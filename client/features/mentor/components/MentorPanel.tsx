"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { display } from "@/lib/fonts";
import type { MentorSession, StaffStudent } from "../types/mentorTypes";
import { StudentRow } from "./StudentRow";

const ORDER = { waiting: 0, ongoing: 1, idle: 2 } as const;

const onCobalt =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export function MentorPanel({
  session,
  onGroupGone,
  onLogout,
  loggingOut,
  logoutError,
}: {
  session: MentorSession;
  onGroupGone: () => void;
  onLogout: () => void;
  loggingOut: boolean;
  logoutError: string;
}) {
  const [students, setStudents] = useState<StaffStudent[]>([]);
  const [connected, setConnected] = useState(socket.connected);
  const [codeCopied, setCodeCopied] = useState(false);
  const [copiedFor, setCopiedFor] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    // runs on connect AND on every reconnect (the server forgets us after a restart)
    const join = () => {
      setConnected(true);
      socket.emit("admin_join_group", {
        groupCode: session.groupCode,
        ownerKey: session.ownerKey,
      });
    };
    const onDisconnect = () => setConnected(false);
    const onRoomUpdate = ({ students }: { students: StaffStudent[] }) =>
      setStudents(students);
    // the server says our key doesn't match any group (it was deleted)
    const onDenied = () => onGroupGone();

    socket.on("connect", join);
    socket.on("disconnect", onDisconnect);
    socket.on("room_update", onRoomUpdate);
    socket.on("staff_denied", onDenied);

    if (socket.connected) join();
    else socket.connect();

    return () => {
      socket.off("connect", join);
      socket.off("disconnect", onDisconnect);
      socket.off("room_update", onRoomUpdate);
      socket.off("staff_denied", onDenied);
    };
  }, [session.groupCode, session.ownerKey, onGroupGone]);

  // copy the password in the background, then open RustDesk right away
  const launch = (student: StaffStudent) => {
    const id = String(student.rustdeskId).replace(/\s+/g, "");

    if (student.password) {
      navigator.clipboard
        ?.writeText(student.password)
        .then(() => {
          setCopiedFor(student.socketId);
          setTimeout(
            () =>
              setCopiedFor((cur) => (cur === student.socketId ? null : cur)),
            2500,
          );
        })
        .catch(() => {});
    }

    window.location.href = `rustdesk://${id}`;
  };

  const handleConnect = (student: StaffStudent) => {
    launch(student);
    socket.emit("help_started", {
      groupCode: session.groupCode,
      studentSocketId: student.socketId,
    });
  };

  const handleComplete = (student: StaffStudent) => {
    socket.emit("help_completed", {
      groupCode: session.groupCode,
      studentSocketId: student.socketId,
    });
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard?.writeText(session.groupCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 1800);
    } catch {
      // clipboard blocked: ignore
    }
  };

  const sorted = [...students].sort(
    (a, b) => ORDER[a.status] - ORDER[b.status],
  );
  const waiting = students.filter((s) => s.status === "waiting").length;
  const summary =
    students.length === 0
      ? "No students online yet"
      : `${students.length} student${students.length === 1 ? "" : "s"} online${
          waiting ? `, ${waiting} ${waiting === 1 ? "needs" : "need"} help` : ""
        }`;

  return (
    <div
      className={`${display.className} min-h-screen bg-[#F5F6FB] text-[#0E1330]`}
    >
      <header className="bg-[#2547FF] text-white">
        <div className="mx-auto max-w-3xl px-6 pb-14 pt-8">
          <div className="flex items-center justify-between gap-4">
            <h1 className="truncate font-semibold text-white/80">
              {session.groupName}
            </h1>
            <span className="flex shrink-0 items-center gap-2 text-sm font-medium text-white/80">
              <span
                aria-hidden="true"
                className={`size-2.5 rounded-full ${connected ? "bg-[#4DF0B0]" : "bg-[#FFC53D]"}`}
              />
              {connected ? "Live" : "Reconnecting"}
            </span>
          </div>

          <p className="mt-8 text-7xl font-extrabold leading-none tracking-[0.12em] tabular-nums sm:text-8xl">
            {session.groupCode}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              onClick={copyCode}
              className={`rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#2547FF] transition-transform hover:scale-[1.03] motion-reduce:transition-none ${onCobalt}`}
            >
              {codeCopied ? "Copied" : "Copy code"}
            </button>
            <p className="text-white/80">{summary}</p>
          </div>

          {!connected && (
            <p
              role="status"
              className="mt-6 rounded-2xl bg-white/15 px-4 py-3 text-sm"
            >
              Reconnecting to the live server. If it was asleep, this can take
              up to a minute.
            </p>
          )}
        </div>
      </header>

      <main className="relative -mt-6 mx-auto max-w-3xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_8px_30px_rgba(14,19,48,0.08)]">
          {sorted.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-xl font-bold">Waiting for students</p>
              <p className="mx-auto mt-2 max-w-xs text-[#5A6285]">
                Share the code above. Students show up here the moment they
                join.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#EEF0F8]">
              {sorted.map((s) => (
                <StudentRow
                  key={s.socketId}
                  student={s}
                  passwordCopied={copiedFor === s.socketId}
                  onConnect={() => handleConnect(s)}
                  onReconnect={() => launch(s)}
                  onComplete={() => handleComplete(s)}
                />
              ))}
            </ul>
          )}
        </div>
      </main>

      <footer className="mx-auto max-w-3xl px-6 pb-12 pt-8 text-center">
        {confirming ? (
          <div className="flex flex-col items-center gap-3">
            <p className="max-w-sm text-sm font-semibold">
              Delete this group? The code stops working and you are logged out.
              Students already inside stay connected until they leave.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onLogout}
                disabled={loggingOut}
                className="rounded-full bg-[#B42318] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#912018] disabled:opacity-60"
              >
                {loggingOut ? "Deleting group…" : "Delete group"}
              </button>
              <button
                onClick={() => setConfirming(false)}
                disabled={loggingOut}
                className="rounded-full border border-[#C9CEE3] px-5 py-2.5 text-sm font-bold transition-colors hover:bg-white disabled:opacity-60"
              >
                Keep group
              </button>
            </div>
            {logoutError && (
              <p role="alert" className="text-sm font-semibold text-[#B42318]">
                {logoutError}
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="text-sm font-semibold text-[#5A6285] underline-offset-4 hover:text-[#B42318] hover:underline"
          >
            Delete group and log out
          </button>
        )}
      </footer>
    </div>
  );
}
