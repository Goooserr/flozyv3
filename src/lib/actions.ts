import { createClient } from './supabase'

export async function getClients() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) return []
  return data
}

export async function addClient(client: { full_name: string, email: string, phone: string, address: string, metadata?: any }) {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('clients')
    .insert([
      { 
        ...client, 
        artisan_id: userData.user?.id,
        metadata: client.metadata || {}
      }
    ])
    .select()

  if (error) throw error
  return data
}

export async function updateClient(id: string, client: any) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('clients')
    .update(client)
    .eq('id', id)
    .select()

  if (error) throw error
  return data
}

export async function getFieldDefinitions(entityType: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('field_definitions')
    .select('*')
    .eq('entity_type', entityType)
  
  if (error) {
    console.error('Error fetching field definitions:', error)
    return []
  }
  return data
}

export async function addFieldDefinition(definition: { entity_type: string, label: string, field_type: string, required: boolean }) {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('field_definitions')
    .insert([{ ...definition, artisan_id: userData.user?.id }])
    .select()

  if (error) throw error
  return data
}

export async function deleteFieldDefinition(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('field_definitions')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

// --- MODULE STOCK ---
export async function getStock() {
  const supabase = createClient()
  const { data, error } = await supabase.from('stock').select('*').order('name')
  if (error) return []
  return data
}

export async function updateStockQuantity(id: string, newQuantity: number) {
  const supabase = createClient()
  const { data, error } = await supabase.from('stock').update({ quantity: newQuantity }).eq('id', id).select()
  if (error) throw error
  return data
}

// --- MODULE PLANNING ---
export async function getInterventions() {
  const supabase = createClient()
  const { data, error } = await supabase.from('interventions').select('*, clients(full_name)').order('start_time')
  if (error) return []
  return data
}

export async function createIntervention(intervention: any) {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return null

  // Mapping date string to start_time if provided
  const startTime = intervention.date || intervention.start_time
  const endTime = intervention.end_time || (startTime ? new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString() : null)

  const payload = {
    ...intervention,
    artisan_id: userData.user.id,
    start_time: startTime,
    end_time: endTime
  }

  // Remove 'date' if it exists to avoid DB error
  delete (payload as any).date

  const { data, error } = await supabase.from('interventions').insert([payload]).select()

  if (error) throw error
  return data
}

export async function updateIntervention(id: string, updates: any) {
  const supabase = createClient()
  const { data, error } = await supabase.from('interventions').update(updates).eq('id', id).select()
  if (error) throw error
  return data
}

// --- ESPACE ADMIN ---
export async function getAdminStats() {
  const supabase = createClient()
  
  // Vérification admin
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user?.id).single()
  
  if (!profile?.is_admin) throw new Error("Accès refusé")

  const [users, clients, docs] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('clients').select('id', { count: 'exact' }),
    supabase.from('documents').select('amount')
  ])

  const totalRevenue = docs.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0

  return {
    totalUsers: users.count || 0,
    totalClients: clients.count || 0,
    totalRevenue,
    activeArtisans: users.count || 0
  }
}

// --- MODULE CATALOGUE ---
export async function getCatalogItems() {
  const supabase = createClient()
  const { data, error } = await supabase.from('catalog_items').select('*').order('name')
  if (error) return []
  return data
}

// --- MODULE ADMIN & CHAT ---
export async function getAllArtisans() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*, clients:clients(count)')
    .order('created_at', { ascending: false })
  if (error) return []
  return data
}

export async function getMessages(otherUserId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
    .order('created_at', { ascending: true })
  
  if (error) return []
  return data
}

export async function sendMessage(recipientId: string, content: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('messages').insert([
    { sender_id: user.id, recipient_id: recipientId, content }
  ])
}

// --- MODULE DOCUMENTS (INVOICES/QUOTES) ---
export async function getDocuments(type?: 'invoice' | 'quote') {
  const supabase = createClient()
  let query = supabase.from('documents').select('*, clients(full_name)').order('created_at', { ascending: false })
  
  if (type) {
    query = query.eq('type', type)
  }
  
  const { data, error } = await query
  if (error) return []
  return data
}

export async function createDocument(document: any) {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error("Non autorisé")

  const { data, error } = await supabase.from('documents').insert([{
    ...document,
    artisan_id: userData.user.id
  }]).select().single()

  if (error) throw error
  return data
}

export async function updateDocumentStatus(id: string, status: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from('documents').update({ status }).eq('id', id).select()
  if (error) throw error
  return data
}

export async function convertQuoteToInvoice(id: string, currentNumber: string) {
  const supabase = createClient()
  const newNumber = currentNumber.replace('DEV-', 'FAC-')
  const { data, error } = await supabase.from('documents').update({ 
    type: 'invoice',
    document_number: newNumber,
    status: 'pending'
  }).eq('id', id).select()
  if (error) throw error
  return data
}

export async function uploadInterventionPhoto(interventionId: string, file: File) {
  // Utilise l'API serveur qui a les droits pour créer le bucket si besoin
  const formData = new FormData()
  formData.append('file', file)
  formData.append('interventionId', interventionId)

  const res = await fetch('/api/upload-photo', {
    method: 'POST',
    body: formData,
  })

  const result = await res.json()

  if (!res.ok || !result.success) {
    throw new Error(result.error || "Erreur lors de l'upload")
  }

  return result
}
