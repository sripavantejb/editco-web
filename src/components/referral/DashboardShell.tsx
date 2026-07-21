"use client";

import { DashboardThemeProvider } from "@/components/referral/DashboardThemeProvider";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return <DashboardThemeProvider>{children}</DashboardThemeProvider>;
}
