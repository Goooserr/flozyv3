import { Metadata } from 'next'
import DemoClient from './DemoClient'

export const metadata: Metadata = {
  title: 'Démo Interactive | Flozy - Logiciel Artisan BTP',
  description: 'Testez gratuitement Flozy, le logiciel de gestion tout-en-un pour les artisans du BTP. Devis, factures, plannings et suivi de chantier en quelques clics.',
  openGraph: {
    title: 'Démo Interactive | Flozy - Logiciel Artisan BTP',
    description: 'Testez gratuitement Flozy, le logiciel de gestion tout-en-un pour les artisans du BTP. Devis, factures, plannings et suivi de chantier en quelques clics.',
    type: 'website',
  }
}

export default function DemoPage() {
  return <DemoClient />
}
