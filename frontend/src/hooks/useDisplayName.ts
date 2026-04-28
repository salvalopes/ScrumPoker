import Cookies from "js-cookie";
import {
  displayNameConfig,
  isValidDisplayName,
  normalizeDisplayName
} from "../config/displayName";

export function useDisplayName() {
  const rawDisplayName = Cookies.get(displayNameConfig.cookieName) ?? "";
  const displayName = normalizeDisplayName(rawDisplayName);

  if (rawDisplayName !== displayName) {
    if (displayName.length > 0) {
      Cookies.set(displayNameConfig.cookieName, displayName, getCookieOptions());
    } else {
      Cookies.remove(displayNameConfig.cookieName, { path: "/" });
    }
  }

  const setDisplayName = (value: string) => {
    const normalizedDisplayName = normalizeDisplayName(value);

    if (!isValidDisplayName(normalizedDisplayName)) {
      return false;
    }

    Cookies.set(displayNameConfig.cookieName, normalizedDisplayName, getCookieOptions());
    return true;
  };

  const clearDisplayName = () => {
    Cookies.remove(displayNameConfig.cookieName, { path: "/" });
  };

  return {
    displayName,
    hasDisplayName: displayName.length > 0,
    setDisplayName,
    clearDisplayName
  };
}

function getCookieOptions() {
  return {
    expires: 30,
    sameSite: "lax" as const,
    secure: window.location.protocol === "https:",
    path: "/"
  };
}
