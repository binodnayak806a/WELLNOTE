import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  session: any | null
  loading: boolean
  hospitalId: string | null
  isAuthenticated: boolean
  
  // Actions
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, userData: any) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>
  initialize: () => Promise<void>
  setUser: (user: User | null) => void
  setSession: (session: any) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: true,
      hospitalId: null,
      isAuthenticated: false,

      signIn: async (email: string, password: string) => {
        try {
          set({ loading: true })
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          })
          
          if (error) {
            return { success: false, error: error.message }
          }

          // The user profile will be fetched by the auth state change listener
          return { success: true }
        } catch (error: any) {
          return { success: false, error: error.message }
        } finally {
          set({ loading: false })
        }
      },

      signUp: async (email: string, password: string, userData: any) => {
        try {
          set({ loading: true })
          
          // Use the create-user Edge Function for transactional user creation
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
              email,
              password,
              metadata: userData
            })
          })
          
          const result = await response.json()
          
          if (!result.success) {
            return { success: false, error: result.error }
          }

          return { success: true }
        } catch (error: any) {
          return { success: false, error: error.message }
        } finally {
          set({ loading: false })
        }
      },

      signOut: async () => {
        try {
          set({ loading: true })
          await supabase.auth.signOut()
          set({
            user: null,
            session: null,
            hospitalId: null,
            isAuthenticated: false
          })
        } catch (error) {
          console.error('Sign out error:', error)
        } finally {
          set({ loading: false })
        }
      },

      resetPassword: async (email: string) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
          })
          
          if (error) {
            return { success: false, error: error.message }
          }

          return { success: true }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },

      updateProfile: async (data: Partial<User>) => {
        try {
          const { user } = get()
          if (!user) return { success: false, error: 'No user logged in' }

          const { data: updatedUser, error } = await supabase
            .from('users')
            .update(data)
            .eq('id', user.id)
            .select()
            .single()

          if (error) {
            return { success: false, error: error.message }
          }

          set({ user: updatedUser })
          return { success: true }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      },

      initialize: async () => {
        try {
          set({ loading: true })
          
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user) {
            // Fetch user profile
            const { data: userProfile, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (!error && userProfile) {
              set({
                user: userProfile,
                session,
                hospitalId: userProfile.hospital_id,
                isAuthenticated: true
              })
            } else {
              console.error('Failed to fetch user profile:', error)
              set({
                user: null,
                session: null,
                hospitalId: null,
                isAuthenticated: false
              })
            }
          } else {
            set({
              user: null,
              session: null,
              hospitalId: null,
              isAuthenticated: false
            })
          }
        } catch (error) {
          console.error('Auth initialization error:', error)
          set({
            user: null,
            session: null,
            hospitalId: null,
            isAuthenticated: false
          })
        } finally {
          set({ loading: false })
        }
      },

      setUser: (user: User | null) => {
        set({ 
          user, 
          hospitalId: user?.hospital_id || null,
          isAuthenticated: !!user 
        })
      },

      setSession: (session: any) => {
        set({ session })
      },

      setLoading: (loading: boolean) => {
        set({ loading })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        hospitalId: state.hospitalId,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// Set up auth state change listener
supabase.auth.onAuthStateChange(async (event, session) => {
  const { setUser, setSession, setLoading } = useAuthStore.getState()
  
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    setLoading(true)
    
    try {
      if (session?.user) {
        // Fetch user profile
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (!error && userProfile) {
          setUser(userProfile)
          
          // Update last login timestamp
          await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', session.user.id)
        } else {
          console.error('Failed to fetch user profile:', error)
          setUser(null)
        }
      }
    } catch (error) {
      console.error('Error handling auth state change:', error)
      setUser(null)
    } finally {
      setSession(session)
      setLoading(false)
    }
  } else if (event === 'SIGNED_OUT') {
    setUser(null)
    setSession(null)
  }
})