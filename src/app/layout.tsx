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
