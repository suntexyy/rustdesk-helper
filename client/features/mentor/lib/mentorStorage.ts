import type { MentorSession } from "../types/mentorTypes";

const KEY = "mentor";

export function loadSession(): MentorSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s?.mentorId && s?.ownerKey && s?.groupCode) return s as MentorSession;
  } catch {
    // corrupted value: treat as no session
  }
  return null;
}

export const saveSession = (s: MentorSession) =>
  localStorage.setItem(KEY, JSON.stringify(s));

export const clearSession = () => localStorage.removeItem(KEY);
