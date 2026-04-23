import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar, Header } from "@/components/layout";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flozy Artisan | Gestion simplifiée",
  description: "La plateforme de gestion moderne pour les artisans et PME.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark h-full">
      <body className={`${inter.className} min-h-full flex bg-background text-foreground antialiased`}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
