"use client";

import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { checkGroup } from "@/lib/api";
import toast from "react-hot-toast";

export default function HomePage() {
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
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4">
      <div className="bg-white rounded-2xl p-10 w-full max-w-[440px] shadow-[0_4px_24px_rgba(0,0,0,0.08)] flex flex-col gap-7">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 text-zinc-950">
            Join Your Group
          </h1>
          <p className="text-sm text-zinc-500 m-0">
            Enter the 6-character group code from your mentor
          </p>
        </div>

        {/* 6 Slots */}
        <div className="flex gap-[10px] justify-center">
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
              className={`w-[52px] h-[60px] rounded-[10px] text-[22px] font-mono font-bold text-center outline-none bg-zinc-50 transition-colors cursor-text ${
                slot ? "border-2 border-zinc-900" : "border-2 border-zinc-200"
              }`}
            />
          ))}
        </div>

        {/* Button */}
        <button
          onClick={joinGroup}
          disabled={mutation.isPending || code.length < 6}
          className={`w-full h-[44px] rounded-[8px] text-[15px] font-semibold transition-colors ${
            mutation.isPending || code.length < 6
              ? "bg-zinc-400 text-white cursor-not-allowed"
              : "bg-zinc-900 text-white cursor-pointer"
          }`}
        >
          {mutation.isPending ? "Checking..." : "Join Group"}
        </button>
      </div>
    </div>
  );
}
