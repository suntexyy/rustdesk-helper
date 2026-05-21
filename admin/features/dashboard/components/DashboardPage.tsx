"use client";

import { useMe } from "../useMe";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const { data } = useMe();
  const userName = data?.data?.name || "Admin";

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {userName}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here is an overview of your application today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4"></div>
    </div>
  );
}
