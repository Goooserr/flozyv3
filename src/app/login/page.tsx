import { Metadata } from "next";
import LoginPage from "./LoginClient";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace Flozy pour gérer vos chantiers, devis et factures.",
};

export default function Page() {
  return <LoginPage />;
}
