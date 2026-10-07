"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket";
import type { MentorSession } from "../types/mentorTypes";
import { clearSession, loadSession, saveSession } from "../lib/mentorStorage";
import { deleteMentorGroup } from "../api/mentorApi";
import { CreateGroupForm } from "./CreateGroupForm";
import { MentorPanel } from "./MentorPanel";

export function MentorPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<MentorSession | null>(null);
  const [notice, setNotice] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  // localStorage only exists in the browser, so read it after mount
  useEffect(() => {
    setSession(loadSession());
    setReady(true);
  }, []);

  const handleCreated = (s: MentorSession) => {
    saveSession(s);
    setNotice("");
    setSession(s);
  };

  // the server no longer knows our group (it was deleted)
  const handleGone = useCallback(() => {
    socket.disconnect();
    clearSession();
    setSession(null);
    setNotice("Your group no longer exists. Create a new one to continue.");
  }, []);

  const handleLogout = async () => {
    if (!session) return;
    setLoggingOut(true);
    setLogoutError("");
    try {
      await deleteMentorGroup(session.ownerKey);
      socket.disconnect();
      clearSession();
      router.push("/");
    } catch {
      // keep the session so the mentor can retry
      setLogoutError(
        "Could not delete your group. Check your connection and try again.",
      );
      setLoggingOut(false);
    }
  };

  if (!ready) return <div className="min-h-screen bg-[#2547FF]" />;

  if (!session) {
    return <CreateGroupForm onCreated={handleCreated} notice={notice} />;
  }

  return (
    <MentorPanel
      session={session}
      onGroupGone={handleGone}
      onLogout={handleLogout}
      loggingOut={loggingOut}
      logoutError={logoutError}
    />
  );
}
