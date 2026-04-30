import { Metadata } from "next";
import MentionsLegalesContent from "./MentionsLegalesContent";

export const metadata: Metadata = {
  title: "Mentions Légales",
  description: "Informations légales concernant l'éditeur et l'hébergeur du site Flozy.",
  robots: { index: false }, // Souvent préférable de ne pas indexer le légal en priorité
};

export default function Page() {
  return <MentionsLegalesContent />;
}
