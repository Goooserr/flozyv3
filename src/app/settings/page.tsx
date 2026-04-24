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
  FileText
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { CustomFieldsSettings } from '@/components/CustomFieldsSettings';
import { ModuleSettings } from '@/components/ModuleSettings';
import { useTheme } from '@/components/DynamicThemeProvider';

export default function SettingsPage() {
  const supabase = createClient();
  const { setPrimaryColor } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    company_name: '',
    phone: '',
    address: '',
    logo_url: '',
    primary_color: '#000000'
  });
  const [success, setSuccess] = useState(false);

  const [magicColor, setMagicColor] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data) setProfile(data);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', user.id);
      
      if (!error) {
        setSuccess(true);
        setPrimaryColor(profile.primary_color || '#000000');
        setTimeout(() => setSuccess(false), 3000);
      }
    }
    setSaving(false);
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setProfile(prev => ({ ...prev, logo_url: base64 }));
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
        setProfile(prev => ({ ...prev, primary_color: hex }));
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
          <div>
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
                 <input 
                   type="file" 
                   accept="image/*" 
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                   onChange={handleLogoUpload}
                 />
                 <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <p className="text-white text-sm font-bold flex items-center gap-2"><Upload className="w-4 h-4" /> Changer</p>
                 </div>
              </div>

              {magicColor && (
                <div className="bg-primary/10 border border-primary/30 text-primary p-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-2">
                  <CheckCircle2 className="w-4 h-4" /> Couleur magique détectée d'après votre logo !
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"> Nom complet </label>
                  <input 
                    value={profile.full_name}
                    onChange={e => setProfile({...profile, full_name: e.target.value})}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"> Entreprise </label>
                  <input 
                    value={profile.company_name}
                    onChange={e => setProfile({...profile, company_name: e.target.value})}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"> Couleur de marque </label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color"
                      value={profile.primary_color || '#000000'}
                      onChange={e => setProfile({...profile, primary_color: e.target.value})}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none p-0"
                    />
                    <input 
                      type="text"
                      value={profile.primary_color || '#000000'}
                      onChange={e => setProfile({...profile, primary_color: e.target.value})}
                      className="flex-1 bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 uppercase font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"> Adresse </label>
                  <input 
                    value={profile.address}
                    onChange={e => setProfile({...profile, address: e.target.value})}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-border mt-4">
                {success ? (
                  <p className="text-emerald-500 text-sm flex items-center gap-2 animate-in slide-in-from-left-2">
                    <CheckCircle2 className="w-4 h-4" /> Enregistré ! L'interface a été mise à jour.
                  </p>
                ) : <div />}
                <button 
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>

          {/* Colonne Live Preview */}
          <div className="bg-secondary/30 border border-border rounded-3xl p-6 lg:p-8 flex flex-col justify-center items-center relative overflow-hidden">
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

      {/* Modules Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <LayoutGrid className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">Modules & Fonctionnalités</h3>
        </div>
        <ModuleSettings />
      </section>

      {/* Custom Fields Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <Tag className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">Champs Personnalisés</h3>
        </div>
        <CustomFieldsSettings />
      </section>
    </div>
  );
}
