import Link from "next/link";
import type { LiveGroup } from "../dashboardTypes";
import { Panel } from "./Panel";

export function StudentsPerGroup({ groups }: { groups: LiveGroup[] }) {
  const sorted = [...groups].sort((a, b) => b.students - a.students);
  const max = Math.max(1, ...sorted.map((g) => g.students));

  return (
    <Panel title="Students per group" description="Groups with students online">
      {sorted.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No active groups right now.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {sorted.map((g) => (
            <li key={g.code}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <Link
                  href={`/dashboard/group/${g.code}`}
                  className="font-mono font-medium hover:underline"
                >
                  {g.code}
                </Link>
                <span className="text-muted-foreground">
                  {g.students} student{g.students !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{ width: `${(g.students / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
