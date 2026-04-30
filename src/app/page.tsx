import { Metadata } from "next";
import LandingPage from "./LandingClient";

export const metadata: Metadata = {
  title: "Flozy | Logiciel de gestion pour artisans - Devis, Factures, Planning",
  description: "Gagnez 10h par semaine sur votre administratif. Flozy est le logiciel tout-en-un conçu pour les artisans : devis rapides, facturation simplifiée, gestion de stock et planning intelligent.",
  alternates: {
    canonical: "https://flozy.fr",
  },
};

export default function Page() {
  return <LandingPage />;
}
