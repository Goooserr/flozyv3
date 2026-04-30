import { Metadata } from "next";
import PhotosPage from "./PhotosClient";

export const metadata: Metadata = {
  title: "Photos de Chantier",
  description: "Archivez les preuves de vos travaux. Photos avant/après et suivi visuel des interventions.",
};

export default function Page() {
  return <PhotosPage />;
}
