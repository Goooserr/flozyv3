'use client'

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  CreditCard,
  PlusCircle,
  Menu,
  LogOut,
  Box,
  Calendar,
  Shield,
  Lock,
  Camera,
  X,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from './DynamicThemeProvider';
import { QuickActionFAB } from './QuickActionFAB';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', module: null },
  { name: 'Planning', icon: Calendar, href: '/planning', module: 'planning' },
  { name: 'Photos', icon: Camera, href: '/photos', module: 'planning' },
  { name: 'Stock', icon: Box, href: '/stock', module: 'stock' },
  { name: 'Factures', icon: FileText, href: '/invoices', module: 'documents' },
  { name: 'Clients', icon: Users, href: '/clients', module: 'clients' },
  { name: 'Abonnement', icon: CreditCard, href: '/billing', module: null },
  { name: 'Paramètres', icon: Settings, href: '/settings', module: null },
];

function NavList({ enabledModules, pathname, isAdmin, isDocumentsEnabled, onNavigate }: {
  enabledModules: string[];
  pathname: string;
  isAdmin: boolean;
  isDocumentsEnabled: boolean;
  onNavigate?: () => void;
}) {
  const { companyName, logoUrl, primaryColor } = useTheme();

  return (
    <>
      <nav className="flex-1 px-4 space-y-1 mt-2">
        {navItems.map((item) => {
          const isEnabled = !item.module || enabledModules.includes(item.module);
          const isActive = pathname.startsWith(item.href) && item.href !== '/' || pathname === item.href;

          return (
            <Link
              key={item.name}
              href={isEnabled ? item.href : '/billing'}
              onClick={onNavigate}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group",
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                !isEnabled && "opacity-60 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                {item.name}
              </div>
              {!isEnabled && <Lock className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/admin"
            onClick={onNavigate}
            className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all mt-10 border border-amber-500/20"
          >
            <Shield className="w-4 h-4" />
            Zone Admin
          </Link>
        )}
      </nav>

      {isDocumentsEnabled && (
        <div className="p-4 border-t border-border">
          <Link
            href="/invoices/new"
            onClick={onNavigate}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity"
          >
            <PlusCircle className="w-4 h-4" />
            Nouveau Devis
          </Link>
        </div>
      )}
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { enabledModules, companyName, logoUrl, primaryColor } = useTheme();
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
        setIsAdmin(data?.is_admin || false);
      }
    }
    checkAdmin();
  }, []);

  const isDocumentsEnabled = enabledModules.includes('documents');

  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold" style={{ color: primaryColor }}>
                {companyName ? companyName.substring(0, 2).toUpperCase() : 'FL'}
              </span>
            </div>
          )}
          <h1 className="text-lg font-bold truncate">
            {companyName || 'Mon Entreprise'}
          </h1>
        </div>
      </div>

      <NavList
        enabledModules={enabledModules}
        pathname={pathname}
        isAdmin={isAdmin}
        isDocumentsEnabled={isDocumentsEnabled}
      />
    </aside>
  );
}

export function MobileDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { enabledModules, companyName, logoUrl, primaryColor, subscriptionPlan } = useTheme();
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
        setIsAdmin(data?.is_admin || false);
      }
    }
    checkAdmin();
  }, []);

  const isDocumentsEnabled = enabledModules.includes('documents');

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] md:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={cn(
        "fixed inset-y-0 left-0 w-72 bg-card border-r border-border z-[201] flex flex-col transition-transform duration-300 ease-in-out md:hidden shadow-2xl",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header du drawer */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-9 h-9 rounded-xl object-contain" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-black" style={{ color: primaryColor }}>
                  {companyName ? companyName.substring(0, 2).toUpperCase() : 'FL'}
                </span>
              </div>
            )}
            <div>
              <p className="font-bold text-sm leading-tight truncate max-w-[150px]">
                {companyName || 'Mon Entreprise'}
              </p>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border",
                subscriptionPlan === 'starter'
                  ? "text-zinc-500 border-zinc-500/20"
                  : "text-primary border-primary/20 bg-primary/10"
              )}>
                {subscriptionPlan}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <NavList
          enabledModules={enabledModules}
          pathname={pathname}
          isAdmin={isAdmin}
          isDocumentsEnabled={isDocumentsEnabled}
          onNavigate={onClose}
        />
      </div>
    </>
  );
}

export function Header() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { primaryColor, companyName, logoUrl, subscriptionPlan } = useTheme();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
    }
    load();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      <MobileDrawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <header className="h-16 border-b border-border bg-background/50 backdrop-blur-xl sticky top-0 z-10 px-4 flex items-center justify-between">
        {/* Hamburger + Logo — Mobile */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            id="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2.5 hover:bg-secondary rounded-xl text-foreground transition-colors border border-border"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold truncate max-w-[120px]">{companyName || 'Mon Espace'}</span>
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
              <div className="w-8 h-8 rounded-lg bg-secondary overflow-hidden border border-border" style={{ borderColor: primaryColor + '40' }}>
                {profile?.logo_url ? (
                  <img src={profile.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full" style={{ backgroundColor: primaryColor }} />
                )}
              </div>
              <div className="hidden sm:block text-right">
                <div className="flex items-center justify-end gap-2">
                  <p className="text-sm font-medium leading-none">{profile?.company_name || 'Mon Compte'}</p>
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border",
                    subscriptionPlan === 'starter' ? "text-zinc-500 border-zinc-500/20" : "text-primary border-primary/20 bg-primary/10"
                  )}>
                    {subscriptionPlan}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{profile?.full_name || 'Artisan'}</p>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
