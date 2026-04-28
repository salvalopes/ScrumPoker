export const displayNameConfig = {
  cookieName: "displayName",
  maxLength: 30
};

export function normalizeDisplayName(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, displayNameConfig.maxLength);
}

export function isValidDisplayName(value: string) {
  return normalizeDisplayName(value).length > 0;
}
