import { appConfig } from "./appConfig";
import type { RoomState } from "../types/poker";

export async function fetchRoomState(roomId: string, signal?: AbortSignal): Promise<RoomState> {
  const response = await fetch(`${appConfig.apiBaseUrl}/api/room/${roomId}/state`, {
    credentials: "same-origin",
    signal
  });

  if (!response.ok) {
    throw new Error("Failed to fetch room state.");
  }

  return (await response.json()) as RoomState;
}
