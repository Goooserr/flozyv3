import { Metadata } from "next";
import Dashboard from "./DashboardClient";

export const metadata: Metadata = {
  title: "Tableau de Bord",
  description: "Gérez votre activité d'artisan en un coup d'œil : CA, interventions et clients.",
};

export default function Page() {
  return <Dashboard />;
}
