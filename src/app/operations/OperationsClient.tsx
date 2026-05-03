'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  Euro,
  ArrowUpRight,
  ArrowDownRight,
  LayoutGrid,
  List,
  ChevronRight,
  TrendingDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/DynamicThemeProvider'

export default function OperationsClient() {
  const { primaryColor } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [interventions, setInterventions] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    scheduled: 0,
    totalValue: 0,
    totalMargin: 0
  })

  useEffect(() => {
    async function loadData() {
      const { getInterventions, getDocuments } = await import('@/lib/actions')
      const [iData, dData] = await Promise.all([getInterventions(), getDocuments()])
      const inters = iData || []
      const docs = dData || []
      setInterventions(inters)

      const now = Date.now()
      const d7 = now - 7 * 86400000
      const d14 = now - 14 * 86400000

      const thisW = (arr: any[], field = 'created_at') => arr.filter(i => new Date(i[field]).getTime() >= d7).length
      const lastW = (arr: any[], field = 'created_at') => arr.filter(i => { const t = new Date(i[field]).getTime(); return t >= d14 && t < d7 }).length
      const trendStr = (diff: number) => diff >= 0 ? `+${diff} cette sem.` : `${diff} cette sem.`

      const interDiff = thisW(inters) - lastW(inters)
      const completed = inters.filter((i: any) => i.status === 'completed' || i.status === 'archived')
      const compDiff = thisW(completed) - lastW(completed)

      const paidDocs = docs.filter((d: any) => d.status === 'paid')
      const caTotal = paidDocs.reduce((a: number, d: any) => a + (d.amount || 0), 0)
      const caThis = paidDocs.filter((d: any) => new Date(d.created_at).getTime() >= d7).reduce((a: number, d: any) => a + (d.amount || 0), 0)
      const caLast = paidDocs.filter((d: any) => { const t = new Date(d.created_at).getTime(); return t >= d14 && t < d7 }).reduce((a: number, d: any) => a + (d.amount || 0), 0)
      const caDiff = caThis - caLast

      // Value depuis les descriptions JSON (inchangé)
      const newStats = inters.reduce((acc: any, curr: any) => {
        acc.total++
        if (curr.status === 'completed') acc.completed++
        else if (curr.status === 'in_progress') acc.inProgress++
        else acc.scheduled++
        try {
          const p = JSON.parse(curr.description || '{}')
          if (p.total_sell) acc.totalValue += p.total_sell
          if (p.total_sell && p.total_cost) acc.totalMargin += (p.total_sell - p.total_cost)
        } catch {}
        return acc
      }, { total: 0, completed: 0, inProgress: 0, scheduled: 0, totalValue: 0, totalMargin: 0 })

      newStats.caTotal = caTotal
      newStats.trendInter = trendStr(interDiff)
      newStats.trendComp = trendStr(compDiff)
      newStats.trendCA = (caDiff >= 0 ? '+' : '') + caDiff.toFixed(0) + ' €'
      newStats.trendCAPos = caDiff >= 0
      setStats(newStats)
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 px-4 md:px-0 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Hub Opérations</h1>
          <p className="text-muted-foreground text-sm">Tour de contrôle stratégique de vos chantiers et performances.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Santé des Opérations</p>
              <p className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                 <CheckCircle2 className="w-3 h-3" /> Optimale
              </p>
           </div>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Chantiers en cours" 
          value={stats.inProgress} 
          icon={Clock} 
          trend={stats.trendInter || '+0 cette sem.'} 
          color="text-blue-500" 
          bgColor="bg-blue-500/10" 
        />
        <StatCard 
          label="CA Encaissé" 
          value={`${(stats.caTotal || stats.totalValue || 0).toLocaleString('fr-FR')} €`} 
          icon={TrendingUp} 
          trend={stats.trendCA || '0 € cette sem.'} 
          color="text-emerald-500" 
          bgColor="bg-emerald-500/10" 
        />
        <StatCard 
          label="Marge Brute" 
          value={`${stats.totalMargin.toLocaleString()} €`} 
          icon={Euro} 
          trend={`${((stats.totalMargin / (stats.totalValue || 1)) * 100).toFixed(1)}% rendement`} 
          color="text-primary" 
          bgColor="bg-primary/10" 
        />
        <StatCard 
          label="Taux de Complétion" 
          value={`${completionRate.toFixed(0)}%`} 
          icon={CheckCircle2} 
          trend={`${stats.completed} terminés sur ${stats.total}`} 
          color="text-amber-500" 
          bgColor="bg-amber-500/10" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pipeline de Progression */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <h3 className="font-bold">Pipeline d'Avancement</h3>
               </div>
               <button className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground">Détails complets</button>
            </div>

            <div className="space-y-6">
              {interventions.filter(i => i.status !== 'completed').slice(0, 5).map((inter) => {
                let progress = 0
                if (inter.status === 'in_progress') progress = 65
                else if (inter.status === 'scheduled') progress = 10
                
                return (
                  <div 
                    key={inter.id} 
                    className="group cursor-pointer"
                    onClick={() => {
                      sessionStorage.setItem('planning_open_id', inter.id)
                      router.push('/planning')
                    }}
                  >
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{inter.title}</h4>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{inter.clients?.full_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black">{progress}%</span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-0.5" />
                      </div>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full transition-all duration-1000", progress > 50 ? "bg-emerald-500" : "bg-amber-500")} 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                  </div>
                )
              })}
              {interventions.length === 0 && (
                 <p className="text-center py-10 text-muted-foreground text-sm italic">Aucun chantier actif pour le moment.</p>
              )}
            </div>
          </section>

          {/* Analyse de Charge */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <BarChart3 className="w-32 h-32" />
             </div>
             <div className="relative z-10">
                <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                   <LayoutGrid className="w-5 h-5 text-zinc-500" /> Charge de travail actuelle
                </h3>
                <div className="grid grid-cols-3 gap-6">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">À Planifier</p>
                      <p className="text-2xl font-black text-white">{stats.scheduled}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Action Requise</p>
                      <p className="text-2xl font-black text-amber-500">{stats.inProgress}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Finalisés</p>
                      <p className="text-2xl font-black text-emerald-500">{stats.completed}</p>
                   </div>
                </div>
             </div>
          </section>
        </div>

        {/* Sidebar Monitoring */}
        <div className="space-y-6">
           <section className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold mb-6 flex items-center gap-2">
                 <AlertCircle className="w-5 h-5 text-amber-500" /> Vigilance Gérant
              </h3>
              <div className="space-y-4">
                 {stats.inProgress > 0 && (
                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                       <p className="text-xs font-bold text-amber-600 mb-1">Retard potentiel détecté</p>
                       <p className="text-[10px] text-amber-600/70">{stats.inProgress} chantiers sont en cours depuis plus de 48h sans mise à jour.</p>
                    </div>
                 )}
                 <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                    <p className="text-xs font-bold text-emerald-600 mb-1">Optimisation Marge</p>
                    <p className="text-[10px] text-emerald-600/70">Votre rendement moyen est de {((stats.totalMargin / (stats.totalValue || 1)) * 100).toFixed(0)}%. C'est au-dessus de la moyenne du secteur.</p>
                 </div>
              </div>
           </section>

           <button className="w-full bg-secondary border border-border hover:bg-secondary/80 text-foreground py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">
              Générer Rapport Mensuel PDF
           </button>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, trend, color, bgColor }: any) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm group hover:border-primary/30 transition-all">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", bgColor)}>
        <Icon className={cn("w-6 h-6", color)} />
      </div>
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-2xl font-black mb-2">{value}</h3>
      <p className="text-[10px] font-bold text-muted-foreground">{trend}</p>
    </div>
  )
}
