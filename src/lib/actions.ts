import { createClient } from './supabase'

export async function getClients() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching clients:', error)
    return []
  }
  return data
}

export async function addClient(client: { full_name: string, email: string, phone: string, address: string }) {
  const supabase = createClient()
  
  // Note: Dans une version réelle, on récupérerait l'ID de l'artisan via l'auth
  const { data: userData } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('clients')
    .insert([
      { 
        ...client, 
        artisan_id: userData.user?.id 
      }
    ])
    .select()

  if (error) throw error
  return data
}
