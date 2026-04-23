'use client'

import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  CreditCard,
  PlusCircle,
  Menu,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Factures', icon: FileText, href: '/invoices' },
  { name: 'Clients', icon: Users, href: '/clients' },
  { name: 'Abonnement', icon: CreditCard, href: '/billing' },
  { name: 'Paramètres', icon: Settings, href: '/settings' },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Flozy Artisan
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
              item.name === 'Dashboard' 
                ? "bg-secondary text-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </a>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <Link 
          href="/invoices/new"
          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:opacity-90 transition-opacity"
        >
          <PlusCircle className="w-4 h-4" />
          Nouveau Devis
        </Link>
      </div>
    </aside>
  );
}

export function Header() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="h-16 border-b border-border bg-background/50 backdrop-blur-xl sticky top-0 z-10 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4 md:hidden">
        <Menu className="w-5 h-5 text-muted-foreground" />
        <span className="font-bold">Flozy</span>
      </div>
      
      <div className="flex-1 flex justify-end items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSignOut}
            className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            title="Déconnexion"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium leading-none">Mon Compte</p>
              <p className="text-xs text-muted-foreground mt-1">Artisan</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
