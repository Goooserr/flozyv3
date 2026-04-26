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

// --- PROFILES & ADMIN ---
export async function updateArtisanProfile(id: string, updates: any) {
  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update(updates)
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
