'use client'

import React, { useState } from 'react';
import { Sidebar, Header, BottomNav, MobileDrawer } from "@/components/layout";
import { DynamicThemeProvider } from "@/components/DynamicThemeProvider";
import { QuickActionFAB } from "@/components/QuickActionFAB";
import { usePathname } from "next/navigation";
import { PostHogProvider } from "./PostHogProvider";
import PostHogPageView from "./PostHogPageView";
import { MetaPixel } from "./analytics/MetaPixel";
import { GoogleTag } from "./analytics/GoogleTag";

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/register" || pathname === "/demo" || pathname.startsWith("/p/") || pathname === "/admin-login" || pathname.startsWith("/legal");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <PostHogProvider>
      <PostHogPageView />
      <MetaPixel />
      <GoogleTag />
      <DynamicThemeProvider>
        {isPublicPage ? (
        <main className="min-h-screen">
          {children}
        </main>
      ) : (
        <div className="flex min-h-[100dvh]">
          <Sidebar />
          <MobileDrawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
          <div className="flex-1 flex flex-col min-h-[100dvh] relative pb-20 md:pb-0">
            <Header onOpenMenu={() => setIsMobileMenuOpen(true)} />
            <main className="flex-1 p-4 md:p-6 overflow-y-auto">
              {children}
            </main>
            <QuickActionFAB className="md:bottom-8 bottom-24" />
            <BottomNav onOpenMenu={() => setIsMobileMenuOpen(true)} />
          </div>
        </div>
      )}
    </DynamicThemeProvider>
    </PostHogProvider>
  );
}
