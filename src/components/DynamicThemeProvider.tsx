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
  siret: '',
  setSiret: (siret: string) => {},
  apeCode: '',
  setApeCode: (code: string) => {},
  hourlyRate: 50,
  setHourlyRate: (rate: number) => {},
  enabledModules: ['clients', 'documents'] as string[],
  setEnabledModules: (modules: string[]) => {},
  subscriptionPlan: 'starter',
  setSubscriptionPlan: (plan: string) => {},
  userRole: 'artisan',
  setUserRole: (role: string) => {},
  userId: '' as string | undefined,
  setUserId: (id: string | undefined) => {},
  isAdmin: false,
  setIsAdmin: (isAdmin: boolean) => {}
})

export function DynamicThemeProvider({ children }: { children: React.ReactNode }) {
  const [primaryColor, setPrimaryColor] = useState('#000000')
  const [companyName, setCompanyName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [siret, setSiret] = useState('')
  const [apeCode, setApeCode] = useState('')
  const [hourlyRate, setHourlyRate] = useState(50)
  const [enabledModules, setEnabledModules] = useState<string[]>(['clients', 'documents'])
  const [subscriptionPlan, setSubscriptionPlan] = useState('starter')
  const [userRole, setUserRole] = useState('artisan')
  const [userId, setUserId] = useState<string | undefined>()
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  async function loadProfile(uId?: string) {
    const uid = uId || (await supabase.auth.getUser()).data.user?.id
    if (!uid) return
    setUserId(uid)

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single()

    if (!profile) return

    let workspaceData = profile
    setUserRole(profile.role || 'artisan')
    setIsAdmin(profile.is_admin || false)

    // Si c'est un employé, on récupère les réglages de son patron
    if (profile.role === 'employee' && profile.employer_id) {
      const { data: employer } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profile.employer_id)
        .single()
      
      if (employer) {
        workspaceData = { ...workspaceData, ...employer, subscription_plan: employer.subscription_plan }
      }
    }

    if (workspaceData.primary_color) setPrimaryColor(workspaceData.primary_color)
    if (workspaceData.enabled_modules) setEnabledModules(workspaceData.enabled_modules)
    if (workspaceData.company_name) setCompanyName(workspaceData.company_name)
    if (workspaceData.logo_url) setLogoUrl(workspaceData.logo_url)
    if (workspaceData.siret) setSiret(workspaceData.siret)
    if (workspaceData.ape_code) setApeCode(workspaceData.ape_code)
    if (workspaceData.hourly_rate) setHourlyRate(workspaceData.hourly_rate)
    
    // Normalisation forcée pour éviter les bugs de casse
    if (workspaceData.subscription_plan) {
      setSubscriptionPlan(workspaceData.subscription_plan.toLowerCase())
    }
  }

  useEffect(() => {
    loadProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && session?.user) {
        loadProfile(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-custom', primaryColor)
    const r = parseInt(primaryColor.slice(1, 3), 16)
    const g = parseInt(primaryColor.slice(3, 5), 16)
    const b = parseInt(primaryColor.slice(5, 7), 16)
    document.documentElement.style.setProperty('--primary-custom-rgb', `${r}, ${g}, ${b}`)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    const foreground = luminance > 0.6 ? '#000000' : '#ffffff'
    document.documentElement.style.setProperty('--primary-custom-foreground', foreground)
  }, [primaryColor])

  return (
    <ThemeContext.Provider value={{ 
      primaryColor, setPrimaryColor, 
      companyName, setCompanyName,
      logoUrl, setLogoUrl,
      siret, setSiret,
      apeCode, setApeCode,
      hourlyRate, setHourlyRate,
      enabledModules, setEnabledModules,
      subscriptionPlan, setSubscriptionPlan,
      userRole, setUserRole,
      userId, setUserId,
      isAdmin, setIsAdmin
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
