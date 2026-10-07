import type { MentorSession } from "../types/mentorTypes";
// if your client already has an API-url helper, import that instead
const base = () => {
  if (
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ) {
    return "http://localhost:5000";
  }
  return (process.env.NEXT_PUBLIC_rustdesk_helper_API_URL ?? "").replace(
    /\/$/,
    "",
  );
};

export async function createMentorGroup(name: string): Promise<MentorSession> {
  const mentorId = crypto.randomUUID();

  const res = await fetch(`${base()}/api/groups/mentor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, mentorId }),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(json?.message || "Could not create the group");
  }

  return {
    mentorId,
    ownerKey: json.data.ownerKey,
    groupCode: json.data.code,
    groupName: json.data.name,
  };
}

export async function deleteMentorGroup(ownerKey: string): Promise<void> {
  const res = await fetch(`${base()}/api/groups/mentor/me`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${ownerKey}` },
  });
  // 404 means the group is already gone, which is fine
  if (!res.ok && res.status !== 404)
    throw new Error("Could not delete the group");
}
