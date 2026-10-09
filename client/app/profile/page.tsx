"use client";

import { socket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { display } from "@/lib/fonts";

const GLOW =
  "radial-gradient(60% 50% at 15% 0%, rgba(51,85,255,0.95) 0%, rgba(51,85,255,0) 70%), radial-gradient(45% 45% at 95% 85%, rgba(123,92,255,0.6) 0%, rgba(123,92,255,0) 70%)";

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [rustdeskId, setRustdeskId] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("student");
    if (saved) {
      const data = JSON.parse(saved);
      setName(data.name || "");
      setRustdeskId((data.rustdeskId || "").replace(/\s+/g, ""));
      setPassword(data.password || "");
      setAvatar(data.avatar || null);
    }
  }, []);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setAvatar(compressed);
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        // Max 100x100px for avatar
        const size = 100;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;

        // Crop to square from center
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;

        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        URL.revokeObjectURL(url);

        // 0.7 quality JPEG — very small
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };

      img.src = url;
    });
  };

  const save = () => {
    if (!name || !rustdeskId || !password) {
      return;
    }

    const data = {
      name,
      rustdeskId: rustdeskId.replace(/\s+/g, ""),
      password,
      avatar,
    };
    localStorage.setItem("student", JSON.stringify(data));

    // Don't emit socket here — group page handles join_group on mount
    router.push("/group");
  };

  const fields = [
    {
      id: "profile-name",
      label: "Full name",
      value: name,
      set: setName,
      placeholder: "John Doe",
      type: "text",
      autoComplete: "name",
    },
    {
      id: "profile-rustdesk-id",
      label: "RustDesk ID",
      value: rustdeskId,
      set: (v: string) => setRustdeskId(v.replace(/\s+/g, "")),
      placeholder: "123456789",
      type: "text",
      autoComplete: "off",
    },
    {
      id: "profile-rustdesk-password",
      label: "RustDesk password",
      value: password,
      set: setPassword,
      placeholder: "••••••••",
      type: "password",
      autoComplete: "off",
    },
  ];

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
          href="/student"
          className={`rounded text-sm font-semibold text-[#AAB4DB] underline-offset-4 transition-colors hover:text-white hover:underline ${focus}`}
        >
          Back to code
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center px-6 pb-20 pt-10">
        <div className="w-full max-w-xl">
          <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">
            Your profile.
          </h1>
          {/* Avatar upload */}
          <div className="mt-10 flex items-center gap-5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label={avatar ? "Change photo" : "Add a photo"}
              className={`flex size-24 cursor-pointer shrink-0 items-center justify-center overflow-hidden rounded-full border-2 transition-colors ${focus} ${
                avatar
                  ? "border-white"
                  : "border-dashed border-white/30 bg-white/10 hover:border-white hover:bg-white/15"
              }`}
            >
              {avatar ? (
                // the photo is a small base64 image, so next/image doesn't help here
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar}
                  alt="Your avatar"
                  className="size-full object-cover"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="text-4xl font-light text-white/60"
                >
                  +
                </span>
              )}
            </button>

            <div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={`rounded text-base font-semibold underline-offset-4 hover:underline ${focus}`}
              >
                {avatar ? "Change photo" : "Add a photo"}
              </button>
              <p className="mt-1 text-sm text-[#AAB4DB]">Optional</p>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhoto}
            />
          </div>

          {/* Fields */}
          <div className="mt-8 flex flex-col gap-6">
            {fields.map(
              ({ id, label, value, set, placeholder, type, autoComplete }) => (
                <div key={id} className="flex flex-col gap-2">
                  <label htmlFor={id} className="text-sm font-semibold">
                    {label}
                  </label>
                  <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    autoComplete={autoComplete}
                    aria-describedby={`${id}-hint`}
                    className="h-14 w-full rounded-2xl border border-white/20 bg-white/10 px-5 text-lg font-semibold text-white outline-none backdrop-blur transition-colors placeholder:font-normal placeholder:text-white/40 focus-visible:border-white focus-visible:ring-4 focus-visible:ring-white/20"
                  />
                </div>
              ),
            )}
          </div>

          <button
            onClick={save}
            disabled={!name || !rustdeskId || !password}
            className="mt-10 h-16 w-full rounded-full bg-white text-lg font-bold text-[#1B2FD6] transition-transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/40 disabled:hover:scale-100 motion-reduce:transition-none"
          >
            Save and join
          </button>
        </div>
      </main>
    </div>
  );
}
