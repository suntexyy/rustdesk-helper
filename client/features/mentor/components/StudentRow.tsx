import type { StaffStudent } from "../types/mentorTypes";

const STATUS: Record<StaffStudent["status"], { label: string; cls: string }> = {
  idle: { label: "Online", cls: "bg-zinc-100 text-zinc-600" },
  waiting: { label: "Needs help", cls: "bg-amber-100 text-amber-700" },
  ongoing: { label: "In session", cls: "bg-blue-100 text-blue-700" },
};

export function StudentRow({
  student,
  onConnect,
  onComplete,
}: {
  student: StaffStudent;
  onConnect: () => void;
  onComplete: () => void;
}) {
  const status = STATUS[student.status];

  return (
    <li className="flex items-center gap-4 py-4">
      {student.avatar ? (
        <img
          src={student.avatar}
          alt=""
          className="size-10 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-600">
          {student.name.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-black">
          {student.name}
        </p>
        <p className="font-mono text-xs text-zinc-500">{student.rustdeskId}</p>
      </div>

      <span
        className={`hidden rounded-full px-3 py-1 text-xs font-medium sm:inline ${status.cls}`}
      >
        {status.label}
      </span>

      {student.status === "ongoing" ? (
        <button
          onClick={onComplete}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          Complete
        </button>
      ) : (
        <button
          onClick={onConnect}
          className="rounded-lg bg-[#18181b] px-4 py-2 text-sm font-medium text-white hover:bg-black"
        >
          Connect
        </button>
      )}
    </li>
  );
}
