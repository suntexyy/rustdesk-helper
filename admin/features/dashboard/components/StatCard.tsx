import type { LucideIcon } from "lucide-react";

export function StatCard({
  title,
  value,
  icon: Icon,
  accent = "bg-primary/10 text-primary",
  hint,
}: {
  title: string;
  value: number | string;
  icon: LucideIcon;
  accent?: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div
          className={`flex size-9 items-center justify-center rounded-lg ${accent}`}
        >
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
