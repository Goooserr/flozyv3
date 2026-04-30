import { Metadata } from "next";
import CGVContent from "./CGVContent";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente",
  description: "Conditions d'utilisation et de vente du logiciel Flozy pour les professionnels.",
  robots: { index: false },
};

export default function Page() {
  return <CGVContent />;
}
