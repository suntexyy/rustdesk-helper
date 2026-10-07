"use client";

import Link from "next/link";
import { useState } from "react";
import { display } from "@/lib/fonts";
import { createMentorGroup } from "../api/mentorApi";
import type { MentorSession } from "../types/mentorTypes";

const STEPS = [
  {
    title: "Name your group",
    text: "Pick something your students will recognize.",
  },
  {
    title: "Share the code",
    text: "You get a six-digit code to give to your class.",
  },
  {
    title: "Help whoever asks",
    text: "Students who need help move to the top of your list.",
  },
];

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
      className={`${display.className} grid min-h-screen lg:grid-cols-[5fr_6fr]`}
    >
      <aside className="flex flex-col justify-between gap-14 bg-[#0B2545] p-8 text-white sm:p-12 lg:p-16">
        <Link
          href="/"
          className="w-fit text-sm font-medium text-[#C9D6EA] underline-offset-4 hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          Back to start
        </Link>

        <div>
          <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl">
            Start your group.
          </h1>
          <p className="mt-5 max-w-sm text-lg leading-relaxed text-[#C9D6EA]">
            Students join with your code. You see who is online and who needs
            help.
          </p>
        </div>

        <ol className="flex flex-col gap-5">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#35527E] text-sm font-semibold">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold">{step.title}</p>
                <p className="text-sm text-[#C9D6EA]">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </aside>

      <section className="flex items-center justify-center bg-[#F4F6FA] p-8 sm:p-12">
        <form onSubmit={submit} className="w-full max-w-md text-[#0B2545]">
          {notice && (
            <p
              role="status"
              className="mb-6 rounded-xl bg-[#FFF3C4] px-4 py-3 text-sm font-medium text-[#5C4200]"
            >
              {notice}
            </p>
          )}

          <label htmlFor="group-name" className="text-sm font-semibold">
            Group name
          </label>
          <input
            id="group-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Frontend class"
            maxLength={60}
            aria-describedby="group-name-hint"
            className="mt-2 h-14 w-full rounded-xl border-2 border-[#DDE3EC] bg-white px-4 text-lg outline-none transition focus-visible:border-[#0B2545] focus-visible:ring-4 focus-visible:ring-[#0B2545]/15"
          />
          <p id="group-name-hint" className="mt-2 text-sm text-[#5B6B82]">
            Students see this name when they join.
          </p>

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-xl bg-[#FDECEA] px-4 py-3 text-sm font-medium text-[#912018]"
            >
              Couldn&apos;t create your group. {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!name.trim() || loading}
            className="mt-6 h-14 w-full rounded-full bg-[#0B2545] text-base font-semibold text-white transition-colors hover:bg-[#13365F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B2545] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Creating group…" : "Create group"}
          </button>
        </form>
      </section>
    </div>
  );
}
