import { createClient } from './supabase'

// --- HELPER : Récupère l'ID de l'artisan (soit soi-même, soit son patron) ---
async function getArtisanId() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Non authentifié")
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, employer_id')
    .eq('id', user.id)
    .single()
    
  return profile?.employer_id || user.id
}

// --- CLIENTS ---
export async function getClients() {
  const supabase = createClient()
  const artisanId = await getArtisanId()
  const { data } = await supabase
    .from('clients')
    .select('*')
    .eq('artisan_id', artisanId)
    .order('full_name')
  return data || []
}

export async function addClient(client: any) {
  const supabase = createClient()
  const artisanId = await getArtisanId()
  const { data, error } = await supabase
    .from('clients')
    .insert([{ ...client, artisan_id: artisanId }])
    .select()
  if (error) throw error
  return data[0]
}

export async function updateClient(id: string, updates: any) {
  const supabase = createClient()
  const { error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

// --- DOCUMENTS (Devis & Factures) ---
export async function getDocuments() {
  const supabase = createClient()
  const artisanId = await getArtisanId()
  const { data } = await supabase
    .from('documents')
    .select('*, clients(*)')
    .eq('artisan_id', artisanId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function createDocument(doc: any) {
  const supabase = createClient()
  const artisanId = await getArtisanId()
  const { data, error } = await supabase
    .from('documents')
    .insert([{ ...doc, artisan_id: artisanId }])
    .select()
  if (error) throw error
  return data[0]
}

// --- STOCK ---
export async function getStock() {
  const supabase = createClient()
  const artisanId = await getArtisanId()
  const { data } = await supabase
    .from('stock')
    .select('*')
    .eq('artisan_id', artisanId)
    .order('name')
  return data || []
}

export async function updateStockQuantity(id: string, quantity: number) {
  const supabase = createClient()
  const { error } = await supabase
    .from('stock')
    .update({ quantity })
    .eq('id', id)
  if (error) throw error
}

// --- INTERVENTIONS ---
export async function getInterventions() {
  const supabase = createClient()
  const artisanId = await getArtisanId()
  const { data } = await supabase
    .from('interventions')
    .select('*, clients(*)')
    .eq('artisan_id', artisanId)
    .order('start_time', { ascending: false })
  return data || []
}

export async function createIntervention(inter: any) {
  const supabase = createClient()
  const artisanId = await getArtisanId()
  const { data, error } = await supabase
    .from('interventions')
    .insert([{ ...inter, artisan_id: artisanId }])
    .select()
  if (error) throw error
  return data[0]
}

export async function updateIntervention(id: string, updates: any) {
  const supabase = createClient()
  const { error } = await supabase
    .from('interventions')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

export async function uploadInterventionPhoto(interventionId: string, file: File) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Non authentifié")

  const fileName = `${user.id}/${interventionId}/${Date.now()}-${file.name}`
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('photos')
    .upload(fileName, file)

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('photos')
    .getPublicUrl(fileName)

  const { data, error } = await supabase
    .from('intervention_photos')
    .insert([{
      intervention_id: interventionId,
      artisan_id: user.id,
      url: publicUrl,
      file_name: fileName
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteInterventionPhoto(photoId: string, fileName: string) {
  const supabase = createClient()
  await supabase.storage.from('photos').remove([fileName])
  const { error } = await supabase
    .from('intervention_photos')
    .delete()
    .eq('id', photoId)
  if (error) throw error
}

// --- CHAMPS PERSONNALISÉS ---
export async function getFieldDefinitions(entityType?: string) {
  const supabase = createClient()
  const artisanId = await getArtisanId()
  let query = supabase.from('field_definitions').select('*').eq('artisan_id', artisanId)
  if (entityType) query = query.eq('entity_type', entityType)
  const { data } = await query
  return data || []
}

export async function addFieldDefinition(def: any) {
  const supabase = createClient()
  const artisanId = await getArtisanId()
  const { error } = await supabase.from('field_definitions').insert([{ ...def, artisan_id: artisanId }])
  if (error) throw error
}

export async function deleteFieldDefinition(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('field_definitions').delete().eq('id', id)
  if (error) throw error
}

// --- PROFILES & ADMIN ---
export async function updateArtisanProfile(id: string, updates: any) {
  const supabase = createClient()
  const finalUpdates = { ...updates }
  if (finalUpdates.subscription_plan) {
    finalUpdates.subscription_plan = finalUpdates.subscription_plan.toLowerCase()
  }
  const { error } = await supabase
    .from('profiles')
    .update(finalUpdates)
    .eq('id', id)
  if (error) throw error
  return true
}

export async function getAllArtisans() {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'artisan')
  return data || []
}

export async function suspendArtisan(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ subscription_status: 'suspended' })
    .eq('id', id)
  if (error) throw error
}

export async function activateArtisan(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ subscription_status: 'active' })
    .eq('id', id)
  if (error) throw error
}

export async function getAdminStats() {
  const supabase = createClient()
  const { data: artisans } = await supabase.from('profiles').select('id').eq('role', 'artisan')
  const { data: docs } = await supabase.from('documents').select('amount')
  return {
    total_artisans: artisans?.length || 0,
    total_revenue: docs?.reduce((acc, d) => acc + (d.amount || 0), 0) || 0
  }
}

// --- MESSAGERIE ---
export async function getMessages(recipientId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
    .order('created_at', { ascending: true })
  return data || []
}

export async function sendMessage(recipientId: string, content: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('messages')
    .insert([{ sender_id: user?.id, recipient_id: recipientId, content }])
  if (error) throw error
}

export async function convertQuoteToInvoice(quoteId: string, docNumber: string) {
  const supabase = createClient()
  const artisanId = await getArtisanId()
  const { data: quote } = await supabase.from('documents').select('*').eq('id', quoteId).single()
  if (!quote) throw new Error("Devis non trouvé")

  const { data, error } = await supabase
    .from('documents')
    .insert([{
      type: 'invoice',
      document_number: docNumber,
      amount: quote.amount,
      client_id: quote.client_id,
      artisan_id: artisanId,
      metadata: quote.metadata,
      status: 'pending'
    }])
    .select()

  if (error) throw error
  return data[0]
}
