"use client";

import Image from "next/image";
import { Student } from "../schema/schema";

import { useState } from "react";

export function StudentCard({
  student,
  onConnect,
  onComplete,
}: {
  student: Student;
  onConnect: () => void;
  onComplete: () => void;
}) {
  const [showPass, setShowPass] = useState(false);
  const [copied, setCopied] = useState(false);

  const isWaiting = student.status === "waiting";
  const isOngoing = student.status === "ongoing";
  const isIdle = student.status === "idle";

  const initials = student.name.slice(0, 2).toUpperCase();

  const copyPass = () => {
    navigator.clipboard.writeText(student.password).then(() => {
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className={`
        group flex items-center justify-between gap-5 rounded-3xl border p-5
        bg-white shadow-sm transition-all duration-300
        hover:scale-[1.01] hover:shadow-xl
        ${
          isWaiting
            ? "border-yellow-200"
            : isOngoing
              ? "border-blue-200"
              : "border-zinc-200"
        }
      `}
    >
      {/* Left */}
      <div className="flex flex-1 min-w-0 items-center gap-4">
        {/* Avatar */}
        <div
          className={`
            h-16 w-16 overflow-hidden rounded-full border-2 flex items-center justify-center
            text-sm font-bold shrink-0 shadow-md
            ${
              isWaiting
                ? "border-yellow-300"
                : isOngoing
                  ? "border-blue-300"
                  : "border-zinc-200"
            }
          `}
        >
          {student.avatar ? (
            <Image
              src={student.avatar}
              alt={student.name}
              width={88}
              height={88}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {initials}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-col gap-3">
          {/* Name */}
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold text-black">{student.name}</h3>

            <div
              className={`
                flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium capitalize
                ${
                  isWaiting
                    ? "bg-yellow-100 text-yellow-700"
                    : isOngoing
                      ? "bg-blue-100 text-blue-700"
                      : "bg-zinc-100 text-zinc-600"
                }
              `}
            >
              <div
                className={`
                  h-2 w-2 rounded-full
                  ${
                    isWaiting
                      ? "bg-yellow-500"
                      : isOngoing
                        ? "bg-blue-500"
                        : "bg-zinc-400"
                  }
                `}
              />
              {student.status}
            </div>
          </div>

          {/* Credentials */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600">
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-500">ID:</span>

              <span className="font-mono text-black">
                {student.rustdeskId || "—"}
              </span>
            </div>

            <div className="h-4 w-px bg-zinc-200" />

            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-zinc-500">Pass:</span>

              <span className="font-mono text-black">
                {showPass ? student.password : "••••••••"}
              </span>

              <button
                onClick={() => setShowPass((p) => !p)}
                className="text-xs text-zinc-500 underline underline-offset-2 hover:text-black"
              >
                {showPass ? "hide" : "show"}
              </button>

              <button
                onClick={copyPass}
                className={`
                  rounded-lg px-2 py-1 text-xs font-medium transition
                  ${
                    copied
                      ? "bg-green-100 text-green-700"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }
                `}
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 gap-2">
        {(isWaiting || isIdle) && (
          <button
            onClick={onConnect}
            className="
              rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600
              px-5 py-3 text-sm font-semibold text-white
              shadow-lg transition-all duration-300
              hover:scale-105 hover:shadow-blue-300
            "
          >
            Connect
          </button>
        )}

        {isOngoing && (
          <button
            onClick={onComplete}
            className="
              rounded-2xl border border-green-200 bg-green-100
              px-5 py-3 text-sm font-semibold text-green-700
              transition hover:bg-green-200
            "
          >
            ✓ Complete
          </button>
        )}
      </div>
    </div>
  );
}
