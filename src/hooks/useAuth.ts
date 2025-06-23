import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth'

export function useAuth() {
  const {
    user,
    session,
    hospitalId,
    loading,
    isAuthenticated,
    signOut,
    refreshSession,
    updateProfile,
    initialize
  } = useAuthStore()

  // Initialize auth state on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  return {
    user,
    session,
    hospitalId,
    role: user?.role || null,
    loading,
    isAuthenticated,
    signOut,
    updateProfile
  }
}