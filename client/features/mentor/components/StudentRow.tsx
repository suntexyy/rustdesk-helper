import type { StaffStudent } from "../types/mentorTypes";

const STATUS = {
  idle: {
    label: "Online",
    dot: "bg-[#34E3A5]",
    text: "text-[#34E3A5]",
    row: "hover:bg-white/5",
  },
  waiting: {
    label: "Needs help",
    dot: "bg-[#FFC53D]",
    text: "text-[#FFC53D]",
    row: "bg-[#FFC53D]/10 ring-1 ring-inset ring-[#FFC53D]/40",
  },
  ongoing: {
    label: "In session",
    dot: "bg-[#6D8BFF]",
    text: "text-[#9DB1FF]",
    row: "bg-[#4C6BFF]/10 ring-1 ring-inset ring-[#4C6BFF]/30",
  },
} as const;

// RustDesk shows IDs in groups of three from the right: 80 595 673
const formatId = (id: string) => {
  const clean = String(id).replace(/\s+/g, "");
  return /^\d+$/.test(clean)
    ? clean.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    : clean;
};

// a steady color for each student, taken from their name
const hueFor = (name: string) =>
  Array.from(name).reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 0);

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export function StudentRow({
  student,
  passwordCopied,
  onConnect,
  onReconnect,
  onComplete,
}: {
  student: StaffStudent;
  passwordCopied: boolean;
  onConnect: () => void;
  onReconnect: () => void;
  onComplete: () => void;
}) {
  const s = STATUS[student.status];
  const hue = hueFor(student.name);

  return (
    <li
      className={`flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl px-4 py-3.5 transition-colors motion-reduce:transition-none ${s.row}`}
    >
      <span className="relative flex size-12 shrink-0">
        {student.avatar ? (
          // avatars are small base64 images, so next/image doesn't help here
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={student.avatar}
            alt=""
            className="size-12 rounded-full object-cover"
          />
        ) : (
          <span
            className="flex size-12 items-center justify-center rounded-full text-lg font-bold"
            style={{
              backgroundColor: `hsl(${hue} 85% 70%)`,
              color: `hsl(${hue} 60% 18%)`,
            }}
          >
            {student.name.charAt(0).toUpperCase()}
          </span>
        )}

        <span
          aria-hidden="true"
          className="absolute -bottom-0.5 -right-0.5 flex size-4"
        >
          {student.status === "waiting" && (
            <span className="absolute inset-0 animate-ping rounded-full bg-[#FFC53D] motion-reduce:hidden" />
          )}
          <span
            className={`relative size-4 rounded-full ring-2 ring-[#0D1342] ${s.dot}`}
          />
        </span>
      </span>

      <div className="min-w-0 flex-1 basis-40">
        <p className="truncate font-semibold text-white">{student.name}</p>
        <p className="flex flex-wrap items-baseline gap-x-3 text-sm">
          <span className={`font-medium ${s.text}`}>{s.label}</span>
          <span className="select-all tabular-nums text-[#AAB4DB]">
            {formatId(student.rustdeskId)}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        {passwordCopied && (
          <span
            role="status"
            className="mr-1 text-sm font-medium text-[#34E3A5]"
          >
            Password copied
          </span>
        )}

        {student.status === "ongoing" ? (
          <>
            <button
              onClick={onReconnect}
              aria-label={`Reopen RustDesk for ${student.name}`}
              className={`rounded-full px-3 py-2 text-sm font-semibold text-[#AAB4DB] transition-colors hover:text-white ${focus}`}
            >
              Reopen
            </button>
            <button
              onClick={onComplete}
              aria-label={`Finish session with ${student.name}`}
              className={`rounded-full bg-[#34E3A5] px-5 py-2.5 text-sm font-bold text-[#04261A] transition-transform hover:scale-[1.04] motion-reduce:transition-none ${focus}`}
            >
              Finish
            </button>
          </>
        ) : (
          <button
            onClick={onConnect}
            aria-label={`Connect to ${student.name}`}
            className={`rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#1B2FD6] transition-transform hover:scale-[1.04] motion-reduce:transition-none ${focus}`}
          >
            Connect
          </button>
        )}
      </div>
    </li>
  );
}
