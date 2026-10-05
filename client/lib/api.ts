export const API_URL =
  process.env.NEXT_PUBLIC_rustdesk_helper_API_URL ??
  "https://rustdesk-helper-kf61.vercel.app";

export const checkGroup = async (code: string) => {
  const res = await fetch(`${API_URL}/api/groups/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Invalid group code");
  }

  return data;
};
