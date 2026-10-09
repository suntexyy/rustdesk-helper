"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import { display } from "@/lib/fonts";
import type { MentorSession, StaffStudent } from "../types/mentorTypes";
import { StudentRow } from "./StudentRow";

const ORDER = { waiting: 0, ongoing: 1, idle: 2 } as const;

const HEADER_GLOW =
  "radial-gradient(70% 60% at 50% -10%, rgba(51,85,255,0.9) 0%, rgba(51,85,255,0) 70%), radial-gradient(40% 40% at 100% 20%, rgba(123,92,255,0.45) 0%, rgba(123,92,255,0) 70%)";

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

// a short, soft tone made in the browser (no audio file needed)
function beep() {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;

    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
    setTimeout(() => ctx.close(), 600);
  } catch {
    // audio blocked: ignore
  }
}

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
  const [copied, setCopied] = useState<"code" | "invite" | null>(null);
  const [copiedFor, setCopiedFor] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  // this panel only renders in the browser, so reading localStorage here is safe
  const [soundOn, setSoundOn] = useState(() => {
    try {
      return localStorage.getItem("mentorSound") === "on";
    } catch {
      return false;
    }
  });
  const prevWaiting = useRef(0);

  const waiting = students.filter((s) => s.status === "waiting").length;

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

  // remember the original tab title so we can put it back
  useEffect(() => {
    const original = document.title;
    return () => {
      document.title = original;
    };
  }, []);

  // show how many students need help in the tab title
  useEffect(() => {
    document.title =
      waiting > 0
        ? `(${waiting}) Needs help - ${session.groupName}`
        : session.groupName;
  }, [waiting, session.groupName]);

  // soft beep when someone new asks for help
  useEffect(() => {
    if (soundOn && waiting > prevWaiting.current) beep();
    prevWaiting.current = waiting;
  }, [waiting, soundOn]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    try {
      localStorage.setItem("mentorSound", next ? "on" : "off");
    } catch {
      // storage blocked: the setting just won't be remembered
    }
    if (next) beep(); // a test beep, which also lets the browser allow sound
  };

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

  const copy = async (kind: "code" | "invite") => {
    if (!navigator.clipboard) return;
    const text =
      kind === "code"
        ? session.groupCode
        : `Join "${session.groupName}" on rustdesk-helper: ${window.location.origin}/student\nGroup code: ${session.groupCode}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      // clipboard blocked: ignore
    }
  };

  const sorted = [...students].sort(
    (a, b) => ORDER[a.status] - ORDER[b.status],
  );
  const summary =
    students.length === 0
      ? "No students online yet"
      : `${students.length} student${students.length === 1 ? "" : "s"} online${
          waiting ? `, ${waiting} ${waiting === 1 ? "needs" : "need"} help` : ""
        }`;

  return (
    <div
      className={`${display.className} relative min-h-screen overflow-hidden bg-[#070B24] text-white`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[34rem]"
        style={{ backgroundImage: HEADER_GLOW }}
      />

      <div className="relative z-10 mx-auto w-full max-w-2xl px-6 py-8 sm:py-12">
        <header>
          <div className="flex items-center justify-between gap-4 text-sm">
            <h1 className="truncate font-semibold text-[#C9D3F5]">
              {session.groupName}
            </h1>

            <div className="flex shrink-0 items-center gap-3">
              <button
                onClick={toggleSound}
                aria-pressed={soundOn}
                className={`rounded-full border px-3 py-1.5 font-medium transition-colors ${focus} ${
                  soundOn
                    ? "border-white bg-white text-[#1B2FD6]"
                    : "border-white/25 text-[#C9D3F5] hover:border-white hover:text-white"
                }`}
              >
                Sound {soundOn ? "on" : "off"}
              </button>
              <span className="flex items-center gap-2 font-medium text-[#C9D3F5]">
                <span
                  aria-hidden="true"
                  className={`size-2.5 rounded-full ${connected ? "bg-[#34E3A5]" : "bg-[#FFC53D]"}`}
                />
                {connected ? "Live" : "Reconnecting"}
              </span>
            </div>
          </div>

          <p className="mt-10 text-7xl font-extrabold leading-none tracking-[0.1em] tabular-nums [text-shadow:0_0_60px_rgba(110,140,255,0.8)] sm:text-8xl">
            {session.groupCode}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button
              onClick={() => copy("code")}
              className={`rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#1B2FD6] transition-transform hover:scale-[1.03] motion-reduce:transition-none ${focus}`}
            >
              {copied === "code" ? "Copied" : "Copy code"}
            </button>
            <button
              onClick={() => copy("invite")}
              className={`rounded-full border-2 border-white/40 bg-white/5 px-5 py-2 text-sm font-bold backdrop-blur transition-colors hover:bg-white/15 ${focus}`}
            >
              {copied === "invite" ? "Copied" : "Copy invite"}
            </button>
          </div>

          <p className="mt-6 text-[#C9D3F5]">{summary}</p>

          {!connected && (
            <p
              role="status"
              className="mt-6 rounded-2xl border border-[#FFC53D]/40 bg-[#FFC53D]/10 px-4 py-3 text-sm text-[#FFC53D]"
            >
              Reconnecting to the live server. If it was asleep, this can take
              up to a minute.
            </p>
          )}
        </header>

        <main className="mt-10">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-2 backdrop-blur-sm">
            {sorted.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <p className="text-xl font-bold">Waiting for students</p>
                <p className="mx-auto mt-2 max-w-sm text-[#AAB4DB]">
                  Students open the site, choose &quot;I&apos;m a student&quot;,
                  and enter your code. They show up here the moment they join.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-1">
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

        <footer className="mt-12">
          {confirming ? (
            <div className="flex flex-col items-start gap-3">
              <p className="max-w-sm text-sm font-semibold text-white/90">
                Delete this group? The code stops working and you are logged
                out. Students already inside stay connected until they leave.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={onLogout}
                  disabled={loggingOut}
                  className={`rounded-full bg-[#D92D3A] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#B91C28] disabled:opacity-60 ${focus}`}
                >
                  {loggingOut ? "Deleting group…" : "Delete group"}
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  disabled={loggingOut}
                  className={`rounded-full border-2 border-white/25 px-5 py-2 text-sm font-bold transition-colors hover:border-white disabled:opacity-60 ${focus}`}
                >
                  Keep group
                </button>
              </div>
              {logoutError && (
                <p
                  role="alert"
                  className="text-sm font-semibold text-[#FF9AA0]"
                >
                  {logoutError}
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className={`rounded text-sm font-medium text-[#AAB4DB] underline-offset-4 transition-colors hover:text-[#FF9AA0] hover:underline ${focus}`}
            >
              Delete group and log out
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
