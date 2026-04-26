'use client'

import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar, Header } from "@/components/layout";
import { DynamicThemeProvider } from "@/components/DynamicThemeProvider";
import { QuickActionFAB } from "@/components/QuickActionFAB";
import { usePathname } from "next/navigation";

const inter = Inter({
  subsets: ["latin"],
});

import { FlozyCareWidget } from "@/components/FlozyCareWidget";
import { useTheme } from "@/components/DynamicThemeProvider";

function PlanBadge() {
  const { subscriptionPlan } = useTheme();
  return (
    <div className="fixed top-0 left-0 z-[9999] bg-red-600 text-white px-4 py-1 font-black text-[10px] uppercase shadow-xl pointer-events-none">
      DEBUG: PLAN = {subscriptionPlan}
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/register" || pathname === "/demo" || pathname.startsWith("/p/") || pathname === "/admin-login";

  return (
    <html lang="fr" className="dark h-full">
      <body className={`${inter.className} min-h-full bg-background text-foreground antialiased`}>
        <DynamicThemeProvider>
          {/* Debug Plan Badge */}
          <PlanBadge />
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
                <FlozyCareWidget />
              </div>
            </div>
          )}
        </DynamicThemeProvider>
      </body>
    </html>
  );
}
