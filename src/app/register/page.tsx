import { Metadata } from "next";
import RegisterPage from "./RegisterClient";

export const metadata: Metadata = {
  title: "Inscription",
  description: "Créez votre compte Flozy et commencez à gérer votre activité d'artisan avec excellence. Inscription rapide en moins de 2 minutes.",
};

export default function Page() {
  return <RegisterPage />;
}
