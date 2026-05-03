import { Metadata } from "next";
import InvoicesPage from "./InvoicesClient";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Factures & Devis",
  description: "Gérez vos documents financiers, suivez les paiements et créez de nouveaux devis professionnels.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <InvoicesPage />
    </Suspense>
  );
}
