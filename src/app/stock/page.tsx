import { Metadata } from "next";
import StockPage from "./StockClient";

export const metadata: Metadata = {
  title: "Gestion de Stock",
  description: "Suivez vos consommables et matériels en temps réel. Alertes de stock bas et inventaire.",
};

export default function Page() {
  return <StockPage />;
}
