'use client'

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Upload, 
  Save, 
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  Tag,
  LayoutGrid,
  FileText, 
  ShieldAlert, 
  Trash2,
  Users,
  UserPlus,
  Link as LinkIcon,
  Copy,
  ExternalLink,
  Sparkles,
  Lock,
  ArrowRight,
  Star
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { CustomFieldsSettings } from '@/components/CustomFieldsSettings';
import { ModuleSettings } from '@/components/ModuleSettings';
import { useTheme } from '@/components/DynamicThemeProvider';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { setPrimaryColor, setCompanyName, setLogoUrl } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({
    full_name: '',
    company_name: '',
    business_name: '',
    siret: '',
    phone: '',
    address: '',
    website: '',
    logo_url: '',
    primary_color: '#000000',
    subscription_plan: 'starter',
    role: 'artisan'
  });
  const [userEmail, setUserEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const [magicColor, setMagicColor] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setProfile(data);
          setInviteLink(`${window.location.origin}/register?employer_id=${user.id}&role=employee&company=${encodeURIComponent(data.company_name || 'Flozy')}`);
        }

        // Load employees
        const { data: empData } = await supabase
          .from('profiles')
          .select('*')
          .eq('employer_id', user.id);
        if (empData) setEmployees(empData);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (profile.role === 'employee') return; // Sécurité supplémentaire

    setSaving(true);
    try {
      const { updateArtisanProfile } = await import('@/lib/actions');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // On ne filtre que les champs qu'on a le droit de modifier pour éviter les erreurs de base de données
        const brandingUpdates = {
          full_name: profile.full_name,
          company_name: profile.company_name,
          primary_color: profile.primary_color,
          logo_url: profile.logo_url,
          address: profile.address,
          phone: profile.phone,
          website: profile.website,
          business_name: profile.business_name,
          siret: profile.siret
        };

        await updateArtisanProfile(user.id, brandingUpdates);
        setSuccess(true);
        setPrimaryColor(profile.primary_color || '#000000');
        setCompanyName(profile.company_name || '');
        setLogoUrl(profile.logo_url || '');
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      alert("Erreur lors de l'enregistrement : " + err.message);
    } finally {
      setSaving(false);
    }
  }

  const copyInviteUrl = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteEmployee = async (empId: string) => {
    if (confirm("Supprimer l'accès de cet employé ?")) {
      const { error } = await supabase.from('profiles').delete().eq('id', empId);
      if (!error) {
        setEmployees(prev => prev.filter(e => e.id !== empId));
      }
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setProfile((prev: any) => ({ ...prev, logo_url: base64 }));
      // On met à jour le preview mais l'enregistrement définitif se fait au Save
      extractDominantColor(base64);
    };
    reader.readAsDataURL(file);
  };

  const extractDominantColor = (imageSrc: string) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      
      canvas.width = 50;
      canvas.height = 50;
      ctx.drawImage(img, 0, 0, 50, 50);
      
      const imageData = ctx.getImageData(0, 0, 50, 50);
      const data = imageData.data;
      
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i+3] < 128) continue; // ignore transparent
        if (data[i] > 240 && data[i+1] > 240 && data[i+2] > 240) continue; // ignore white
        
        r += data[i];
        g += data[i+1];
        b += data[i+2];
        count++;
      }
      
      if (count > 0) {
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);
        
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        setProfile((prev: any) => ({ ...prev, primary_color: hex }));
        setMagicColor(true);
        setTimeout(() => setMagicColor(false), 5000);
      }
    };
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Paramètres du SaaS</h2>
        <p className="text-muted-foreground text-sm">Configurez l'interface selon les besoins spécifiques de votre entreprise.</p>
      </div>

      {/* Profil Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <User className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">Identité & Branding</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Colonne Formulaire */}
          <div className={cn(profile.role === 'employee' && "opacity-75 cursor-not-allowed")}>
            <form onSubmit={handleSave} className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-6">
              
              <div className="flex flex-col items-center justify-center p-6 bg-secondary/30 rounded-2xl border-2 border-dashed border-border mb-6 group relative overflow-hidden transition-colors hover:border-primary/50">
                 {profile.logo_url ? (
                    <img src={profile.logo_url} alt="Logo" className="h-20 object-contain" />
                 ) : (
                    <div className="text-center">
                       <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                       <p className="text-sm font-medium">Ajouter un logo</p>
                       <p className="text-xs text-muted-foreground">PNG, JPG jusqu'à 2MB</p>
                    </div>
                 )}
                 {profile.role !== 'employee' && (
                   <input 
                     type="file" 
                     accept="image/*" 
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                     onChange={handleLogoUpload}
                   />
                 )}
                 {profile.role !== 'employee' && (
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <p className="text-white text-sm font-bold flex items-center gap-2"><Upload className="w-4 h-4" /> Changer</p>
                   </div>
                 )}
              </div>

              {profile.role === 'employee' && (
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" /> En tant qu'employé, vous ne pouvez pas modifier le branding de l'entreprise.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"> Nom complet </label>
                  <input 
                    disabled={profile.role === 'employee'}
                    value={profile.full_name}
                    onChange={e => setProfile({...profile, full_name: e.target.value})}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"> Entreprise </label>
                  <input 
                    disabled={profile.role === 'employee'}
                    value={profile.company_name}
                    onChange={e => setProfile({...profile, company_name: e.target.value})}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"> Couleur de marque </label>
                  <div className="flex items-center gap-4 bg-secondary/30 p-2 rounded-xl border border-border">
                    <input 
                      disabled={profile.role === 'employee'}
                      type="color"
                      value={profile.primary_color || '#000000'}
                      onChange={e => setProfile({...profile, primary_color: e.target.value})}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none p-0 disabled:opacity-50 shrink-0"
                    />
                    <input 
                      disabled={profile.role === 'employee'}
                      type="text"
                      value={profile.primary_color || '#000000'}
                      onChange={e => setProfile({...profile, primary_color: e.target.value})}
                      className="w-full bg-transparent border-none px-2 py-1 text-sm outline-none focus:ring-0 uppercase font-mono disabled:opacity-50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"> Adresse </label>
                  <input 
                    disabled={profile.role === 'employee'}
                    value={profile.address}
                    onChange={e => setProfile({...profile, address: e.target.value})}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"> Téléphone </label>
                  <input 
                    disabled={profile.role === 'employee'}
                    value={profile.phone}
                    onChange={e => setProfile({...profile, phone: e.target.value})}
                    placeholder="06 00 00 00 00"
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"> Numéro SIRET </label>
                  <input 
                    disabled={profile.role === 'employee'}
                    value={profile.siret}
                    onChange={e => setProfile({...profile, siret: e.target.value})}
                    placeholder="123 456 789 00012"
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"> Site Web </label>
                  <input 
                    disabled={profile.role === 'employee'}
                    value={profile.website}
                    onChange={e => setProfile({...profile, website: e.target.value})}
                    placeholder="https://votre-site.fr"
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                  />
                </div>
              </div>

              {profile.role !== 'employee' && (
                <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 mt-6">
                  <div className="order-2 sm:order-1">
                    {success ? (
                      <p className="text-emerald-500 text-sm flex items-center gap-2 animate-in slide-in-from-left-2">
                        <CheckCircle2 className="w-4 h-4" /> Enregistré ! L'interface a été mise à jour.
                      </p>
                    ) : (
                      <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
                        Modifications appliquées en temps réel sur l'aperçu
                      </p>
                    )}
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto px-10 py-4 bg-white text-black rounded-2xl font-black text-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 order-1 sm:order-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Sauvegarder
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Colonne Live Preview */}
          <div className="bg-secondary/30 border border-border rounded-3xl p-6 lg:p-8 flex flex-col justify-center items-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: profile.primary_color || '#000000' }} />
             
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: profile.primary_color || '#000000' }} />
              
              <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-xl overflow-hidden relative z-10 transition-all duration-300">
                 {/* Header Facture Simulé */}
                 <div className="h-2 w-full transition-colors duration-500" style={{ backgroundColor: profile.primary_color || '#000000' }} />
                 <div className="p-6">
                   <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-col gap-3">
                         {profile.logo_url ? (
                            <img src={profile.logo_url} alt="Logo" className="w-16 h-16 object-contain" />
                         ) : (
                            <div 
                              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm transition-colors duration-500"
                              style={{ backgroundColor: profile.primary_color || '#000000' }}
                            >
                               {profile.company_name ? profile.company_name.substring(0, 2).toUpperCase() : 'CO'}
                            </div>
                         )}
                         <div>
                            <h4 className="font-bold text-foreground leading-none">{profile.company_name || 'Nom de l\'entreprise'}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{profile.address || 'Adresse de l\'entreprise'}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded bg-secondary text-muted-foreground inline-block mb-1">Devis</div>
                         <p className="text-xs font-mono text-muted-foreground">#DEV-2024</p>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <div className="h-8 bg-secondary/50 rounded flex items-center px-3 justify-between">
                         <div className="w-24 h-2 bg-secondary rounded" />
                         <div className="w-12 h-2 bg-secondary rounded" />
                      </div>
                      <div className="h-8 bg-secondary/50 rounded flex items-center px-3 justify-between">
                         <div className="w-32 h-2 bg-secondary rounded" />
                         <div className="w-16 h-2 bg-secondary rounded" />
                      </div>
                   </div>

                   <div className="mt-6 pt-4 border-t border-border flex justify-end">
                      <button 
                        className="px-4 py-2 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                        style={{ backgroundColor: profile.primary_color || '#000000' }}
                      >
                        Payer en ligne
                      </button>
                   </div>
                </div>
             </div>
             
             <div className="mt-6 text-center">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 justify-center">
                  <FileText className="w-3 h-3" /> Aperçu en direct
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">Vos devis, factures et portail client s'adapteront automatiquement à vos couleurs.</p>
             </div>
          </div>

        </div>
      </section>

      {/* Équipe Section */}
      {profile.role !== 'employee' && (
        <section className="space-y-6">
          {/* Team Management - ONLY FOR EXPERT */}
          {profile.subscription_plan === 'expert' ? (
            <div className="bg-card border border-border rounded-3xl p-8 mb-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Users className="w-6 h-6 text-primary" />
                    Gestion d'Équipe
                  </h2>
                  <p className="text-muted-foreground mt-1">Gérez vos collaborateurs et leurs accès.</p>
                </div>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold border border-primary/20">
                  {employees.length} / 5 Employés
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="font-bold text-lg mb-4">Membres de l'équipe</h3>
                  {employees.length === 0 ? (
                    <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center">
                      <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-muted-foreground opacity-50" />
                      </div>
                      <h4 className="font-bold text-lg mb-2">Aucun employé pour le moment.</h4>
                      <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                        Utilisez le lien magique pour inviter vos collaborateurs.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {employees.map((emp) => (
                        <div key={emp.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                              {emp.full_name?.charAt(0) || 'E'}
                            </div>
                            <div>
                              <p className="font-bold">{emp.full_name}</p>
                              <p className="text-xs text-muted-foreground">{emp.email}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteEmployee(emp.id)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                            title="Supprimer l'accès"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Invite Link */}
                <div className="bg-muted/30 border border-border rounded-3xl p-6 h-fit">
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Lien Magique
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Envoyez ce lien à vos employés pour qu'ils rejoignent votre espace.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <input 
                        type="text" 
                        readOnly 
                        value={inviteLink}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs pr-24 font-mono"
                      />
                      <button 
                        onClick={copyInviteUrl}
                        className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-secondary hover:bg-secondary/80 rounded-lg text-xs font-bold flex items-center gap-2 transition-all"
                      >
                        {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Copié' : 'Copier'}
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic text-center px-4">
                      Les employés n'ont accès qu'aux fonctions terrain (planning, photos, clients).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-3xl p-12 mb-12 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Multi-utilisateur (Expert)</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Passez au plan <strong>Expert</strong> pour inviter des employés, partager vos chantiers et centraliser la gestion de votre entreprise.
              </p>
              <button 
                onClick={() => router.push('/billing?plan=expert')}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2 mx-auto"
              >
                Passer en Expert <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>
      )}

      {/* Modules Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <LayoutGrid className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">Modules & Fonctionnalités</h3>
        </div>
        <ModuleSettings />
      </section>

      {/* Account & Security Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <Mail className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">Compte & Sécurité</h3>
        </div>
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-1">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Adresse Email</p>
              <p className="text-sm font-bold text-foreground">{userEmail || 'Chargement...'}</p>
              <p className="text-xs text-muted-foreground">Utilisée pour vos factures et votre connexion.</p>
           </div>
           <div className="space-y-1">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Plan Actuel</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground uppercase tracking-tighter">
                  {profile.subscription_plan || 'Starter'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                  Actif
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Votre abonnement actuel chez Flozy.</p>
           </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-red-500/20 pb-2">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-bold text-red-500">Zone de Danger</h3>
        </div>
        <div className="bg-red-500/5 border border-red-500/10 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="space-y-1 text-center md:text-left">
              <h4 className="text-sm font-bold text-red-500">Supprimer mon compte</h4>
              <p className="text-xs text-muted-foreground max-w-md">
                Cette action est irréversible. Toutes vos factures, vos clients et vos données de chantier seront définitivement supprimés.
              </p>
           </div>
           <button 
             onClick={async () => {
               if (confirm("ÊTES-VOUS SÛR ? Cette action supprimera définitivement toutes vos données Flozy. Vous ne pourrez pas revenir en arrière.")) {
                 const { error } = await supabase.rpc('delete_own_user');
                 if (error) {
                   alert("Erreur lors de la suppression : " + error.message);
                 } else {
                   await supabase.auth.signOut();
                   window.location.href = '/';
                 }
               }
             }}
             className="flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-sm"
           >
             <Trash2 className="w-4 h-4" /> Supprimer définitivement
           </button>
        </div>
      </section>

      {/* Review Section */}
      <ReviewForm profile={profile} />
    </div>
  );
}

function ReviewForm({ profile }: { profile: any }) {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('reviews').insert({
      artisan_id: user.id,
      author_name: profile.full_name,
      company_name: profile.company_name,
      content,
      rating,
      is_featured: true
    });

    setSubmitting(false);
    if (!error) {
      setSent(true);
      setContent('');
    } else {
      alert("Erreur lors de l'envoi : " + error.message);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold">Votre avis nous intéresse</h3>
      </div>
      <div className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-8 shadow-sm">
        {sent ? (
          <div className="text-center py-8 animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h4 className="text-xl font-bold mb-2">Merci pour votre retour !</h4>
            <p className="text-muted-foreground text-sm">Votre avis sera affiché sur la page d'accueil pour aider d'autres artisans.</p>
            <button onClick={() => setSent(false)} className="mt-6 text-sm font-bold text-primary hover:underline">Modifier mon avis</button>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Partagez votre expérience avec Flozy. Vos retours nous aident à améliorer l'outil chaque jour.
            </p>
            
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setRating(num)}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    rating >= num ? "text-primary bg-primary/10" : "text-muted-foreground bg-secondary/50"
                  )}
                >
                  <Star className={cn("w-6 h-6", rating >= num && "fill-primary")} />
                </button>
              ))}
            </div>

            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Qu'est-ce que vous préférez sur Flozy ? Combien de temps gagnez-vous chaque semaine ?"
              className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[120px] resize-none"
            />

            <button
              disabled={submitting || !content}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-90 disabled:opacity-50 transition-all shadow-xl shadow-primary/20"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Envoyer mon témoignage</>}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
