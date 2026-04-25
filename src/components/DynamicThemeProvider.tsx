'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

const ThemeContext = createContext({
  primaryColor: '#000000',
  setPrimaryColor: (color: string) => {},
  companyName: '',
  setCompanyName: (name: string) => {},
  logoUrl: '',
  setLogoUrl: (url: string) => {},
  enabledModules: ['clients', 'documents'] as string[],
  setEnabledModules: (modules: string[]) => {},
  subscriptionPlan: 'starter',
  setSubscriptionPlan: (plan: string) => {}
})

export function DynamicThemeProvider({ children }: { children: React.ReactNode }) {
  const [primaryColor, setPrimaryColor] = useState('#000000')
  const [companyName, setCompanyName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [enabledModules, setEnabledModules] = useState<string[]>(['clients', 'documents'])
  const [subscriptionPlan, setSubscriptionPlan] = useState('starter')
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile(userId?: string) {
      const uid = userId || (await supabase.auth.getUser()).data.user?.id
      if (!uid) return

      const { data, error } = await supabase
        .from('profiles')
        .select('primary_color, enabled_modules, company_name, logo_url, subscription_plan')
        .eq('id', uid)
        .single()

      if (!error && data) {
        if (data.primary_color) setPrimaryColor(data.primary_color)
        if (data.enabled_modules) setEnabledModules(data.enabled_modules)
        if (data.company_name) setCompanyName(data.company_name)
        if (data.logo_url) setLogoUrl(data.logo_url)
        if (data.subscription_plan) setSubscriptionPlan(data.subscription_plan.toLowerCase())
      } else if (error) {
        console.warn('Note: Les colonnes personnalisées ne sont peut-être pas encore créées dans Supabase. Exécutez le script SQL.')
      }
    }

    // Chargement initial
    loadProfile()

    // Recharge le profil dès que la session est rétablie (nouveau navigateur, onglet, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        loadProfile(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    // Injection de la variable CSS --primary
    // On convertit l'hex en oklch ou on utilise directement hex si on change le globals.css
    document.documentElement.style.setProperty('--primary-custom', primaryColor)
    
    // On peut aussi calculer une version plus claire pour les survol/badges
    const r = parseInt(primaryColor.slice(1, 3), 16)
    const g = parseInt(primaryColor.slice(3, 5), 16)
    const b = parseInt(primaryColor.slice(5, 7), 16)
    document.documentElement.style.setProperty('--primary-custom-rgb', `${r}, ${g}, ${b}`)
    
    // Calcul de la luminance pour déterminer si le texte doit être blanc ou noir
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const foreground = luminance > 0.6 ? '#000000' : '#ffffff';
    document.documentElement.style.setProperty('--primary-custom-foreground', foreground);
  }, [primaryColor])

  return (
    <ThemeContext.Provider value={{ 
      primaryColor, setPrimaryColor, 
      companyName, setCompanyName,
      logoUrl, setLogoUrl,
      enabledModules, setEnabledModules,
      subscriptionPlan, setSubscriptionPlan
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
