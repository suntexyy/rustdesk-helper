"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useMe } from "@/features/dashboard/useMe";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, isLoading, error } = useMe();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
          <p className="text-sm text-zinc-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If there's an error fetching the user (e.g. 401 Unauthorized)
  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Not Authenticated</h2>
          <p className="text-zinc-500 mb-4">
            Please log in to access the dashboard.
          </p>
          <a href="/login" className="text-blue-500 hover:underline">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  const userData = data.data;

  const user = {
    name: userData.name || "Admin",
    email: userData.email || "admin@rustdesk-helper.ge",
    avatar: "", // Placeholder or default
  };

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6 bg-zinc-50/50 dark:bg-zinc-900/50">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
