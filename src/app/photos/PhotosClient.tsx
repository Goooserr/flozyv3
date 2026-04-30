'use client'

import React, { useState, useEffect } from 'react'
import { Camera, Search, X, ChevronLeft, ChevronRight, Download, ZoomIn, Loader2, ImageOff } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type Photo = {
  id: string
  url: string
  file_name: string
  created_at: string
  intervention_id: string
  intervention_title?: string
  client_name?: string
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [filterIntervention, setFilterIntervention] = useState('all')
  const [interventions, setInterventions] = useState<any[]>([])

  const supabase = createClient()

  async function load() {
    setLoading(true)

    // Récupérer les photos avec le titre de l'intervention et le client
    const { data: photoRows } = await supabase
      .from('intervention_photos')
      .select(`
        id, url, file_name, created_at, intervention_id,
        interventions(title, clients(full_name))
      `)
      .order('created_at', { ascending: false })

    const formatted: Photo[] = (photoRows || []).map((row: any) => ({
      id: row.id,
      url: row.url,
      file_name: row.file_name,
      created_at: row.created_at,
      intervention_id: row.intervention_id,
      intervention_title: row.interventions?.title || 'Intervention',
      client_name: row.interventions?.clients?.full_name || '',
    }))

    setPhotos(formatted)

    // Extraire les interventions uniques pour le filtre
    const uniqueInterventions = Array.from(
      new Map(
        (photoRows || [])
          .filter((r: any) => r.interventions)
          .map((r: any) => [r.intervention_id, { id: r.intervention_id, title: r.interventions?.title }])
      ).values()
    )
    setInterventions(uniqueInterventions)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = photos.filter(p => {
    const matchSearch = p.intervention_title?.toLowerCase().includes(search.toLowerCase()) ||
                        p.client_name?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filterIntervention === 'all' || p.intervention_id === filterIntervention
    return matchSearch && matchFilter
  })

  // Grouper par intervention
  const grouped = filtered.reduce((acc, photo) => {
    const key = photo.intervention_id
    if (!acc[key]) acc[key] = { title: photo.intervention_title || '', client: photo.client_name || '', photos: [] }
    acc[key].photos.push(photo)
    return acc
  }, {} as Record<string, { title: string, client: string, photos: Photo[] }>)

  function navigate(dir: number) {
    if (lightbox === null) return
    const newIdx = lightbox + dir
    if (newIdx >= 0 && newIdx < filtered.length) setLightbox(newIdx)
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-1">
            <Camera className="w-4 h-4" /> Galerie Chantier
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Photos de Terrain</h2>
          <p className="text-muted-foreground">Toutes les photos prises sur vos chantiers, organisées par intervention.</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black">{photos.length}</p>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">photos</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par chantier ou client..."
            className="w-full bg-card border border-border rounded-2xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <select
          value={filterIntervention}
          onChange={e => setFilterIntervention(e.target.value)}
          className="bg-card border border-border rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium min-w-[200px]"
        >
          <option value="all">Tous les chantiers</option>
          {interventions.map((i: any) => (
            <option key={i.id} value={i.id}>{i.title}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 border border-dashed border-border rounded-[3rem] bg-card/30">
          <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6">
            <ImageOff className="w-12 h-12 text-primary opacity-20" />
          </div>
          <h3 className="text-xl font-bold mb-2">Aucune photo trouvée</h3>
          <p className="text-muted-foreground text-sm max-w-sm text-center">
            Prenez des photos directement depuis vos interventions dans le Planning.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(grouped).map(([interventionId, group]) => (
            <div key={interventionId} className="space-y-4">
              {/* Group Header */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Camera className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{group.title}</h3>
                    {group.client && (
                      <p className="text-sm text-muted-foreground">{group.client}</p>
                    )}
                  </div>
                </div>
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-secondary px-3 py-1 rounded-full">
                  {group.photos.length} photo{group.photos.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Photo Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {group.photos.map((photo, idx) => {
                  const globalIdx = filtered.findIndex(p => p.id === photo.id)
                  return (
                    <button
                      key={photo.id}
                      onClick={() => setLightbox(globalIdx)}
                      className="group relative aspect-square rounded-2xl overflow-hidden bg-secondary border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5"
                    >
                      <img
                        src={photo.url}
                        alt={photo.intervention_title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-[9px] text-white font-bold truncate">{formatDate(photo.created_at)}</p>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                          <ZoomIn className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && filtered[lightbox] && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[200] flex flex-col animate-in fade-in duration-200"
          onClick={() => setLightbox(null)}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 shrink-0" onClick={e => e.stopPropagation()}>
            <div>
              <p className="font-bold text-white">{filtered[lightbox].intervention_title}</p>
              <p className="text-xs text-zinc-400">{filtered[lightbox].client_name} · {formatDate(filtered[lightbox].created_at)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 font-mono">{lightbox + 1} / {filtered.length}</span>
              <a
                href={filtered[lightbox].url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                onClick={e => e.stopPropagation()}
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={() => setLightbox(null)}
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Image */}
          <div className="flex-1 flex items-center justify-center px-20 pb-8 relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => navigate(-1)}
              disabled={lightbox === 0}
              className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 disabled:opacity-20 text-white rounded-2xl transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <img
              src={filtered[lightbox].url}
              alt={filtered[lightbox].intervention_title}
              className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
            />

            <button
              onClick={() => navigate(1)}
              disabled={lightbox === filtered.length - 1}
              className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 disabled:opacity-20 text-white rounded-2xl transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Filmstrip */}
          <div className="flex gap-2 px-6 pb-6 overflow-x-auto shrink-0 justify-center" onClick={e => e.stopPropagation()}>
            {filtered.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setLightbox(idx)}
                className={cn(
                  "w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all",
                  idx === lightbox ? "border-primary scale-110" : "border-transparent opacity-50 hover:opacity-80"
                )}
              >
                <img src={p.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
