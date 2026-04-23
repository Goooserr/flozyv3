'use client'

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  FileText, 
  ChevronLeft,
  Download,
  Calculator
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getClients } from '@/lib/actions';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  vat: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [docType, setDocType] = useState<'quote' | 'invoice'>('quote');
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, price: 0, vat: 20 }
  ]);

  useEffect(() => {
    async function load() {
      const data = await getClients();
      setClients(data);
    }
    load();
  }, []);

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, price: 0, vat: 20 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const totalVat = items.reduce((acc, item) => acc + (item.quantity * item.price * (item.vat / 100)), 0);
  const total = subtotal + totalVat;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Retour
        </button>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-all">
            <Download className="w-4 h-4" /> Aperçu PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">
            <Save className="w-4 h-4" /> Enregistrer le {docType === 'quote' ? 'Devis' : 'Facture'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Éditeur de document</h1>
                <p className="text-muted-foreground text-sm">Créez vos lignes de services et produits.</p>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 px-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <div className="col-span-6">Description</div>
                <div className="col-span-2">Qté</div>
                <div className="col-span-2">Prix Unit.</div>
                <div className="col-span-2">Total HT</div>
              </div>

              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-start group">
                  <div className="col-span-6">
                    <input 
                      className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="Désignation du travail..."
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <input 
                      type="number"
                      className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    <input 
                      type="number"
                      className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="flex-1 bg-secondary/30 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-right font-medium">
                      {(item.quantity * item.price).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-muted-foreground hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <button 
                onClick={addItem}
                className="flex items-center gap-2 text-sm font-bold text-primary hover:bg-primary/5 px-4 py-2 rounded-xl transition-all mt-4"
              >
                <Plus className="w-4 h-4" /> Ajouter une ligne
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold">Paramètres</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Type de document</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-xl">
                  <button 
                    onClick={() => setDocType('quote')}
                    className={cn(
                      "py-2 text-sm font-medium rounded-lg transition-all",
                      docType === 'quote' ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                    )}
                  >
                    Devis
                  </button>
                  <button 
                    onClick={() => setDocType('invoice')}
                    className={cn(
                      "py-2 text-sm font-medium rounded-lg transition-all",
                      docType === 'invoice' ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                    )}
                  >
                    Facture
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Client</label>
                <select 
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none"
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Totals Card */}
          <div className="bg-primary text-primary-foreground rounded-3xl p-6 shadow-xl shadow-primary/20 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-5 h-5 opacity-80" />
              <h3 className="font-bold text-lg">Récapitulatif</h3>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between opacity-80">
                <span>Total HT</span>
                <span>{subtotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
              </div>
              <div className="flex justify-between opacity-80 border-b border-white/10 pb-2">
                <span>TVA (20%)</span>
                <span>{totalVat.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-2">
                <span>Total TTC</span>
                <span>{total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
