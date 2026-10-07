import type { StaffStudent } from "../types/mentorTypes";

const STATUS = {
  idle: {
    label: "Online",
    dot: "bg-[#1FCB8D]",
    text: "text-[#0B7A55]",
    row: "",
  },
  waiting: {
    label: "Needs help",
    dot: "bg-[#FFC53D]",
    text: "text-[#8A5A00]",
    row: "bg-[#FFF9E6]",
  },
  ongoing: {
    label: "In session",
    dot: "bg-[#2547FF]",
    text: "text-[#2547FF]",
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

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2547FF]";

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
      className={`flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4 ${s.row}`}
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
          <span className="flex size-12 items-center justify-center rounded-full bg-[#E8ECFF] text-lg font-bold text-[#2547FF]">
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
            className={`relative size-4 rounded-full border-2 border-white ${s.dot}`}
          />
        </span>
      </span>

      <div className="min-w-0 flex-1 basis-40">
        <p className="flex items-baseline gap-2">
          <span className="truncate font-semibold">{student.name}</span>
          <span className={`shrink-0 text-sm font-medium ${s.text}`}>
            {s.label}
          </span>
        </p>
        <p className="select-all text-sm tabular-nums text-[#5A6285]">
          {formatId(student.rustdeskId)}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {passwordCopied && (
          <span role="status" className="text-sm font-medium text-[#0B7A55]">
            Password copied
          </span>
        )}

        {student.status === "ongoing" ? (
          <>
            <button
              onClick={onReconnect}
              aria-label={`Reopen RustDesk for ${student.name}`}
              className={`rounded-full px-3 py-2 text-sm font-semibold text-[#2547FF] hover:underline ${focus}`}
            >
              Reopen
            </button>
            <button
              onClick={onComplete}
              aria-label={`Finish session with ${student.name}`}
              className={`rounded-full bg-[#0E1330] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1B2250] ${focus}`}
            >
              Finish
            </button>
          </>
        ) : (
          <button
            onClick={onConnect}
            aria-label={`Connect to ${student.name}`}
            className={`rounded-full bg-[#2547FF] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1B38E0] ${focus}`}
          >
            Connect
          </button>
        )}
      </div>
    </li>
  );
}
