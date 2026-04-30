import { Metadata } from "next";
import ClientsPage from "./ClientsClient";

export const metadata: Metadata = {
  title: "Clients",
  description: "Répertoire complet de vos clients, historique des chantiers et documents associés.",
};

export default function Page() {
  return <ClientsPage />;
}
