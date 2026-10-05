import type { HelpRequestItem } from "../dashboardTypes";
import { timeAgo } from "../lib/format";
import { Panel } from "./Panel";

const STATUS_STYLE: Record<HelpRequestItem["status"], string> = {
  waiting: "bg-amber-100 text-amber-700",
  ongoing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-zinc-100 text-zinc-600",
};

export function RecentHelpRequests({ items }: { items: HelpRequestItem[] }) {
  return (
    <Panel title="Recent help requests" description="The last 10 requests">
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No help requests yet.
        </p>
      ) : (
        <ul className="flex flex-col divide-y">
          {items.map((r) => (
            <li
              key={r._id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{r.studentName}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  Group {r.groupCode} · {timeAgo(r.requestedAt)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLE[r.status]}`}
              >
                {r.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
