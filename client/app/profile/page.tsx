"use client";

import { socket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast/headless";

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
      setRustdeskId(data.rustdeskId || "");
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

    const data = { name, rustdeskId, password, avatar };
    localStorage.setItem("student", JSON.stringify(data));

    // Don't emit socket here — group page handles join_group on mount
    router.push("/group");
  };

  return (
    <div className=" min-h-screen flex items-center justify-center p-4">
      <div
        className="w-full max-w-[420px] rounded-2xl p-10
  shadow-[0_4px_24px_rgba(0,0,0,0.08)]
  flex
  flex-col
  gap-6
"
      >
        <div className="text-center">
          <h1 className="mb-1 text-[22px] font-bold text-[#09090b]">
            Your Profile
          </h1>
          <p className="text-[14px] text-[#71717a]">
            Fill in your details to join
          </p>
        </div>

        {/* Avatar upload */}
        <div className="flex flex-col items-center gap-[10px]">
          <div
            onClick={() => fileRef.current?.click()}
            className={`w-20 h-20 rounded-full flex items-center justify-center cursor-pointer overflow-hidden shrink-0 transition-colors border-2 border-dashed border-[#d4d4d4] ${
              avatar ? "bg-transparent" : "bg-[#f4f4f5]"
            }`}
          >
            {avatar ? (
              <img
                src={avatar}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[28px] text-[#a1a1aa]">+</span>
            )}
          </div>
          <span
            className="text-[12px] text-[#71717a] cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            {avatar ? "Change photo" : "Add photo (optional)"}
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhoto}
          />
        </div>

        {/* Fields */}
        {[
          {
            label: "Full Name",
            value: name,
            set: setName,
            placeholder: "John Doe",
            type: "text",
          },
          {
            label: "RustDesk ID",
            value: rustdeskId,
            set: setRustdeskId,
            placeholder: "RustDesk ID",
            type: "text",
          },
          {
            label: "RustDesk Password",
            value: password,
            set: setPassword,
            placeholder: "••••••••",
            type: "password",
          },
        ].map(({ label, value, set, placeholder, type }) => (
          <div key={label} className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-[#09090b]">
              {label}
            </label>
            <input
              type={type}
              placeholder={placeholder}
              value={value}
              onChange={(e) => set(e.target.value)}
              className="h-[44px] border-[1.5px] border-[#e4e4e7] rounded-[8px] pl-2 text-[14px] outline-none color-[#09090b] background-[#fafafa] width-[100%] boxSizing-[border-box] transition-[border-color_0.15s]"
            />
          </div>
        ))}

        <button
          onClick={save}
          disabled={!name || !rustdeskId || !password}
          className="h-11 bg-[#18181b] text-white border-0 rounded-lg text-[15px] font-semibold cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save & Join
        </button>
      </div>
    </div>
  );
}
