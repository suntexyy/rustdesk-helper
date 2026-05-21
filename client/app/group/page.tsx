"use client";

import { socket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Status = "idle" | "waiting" | "ongoing";

export default function GroupPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [studentName, setStudentName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("student");
    const groupCode = localStorage.getItem("groupCode");

    if (!saved || !groupCode) {
      console.log("Missing student/group");
      return;
    }

    const data = JSON.parse(saved);

    setStudentName(data.name || "");
    setAvatar(data.avatar || null);

    if (!socket.connected) {
      socket.connect();
    }

    console.log("EMITTING JOIN_GROUP");

    socket.emit("join_group", {
      groupCode,
      student: data,
    });

    socket.on("help_started", () => setStatus("ongoing"));
    socket.on("help_completed", () => setStatus("idle"));

    return () => {
      socket.off("help_started");
      socket.off("help_completed");
    };
  }, []);

  const requestHelp = () => {
    const groupCode = localStorage.getItem("groupCode");

    socket.emit("help_requested", { groupCode });

    setStatus("waiting");
  };

  const cancelHelp = () => {
    const groupCode = localStorage.getItem("groupCode");
    const saved = localStorage.getItem("student");

    if (saved) {
      socket.emit("join_group", {
        groupCode,
        student: JSON.parse(saved),
      });
    }

    setStatus("idle");
  };

  const disconnect = () => {
    socket.disconnect();

    localStorage.removeItem("groupCode");
    localStorage.removeItem("student");

    router.push("/");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      {/* Background Glow */}
      <div className="absolute inset-0">
        <div className="absolute top-[-150px] left-[-100px] h-[350px] w-[350px] rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-[-150px] right-[-100px] h-[350px] w-[350px] rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8">
          {/* Top Badge */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1 text-sm font-medium text-blue-300">
              Student Support Portal
            </div>
          </div>

          {/* Avatar */}
          <div className="mb-5 flex justify-center">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white/10 shadow-2xl">
              {avatar ? (
                <img
                  src={avatar}
                  alt={studentName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-3xl font-bold text-white">
                  {studentName?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Welcome */}
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>

            <p className="mt-2 text-lg text-zinc-300">{studentName}</p>

            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Need help from a mentor? Request assistance and wait for a mentor
              to connect remotely through RustDesk.
            </p>
          </div>

          {/* Divider */}
          <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Status Content */}
          <div className="flex flex-col items-center justify-center">
            {status === "idle" && (
              <button
                onClick={requestHelp}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/30"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  🚀 Ask for Help
                </span>

                <div className="absolute inset-0 bg-white/10 opacity-0 transition group-hover:opacity-100" />
              </button>
            )}

            {status === "waiting" && (
              <div className="w-full rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-6 text-center">
                <div className="mb-3 text-5xl animate-pulse">⏳</div>

                <h2 className="text-xl font-semibold text-yellow-300">
                  Waiting for a mentor...
                </h2>

                <p className="mt-2 text-sm text-yellow-100/70">
                  Your request has been sent successfully.
                </p>

                <button
                  onClick={cancelHelp}
                  className="mt-5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Cancel Request
                </button>
              </div>
            )}

            {status === "ongoing" && (
              <div className="w-full rounded-2xl border border-blue-500/20 bg-blue-500/10 p-6 text-center">
                <div className="mb-3 text-5xl">🖥️</div>

                <h2 className="text-xl font-semibold text-blue-300">
                  Mentor Connecting...
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-blue-100/70">
                  Keep RustDesk open and accept the incoming connection request.
                </p>

                <div className="mt-5 flex items-center justify-center gap-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:0.2s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Leave Button */}
          {status !== "ongoing" && (
            <button
              onClick={disconnect}
              className="mt-8 w-full rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300 transition-all hover:bg-red-500/20"
            >
              Leave Group
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
