import type { StaffStudent } from "../types/mentorTypes";

const STATUS = {
  idle: {
    label: "Online",
    dot: "bg-[#3DDC97]",
    text: "text-[#0B6B45]",
    rail: "bg-transparent",
    row: "",
  },
  waiting: {
    label: "Needs help",
    dot: "bg-[#FFD23F]",
    text: "text-[#7A5200]",
    rail: "bg-[#FFD23F]",
    row: "bg-[#FFF8DE]",
  },
  ongoing: {
    label: "In session",
    dot: "bg-[#2F6BFF]",
    text: "text-[#1F4FCC]",
    rail: "bg-[#2F6BFF]",
    row: "",
  },
} as const;

// RustDesk shows IDs in groups of three from the right: 80 595 673
const formatId = (id: string) => {
  const clean = String(id).replace(/\s+/g, "");
  return /^\d+$/.test(clean)
    ? clean.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    : clean;
};

const primary =
  "rounded-full bg-[#0B2545] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#13365F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B2545]";
const secondary =
  "rounded-full border border-[#C5CEDB] px-5 py-2.5 text-sm font-semibold text-[#0B2545] transition-colors hover:bg-[#F4F6FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B2545]";

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

  return (
    <li
      className={`relative flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-[#EEF1F6] py-4 pl-6 pr-5 last:border-b-0 ${s.row}`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-1.5 ${s.rail}`}
      />

      <span className="relative flex size-12 shrink-0">
        {student.status === "waiting" && (
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-ping rounded-full bg-[#FFD23F] motion-reduce:hidden"
          />
        )}
        {student.avatar ? (
          // avatars are small base64 images, so next/image doesn't help here
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={student.avatar}
            alt=""
            className="relative size-12 rounded-full object-cover ring-2 ring-white"
          />
        ) : (
          <span className="relative flex size-12 items-center justify-center rounded-full bg-[#0B2545] text-lg font-bold text-white">
            {student.name.charAt(0).toUpperCase()}
          </span>
        )}
      </span>

      <div className="min-w-0 flex-1 basis-40">
        <p className="truncate font-semibold text-[#0B2545]">{student.name}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm">
          <span aria-hidden="true" className={`size-2 rounded-full ${s.dot}`} />
          <span className={`font-medium ${s.text}`}>{s.label}</span>
          <span className="select-all tabular-nums text-[#5B6B82]">
            {formatId(student.rustdeskId)}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        {passwordCopied && (
          <span role="status" className="text-sm font-medium text-[#0B6B45]">
            Password copied
          </span>
        )}

        {student.status === "ongoing" ? (
          <>
            <button
              onClick={onReconnect}
              className={secondary}
              aria-label={`Reconnect to ${student.name}`}
            >
              Reconnect
            </button>
            <button
              onClick={onComplete}
              className={primary}
              aria-label={`Finish session with ${student.name}`}
            >
              Finish session
            </button>
          </>
        ) : (
          <button
            onClick={onConnect}
            className={primary}
            aria-label={`Connect to ${student.name}`}
          >
            Connect
          </button>
        )}
      </div>
    </li>
  );
}
