"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { display } from "@/lib/fonts";
import type { MentorSession, StaffStudent } from "../types/mentorTypes";
import { StudentRow } from "./StudentRow";

const SECTIONS: { status: StaffStudent["status"]; title: string }[] = [
  { status: "waiting", title: "Needs help" },
  { status: "ongoing", title: "In session" },
  { status: "idle", title: "Online" },
];

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

  const waiting = students.filter((s) => s.status === "waiting").length;
  const summary =
    students.length === 0
      ? "No students online yet"
      : `${students.length} student${students.length === 1 ? "" : "s"} online${
          waiting ? `, ${waiting} ${waiting === 1 ? "needs" : "need"} help` : ""
        }`;

  return (
    <div
      className={`${display.className} min-h-screen bg-[#F4F6FA] text-[#0B2545]`}
    >
      <header className="bg-[#0B2545] text-white">
        <div className="mx-auto flex max-w-4xl flex-col gap-8 px-5 py-8 sm:px-6 sm:py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-xl font-semibold text-[#C9D6EA] sm:text-2xl">
              {session.groupName}
            </h1>

            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2 text-[#C9D6EA]">
                <span
                  aria-hidden="true"
                  className={`size-2.5 rounded-full ${connected ? "bg-[#3DDC97]" : "bg-[#FFD23F]"}`}
                />
                {connected ? "Live" : "Reconnecting"}
              </span>

              {!confirming && (
                <button
                  onClick={() => setConfirming(true)}
                  className="rounded-full border border-[#35527E] px-4 py-2 font-medium text-[#C9D6EA] transition-colors hover:border-[#FF8A80] hover:text-[#FF8A80] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Delete group and log out
                </button>
              )}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
              <p className="text-6xl font-extrabold leading-none tracking-[0.14em] tabular-nums text-[#FFD23F] sm:text-7xl">
                {session.groupCode}
              </p>
              <button
                onClick={copyCode}
                className="mb-1 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {codeCopied ? "Copied" : "Copy code"}
              </button>
            </div>
            <p className="mt-4 text-[#C9D6EA]">{summary}</p>
          </div>

          {confirming && (
            <div
              role="group"
              aria-label="Confirm group deletion"
              className="rounded-2xl bg-[#13365F] p-5"
            >
              <p className="font-semibold">Delete this group for good?</p>
              <p className="mt-1 text-sm text-[#C9D6EA]">
                The code stops working and you are logged out. Students already
                inside stay connected until they leave.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={onLogout}
                  disabled={loggingOut}
                  className="rounded-full bg-[#D92D20] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#B42318] disabled:opacity-60"
                >
                  {loggingOut ? "Deleting group…" : "Delete group"}
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  disabled={loggingOut}
                  className="rounded-full border border-[#35527E] px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10 disabled:opacity-60"
                >
                  Keep group
                </button>
              </div>
              {logoutError && (
                <p
                  role="alert"
                  className="mt-3 text-sm font-medium text-[#FFB4AB]"
                >
                  {logoutError}
                </p>
              )}
            </div>
          )}
        </div>
      </header>

      {!connected && (
        <div role="status" className="bg-[#FFD23F] text-[#0B2545]">
          <p className="mx-auto max-w-4xl px-5 py-3 text-sm font-medium sm:px-6">
            Reconnecting to the live server. If it was asleep, this can take up
            to a minute.
          </p>
        </div>
      )}

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {students.length === 0 ? (
          <div className="px-2 py-16 text-center">
            <h2 className="text-2xl font-bold">Nobody has joined yet</h2>
            <p className="mx-auto mt-3 max-w-md text-[#5B6B82]">
              Give your class the code{" "}
              <span className="font-bold text-[#0B2545]">
                {session.groupCode}
              </span>
              . Students appear here as soon as they join.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#DDE3EC] bg-white">
            {SECTIONS.map(({ status, title }) => {
              const list = students.filter((s) => s.status === status);
              if (list.length === 0) return null;

              return (
                <section key={status} aria-labelledby={`section-${status}`}>
                  <h2
                    id={`section-${status}`}
                    className="flex items-baseline gap-2 border-b border-[#EEF1F6] bg-[#F9FAFC] px-5 py-3 text-sm font-bold"
                  >
                    {title}
                    <span className="font-medium text-[#5B6B82]">
                      {list.length}
                    </span>
                  </h2>
                  <ul>
                    {list.map((s) => (
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
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
