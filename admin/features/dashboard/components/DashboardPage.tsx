"use client";

import { LifeBuoy, Layers, Play, Users, Wifi, Zap } from "lucide-react";
import { useMe } from "../useMe";
import { useDashboard } from "../hooks/useDashboard";
import { StatCard } from "./StatCard";
import { HelpRequestsChart } from "./HelpRequestsChart";
import { StatusDonut } from "./StatusDonut";
import { StudentsPerGroup } from "./StudentsPerGroup";
import { ActiveSessions } from "./ActiveSessions";
import { RecentHelpRequests } from "./RecentHelpRequests";

export default function DashboardPage() {
  const { data } = useMe();
  const userName = data?.data?.name || "Admin";

  const { live, connected, stats } = useDashboard();

  const online = live?.online ?? 0;
  const waiting = live?.waiting ?? 0;
  const ongoing = live?.ongoing ?? 0;
  const idle = Math.max(0, online - waiting - ongoing);
  const ongoingStudents =
    live?.students.filter((s) => s.status === "ongoing") ?? [];

  const liveValue = (n: number) => (live ? n : "—");
  const statValue = (n?: number) => (n === undefined ? "—" : n);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {userName}!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Here is an overview of your application today.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
          <span
            className={`size-2 rounded-full ${connected ? "animate-pulse bg-green-500" : "bg-amber-500"}`}
          />
          {connected ? "Live" : "Connecting… (can take up to a minute)"}
        </div>
      </div>

      {/* Numbers */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total students"
          value={statValue(stats?.totalStudents)}
          icon={Users}
          hint="Unique students who have joined"
        />
        <StatCard
          title="Online students"
          value={liveValue(online)}
          icon={Wifi}
          accent="bg-green-100 text-green-600"
        />
        <StatCard
          title="Needing help"
          value={liveValue(waiting)}
          icon={LifeBuoy}
          accent="bg-amber-100 text-amber-600"
        />
        <StatCard
          title="Ongoing sessions"
          value={liveValue(ongoing)}
          icon={Play}
          accent="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Total groups"
          value={statValue(stats?.totalGroups)}
          icon={Layers}
        />
        <StatCard
          title="Requests today"
          value={statValue(stats?.requestsToday)}
          icon={Zap}
          accent="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-7">
        <HelpRequestsChart perDay={stats?.perDay ?? []} />
        <StatusDonut idle={idle} waiting={waiting} ongoing={ongoing} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StudentsPerGroup groups={live?.groups ?? []} />
        <ActiveSessions students={ongoingStudents} />
      </div>

      <RecentHelpRequests items={stats?.recent ?? []} />
    </div>
  );
}
