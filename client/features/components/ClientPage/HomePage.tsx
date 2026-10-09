"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { checkGroup } from "@/lib/api";
import { display } from "@/lib/fonts";
import toast from "react-hot-toast";
import { useGroupClosed } from "@/lib/useGroupClosed";

const GLOW =
  "radial-gradient(60% 50% at 15% 0%, rgba(51,85,255,0.95) 0%, rgba(51,85,255,0) 70%), radial-gradient(45% 45% at 95% 85%, rgba(123,92,255,0.6) 0%, rgba(123,92,255,0) 70%)";

export default function HomePage() {
  useGroupClosed();
  const router = useRouter();
  const [slots, setSlots] = useState<string[]>(["", "", "", "", "", ""]);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const mutation = useMutation({
    mutationFn: checkGroup,
    onSuccess: () => {
      localStorage.setItem("groupCode", slots.join(""));
      router.push("/profile");
    },
    onError: (err: any) => {
      toast.error(err.message || "Invalid group code");
      // clear slots on error
      setSlots(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    },
  });

  const handleChange = (index: number, value: string) => {
    // only take the last typed character
    const char = value.slice(-1).toUpperCase();
    const newSlots = [...slots];
    newSlots[index] = char;
    setSlots(newSlots);

    // move focus forward
    if (char && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  useEffect(() => {
    try {
      if (sessionStorage.getItem("groupClosed")) {
        sessionStorage.removeItem("groupClosed");
        toast(
          "The mentor closed that group. Enter a new code to join another.",
        );
      }
    } catch {
      // storage blocked: skip the message
    }
  }, []);

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      const newSlots = [...slots];
      if (slots[index]) {
        // clear current slot
        newSlots[index] = "";
        setSlots(newSlots);
      } else if (index > 0) {
        // move back and clear previous
        newSlots[index - 1] = "";
        setSlots(newSlots);
        inputs.current[index - 1]?.focus();
      }
    }

    if (e.key === "Enter") {
      joinGroup();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").toUpperCase().slice(0, 6);
    const newSlots = [...slots];
    pasted.split("").forEach((char, i) => {
      newSlots[i] = char;
    });
    setSlots(newSlots);
    // focus last filled slot
    const lastIndex = Math.min(pasted.length, 5);
    inputs.current[lastIndex]?.focus();
  };

  const joinGroup = () => {
    const code = slots.join("");
    if (code.length < 6) {
      toast.error("Please enter all 6 characters");
      return;
    }
    mutation.mutate(code);
  };

  const code = slots.join("");

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
          className="rounded text-sm font-semibold text-[#AAB4DB] underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Back to start
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center px-6 pb-24 pt-10">
        <div className="w-full max-w-xl">
          <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">
            Join your group.
          </h1>
          <p className="mt-4 text-lg text-[#AAB4DB]">
            Enter the 6-character code from your mentor.
          </p>

          {/* 6 Slots */}
          <div
            role="group"
            aria-label="Group code"
            className="mt-10 flex gap-2 sm:gap-3"
          >
            {slots.map((slot, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputs.current[i] = el;
                }}
                value={slot}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                maxLength={2}
                aria-label={`Character ${i + 1} of 6`}
                autoComplete="off"
                autoCapitalize="characters"
                autoFocus={i === 0}
                className={`h-16 min-w-0 flex-1 cursor-text rounded-2xl border-2 text-center text-3xl font-extrabold uppercase outline-none transition-colors focus-visible:border-white focus-visible:ring-4 focus-visible:ring-white/25 sm:h-24 sm:text-5xl ${
                  slot
                    ? "border-white bg-white text-[#1B2FD6] caret-[#1B2FD6]"
                    : "border-white/20 bg-white/10 text-white caret-white"
                }`}
              />
            ))}
          </div>

          <p className="mt-4 text-sm text-[#AAB4DB]">
            You can paste the code too.
          </p>

          {/* Button */}
          <button
            onClick={joinGroup}
            disabled={mutation.isPending || code.length < 6}
            className="mt-8 h-16 w-full rounded-full bg-white text-lg font-bold text-[#1B2FD6] transition-transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/40 disabled:hover:scale-100 motion-reduce:transition-none"
          >
            {mutation.isPending ? "Checking…" : "Join group"}
          </button>
        </div>
      </main>
    </div>
  );
}
