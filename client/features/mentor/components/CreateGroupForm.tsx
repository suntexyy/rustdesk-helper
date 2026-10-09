"use client";

import Link from "next/link";
import { useState } from "react";
import { display } from "@/lib/fonts";
import { createMentorGroup } from "../api/mentorApi";
import type { MentorSession } from "../types/mentorTypes";

const GLOW =
  "radial-gradient(60% 50% at 15% 0%, rgba(51,85,255,0.95) 0%, rgba(51,85,255,0) 70%), radial-gradient(45% 45% at 95% 85%, rgba(123,92,255,0.6) 0%, rgba(123,92,255,0) 70%)";

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export function CreateGroupForm({
  onCreated,
  notice,
}: {
  onCreated: (session: MentorSession) => void;
  notice?: string;
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || loading) return;

    setLoading(true);
    setError("");
    try {
      onCreated(await createMentorGroup(name.trim()));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Check your connection and try again",
      );
      setLoading(false);
    }
  };

  return (
    <div
      className={`${display.className} relative flex min-h-screen flex-col overflow-hidden bg-[#070B24] text-white`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: GLOW }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-80 -right-80 size-[46rem]"
      >
        <span className="absolute inset-0 rounded-full border border-white/10" />
        <span className="absolute inset-16 rounded-full border border-white/10" />
        <span className="absolute inset-32 rounded-full border border-white/10" />
      </div>

      <header className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-8">
        <Link
          href="/"
          className={`rounded text-sm font-semibold text-[#AAB4DB] underline-offset-4 transition-colors hover:text-white hover:underline ${focus}`}
        >
          Back to start
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center px-6 pb-24 pt-10">
        <form onSubmit={submit} className="w-full max-w-xl">
          {notice && (
            <p
              role="status"
              className="mb-6 rounded-2xl border border-[#FFC53D]/40 bg-[#FFC53D]/10 px-5 py-3 text-sm font-medium text-[#FFC53D]"
            >
              {notice}
            </p>
          )}

          <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">
            Name your group.
          </h1>
          <p className="mt-4 text-lg text-[#AAB4DB]">
            You get a six-digit code to share with your class.
          </p>

          <label htmlFor="group-name" className="sr-only">
            Group name
          </label>
          <input
            id="group-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Class Name"
            maxLength={60}
            autoFocus
            autoComplete="off"
            className="mt-10 h-16 w-full rounded-2xl border border-white/20 bg-white/10 px-6 text-xl font-semibold text-white outline-none backdrop-blur placeholder:font-normal placeholder:text-white/40 focus-visible:border-white focus-visible:ring-4 focus-visible:ring-white/20"
          />

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-2xl border border-[#FF6B73]/40 bg-[#FF6B73]/10 px-5 py-3 text-sm font-semibold text-[#FF9AA0]"
            >
              Couldn&apos;t create your group. {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!name.trim() || loading}
            className={`mt-6 h-16 w-full rounded-full bg-white text-lg font-bold text-[#1B2FD6] transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/40 disabled:hover:scale-100 motion-reduce:transition-none ${focus}`}
          >
            {loading ? "Creating group…" : "Create group"}
          </button>
        </form>
      </main>
    </div>
  );
}
