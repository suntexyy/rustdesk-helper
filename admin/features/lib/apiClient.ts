const normalizeBaseUrl = (value: string) => value.replace(/\/$/, "");

const getBaseUrl = () => {
  const configuredBaseUrl =
    process.env.NEXT_PUBLIC_rustdesk_helper_API_URL?.trim();

  if (configuredBaseUrl) {
    return normalizeBaseUrl(configuredBaseUrl);
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:5000";
    }

    const appHostname = hostname.replace(/^www\./, "");
    const apiHostname = appHostname.startsWith("api.")
      ? appHostname
      : `api.${appHostname.replace(/^admin\./, "")}`;

    return `${protocol}//${apiHostname}`;
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:5000";
  }

  throw new Error("NEXT_PUBLIC_rustdesk_helper_API_URL is not configured.");
};

export async function safeFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${endpoint}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (res.status === 204) {
    return undefined as unknown as T;
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  // refresh failed / not logged in
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }

    throw new Error(data.message || "Unauthorized");
  }

  if (!res.ok) {
    throw new Error(data.message || `Request failed: ${res.status}`);
  }

  return data as T;
}
