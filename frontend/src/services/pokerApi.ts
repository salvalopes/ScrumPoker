import { appConfig } from "./appConfig";
import type { RoomState } from "../types/poker";

export async function fetchRoomState(signal?: AbortSignal): Promise<RoomState> {
  const response = await fetch(`${appConfig.apiBaseUrl}/api/room/state`, {
    credentials: "same-origin",
    signal
  });

  if (!response.ok) {
    throw new Error("Failed to fetch room state.");
  }

  return (await response.json()) as RoomState;
}
