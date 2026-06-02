import Cookies from "js-cookie";

const ROOM_ID_COOKIE = "roomId";
const ROOM_ID_CHARSET = "abcdefghijklmnopqrstuvwxyz0123456789";
const ROOM_ID_LENGTH = 10;

export function generateRoomId(): string {
  const buffer = new Uint8Array(ROOM_ID_LENGTH);
  crypto.getRandomValues(buffer);
  return Array.from(buffer, (byte) => ROOM_ID_CHARSET[byte % ROOM_ID_CHARSET.length]).join("");
}

function getCookieOptions() {
  return {
    expires: 30,
    sameSite: "lax" as const,
    secure: window.location.protocol === "https:",
    path: "/"
  };
}

export function useRoomId() {
  const roomId = Cookies.get(ROOM_ID_COOKIE) ?? "";

  const setRoomId = (id: string) => {
    Cookies.set(ROOM_ID_COOKIE, id, getCookieOptions());
  };

  const clearRoomId = () => {
    Cookies.remove(ROOM_ID_COOKIE, { path: "/" });
  };

  return { roomId, setRoomId, clearRoomId };
}
