'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface SystemSetting {
  id: string
  appName: string
  appDesc: string
  appIcon: string | null
}

interface SettingsContextType {
  settings: SystemSetting | null
  loading: boolean
  refreshSettings: () => Promise<void>
  updateSettings: (settings: Partial<SystemSetting>) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SystemSetting | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Failed to load settings', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const updateSettings = (newSettings: Partial<SystemSetting>) => {
    setSettings((prev) => prev ? { ...prev, ...newSettings } : null)
  }

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
