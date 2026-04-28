function normalizeBaseUrl(value?: string) {
  if (!value) {
    return "";
  }

  return value.endsWith("/") ? value.slice(0, -1) : value;
}

const apiBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);
const hubUrl = normalizeBaseUrl(import.meta.env.VITE_HUB_URL);

export const appConfig = {
  apiBaseUrl,
  hubUrl: hubUrl || (apiBaseUrl ? `${apiBaseUrl}/hubs/poker` : "/hubs/poker")
};
