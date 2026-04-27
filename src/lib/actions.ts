'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

import { ADMIN_ID } from './constants'

// Helper pour vǸrifier si l'utilisateur est autorisǸ via le mot de passe maǩtre admin
async function isAdminAuthorized() {
  const cookieStore = await cookies()
  const hasAccessCookie = cookieStore.get('flozy_admin_access')?.value === 'true'
  // On ne considère comme admin que si le cookie est présent ET qu'on n'est pas en train d'agir en tant qu'artisan
  return hasAccessCookie
}

// Helper pour créer un client Supabase côté serveur avec gestion des cookies
async function getServerSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignoré si appelé depuis un Server Component
          }
        },
      },
    }
  )
}

// Client privilégié pour contourner le RLS dans le panel admin
function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  )
}

// --- HELPER : Récupère l'ID de l'artisan (soit soi-même, soit son patron) ---
async function getArtisanId() {
  const supabase = await getServerSupabase()
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
  const supabase = await getServerSupabase()
  const artisanId = await getArtisanId()
  const { data } = await supabase
    .from('clients')
    .select('*')
    .eq('artisan_id', artisanId)
    .order('full_name')
  return data || []
}

export async function addClient(client: any) {
  const supabase = await getServerSupabase()
  const artisanId = await getArtisanId()
  const { data, error } = await supabase
    .from('clients')
    .insert([{ ...client, artisan_id: artisanId }])
    .select()
  if (error) throw error
  return data[0]
}

export async function updateClient(id: string, updates: any) {
  const supabase = await getServerSupabase()
  const { error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

// --- DOCUMENTS (Devis & Factures) ---
export async function getDocuments() {
  const supabase = await getServerSupabase()
  const artisanId = await getArtisanId()
  const { data } = await supabase
    .from('documents')
    .select('*, clients(*)')
    .eq('artisan_id', artisanId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function createDocument(doc: any) {
  const supabase = await getServerSupabase()
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
  const supabase = await getServerSupabase()
  const artisanId = await getArtisanId()
  const { data } = await supabase
    .from('stock')
    .select('*')
    .eq('artisan_id', artisanId)
    .order('name')
  return data || []
}

export async function updateStockQuantity(id: string, quantity: number) {
  const supabase = await getServerSupabase()
  const { error } = await supabase
    .from('stock')
    .update({ quantity })
    .eq('id', id)
  if (error) throw error
}

// --- INTERVENTIONS ---
export async function getInterventions() {
  const supabase = await getServerSupabase()
  const artisanId = await getArtisanId()
  const { data } = await supabase
    .from('interventions')
    .select('*, clients(*)')
    .eq('artisan_id', artisanId)
    .order('start_time', { ascending: false })
  return data || []
}

export async function createIntervention(inter: any) {
  const supabase = await getServerSupabase()
  const artisanId = await getArtisanId()
  const { data, error } = await supabase
    .from('interventions')
    .insert([{ ...inter, artisan_id: artisanId }])
    .select()
  if (error) throw error
  return data[0]
}

export async function updateIntervention(id: string, updates: any) {
  const supabase = await getServerSupabase()
  const { error } = await supabase
    .from('interventions')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

export async function uploadInterventionPhoto(interventionId: string, file: File) {
  const supabase = await getServerSupabase()
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
  const supabase = await getServerSupabase()
  await supabase.storage.from('photos').remove([fileName])
  const { error } = await supabase
    .from('intervention_photos')
    .delete()
    .eq('id', photoId)
  if (error) throw error
}

// --- CHAMPS PERSONNALISÉS ---
export async function getFieldDefinitions(entityType?: string) {
  const supabase = await getServerSupabase()
  const artisanId = await getArtisanId()
  let query = supabase.from('field_definitions').select('*').eq('artisan_id', artisanId)
  if (entityType) query = query.eq('entity_type', entityType)
  const { data } = await query
  return data || []
}

export async function addFieldDefinition(def: any) {
  const supabase = await getServerSupabase()
  const artisanId = await getArtisanId()
  const { error } = await supabase.from('field_definitions').insert([{ ...def, artisan_id: artisanId }])
  if (error) throw error
}

export async function deleteFieldDefinition(id: string) {
  const supabase = await getServerSupabase()
  const { error } = await supabase.from('field_definitions').delete().eq('id', id)
  if (error) throw error
}

// --- PROFILES & ADMIN ---
export async function forceUpgradeToExpert() {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Non authentifié")
  
  const { error } = await supabase
    .from('profiles')
    .upsert({ 
      id: user.id,
      subscription_plan: 'expert',
      enabled_modules: ['clients', 'documents', 'planning', 'stock'],
      subscription_status: 'active',
      email: user.email
    })
  
  if (error) throw error
  return true
}

export async function updateArtisanProfile(id: string, updates: any) {
  const isPrivileged = await isAdminAuthorized()
  const supabase = isPrivileged ? createAdminClient() : await getServerSupabase()
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
  const isPrivileged = await isAdminAuthorized()
  if (!isPrivileged) return []
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'artisan')
  return data || []
}

export async function suspendArtisan(id: string) {
  const isPrivileged = await isAdminAuthorized()
  const supabase = isPrivileged ? createAdminClient() : await getServerSupabase()
  const { error } = await supabase
    .from('profiles')
    .update({ subscription_status: 'suspended' })
    .eq('id', id)
  if (error) throw error
}

export async function activateArtisan(id: string) {
  const isPrivileged = await isAdminAuthorized()
  const supabase = isPrivileged ? createAdminClient() : await getServerSupabase()
  const { error } = await supabase
    .from('profiles')
    .update({ subscription_status: 'active' })
    .eq('id', id)
  if (error) throw error
}

export async function getAdminStats() {
  const isPrivileged = await isAdminAuthorized()
  if (!isPrivileged) throw new Error("Non autorisǸ")
  const supabase = createAdminClient()
  
  // 1. Récupération de tous les profils pour les stats d'abonnement
  const { data: profiles } = await supabase.from('profiles').select('subscription_plan, role')
  const artisans = profiles?.filter(p => p.role === 'artisan') || []
  
  // 2. Calcul du MRR (Estimé)
  const mrr = artisans.reduce((acc, p) => {
    const plan = (p.subscription_plan || 'starter').toLowerCase()
    if (plan === 'expert') return acc + 49
    if (plan === 'pro') return acc + 29
    return acc
  }, 0)

  // 3. Répartition des plans
  const stats = {
    total_artisans: artisans.length,
    total_revenue: mrr, // On affiche le MRR comme revenu de référence
    expert_count: artisans.filter(p => p.subscription_plan?.toLowerCase() === 'expert').length,
    pro_count: artisans.filter(p => p.subscription_plan?.toLowerCase() === 'pro').length,
    starter_count: artisans.filter(p => p.subscription_plan?.toLowerCase() === 'starter' || !p.subscription_plan).length,
  }

  // 4. Activité globale (System Pulse)
  const [
    { count: totalDocs },
    { count: totalInters },
    { count: totalMsgs }
  ] = await Promise.all([
    supabase.from('documents').select('*', { count: 'exact', head: true }),
    supabase.from('interventions').select('*', { count: 'exact', head: true }),
    supabase.from('messages').select('*', { count: 'exact', head: true }),
  ])

  return {
    ...stats,
    total_documents: totalDocs || 0,
    total_interventions: totalInters || 0,
    total_messages: totalMsgs || 0,
    platform_status: 'Opérationnel'
  }
}

// --- MESSAGERIE ---
export async function getMessages(otherId: string) {
  const isPrivileged = await isAdminAuthorized()
  
  let userId;
  let supabase;

  if (isPrivileged) {
    userId = ADMIN_ID;
    supabase = createAdminClient();
  } else {
    supabase = await getServerSupabase();
    try {
      userId = await getArtisanId();
    } catch {
      return [];
    }
  }

  const { data } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${userId})`)
    .order('created_at', { ascending: true })
  return data || []
}

export async function sendMessage(recipientId: string, content: string, isAdmin: boolean = false) {
  let userId;
  let supabase;

  if (isAdmin) {
    // Force l'identité Admin (Support)
    userId = ADMIN_ID;
    supabase = createAdminClient();
  } else {
    // Force l'identité Artisan (via son ID de patron si c'est un employé)
    supabase = await getServerSupabase();
    userId = await getArtisanId();
  }

  const { error } = await supabase
    .from('messages')
    .insert([{ 
      sender_id: userId, 
      recipient_id: recipientId, 
      content: content.trim(),
      is_read: false
    }])
  
  if (error) {
    console.error("Error sending message:", error)
    throw new Error(`Erreur lors de l'envoi : ${error.message}`)
  }
}

export async function markMessagesAsRead(senderId: string) {
  const isPrivileged = await isAdminAuthorized()
  
  let userId;
  let supabase;

  if (isPrivileged) {
    userId = ADMIN_ID;
    supabase = createAdminClient();
  } else {
    supabase = await getServerSupabase();
    try {
      userId = await getArtisanId();
    } catch {
      return;
    }
  }

  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('sender_id', senderId)
    .eq('recipient_id', userId)
    .eq('is_read', false)

  if (error) {
    console.error("Error marking messages as read:", error)
  }
}

export async function convertQuoteToInvoice(quoteId: string, docNumber: string) {
  const supabase = await getServerSupabase()
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
