"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import type { MentorSession, StaffStudent } from "../types/mentorTypes";
import { StudentRow } from "./StudentRow";

const ORDER = { waiting: 0, ongoing: 1, idle: 2 } as const;

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
  const [copied, setCopied] = useState(false);

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

  const handleConnect = (student: StaffStudent) => {
    const id = String(student.rustdeskId).replace(/\s+/g, "");

    // copy the password in the background, then launch right away
    if (student.password) {
      navigator.clipboard.writeText(student.password).catch(() => {});
    }
    window.location.href = `rustdesk://${id}`;

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
      await navigator.clipboard.writeText(session.groupCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked: ignore
    }
  };

  const sorted = [...students].sort(
    (a, b) => ORDER[a.status] - ORDER[b.status],
  );
  const waiting = students.filter((s) => s.status === "waiting").length;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10 text-black">
      <div className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {session.groupName}
            </h1>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-zinc-500">Group code</span>
              <span className="rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-1 font-mono text-lg tracking-widest">
                {session.groupCode}
              </span>
              <button
                onClick={copyCode}
                className="rounded-lg border px-3 py-1 text-xs font-medium hover:bg-zinc-50"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <button
            onClick={onLogout}
            disabled={loggingOut}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {loggingOut ? "Deleting…" : "Delete group & log out"}
          </button>
        </div>

        {logoutError && (
          <p className="mt-3 text-sm text-red-600">{logoutError}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
          <span className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full ${connected ? "animate-pulse bg-green-500" : "bg-amber-500"}`}
            />
            {connected ? "Live" : "Connecting… (can take up to a minute)"}
          </span>
          <span>
            {students.length} student{students.length !== 1 ? "s" : ""} online
          </span>
          {waiting > 0 && (
            <span className="font-medium text-amber-700">
              {waiting} need help
            </span>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Students</h2>

        {sorted.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-14 text-center">
            <p className="text-zinc-500">No students online yet.</p>
            <p className="mt-2 text-sm text-zinc-400">
              Share code{" "}
              <span className="font-mono text-black">{session.groupCode}</span>{" "}
              with your class.
            </p>
          </div>
        ) : (
          <ul className="divide-y">
            {sorted.map((s) => (
              <StudentRow
                key={s.socketId}
                student={s}
                onConnect={() => handleConnect(s)}
                onComplete={() => handleComplete(s)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
