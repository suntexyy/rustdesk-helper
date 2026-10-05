import { Panel } from "./Panel";

export function StatusDonut({
  idle,
  waiting,
  ongoing,
}: {
  idle: number;
  waiting: number;
  ongoing: number;
}) {
  const total = idle + waiting + ongoing;
  const r = 40;
  const c = 2 * Math.PI * r;

  const base = [
    {
      label: "Idle",
      value: idle,
      stroke: "stroke-zinc-300",
      dot: "bg-zinc-300",
    },
    {
      label: "Needs help",
      value: waiting,
      stroke: "stroke-amber-500",
      dot: "bg-amber-500",
    },
    {
      label: "In session",
      value: ongoing,
      stroke: "stroke-blue-500",
      dot: "bg-blue-500",
    },
  ];
  const segments = base.map((s, i) => ({
    ...s,
    length: total ? (s.value / total) * c : 0,
    offset: total
      ? base.slice(0, i).reduce((sum, x) => sum + (x.value / total) * c, 0)
      : 0,
  }));

  return (
    <Panel
      title="Session status"
      description="Students online right now"
      className="lg:col-span-3"
    >
      <div className="flex items-center gap-6">
        <div className="relative size-36 shrink-0">
          <svg viewBox="0 0 100 100" className="size-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              strokeWidth="12"
              className="stroke-muted"
            />
            {segments.map(
              (s) =>
                s.value > 0 && (
                  <circle
                    key={s.label}
                    cx="50"
                    cy="50"
                    r={r}
                    fill="none"
                    strokeWidth="12"
                    strokeDasharray={`${s.length} ${c - s.length}`}
                    strokeDashoffset={-s.offset}
                    className={s.stroke}
                  />
                ),
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{total}</span>
            <span className="text-xs text-muted-foreground">online</span>
          </div>
        </div>

        <ul className="flex flex-col gap-3 text-sm">
          {segments.map((s) => (
            <li key={s.label} className="flex items-center gap-2">
              <span className={`size-3 rounded-full ${s.dot}`} />
              <span className="text-muted-foreground">{s.label}</span>
              <span className="font-semibold">{s.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
