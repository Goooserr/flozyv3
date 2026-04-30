import { Metadata } from "next";
import ConfidentialiteContent from "./ConfidentialiteContent";

export const metadata: Metadata = {
  title: "Politique de Confidentialité",
  description: "Comment Flozy protège vos données et celles de vos clients. Conformité RGPD.",
  robots: { index: false },
};

export default function Page() {
  return <ConfidentialiteContent />;
}
