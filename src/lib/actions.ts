'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

import { ADMIN_ID } from './constants'

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

// Helper pour vérifier si l'utilisateur est autorisé via le mot de passe maître admin
async function isAdminAuthorized() {
  const cookieStore = await cookies()
  const hasAccessCookie = cookieStore.get('flozy_admin_access')?.value === 'true'
  
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (hasAccessCookie) return true
  
  if (user) {
    const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    if (data?.is_admin) return true
  }

  // Backup : Florian est toujours admin par email
  if (user?.email === 'florian.benoit73@gmail.com') return true
  
  return false
}

export async function getAdminUsers() {
  const isPrivileged = await isAdminAuthorized()
  if (!isPrivileged) throw new Error("Non autorisé")
  
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, is_admin')
    .eq('is_admin', true)
    .order('created_at', { ascending: true })
    
  return data || []
}

export async function promoteToAdmin(email: string) {
  const isPrivileged = await isAdminAuthorized()
  if (!isPrivileged) throw new Error("Non autorisé")
  
  const supabase = createAdminClient()
  
  // On cherche d'abord l'utilisateur par son email dans les profils
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email.toLowerCase())
    .single()
    
  if (!profile) throw new Error("Aucun utilisateur trouvé avec cet email. Il doit d'abord créer un compte.")
  
  const { error } = await supabase
    .from('profiles')
    .update({ 
      is_admin: true, 
      role: 'admin' 
    })
    .eq('id', profile.id)
    
  if (error) throw error
  return true
}

export async function removeAdminAccess(userId: string) {
  const isPrivileged = await isAdminAuthorized()
  if (!isPrivileged) throw new Error("Non autorisé")
  
  // On ne peut pas se retirer soi-même pour éviter de s'enfermer dehors
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.id === userId) throw new Error("Vous ne pouvez pas retirer vos propres droits admin.")

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('profiles')
    .update({ 
      is_admin: false, 
      role: 'artisan' 
    })
    .eq('id', userId)
    
  if (error) throw error
  return true
}

// Helper pour récupérer l'ID de l'admin officiel (Florian ou support)
async function getOfficialAdminId() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()
  
  return data?.id || ADMIN_ID // Fallback sur la constante si non trouvé
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
  try {
    const supabase = await getServerSupabase()
    const artisanId = await getArtisanId()
    const { data, error } = await supabase
      .from('interventions')
      .insert([{ ...inter, artisan_id: artisanId }])
      .select()
    
    if (error) {
      console.error("Supabase error creating intervention:", error)
      return { error: error.message }
    }
    return { data: data[0] }
  } catch (err: any) {
    console.error("Server action crash (createIntervention):", err)
    return { error: err.message || "Une erreur interne est survenue" }
  }
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
  try {
    const supabase = await getServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Non authentifié")

    const fileName = `${user.id}/${interventionId}/${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file)

    if (uploadError) {
      console.error("Supabase Storage Error:", uploadError)
      return { error: `Erreur Storage: ${uploadError.message}. Vérifiez que le bucket 'photos' existe et est public.` }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName)

    const { data, error } = await supabase
      .from('intervention_photos')
      .insert([{
        intervention_id: interventionId,
        url: publicUrl,
        // On garde artisan_id et file_name en optionnel au cas où les colonnes manquent
        artisan_id: user.id,
        file_name: fileName
      }])
      .select()
      .single()

    if (error) {
      console.error("Database Error (Photos):", error)
      return { error: `Erreur Base de données: ${error.message}` }
    }
    return data
  } catch (err: any) {
    console.error("Action Crash (Photos):", err)
    return { error: err.message || "Erreur interne lors de l'envoi" }
  }
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

export async function updateArtisanPlan(id: string, plan: string) {
  const isPrivileged = await isAdminAuthorized()
  if (!isPrivileged) throw new Error("Non autorisé")
  
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('profiles')
    .update({ 
      subscription_plan: plan.toLowerCase(),
      // Mettre à jour les modules activés par défaut pour le plan
      enabled_modules: plan.toLowerCase() === 'starter' 
        ? ['clients', 'documents'] 
        : ['clients', 'documents', 'planning', 'stock']
    })
    .eq('id', id)
  
  if (error) throw error
  return true
}

export async function deleteArtisanAccount(id: string) {
  const isPrivileged = await isAdminAuthorized()
  if (!isPrivileged) throw new Error("Non autorisé")
  
  const supabase = createAdminClient()
  
  // 1. Supprimer le profil (les cascades devraient gérer le reste dans la DB)
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id)
  
  if (profileError) throw profileError

  // 2. Supprimer l'utilisateur de l'Auth Supabase (nécessite la Service Role Key)
  const { error: authError } = await supabase.auth.admin.deleteUser(id)
  
  if (authError) {
    console.error("Auth deletion error:", authError)
    // On ne throw pas forcément ici si le profil est déjà parti, mais c'est mieux de savoir
  }

  return true
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

// --- MESSAGERIE (ARCHITECTURE CONVERSATIONS) ---

export async function getConversations() {
  const isPrivileged = await isAdminAuthorized()
  if (!isPrivileged) return []
  
  const supabase = createAdminClient()
  
  // 1. Récupérer les conversations brutes
  const { data: convs, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .order('last_message_at', { ascending: false })
  
  if (convError) {
    console.error("Error fetching raw conversations:", convError)
    return []
  }

    // 2. Si aucune conversation mais des messages existent, on tente une réparation
  if (!convs || convs.length === 0) {
    const adminId = await getOfficialAdminId()
    const { data: msgs } = await supabase.from('messages').select('sender_id, recipient_id, content, created_at').order('created_at', { ascending: false })
    if (msgs && msgs.length > 0) {
      const artisansToRepair = new Set(msgs.map(m => m.sender_id === adminId ? m.recipient_id : m.sender_id))
      for (const artisanId of artisansToRepair) {
        if (!artisanId) continue
        const lastMsg = msgs.find(m => m.sender_id === artisanId || m.recipient_id === artisanId)
        if (lastMsg) {
          await supabase.from('conversations').upsert([{
            artisan_id: artisanId,
            last_message_content: lastMsg.content,
            last_message_at: lastMsg.created_at,
            unread_count_admin: 1
          }], { onConflict: 'artisan_id' })
        }
      }
      // Re-fetch après réparation
      return getConversations() 
    }
  }

  // 3. Jointure manuelle avec les profils pour éviter l'erreur PGRST200
  const artisanIds = convs.map(c => c.artisan_id)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, company_name, business_name, email')
    .in('id', artisanIds)

  return convs.map(c => ({
    ...c,
    artisan: profiles?.find(p => p.id === c.artisan_id)
  }))
}

export async function getMessages(otherId: string, isAdmin: boolean = false) {
  let userId;
  let supabase = createAdminClient(); 

  if (isAdmin) {
    if (!await isAdminAuthorized()) throw new Error("Non autorisé");
    userId = ADMIN_ID;
  } else {
    const userSupabase = await getServerSupabase();
    const { data: { user } } = await userSupabase.auth.getUser();
    if (!user) return [];
    userId = await getArtisanId();
  }

  // On récupère la conversation liée à cet artisan
  const artisanId = isAdmin ? otherId : userId;
  const { data: conv } = await supabase
    .from('conversations')
    .select('id')
    .eq('artisan_id', artisanId)
    .single();

  if (!conv) return [];

  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conv.id)
    .order('created_at', { ascending: true })
  
  const adminId = await getOfficialAdminId()
  return data?.map(m => ({
    ...m,
    is_from_admin: m.sender_id === adminId
  })) || []
}

export async function sendMessage(recipientId: string, content: string, isAdmin: boolean = false) {
  let userId;
  let supabase = createAdminClient(); 

  if (isAdmin) {
    if (!await isAdminAuthorized()) throw new Error("Non autorisé");
    userId = await getOfficialAdminId();
  } else {
    const userSupabase = await getServerSupabase();
    const { data: { user } } = await userSupabase.auth.getUser();
    if (!user) throw new Error("Non authentifié");
    userId = await getArtisanId();
  }

  // 1. Trouver ou Créer la conversation
  const artisanId = isAdmin ? recipientId : userId;
  let { data: conv } = await supabase
    .from('conversations')
    .select('id')
    .eq('artisan_id', artisanId)
    .single();

  if (!conv) {
    console.log("Creating new conversation for artisan:", artisanId);
    const { data: newConv, error: convError } = await supabase
      .from('conversations')
      .insert([{ 
        artisan_id: artisanId,
        last_message_content: content.trim(),
        last_message_at: new Date().toISOString(),
        unread_count_admin: isAdmin ? 0 : 1,
        unread_count_artisan: isAdmin ? 1 : 0
      }])
      .select()
      .single();
    
    if (convError || !newConv) {
      console.error("Failed to create conversation:", convError);
      throw convError || new Error("Échec de la création de la conversation");
    }
    conv = newConv;
  }

  if (!conv?.id) throw new Error("ID de conversation manquant");
  const conversationId = conv.id;

  // 2. Insérer le message
  const adminId = await getOfficialAdminId()
  const { error: msgError } = await supabase
    .from('messages')
    .insert([{ 
      conversation_id: conversationId,
      sender_id: userId, 
      recipient_id: isAdmin ? recipientId : adminId, 
      content: content.trim(),
      is_read: false
    }])
  
  if (msgError) throw msgError;

  // 3. Mettre à jour la conversation
  // On utilise un simple update ici pour le compteur (on pourrait utiliser rpc pour plus de précision)
  const { data: currentConv } = await supabase.from('conversations').select('unread_count_admin, unread_count_artisan').eq('id', conversationId).single();
  
  const updateData: any = {
    last_message_content: content.trim(),
    last_message_at: new Date().toISOString()
  };

  if (isAdmin) {
    updateData.unread_count_artisan = (currentConv?.unread_count_artisan || 0) + 1;
  } else {
    updateData.unread_count_admin = (currentConv?.unread_count_admin || 0) + 1;
  }

  await supabase.from('conversations').update(updateData).eq('id', conversationId);
}

export async function markMessagesAsRead(senderId: string, isAdmin: boolean = false) {
  const isPrivileged = await isAdminAuthorized()
  let userId;
  let supabase = createAdminClient();

  if (isAdmin) {
    if (!isPrivileged) return;
    userId = ADMIN_ID;
  } else {
    const userSupabase = await getServerSupabase();
    const { data: { user } } = await userSupabase.auth.getUser();
    if (!user) return;
    userId = await getArtisanId();
  }

  const artisanId = isAdmin ? senderId : userId;

  // Reset le compteur dans la conversation
  if (isAdmin) {
    await supabase.from('conversations').update({ unread_count_admin: 0 }).eq('artisan_id', artisanId);
  } else {
    await supabase.from('conversations').update({ unread_count_artisan: 0 }).eq('artisan_id', artisanId);
  }

  // Marquer les messages individuels
  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('sender_id', senderId)
    .eq('recipient_id', userId)
    .eq('is_read', false)
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
