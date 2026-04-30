'use client'

import { Sidebar, Header } from "@/components/layout";
import { DynamicThemeProvider } from "@/components/DynamicThemeProvider";
import { QuickActionFAB } from "@/components/QuickActionFAB";
import { usePathname } from "next/navigation";
import SupportChat from "@/components/SupportChat";
import { PostHogProvider } from "./PostHogProvider";
import PostHogPageView from "./PostHogPageView";

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/register" || pathname === "/demo" || pathname.startsWith("/p/") || pathname === "/admin-login" || pathname.startsWith("/legal");

  return (
    <PostHogProvider>
      <PostHogPageView />
      <DynamicThemeProvider>
        {isPublicPage ? (
        <main className="min-h-screen">
          {children}
        </main>
      ) : (
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 p-6 overflow-y-auto">
              {children}
            </main>
            <QuickActionFAB />
            <SupportChat />
          </div>
        </div>
      )}
    </DynamicThemeProvider>
    </PostHogProvider>
  );
}
