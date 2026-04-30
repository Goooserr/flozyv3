import { Metadata } from "next";
import SettingsPage from "./SettingsClient";

export const metadata: Metadata = {
  title: "Paramètres",
  description: "Configurez votre profil artisan, votre entreprise et vos préférences Flozy.",
};

export default function Page() {
  return <SettingsPage />;
}
