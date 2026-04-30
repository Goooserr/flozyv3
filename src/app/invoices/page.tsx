import { Metadata } from "next";
import InvoicesPage from "./InvoicesClient";

export const metadata: Metadata = {
  title: "Factures & Devis",
  description: "Gérez vos documents financiers, suivez les paiements et créez de nouveaux devis professionnels.",
};

export default function Page() {
  return <InvoicesPage />;
}
