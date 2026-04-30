import { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppWrapper from "@/components/AppWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Flozy | L'excellence opérationnelle pour les artisans",
    template: "%s | Flozy",
  },
  description: "Le système d'exploitation nouvelle génération pour les artisans modernes. Devis, factures, stock et planning centralisés dans l'interface la plus rapide du marché.",
  keywords: ["artisan", "logiciel gestion", "facturation", "devis", "planning", "chantier", "BTP", "SaaS"],
  authors: [{ name: "Flozy Team" }],
  creator: "Flozy",
  metadataBase: new URL("https://flozy.fr"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://flozy.fr",
    siteName: "Flozy",
    title: "Flozy | L'excellence opérationnelle pour les artisans",
    description: "Gagnez 10h par semaine sur votre administratif. Devis, factures et planning réunis.",
    images: [
      {
        url: "/og-image.png", // À créer plus tard
        width: 1200,
        height: 630,
        alt: "Flozy - Logiciel pour artisans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flozy | Gestion Artisan",
    description: "L'outil tout-en-un pour gérer votre activité d'artisan en toute simplicité.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark h-full">
      <body className={`${inter.variable} font-sans min-h-full bg-background text-foreground antialiased`}>
        <AppWrapper>
          {children}
        </AppWrapper>
      </body>
    </html>
  );
}
