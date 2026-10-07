"use client";

import { useState } from "react";
import { createMentorGroup } from "../api/mentorApi";
import type { MentorSession } from "../types/mentorTypes";

export function CreateGroupForm({
  onCreated,
}: {
  onCreated: (session: MentorSession) => void;
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
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="flex w-full max-w-[420px] flex-col gap-6 rounded-2xl p-10 shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
    >
      <div className="text-center">
        <h1 className="mb-1 text-[22px] font-bold text-[#09090b]">
          Create your group
        </h1>
        <p className="text-[14px] text-[#71717a]">
          You get a code to share with your students
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-bold text-[#09090b]">
          Group name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Frontend class"
          maxLength={60}
          className="h-[44px] rounded-[8px] border-[1.5px] border-[#e4e4e7] pl-2 text-[14px] outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={!name.trim() || loading}
        className="h-11 rounded-lg bg-[#18181b] text-[15px] font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Creating…" : "Create group"}
      </button>
    </form>
  );
}
