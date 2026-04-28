import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel
} from "@microsoft/signalr";
import { useEffect, useState } from "react";
import { normalizeDisplayName } from "../config/displayName";
import { pokerHubEvents, pokerHubMethods } from "../config/poker";
import { appConfig } from "../services/appConfig";
import { fetchRoomState } from "../services/pokerApi";
import type { RoomState } from "../types/poker";

type UsePokerHubResult = {
  roomState: RoomState | null;
  selectedVote: number | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  vote: (value: number) => Promise<void>;
  revealVotes: () => Promise<void>;
  resetVotes: () => Promise<void>;
};

type HubActionResult = {
  succeeded: boolean;
  errorMessage?: string | null;
};

export function usePokerHub(displayName: string): UsePokerHubResult {
  const normalizedDisplayName = normalizeDisplayName(displayName);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [selectedVote, setSelectedVote] = useState<number | null>(null);
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (normalizedDisplayName.length === 0) {
      setRoomState(null);
      setSelectedVote(null);
      setConnection(null);
      setIsConnected(false);
      setIsConnecting(false);
      setError("Display name is required.");
      return;
    }

    let isCancelled = false;
    const abortController = new AbortController();

    const hubConnection = new HubConnectionBuilder()
      .withUrl(appConfig.hubUrl)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    hubConnection.on(pokerHubEvents.roomStateUpdated, (nextRoomState: RoomState) => {
      if (isCancelled) {
        return;
      }

      setRoomState(nextRoomState);

      const currentParticipant = nextRoomState.participants.find(
        (participant) => participant.displayName.toLowerCase() === normalizedDisplayName.toLowerCase()
      );

      if (!currentParticipant?.hasVoted) {
        setSelectedVote(null);
      }
    });

    hubConnection.onreconnecting(() => {
      if (!isCancelled) {
        setIsConnecting(true);
        setIsConnected(false);
        setError(null);
      }
    });

    hubConnection.onreconnected(async () => {
      if (isCancelled) {
        return;
      }

      try {
        const result = await hubConnection.invoke<HubActionResult>(
          pokerHubMethods.joinRoom,
          normalizedDisplayName
        );
        setIsConnected(result?.succeeded ?? false);
        setError(result?.succeeded ? null : result?.errorMessage ?? "Unable to join the room.");
      } catch (joinError) {
        setIsConnected(false);
        setError(getErrorMessage(joinError));
      } finally {
        setIsConnecting(false);
      }
    });

    hubConnection.onclose(() => {
      if (!isCancelled) {
        setIsConnected(false);
      }
    });

    const initialize = async () => {
      try {
        const initialRoomState = await fetchRoomState(abortController.signal);
        if (!isCancelled) {
          setRoomState(initialRoomState);
        }

        await hubConnection.start();
        const result = await hubConnection.invoke<HubActionResult>(
          pokerHubMethods.joinRoom,
          normalizedDisplayName
        );

        if (!isCancelled) {
          setConnection(hubConnection);
          setIsConnected(result?.succeeded ?? false);
          setError(result?.succeeded ? null : result?.errorMessage ?? "Unable to join the room.");
        }
      } catch (initializationError) {
        if (!isCancelled) {
          setIsConnected(false);
          setError(getErrorMessage(initializationError));
        }
      } finally {
        if (!isCancelled) {
          setIsConnecting(false);
        }
      }
    };

    void initialize();

    return () => {
      isCancelled = true;
      abortController.abort();
      setConnection(null);
      setIsConnected(false);
      void hubConnection.stop();
    };
  }, [normalizedDisplayName]);

  const invoke = async (methodName: string, ...args: number[]) => {
    if (!connection || !isConnected) {
      setError("Not connected to the room.");
      return false;
    }

    try {
      setError(null);
      const result = await connection.invoke<HubActionResult>(methodName, ...args);

      if (!result?.succeeded) {
        setError(result?.errorMessage ?? "The room rejected that action.");
        return false;
      }

      return true;
    } catch (invokeError) {
      setError(getErrorMessage(invokeError));
      return false;
    }
  };

  return {
    roomState,
    selectedVote,
    isConnecting,
    isConnected,
    error,
    vote: async (value) => {
      const didVote = await invoke(pokerHubMethods.vote, value);

      if (didVote) {
        setSelectedVote(value);
      }
    },
    revealVotes: async () => {
      await invoke(pokerHubMethods.revealVotes);
    },
    resetVotes: async () => {
      const didReset = await invoke(pokerHubMethods.resetVotes);

      if (didReset) {
        setSelectedVote(null);
      }
    }
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "The room request was interrupted.";
  }

  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return "Something went wrong while connecting to the poker room.";
}
