"use client";

import Link from "next/link";
import { useState } from "react";
import { display } from "@/lib/fonts";
import { createMentorGroup } from "../api/mentorApi";
import type { MentorSession } from "../types/mentorTypes";

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
      className={`${display.className} flex min-h-screen flex-col bg-[#2547FF] text-white`}
    >
      <header className="p-6 sm:p-8">
        <Link
          href="/"
          className="text-sm font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          Back to start
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-24">
        <form onSubmit={submit} className="w-full max-w-lg">
          {notice && (
            <p
              role="status"
              className="mb-6 rounded-2xl bg-white/15 px-5 py-3 text-sm font-medium"
            >
              {notice}
            </p>
          )}

          <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl">
            Name your group.
          </h1>
          <p className="mt-4 text-lg text-white/80">
            You get a six-digit code to share with your class.
          </p>

          <label htmlFor="group-name" className="sr-only">
            Group name
          </label>
          <input
            id="group-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Frontend class"
            maxLength={60}
            className="mt-8 h-16 w-full rounded-2xl bg-white px-6 text-xl font-semibold text-[#0E1330] outline-none placeholder:font-normal placeholder:text-[#8A92B5] focus-visible:ring-4 focus-visible:ring-white/50"
          />

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#B42318]"
            >
              Couldn&apos;t create your group. {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!name.trim() || loading}
            className="mt-4 h-16 w-full rounded-full bg-[#0E1330] text-lg font-bold text-white transition-colors hover:bg-[#1B2250] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-not-allowed disabled:bg-white/20"
          >
            {loading ? "Creating group…" : "Create group"}
          </button>
        </form>
      </main>
    </div>
  );
}
