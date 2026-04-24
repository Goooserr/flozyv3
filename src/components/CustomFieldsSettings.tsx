'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Tag, Settings2 } from 'lucide-react'
import { getFieldDefinitions, addFieldDefinition, deleteFieldDefinition } from '@/lib/actions'

export function CustomFieldsSettings() {
  const [definitions, setDefinitions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newField, setNewField] = useState({
    entity_type: 'client',
    label: '',
    field_type: 'text',
    required: false
  })

  useEffect(() => {
    fetchDefinitions()
  }, [])

  async function fetchDefinitions() {
    try {
      const clients = await getFieldDefinitions('client')
      const documents = await getFieldDefinitions('document')
      setDefinitions([...clients, ...documents])
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAdd() {
    if (!newField.label) return
    try {
      await addFieldDefinition(newField)
      setNewField({ ...newField, label: '' })
      fetchDefinitions()
    } catch (e) {
      console.error(e)
      alert("Erreur lors de l'ajout. Vérifiez votre connexion.")
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteFieldDefinition(id)
      fetchDefinitions()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings2 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">Ajouter un nouveau champ</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium">Entité</label>
            <select 
              value={newField.entity_type}
              onChange={e => setNewField({...newField, entity_type: e.target.value})}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="client">Client</option>
              <option value="document">Facture / Devis</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom du champ</label>
            <input 
              type="text"
              placeholder="ex: Numéro de TVA"
              value={newField.label}
              onChange={e => setNewField({...newField, label: e.target.value})}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <select 
              value={newField.field_type}
              onChange={e => setNewField({...newField, field_type: e.target.value})}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="text">Texte</option>
              <option value="number">Nombre</option>
              <option value="date">Date</option>
              <option value="boolean">Case à cocher</option>
            </select>
          </div>

          <button 
            onClick={handleAdd}
            className="bg-primary text-primary-foreground h-10 px-4 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border bg-secondary/10">
          <h3 className="font-bold">Champs configurés</h3>
        </div>
        <div className="divide-y divide-border">
          {definitions.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground text-sm">
              Aucun champ personnalisé défini pour le moment.
            </div>
          ) : (
            definitions.map((def) => (
              <div key={def.id} className="p-4 flex items-center justify-between hover:bg-secondary/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                    <Tag className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{def.label}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {def.entity_type === 'client' ? 'Client' : 'Document'} • {def.field_type}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(def.id)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
