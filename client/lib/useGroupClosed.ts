"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket";

// Sends the student back to the code page when their group is deleted.
// Also handles a stale code: the server answers "join_denied" when the group is gone.
export function useGroupClosed() {
  const router = useRouter();

  useEffect(() => {
    const leave = () => {
      try {
        localStorage.removeItem("groupCode");
        sessionStorage.setItem("groupClosed", "1");
      } catch {
        // storage blocked: still leave the page
      }
      socket.disconnect();
      router.replace("/student");
    };

    socket.on("group_closed", leave);
    socket.on("join_denied", leave);

    return () => {
      socket.off("group_closed", leave);
      socket.off("join_denied", leave);
    };
  }, [router]);
}
