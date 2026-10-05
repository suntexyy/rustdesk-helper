"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query"; // same package your other hooks use
import { socket } from "@/lib/socket";
import { fetchDashboardStats } from "../dashboardApi";
import type { LiveSnapshot } from "../dashboardTypes";

export function useDashboard() {
  const [live, setLive] = useState<LiveSnapshot | null>(null);
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    // runs on connect AND on every reconnect (the server forgets us after a restart)
    const join = () => {
      setConnected(true);
      socket.emit("admin_join_dashboard");
    };
    const onDisconnect = () => setConnected(false);
    const onUpdate = (snapshot: LiveSnapshot) => setLive(snapshot);

    socket.on("connect", join);
    socket.on("disconnect", onDisconnect);
    socket.on("dashboard_update", onUpdate);

    if (socket.connected) join();
    else socket.connect();

    return () => {
      socket.off("connect", join);
      socket.off("disconnect", onDisconnect);
      socket.off("dashboard_update", onUpdate);
    };
  }, []);

  const stats = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    refetchInterval: 10000, // history numbers refresh every 10 seconds
  });

  return { live, connected, stats: stats.data, statsLoading: stats.isLoading };
}
