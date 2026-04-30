import { Metadata } from "next";
import PlanningPage from "./PlanningClient";

export const metadata: Metadata = {
  title: "Planning & Interventions",
  description: "Organisez vos chantiers et ceux de votre équipe. Vue calendrier et suivi des interventions.",
};

export default function Page() {
  return <PlanningPage />;
}
