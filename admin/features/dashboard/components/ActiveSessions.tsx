import Link from "next/link";
import type { LiveStudent } from "../dashboardTypes";
import { Panel } from "./Panel";

export function ActiveSessions({ students }: { students: LiveStudent[] }) {
  return (
    <Panel
      title="Active sessions"
      description="Students being helped right now"
    >
      {students.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No sessions in progress.
        </p>
      ) : (
        <ul className="flex flex-col divide-y">
          {students.map((s) => (
            <li
              key={s.socketId}
              className="flex items-center justify-between py-3"
            >
              <div>
                <p className="text-sm font-medium">{s.name}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  Group {s.groupCode}
                </p>
              </div>
              <Link
                href={`/dashboard/group/${s.groupCode}`}
                className="rounded-md border px-3 py-1 text-xs font-medium hover:bg-muted"
              >
                Open group
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
