"use client";

import { lastNDays } from "../lib/format";
import { Panel } from "./Panel";

export function HelpRequestsChart({
  perDay,
}: {
  perDay: { date: string; count: number }[];
}) {
  const days = lastNDays(7).map((date) => ({
    date,
    count: perDay.find((p) => p.date === date)?.count ?? 0,
  }));
  const max = Math.max(1, ...days.map((d) => d.count));
  const total = days.reduce((sum, d) => sum + d.count, 0);

  return (
    <Panel
      title="Help requests"
      description={`${total} in the last 7 days`}
      className="lg:col-span-4"
    >
      <div className="flex items-end gap-3">
        {days.map((d) => (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-xs font-medium">{d.count}</span>
            <div className="flex h-32 w-full items-end">
              <div
                className={`w-full rounded-t-md transition-all ${d.count ? "bg-primary" : "bg-muted"}`}
                style={{
                  height: d.count
                    ? `${Math.max(6, (d.count / max) * 100)}%`
                    : "3px",
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(d.date + "T00:00:00").toLocaleDateString(undefined, {
                weekday: "short",
              })}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
