"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { useParams } from "next/navigation";
import { Student } from "@/features/group/schema/schema";
import { StudentCard } from "@/features/group/components/StudentCard";

export default function AdminGroupPage() {
  const params = useParams();

  const code = Array.isArray(params.code) ? params.code[0] : params.code;

  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (!code) return;

    socket.emit("admin_join_group", {
      groupCode: code,
    });

    const onRoomUpdate = ({ students }: { students: Student[] }) =>
      setStudents(students);

    socket.on("room_update", onRoomUpdate);

    return () => {
      socket.off("room_update", onRoomUpdate);
    };
  }, [code]);

  const handleConnect = async (student: Student) => {
    const id = String(student.rustdeskId).replace(/\s+/g, "");

    // Copy the password first; if it fails, still continue
    try {
      if (student.password) {
        await navigator.clipboard.writeText(student.password);
      }
    } catch (err) {
      console.warn("Clipboard failed", err);
    }

    // Use the cleaned id here
    window.location.href = `rustdesk://${id}`;

    socket.emit("help_started", {
      groupCode: code,
      studentSocketId: student.socketId,
    });
  };

  const handleComplete = (student: Student) => {
    socket.emit("help_completed", {
      groupCode: code,
      studentSocketId: student.socketId,
    });
  };

  const waiting = students.filter((s) => s.status === "waiting");
  const others = students.filter((s) => s.status !== "waiting");

  return (
    <div className="relative  overflow-hidden bg-white text-black">
      {/* Content */}
      <div className="relative z-10 mx-auto flex  max-w-6xl flex-col gap-8 px-6 py-10">
        {/* Header */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-black">
              Live Group
            </h1>

            <div className="rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-1 font-mono text-sm text-zinc-700">
              {code}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            {students.length} student
            {students.length !== 1 ? "s" : ""} online
          </div>
        </div>

        {/* Needs Help */}
        {waiting.length > 0 && (
          <div className="rounded-3xl border border-yellow-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <h2 className="text-lg font-semibold text-yellow-700">
                Needs Help
              </h2>

              <div className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                {waiting.length}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {waiting.map((s) => (
                <StudentCard
                  key={s.socketId}
                  student={s}
                  onConnect={() => handleConnect(s)}
                  onComplete={() => handleComplete(s)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Students */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <h2 className="text-lg font-semibold text-black">All Students</h2>

            <div className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
              {students.length}
            </div>
          </div>

          {students.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-16 text-center">
              <p className="text-zinc-500">No students online yet.</p>

              <p className="mt-2 text-sm text-zinc-400">
                Share code <span className="font-mono text-black">{code}</span>{" "}
                with your class.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {others.map((s) => (
                <StudentCard
                  key={s.socketId}
                  student={s}
                  onConnect={() => handleConnect(s)}
                  onComplete={() => handleComplete(s)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
