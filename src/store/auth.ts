// // // // // // // // // // // // import { create } from 'zustand'
// // // // // // // // // // // // import { persist } from 'zustand/middleware'
// // // // // // // // // // // // import { supabase } from '@/lib/supabase'
// // // // // // // // // // // // import type { User } from '@/types'

// // // // // // // // // // // // interface AuthState {
// // // // // // // // // // // //   user: User | null
// // // // // // // // // // // //   session: any | null
// // // // // // // // // // // //   loading: boolean
// // // // // // // // // // // //   hospitalId: string | null
// // // // // // // // // // // //   isAuthenticated: boolean
  
// // // // // // // // // // // //   // Actions
// // // // // // // // // // // //   signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
// // // // // // // // // // // //   signUp: (email: string, password: string, userData: any) => Promise<{ success: boolean; error?: string }>
// // // // // // // // // // // //   signOut: () => Promise<void>
// // // // // // // // // // // //   resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
// // // // // // // // // // // //   updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>
// // // // // // // // // // // //   initialize: () => Promise<void>
// // // // // // // // // // // //   setUser: (user: User | null) => void
// // // // // // // // // // // //   setSession: (session: any) => void
// // // // // // // // // // // //   setLoading: (loading: boolean) => void
// // // // // // // // // // // // }

// // // // // // // // // // // // export const useAuthStore = create<AuthState>()(
// // // // // // // // // // // //   persist(
// // // // // // // // // // // //     (set, get) => ({
// // // // // // // // // // // //       user: null,
// // // // // // // // // // // //       session: null,
// // // // // // // // // // // //       loading: true,
// // // // // // // // // // // //       hospitalId: null,
// // // // // // // // // // // //       isAuthenticated: false,

// // // // // // // // // // // //       signIn: async (email: string, password: string) => {
// // // // // // // // // // // //         try {
// // // // // // // // // // // //           set({ loading: true })
          
// // // // // // // // // // // //           const { data, error } = await supabase.auth.signInWithPassword({
// // // // // // // // // // // //             email,
// // // // // // // // // // // //             password
// // // // // // // // // // // //           })
          
// // // // // // // // // // // //           if (error) {
// // // // // // // // // // // //             return { success: false, error: error.message }
// // // // // // // // // // // //           }

// // // // // // // // // // // //           // The user profile will be fetched by the auth state change listener
// // // // // // // // // // // //           return { success: true }
// // // // // // // // // // // //         } catch (error: any) {
// // // // // // // // // // // //           return { success: false, error: error.message }
// // // // // // // // // // // //         } finally {
// // // // // // // // // // // //           set({ loading: false })
// // // // // // // // // // // //         }
// // // // // // // // // // // //       },

// // // // // // // // // // // //       signUp: async (email: string, password: string, userData: any) => {
// // // // // // // // // // // //         try {
// // // // // // // // // // // //           set({ loading: true })
          
// // // // // // // // // // // //           // Use the create-user Edge Function for transactional user creation
// // // // // // // // // // // //           const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`, {
// // // // // // // // // // // //             method: 'POST',
// // // // // // // // // // // //             headers: {
// // // // // // // // // // // //               'Content-Type': 'application/json',
// // // // // // // // // // // //               'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
// // // // // // // // // // // //             },
// // // // // // // // // // // //             body: JSON.stringify({
// // // // // // // // // // // //               email,
// // // // // // // // // // // //               password,
// // // // // // // // // // // //               metadata: userData
// // // // // // // // // // // //             })
// // // // // // // // // // // //           })
          
// // // // // // // // // // // //           const result = await response.json()
          
// // // // // // // // // // // //           if (!result.success) {
// // // // // // // // // // // //             return { success: false, error: result.error }
// // // // // // // // // // // //           }

// // // // // // // // // // // //           return { success: true }
// // // // // // // // // // // //         } catch (error: any) {
// // // // // // // // // // // //           return { success: false, error: error.message }
// // // // // // // // // // // //         } finally {
// // // // // // // // // // // //           set({ loading: false })
// // // // // // // // // // // //         }
// // // // // // // // // // // //       },

// // // // // // // // // // // //       signOut: async () => {
// // // // // // // // // // // //         try {
// // // // // // // // // // // //           set({ loading: true })
// // // // // // // // // // // //           await supabase.auth.signOut()
// // // // // // // // // // // //           set({
// // // // // // // // // // // //             user: null,
// // // // // // // // // // // //             session: null,
// // // // // // // // // // // //             hospitalId: null,
// // // // // // // // // // // //             isAuthenticated: false
// // // // // // // // // // // //           })
// // // // // // // // // // // //         } catch (error) {
// // // // // // // // // // // //           console.error('Sign out error:', error)
// // // // // // // // // // // //         } finally {
// // // // // // // // // // // //           set({ loading: false })
// // // // // // // // // // // //         }
// // // // // // // // // // // //       },

// // // // // // // // // // // //       resetPassword: async (email: string) => {
// // // // // // // // // // // //         try {
// // // // // // // // // // // //           const { error } = await supabase.auth.resetPasswordForEmail(email, {
// // // // // // // // // // // //             redirectTo: `${window.location.origin}/reset-password`
// // // // // // // // // // // //           })
          
// // // // // // // // // // // //           if (error) {
// // // // // // // // // // // //             return { success: false, error: error.message }
// // // // // // // // // // // //           }

// // // // // // // // // // // //           return { success: true }
// // // // // // // // // // // //         } catch (error: any) {
// // // // // // // // // // // //           return { success: false, error: error.message }
// // // // // // // // // // // //         }
// // // // // // // // // // // //       },

// // // // // // // // // // // //       updateProfile: async (data: Partial<User>) => {
// // // // // // // // // // // //         try {
// // // // // // // // // // // //           const { user } = get()
// // // // // // // // // // // //           if (!user) return { success: false, error: 'No user logged in' }

// // // // // // // // // // // //           const { data: updatedUser, error } = await supabase
// // // // // // // // // // // //             .from('users')
// // // // // // // // // // // //             .update(data)
// // // // // // // // // // // //             .eq('id', user.id)
// // // // // // // // // // // //             .select()
// // // // // // // // // // // //             .single()

// // // // // // // // // // // //           if (error) {
// // // // // // // // // // // //             return { success: false, error: error.message }
// // // // // // // // // // // //           }

// // // // // // // // // // // //           set({ user: updatedUser })
// // // // // // // // // // // //           return { success: true }
// // // // // // // // // // // //         } catch (error: any) {
// // // // // // // // // // // //           return { success: false, error: error.message }
// // // // // // // // // // // //         }
// // // // // // // // // // // //       },

// // // // // // // // // // // //       initialize: async () => {
// // // // // // // // // // // //         try {
// // // // // // // // // // // //           set({ loading: true })
          
// // // // // // // // // // // //           const { data: { session } } = await supabase.auth.getSession()
          
// // // // // // // // // // // //           if (session?.user) {
// // // // // // // // // // // //             // Fetch user profile
// // // // // // // // // // // //             const { data: userProfile, error } = await supabase
// // // // // // // // // // // //               .from('users')
// // // // // // // // // // // //               .select('*')
// // // // // // // // // // // //               .eq('id', session.user.id)
// // // // // // // // // // // //               .single()

// // // // // // // // // // // //             if (!error && userProfile) {
// // // // // // // // // // // //               set({
// // // // // // // // // // // //                 user: userProfile,
// // // // // // // // // // // //                 session,
// // // // // // // // // // // //                 hospitalId: userProfile.hospital_id,
// // // // // // // // // // // //                 isAuthenticated: true
// // // // // // // // // // // //               })
// // // // // // // // // // // //             } else {
// // // // // // // // // // // //               console.error('Failed to fetch user profile:', error)
// // // // // // // // // // // //               set({
// // // // // // // // // // // //                 user: null,
// // // // // // // // // // // //                 session: null,
// // // // // // // // // // // //                 hospitalId: null,
// // // // // // // // // // // //                 isAuthenticated: false
// // // // // // // // // // // //               })
// // // // // // // // // // // //             }
// // // // // // // // // // // //           } else {
// // // // // // // // // // // //             set({
// // // // // // // // // // // //               user: null,
// // // // // // // // // // // //               session: null,
// // // // // // // // // // // //               hospitalId: null,
// // // // // // // // // // // //               isAuthenticated: false
// // // // // // // // // // // //             })
// // // // // // // // // // // //           }
// // // // // // // // // // // //         } catch (error) {
// // // // // // // // // // // //           console.error('Auth initialization error:', error)
// // // // // // // // // // // //           set({
// // // // // // // // // // // //             user: null,
// // // // // // // // // // // //             session: null,
// // // // // // // // // // // //             hospitalId: null,
// // // // // // // // // // // //             isAuthenticated: false
// // // // // // // // // // // //           })
// // // // // // // // // // // //         } finally {
// // // // // // // // // // // //           set({ loading: false })
// // // // // // // // // // // //         }
// // // // // // // // // // // //       },

// // // // // // // // // // // //       setUser: (user: User | null) => {
// // // // // // // // // // // //         set({ 
// // // // // // // // // // // //           user, 
// // // // // // // // // // // //           hospitalId: user?.hospital_id || null,
// // // // // // // // // // // //           isAuthenticated: !!user 
// // // // // // // // // // // //         })
// // // // // // // // // // // //       },

// // // // // // // // // // // //       setSession: (session: any) => {
// // // // // // // // // // // //         set({ session })
// // // // // // // // // // // //       },

// // // // // // // // // // // //       setLoading: (loading: boolean) => {
// // // // // // // // // // // //         set({ loading })
// // // // // // // // // // // //       }
// // // // // // // // // // // //     }),
// // // // // // // // // // // //     {
// // // // // // // // // // // //       name: 'auth-storage',
// // // // // // // // // // // //       partialize: (state) => ({
// // // // // // // // // // // //         user: state.user,
// // // // // // // // // // // //         hospitalId: state.hospitalId,
// // // // // // // // // // // //         isAuthenticated: state.isAuthenticated
// // // // // // // // // // // //       })
// // // // // // // // // // // //     }
// // // // // // // // // // // //   )
// // // // // // // // // // // // )

// // // // // // // // // // // // // Set up auth state change listener
// // // // // // // // // // // // supabase.auth.onAuthStateChange(async (event, session) => {
// // // // // // // // // // // //   const { setUser, setSession, setLoading } = useAuthStore.getState()
  
// // // // // // // // // // // //   if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
// // // // // // // // // // // //     setLoading(true)
    
// // // // // // // // // // // //     try {
// // // // // // // // // // // //       if (session?.user) {
// // // // // // // // // // // //         // Fetch user profile
// // // // // // // // // // // //         const { data: userProfile, error } = await supabase
// // // // // // // // // // // //           .from('users')
// // // // // // // // // // // //           .select('*')
// // // // // // // // // // // //           .eq('id', session.user.id)
// // // // // // // // // // // //           .single()

// // // // // // // // // // // //         if (!error && userProfile) {
// // // // // // // // // // // //           setUser(userProfile)
          
// // // // // // // // // // // //           // Update last login timestamp
// // // // // // // // // // // //           await supabase
// // // // // // // // // // // //             .from('users')
// // // // // // // // // // // //             .update({ last_login: new Date().toISOString() })
// // // // // // // // // // // //             .eq('id', session.user.id)
// // // // // // // // // // // //         } else {
// // // // // // // // // // // //           console.error('Failed to fetch user profile:', error)
// // // // // // // // // // // //           setUser(null)
// // // // // // // // // // // //         }
// // // // // // // // // // // //       }
// // // // // // // // // // // //     } catch (error) {
// // // // // // // // // // // //       console.error('Error handling auth state change:', error)
// // // // // // // // // // // //       setUser(null)
// // // // // // // // // // // //     } finally {
// // // // // // // // // // // //       setSession(session)
// // // // // // // // // // // //       setLoading(false)
// // // // // // // // // // // //     }
// // // // // // // // // // // //   } else if (event === 'SIGNED_OUT') {
// // // // // // // // // // // //     setUser(null)
// // // // // // // // // // // //     setSession(null)
// // // // // // // // // // // //   }
// // // // // // // // // // // // })

// // // // // // // // // // // // src/store/auth.ts

// // // // // // // // // // // import { create } from 'zustand'
// // // // // // // // // // // import { supabase } from '@/lib/supabase'
// // // // // // // // // // // import type { Session, User } from '@supabase/supabase-js'
// // // // // // // // // // // import { offlineCache } from '@/lib/offline/offlineCache'

// // // // // // // // // // // interface AuthState {
// // // // // // // // // // //   user: (User & { role: string, is_active: boolean, hospitals?: any[] }) | null
// // // // // // // // // // //   session: Session | null
// // // // // // // // // // //   hospital: any | null
// // // // // // // // // // //   hospitalId: string | null
// // // // // // // // // // //   userRole: string | null
// // // // // // // // // // //   loading: boolean
// // // // // // // // // // //   isAuthenticated: boolean
// // // // // // // // // // //   error: string | null

// // // // // // // // // // //   // Actions
// // // // // // // // // // //   initialize: () => Promise<void>
// // // // // // // // // // //   setSession: (session: Session | null) => Promise<void>
// // // // // // // // // // //   signInWithEmail: (email: string) => Promise<void>
// // // // // // // // // // //   verifyOtp: (email: string, token: string) => Promise<void>
// // // // // // // // // // //   signOut: () => Promise<void>
// // // // // // // // // // //   setHospital: (hospital: any) => void
// // // // // // // // // // // }

// // // // // // // // // // // export const useAuthStore = create<AuthState>((set, get) => ({
// // // // // // // // // // //   user: null,
// // // // // // // // // // //   session: null,
// // // // // // // // // // //   hospital: null,
// // // // // // // // // // //   hospitalId: null,
// // // // // // // // // // //   userRole: null,
// // // // // // // // // // //   loading: true, // Start in loading state
// // // // // // // // // // //   isAuthenticated: false,
// // // // // // // // // // //   error: null,

// // // // // // // // // // //   initialize: async () => {
// // // // // // // // // // //     try {
// // // // // // // // // // //       set({ loading: true })
      
// // // // // // // // // // //       const { data: { session } } = await supabase.auth.getSession()
      
// // // // // // // // // // //       if (session?.user) {
// // // // // // // // // // //         const { data: profile, error } = await supabase
// // // // // // // // // // //           .from('users')
// // // // // // // // // // //           .select('*, hospitals (*)')
// // // // // // // // // // //           .eq('id', session.user.id)
// // // // // // // // // // //           .single()

// // // // // // // // // // //         if (error) throw error

// // // // // // // // // // //         if (profile) {
// // // // // // // // // // //           const currentHospital = profile.hospitals?.[0] || null
// // // // // // // // // // //           set({
// // // // // // // // // // //             user: profile,
// // // // // // // // // // //             session,
// // // // // // // // // // //             isAuthenticated: true,
// // // // // // // // // // //             hospitalId: currentHospital?.id || null,
// // // // // // // // // // //             hospital: currentHospital,
// // // // // // // // // // //             userRole: profile.role,
// // // // // // // // // // //           })
// // // // // // // // // // //           // Cache essential data after successful authentication
// // // // // // // // // // //           await offlineCache.cacheEssentialData(currentHospital?.id)
// // // // // // // // // // //         }
// // // // // // // // // // //       } else {
// // // // // // // // // // //         set({ user: null, session: null, isAuthenticated: false, hospitalId: null, hospital: null, userRole: null })
// // // // // // // // // // //       }
// // // // // // // // // // //     } catch (error: any) {
// // // // // // // // // // //       console.error('Auth initialization error:', error)
// // // // // // // // // // //       set({ user: null, session: null, isAuthenticated: false, hospitalId: null, hospital: null, userRole: null })
// // // // // // // // // // //     } finally {
// // // // // // // // // // //       set({ loading: false })
// // // // // // // // // // //     }
// // // // // // // // // // //   },

// // // // // // // // // // //   setSession: async (session: Session | null) => {
// // // // // // // // // // //     if (session?.user) {
// // // // // // // // // // //       const { data: profile, error } = await supabase
// // // // // // // // // // //         .from('users')
// // // // // // // // // // //         .select('*, hospitals (*)')
// // // // // // // // // // //         .eq('id', session.user.id)
// // // // // // // // // // //         .single()
      
// // // // // // // // // // //       if (error) {
// // // // // // // // // // //         console.error('Error fetching profile on session update:', error)
// // // // // // // // // // //         set({ user: null, session: null, isAuthenticated: false, error: error.message })
// // // // // // // // // // //         return
// // // // // // // // // // //       }
      
// // // // // // // // // // //       if (profile) {
// // // // // // // // // // //         const currentHospital = profile.hospitals?.[0] || null
// // // // // // // // // // //         set({
// // // // // // // // // // //           user: profile,
// // // // // // // // // // //           session,
// // // // // // // // // // //           isAuthenticated: true,
// // // // // // // // // // //           hospitalId: currentHospital?.id || null,
// // // // // // // // // // //           hospital: currentHospital,
// // // // // // // // // // //           userRole: profile.role,
// // // // // // // // // // //         })
// // // // // // // // // // //       }
// // // // // // // // // // //     } else {
// // // // // // // // // // //       set({ user: null, session: null, isAuthenticated: false, hospitalId: null, hospital: null, userRole: null })
// // // // // // // // // // //     }
// // // // // // // // // // //   },

// // // // // // // // // // //   signInWithEmail: async (email: string) => {
// // // // // // // // // // //     set({ loading: true, error: null })
// // // // // // // // // // //     try {
// // // // // // // // // // //       const { error } = await supabase.auth.signInWithOtp({
// // // // // // // // // // //         email,
// // // // // // // // // // //         options: {
// // // // // // // // // // //           shouldCreateUser: false
// // // // // // // // // // //         }
// // // // // // // // // // //       })
// // // // // // // // // // //       if (error) throw error
// // // // // // // // // // //     } catch (error: any) {
// // // // // // // // // // //       set({ error: error.message })
// // // // // // // // // // //       throw error
// // // // // // // // // // //     } finally {
// // // // // // // // // // //       set({ loading: false })
// // // // // // // // // // //     }
// // // // // // // // // // //   },

// // // // // // // // // // //   verifyOtp: async (email: string, token: string) => {
// // // // // // // // // // //     set({ loading: true, error: null })
// // // // // // // // // // //     try {
// // // // // // // // // // //       const { data, error } = await supabase.auth.verifyOtp({
// // // // // // // // // // //         email,
// // // // // // // // // // //         token,
// // // // // // // // // // //         type: 'email'
// // // // // // // // // // //       })
// // // // // // // // // // //       if (error) throw error

// // // // // // // // // // //       if (data.session) {
// // // // // // // // // // //         get().setSession(data.session)
// // // // // // // // // // //       }
      
// // // // // // // // // // //     } catch (error: any) {
// // // // // // // // // // //       set({ error: error.message })
// // // // // // // // // // //       throw error
// // // // // // // // // // //     } finally {
// // // // // // // // // // //       set({ loading: false })
// // // // // // // // // // //     }
// // // // // // // // // // //   },

// // // // // // // // // // //   signOut: async () => {
// // // // // // // // // // //     await supabase.auth.signOut()
// // // // // // // // // // //     set({ user: null, session: null, isAuthenticated: false, hospitalId: null, hospital: null, userRole: null })
// // // // // // // // // // //     await offlineCache.clearAllData() // Clear offline data on sign out
// // // // // // // // // // //   },

// // // // // // // // // // //   setHospital: (hospital: any) => {
// // // // // // // // // // //     set({ hospital, hospitalId: hospital?.id || null })
// // // // // // // // // // //   },
// // // // // // // // // // // }));


// // // // // // // // // // // // Listen for auth state changes from Supabase
// // // // // // // // // // // supabase.auth.onAuthStateChange((_event, session) => {
// // // // // // // // // // //   useAuthStore.getState().setSession(session)
// // // // // // // // // // // })

// // // // // // // // // // // // REMOVED THE IMMEDIATE INITIALIZE CALL FROM HERE

// // // // // // // // // // // src/store/auth.ts

// // // // // // // // // // import { create } from 'zustand'
// // // // // // // // // // import { supabase } from '@/lib/supabase'
// // // // // // // // // // import type { Session, User } from '@supabase/supabase-js'
// // // // // // // // // // import { offlineCache } from '@/lib/offline/offlineCache'

// // // // // // // // // // interface AuthState {
// // // // // // // // // //   user: (User & { role: string, is_active: boolean, hospitals?: any[] }) | null
// // // // // // // // // //   session: Session | null
// // // // // // // // // //   hospital: any | null
// // // // // // // // // //   hospitalId: string | null
// // // // // // // // // //   userRole: string | null
// // // // // // // // // //   loading: boolean
// // // // // // // // // //   isAuthenticated: boolean
// // // // // // // // // //   error: string | null

// // // // // // // // // //   // Actions
// // // // // // // // // //   initialize: () => Promise<void>
// // // // // // // // // //   setSession: (session: Session | null) => Promise<void>
// // // // // // // // // //   signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
// // // // // // // // // //   signOut: () => Promise<void>
// // // // // // // // // // }

// // // // // // // // // // export const useAuthStore = create<AuthState>((set, get) => ({
// // // // // // // // // //   user: null,
// // // // // // // // // //   session: null,
// // // // // // // // // //   hospital: null,
// // // // // // // // // //   hospitalId: null,
// // // // // // // // // //   userRole: null,
// // // // // // // // // //   loading: true, // Start in loading state
// // // // // // // // // //   isAuthenticated: false,
// // // // // // // // // //   error: null,

// // // // // // // // // //   initialize: async () => {
// // // // // // // // // //     try {
// // // // // // // // // //       set({ loading: true })
      
// // // // // // // // // //       const { data: { session } } = await supabase.auth.getSession()
      
// // // // // // // // // //       if (session?.user) {
// // // // // // // // // //         // Corrected the query to be explicit about the relationship
// // // // // // // // // //         const { data: profile, error } = await supabase
// // // // // // // // // //           .from('users')
// // // // // // // // // //           .select('*, hospital:hospital_id (*)') // Use foreign key name
// // // // // // // // // //           .eq('id', session.user.id)
// // // // // // // // // //           .single()

// // // // // // // // // //         if (error) throw error

// // // // // // // // // //         if (profile) {
// // // // // // // // // //           set({
// // // // // // // // // //             user: { ...profile, hospitals: [profile.hospital] }, // Re-structure for consistency
// // // // // // // // // //             session,
// // // // // // // // // //             isAuthenticated: true,
// // // // // // // // // //             hospitalId: profile.hospital?.id || null,
// // // // // // // // // //             hospital: profile.hospital || null,
// // // // // // // // // //             userRole: profile.role,
// // // // // // // // // //           })
// // // // // // // // // //           await offlineCache.cacheEssentialData(profile.hospital?.id)
// // // // // // // // // //         }
// // // // // // // // // //       } else {
// // // // // // // // // //         set({ user: null, session: null, isAuthenticated: false, hospitalId: null, hospital: null, userRole: null })
// // // // // // // // // //       }
// // // // // // // // // //     } catch (error: any) {
// // // // // // // // // //       console.error('Auth initialization error:', error)
// // // // // // // // // //       set({ user: null, session: null, isAuthenticated: false, hospitalId: null, hospital: null, userRole: null, error: error.message })
// // // // // // // // // //     } finally {
// // // // // // // // // //       set({ loading: false })
// // // // // // // // // //     }
// // // // // // // // // //   },

// // // // // // // // // //   setSession: async (session: Session | null) => {
// // // // // // // // // //     set({ session });
// // // // // // // // // //     if (session?.user) {
// // // // // // // // // //       try {
// // // // // // // // // //         // Corrected the query to be explicit about the relationship
// // // // // // // // // //         const { data: profile, error } = await supabase
// // // // // // // // // //           .from('users')
// // // // // // // // // //           .select('*, hospital:hospital_id (*)') // Use foreign key name
// // // // // // // // // //           .eq('id', session.user.id)
// // // // // // // // // //           .single()
        
// // // // // // // // // //         if (error) throw error
        
// // // // // // // // // //         if (profile) {
// // // // // // // // // //           set({
// // // // // // // // // //             user: { ...profile, hospitals: [profile.hospital] }, // Re-structure for consistency
// // // // // // // // // //             isAuthenticated: true,
// // // // // // // // // //             hospitalId: profile.hospital?.id || null,
// // // // // // // // // //             hospital: profile.hospital,
// // // // // // // // // //             userRole: profile.role,
// // // // // // // // // //             error: null
// // // // // // // // // //           })
// // // // // // // // // //         }
// // // // // // // // // //       } catch (error: any) {
// // // // // // // // // //         console.error('Error fetching profile on session update:', error)
// // // // // // // // // //         set({ user: null, isAuthenticated: false, error: error.message })
// // // // // // // // // //       }
// // // // // // // // // //     } else {
// // // // // // // // // //       set({ user: null, isAuthenticated: false, hospitalId: null, hospital: null, userRole: null })
// // // // // // // // // //     }
// // // // // // // // // //   },

// // // // // // // // // //   signIn: async (email: string, password: string) => {
// // // // // // // // // //     const { error } = await supabase.auth.signInWithPassword({ email, password });
// // // // // // // // // //     if (error) return { success: false, error: error.message };
// // // // // // // // // //     return { success: true };
// // // // // // // // // //   },

// // // // // // // // // //   signOut: async () => {
// // // // // // // // // //     await supabase.auth.signOut()
// // // // // // // // // //     set({ user: null, session: null, isAuthenticated: false, hospitalId: null, hospital: null, userRole: null })
// // // // // // // // // //     await offlineCache.clearAllData() // Clear offline data on sign out
// // // // // // // // // //   },
// // // // // // // // // // }));

// // // // // // // // // // // Initialize auth state once when the app loads
// // // // // // // // // // useAuthStore.getState().initialize();

// // // // // // // // // // // Listen for auth state changes from Supabase
// // // // // // // // // // supabase.auth.onAuthStateChange((_event, session) => {
// // // // // // // // // //   useAuthStore.getState().setSession(session)
// // // // // // // // // // })

// // // // // // // // // import { create } from 'zustand'
// // // // // // // // // import { persist } from 'zustand/middleware'
// // // // // // // // // import { supabase } from '@/lib/supabase'
// // // // // // // // // import type { User, Session } from '@supabase/supabase-js'

// // // // // // // // // // Define a more specific type for your user profile
// // // // // // // // // type UserProfile = User & { 
// // // // // // // // //   role: string;
// // // // // // // // //   is_active: boolean;
// // // // // // // // //   hospital_id: string;
// // // // // // // // //   hospital: any; // The fetched hospital object will be placed here
// // // // // // // // // };

// // // // // // // // // interface AuthState {
// // // // // // // // //   user: UserProfile | null
// // // // // // // // //   session: Session | null
// // // // // // // // //   loading: boolean
// // // // // // // // //   hospitalId: string | null
// // // // // // // // //   isAuthenticated: boolean
  
// // // // // // // // //   initialize: () => Promise<void>
// // // // // // // // //   setSession: (session: Session | null) => Promise<void>
// // // // // // // // //   signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
// // // // // // // // //   signOut: () => Promise<void>
// // // // // // // // // }

// // // // // // // // // export const useAuthStore = create<AuthState>()(
// // // // // // // // //   persist(
// // // // // // // // //     (set, get) => ({
// // // // // // // // //       user: null,
// // // // // // // // //       session: null,
// // // // // // // // //       loading: true,
// // // // // // // // //       hospitalId: null,
// // // // // // // // //       isAuthenticated: false,

// // // // // // // // //       initialize: async () => {
// // // // // // // // //         set({ loading: true });
// // // // // // // // //         const { data: { session } } = await supabase.auth.getSession();
// // // // // // // // //         await get().setSession(session);
// // // // // // // // //         set({ loading: false });
// // // // // // // // //       },

// // // // // // // // //       setSession: async (session: Session | null) => {
// // // // // // // // //         if (session?.user && session.user.id !== get().user?.id) {
// // // // // // // // //             set({ loading: true });
// // // // // // // // //             try {
// // // // // // // // //                 // Corrected and simplified query
// // // // // // // // //                 const { data: userProfile, error } = await supabase
// // // // // // // // //                   .from('users')
// // // // // // // // //                   .select(`
// // // // // // // // //                     *,
// // // // // // // // //                     hospitals ( id, name )
// // // // // // // // //                   `)
// // // // // // // // //                   .eq('id', session.user.id)
// // // // // // // // //                   .single();

// // // // // // // // //                 if (error) throw error;

// // // // // // // // //                 if (userProfile) {
// // // // // // // // //                   set({
// // // // // // // // //                     user: userProfile as UserProfile,
// // // // // // // // //                     session,
// // // // // // // // //                     isAuthenticated: true,
// // // // // // // // //                     hospitalId: userProfile.hospital_id,
// // // // // // // // //                   });
// // // // // // // // //                 } else {
// // // // // // // // //                     throw new Error("User profile not found after login.");
// // // // // // // // //                 }
// // // // // // // // //             } catch (error: any) {
// // // // // // // // //                 console.error('Error fetching profile on session update:', error);
// // // // // // // // //                 await get().signOut(); // Log out if profile is invalid
// // // // // // // // //             } finally {
// // // // // // // // //                 set({ loading: false });
// // // // // // // // //             }
// // // // // // // // //         } else if (!session) {
// // // // // // // // //             set({ user: null, session: null, hospitalId: null, isAuthenticated: false });
// // // // // // // // //         }
// // // // // // // // //       },

// // // // // // // // //       signIn: async (email: string, password: string) => {
// // // // // // // // //         const { error } = await supabase.auth.signInWithPassword({ email, password });
// // // // // // // // //         if (error) return { success: false, error: error.message };
// // // // // // // // //         return { success: true };
// // // // // // // // //       },

// // // // // // // // //       signOut: async () => {
// // // // // // // // //         await supabase.auth.signOut();
// // // // // // // // //         set({ user: null, session: null, hospitalId: null, isAuthenticated: false });
// // // // // // // // //       },
// // // // // // // // //     }),
// // // // // // // // //     {
// // // // // // // // //       name: 'auth-storage',
// // // // // // // // //       partialize: (state) => ({ session: state.session }),
// // // // // // // // //     }
// // // // // // // // //   )
// // // // // // // // // );

// // // // // // // // // // Initialize auth state once when the app loads
// // // // // // // // // useAuthStore.getState().initialize();

// // // // // // // // // // Set up auth state change listener to keep session in sync
// // // // // // // // // supabase.auth.onAuthStateChange((_event, session) => {
// // // // // // // // //   if (session?.access_token !== useAuthStore.getState().session?.access_token) {
// // // // // // // // //     useAuthStore.getState().setSession(session);
// // // // // // // // //   }
// // // // // // // // // });


// // // // // // // // import { create } from 'zustand'
// // // // // // // // import { persist } from 'zustand/middleware'
// // // // // // // // import { supabase } from '@/lib/supabase'
// // // // // // // // import type { User, Session } from '@supabase/supabase-js'

// // // // // // // // // Define a more specific type for your user profile
// // // // // // // // type UserProfile = User & { 
// // // // // // // //   role: string;
// // // // // // // //   is_active: boolean;
// // // // // // // //   hospital_id: string;
// // // // // // // //   hospitals: any; // The fetched hospital object will be placed here
// // // // // // // // };

// // // // // // // // interface AuthState {
// // // // // // // //   user: UserProfile | null
// // // // // // // //   session: Session | null
// // // // // // // //   loading: boolean
// // // // // // // //   hospitalId: string | null
// // // // // // // //   isAuthenticated: boolean
  
// // // // // // // //   initialize: () => Promise<void>
// // // // // // // //   setSession: (session: Session | null) => Promise<void>
// // // // // // // //   signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
// // // // // // // //   signOut: () => Promise<void>
// // // // // // // // }

// // // // // // // // export const useAuthStore = create<AuthState>()(
// // // // // // // //   persist(
// // // // // // // //     (set, get) => ({
// // // // // // // //       user: null,
// // // // // // // //       session: null,
// // // // // // // //       loading: true,
// // // // // // // //       hospitalId: null,
// // // // // // // //       isAuthenticated: false,

// // // // // // // //       initialize: async () => {
// // // // // // // //         set({ loading: true });
// // // // // // // //         const { data: { session } } = await supabase.auth.getSession();
// // // // // // // //         await get().setSession(session);
// // // // // // // //         set({ loading: false });
// // // // // // // //       },

// // // // // // // //       setSession: async (session: Session | null) => {
// // // // // // // //         if (session?.user && session.user.id !== get().user?.id) {
// // // // // // // //             set({ loading: true });
// // // // // // // //             try {
// // // // // // // //                 // Corrected and simplified query
// // // // // // // //                 const { data: userProfile, error } = await supabase
// // // // // // // //                   .from('users')
// // // // // // // //                   .select(`
// // // // // // // //                     *,
// // // // // // // //                     hospitals ( id, name )
// // // // // // // //                   `)
// // // // // // // //                   .eq('id', session.user.id)
// // // // // // // //                   .single();

// // // // // // // //                 if (error) throw error;

// // // // // // // //                 if (userProfile) {
// // // // // // // //                   set({
// // // // // // // //                     user: userProfile as UserProfile,
// // // // // // // //                     session,
// // // // // // // //                     isAuthenticated: true,
// // // // // // // //                     hospitalId: userProfile.hospital_id,
// // // // // // // //                   });
// // // // // // // //                 } else {
// // // // // // // //                     throw new Error("User profile not found after login.");
// // // // // // // //                 }
// // // // // // // //             } catch (error: any) {
// // // // // // // //                 console.error('Error fetching profile on session update:', error);
// // // // // // // //                 await get().signOut(); // Log out if profile is invalid
// // // // // // // //             } finally {
// // // // // // // //                 set({ loading: false });
// // // // // // // //             }
// // // // // // // //         } else if (!session) {
// // // // // // // //             set({ user: null, session: null, hospitalId: null, isAuthenticated: false });
// // // // // // // //         }
// // // // // // // //       },

// // // // // // // //       signIn: async (email: string, password: string) => {
// // // // // // // //         const { error } = await supabase.auth.signInWithPassword({ email, password });
// // // // // // // //         if (error) return { success: false, error: error.message };
// // // // // // // //         return { success: true };
// // // // // // // //       },

// // // // // // // //       signOut: async () => {
// // // // // // // //         await supabase.auth.signOut();
// // // // // // // //         set({ user: null, session: null, hospitalId: null, isAuthenticated: false });
// // // // // // // //       },
// // // // // // // //     }),
// // // // // // // //     {
// // // // // // // //       name: 'auth-storage',
// // // // // // // //       partialize: (state) => ({ session: state.session }),
// // // // // // // //     }
// // // // // // // //   )
// // // // // // // // );

// // // // // // // // // Initialize auth state once when the app loads
// // // // // // // // useAuthStore.getState().initialize();

// // // // // // // // // Set up auth state change listener to keep session in sync
// // // // // // // // supabase.auth.onAuthStateChange((_event, session) => {
// // // // // // // //   if (session?.access_token !== useAuthStore.getState().session?.access_token) {
// // // // // // // //     useAuthStore.getState().setSession(session);
// // // // // // // //   }
// // // // // // // // });


// // // // // // // import { create } from 'zustand'
// // // // // // // import { persist } from 'zustand/middleware'
// // // // // // // import { supabase } from '@/lib/supabase'
// // // // // // // import type { User, Session } from '@supabase/supabase-js'

// // // // // // // // A more specific type for your user profile from the `users` table
// // // // // // // type UserProfile = User & { 
// // // // // // //   role: string;
// // // // // // //   is_active: boolean;
// // // // // // //   hospital_id: string;
// // // // // // //   hospitals: { id: string; name: string }; // Define the shape of the nested hospital object
// // // // // // // };

// // // // // // // interface AuthState {
// // // // // // //   user: UserProfile | null;
// // // // // // //   session: Session | null;
// // // // // // //   loading: boolean;
// // // // // // //   hospitalId: string | null;
// // // // // // //   isAuthenticated: boolean;
  
// // // // // // //   // Actions
// // // // // // //   initialize: () => void;
// // // // // // //   setSession: (session: Session | null) => Promise<void>;
// // // // // // //   signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
// // // // // // //   signOut: () => Promise<void>;
// // // // // // // }

// // // // // // // export const useAuthStore = create<AuthState>()(
// // // // // // //   persist(
// // // // // // //     (set, get) => ({
// // // // // // //       user: null,
// // // // // // //       session: null,
// // // // // // //       loading: true, // Start in loading state
// // // // // // //       hospitalId: null,
// // // // // // //       isAuthenticated: false,

// // // // // // //       initialize: () => {
// // // // // // //         // onAuthStateChange will handle everything, but we can check the initial session
// // // // // // //         // to speed up the first load.
// // // // // // //         supabase.auth.getSession().then(({ data: { session } }) => {
// // // // // // //           get().setSession(session);
// // // // // // //           set({ loading: false });
// // // // // // //         });
// // // // // // //       },

// // // // // // //       setSession: async (session: Session | null) => {
// // // // // // //         if (session) {
// // // // // // //           try {
// // // // // // //             const { data: userProfile, error } = await supabase
// // // // // // //               .from('users')
// // // // // // //               .select(`
// // // // // // //                 *,
// // // // // // //                 hospitals ( id, name )
// // // // // // //               `)
// // // // // // //               .eq('id', session.user.id)
// // // // // // //               .single();

// // // // // // //             if (error) throw error;
            
// // // // // // //             if (userProfile) {
// // // // // // //               set({
// // // // // // //                 user: userProfile as UserProfile,
// // // // // // //                 session,
// // // // // // //                 isAuthenticated: true,
// // // // // // //                 hospitalId: userProfile.hospital_id,
// // // // // // //               });
// // // // // // //             } else {
// // // // // // //               // This case happens if the user exists in auth but not in our public profiles table
// // // // // // //               throw new Error("User profile could not be found.");
// // // // // // //             }
// // // // // // //           } catch (error) {
// // // // // // //             console.error("Error setting session and fetching profile:", error);
// // // // // // //             // If we can't get the profile, the user is not truly logged in. Sign them out.
// // // // // // //             await get().signOut();
// // // // // // //           }
// // // // // // //         } else {
// // // // // // //           // If there is no session, clear all user data
// // // // // // //           set({ user: null, session: null, hospitalId: null, isAuthenticated: false });
// // // // // // //         }
// // // // // // //       },

// // // // // // //       signIn: async (email: string, password: string) => {
// // // // // // //         const { error } = await supabase.auth.signInWithPassword({ email, password });
// // // // // // //         if (error) {
// // // // // // //           return { success: false, error: error.message };
// // // // // // //         }
// // // // // // //         // onAuthStateChange will handle setting the session and profile
// // // // // // //         return { success: true };
// // // // // // //       },

// // // // // // //       signOut: async () => {
// // // // // // //         await supabase.auth.signOut();
// // // // // // //         // The onAuthStateChange listener will clear the state
// // // // // // //       },
// // // // // // //     }),
// // // // // // //     {
// // // // // // //       name: 'auth-storage',
// // // // // // //       // Only persist the session object itself. All other state will be derived from it on load.
// // // // // // //       partialize: (state) => ({ session: state.session }),
// // // // // // //     }
// // // // // // //   )
// // // // // // // );

// // // // // // // // Call initialize once when the app is loaded
// // // // // // // useAuthStore.getState().initialize();

// // // // // // // // This is the single source of truth for auth changes.
// // // // // // // supabase.auth.onAuthStateChange((_event, session) => {
// // // // // // //   // We compare access tokens to prevent unnecessary re-renders
// // // // // // //   if (session?.access_token !== useAuthStore.getState().session?.access_token) {
// // // // // // //     useAuthStore.getState().setSession(session);
// // // // // // //   }
// // // // // // // });



// // // // // // import { create } from 'zustand'
// // // // // // import { persist } from 'zustand/middleware'
// // // // // // import { supabase } from '@/lib/supabase'
// // // // // // import type { User, Session } from '@supabase/supabase-js'

// // // // // // // Define a more specific type for your user profile from the `users` table
// // // // // // type UserProfile = User & { 
// // // // // //   role: string;
// // // // // //   is_active: boolean;
// // // // // //   hospital_id: string;
// // // // // //   hospitals: { id: string; name: string }; // Define the shape of the nested hospital object
// // // // // // };

// // // // // // interface AuthState {
// // // // // //   user: UserProfile | null;
// // // // // //   session: Session | null;
// // // // // //   loading: boolean;
// // // // // //   hospitalId: string | null;
// // // // // //   isAuthenticated: boolean;
  
// // // // // //   initialize: () => void;
// // // // // //   setSession: (session: Session | null) => Promise<void>;
// // // // // //   signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
// // // // // //   signOut: () => Promise<void>;
// // // // // // }

// // // // // // export const useAuthStore = create<AuthState>()(
// // // // // //   persist(
// // // // // //     (set, get) => ({
// // // // // //       user: null,
// // // // // //       session: null,
// // // // // //       loading: true, // Start in loading state
// // // // // //       hospitalId: null,
// // // // // //       isAuthenticated: false,

// // // // // //       initialize: () => {
// // // // // //         // onAuthStateChange will handle everything, but we can check the initial session
// // // // // //         // to speed up the first load.
// // // // // //         supabase.auth.getSession().then(({ data: { session } }) => {
// // // // // //           get().setSession(session);
// // // // // //           set({ loading: false });
// // // // // //         });
// // // // // //       },

// // // // // //       setSession: async (session: Session | null) => {
// // // // // //         if (session) {
// // // // // //           try {
// // // // // //             // This is the corrected, specific query that will not fail
// // // // // //             const { data: userProfile, error } = await supabase
// // // // // //               .from('users')
// // // // // //               .select(`
// // // // // //                 id, email, role, is_active, hospital_id,
// // // // // //                 hospitals ( id, name )
// // // // // //               `)
// // // // // //               .eq('id', session.user.id)
// // // // // //               .single();

// // // // // //             if (error) throw error;
            
// // // // // //             if (userProfile) {
// // // // // //               set({
// // // // // //                 user: userProfile as UserProfile,
// // // // // //                 session,
// // // // // //                 isAuthenticated: true, // This is the key state update
// // // // // //                 hospitalId: userProfile.hospital_id,
// // // // // //               });
// // // // // //             } else {
// // // // // //               throw new Error("User profile not found after login.");
// // // // // //             }
// // // // // //           } catch (error: any) {
// // // // // //             console.error("Error setting session and fetching profile:", error);
// // // // // //             // If we can't get the profile, the user is not truly logged in. Sign them out.
// // // // // //             await get().signOut();
// // // // // //           }
// // // // // //         } else {
// // // // // //           // If there is no session, clear all user data
// // // // // //           set({ user: null, session: null, hospitalId: null, isAuthenticated: false });
// // // // // //         }
// // // // // //       },

// // // // // //       signIn: async (email: string, password: string) => {
// // // // // //         const { error } = await supabase.auth.signInWithPassword({ email, password });
// // // // // //         if (error) {
// // // // // //           return { success: false, error: error.message };
// // // // // //         }
// // // // // //         // onAuthStateChange will handle setting the session and profile
// // // // // //         return { success: true };
// // // // // //       },

// // // // // //       signOut: async () => {
// // // // // //         await supabase.auth.signOut();
// // // // // //         // The onAuthStateChange listener will clear the state
// // // // // //       },
// // // // // //     }),
// // // // // //     {
// // // // // //       name: 'auth-storage',
// // // // // //       // Only persist the session object itself. All other state will be derived from it on load.
// // // // // //       partialize: (state) => ({ session: state.session }),
// // // // // //     }
// // // // // //   )
// // // // // // );

// // // // // // // Initialize auth state once when the app is loaded
// // // // // // useAuthStore.getState().initialize();

// // // // // // // This is the single source of truth for auth changes.
// // // // // // supabase.auth.onAuthStateChange((_event, session) => {
// // // // // //   // We compare access tokens to prevent unnecessary re-renders
// // // // // //   if (session?.access_token !== useAuthStore.getState().session?.access_token) {
// // // // // //     useAuthStore.getState().setSession(session);
// // // // // //   }
// // // // // // });
// // // // // import { create } from 'zustand'
// // // // // import { persist } from 'zustand/middleware'
// // // // // import { supabase } from '@/lib/supabase'
// // // // // import type { User, Session } from '@supabase/supabase-js'

// // // // // // Define a more specific type for your user profile
// // // // // type UserProfile = User & { 
// // // // //   role: string;
// // // // //   is_active: boolean;
// // // // //   hospital_id: string;
// // // // //   hospitals: { id: string; name: string }; // Define the shape of the nested hospital object
// // // // // };

// // // // // interface AuthState {
// // // // //   user: UserProfile | null;
// // // // //   session: Session | null;
// // // // //   loading: boolean;
// // // // //   hospitalId: string | null;
// // // // //   isAuthenticated: boolean;
  
// // // // //   initialize: () => void;
// // // // //   setSession: (session: Session | null) => Promise<void>;
// // // // //   signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
// // // // //   signOut: () => Promise<void>;
// // // // // }

// // // // // export const useAuthStore = create<AuthState>()(
// // // // //   persist(
// // // // //     (set, get) => ({
// // // // //       user: null,
// // // // //       session: null,
// // // // //       loading: true, // Start in loading state
// // // // //       hospitalId: null,
// // // // //       isAuthenticated: false,

// // // // //       initialize: () => {
// // // // //         // onAuthStateChange will handle everything, but we can check the initial session
// // // // //         // to speed up the first load.
// // // // //         supabase.auth.getSession().then(({ data: { session } }) => {
// // // // //           get().setSession(session);
// // // // //           set({ loading: false });
// // // // //         });
// // // // //       },

// // // // //       setSession: async (session: Session | null) => {
// // // // //         if (session) {
// // // // //           try {
// // // // //             // This is the corrected, specific query that will not fail
// // // // //             const { data: userProfile, error } = await supabase
// // // // //               .from('users')
// // // // //               .select(`
// // // // //                 id, email, role, is_active, hospital_id,
// // // // //                 hospitals ( id, name )
// // // // //               `)
// // // // //               .eq('id', session.user.id)
// // // // //               .single();

// // // // //             if (error) throw error;
            
// // // // //             if (userProfile) {
// // // // //               set({
// // // // //                 user: userProfile as UserProfile,
// // // // //                 session,
// // // // //                 isAuthenticated: true, // This is the key state update
// // // // //                 hospitalId: userProfile.hospital_id,
// // // // //               });
// // // // //             } else {
// // // // //               throw new Error("User profile not found after login.");
// // // // //             }
// // // // //           } catch (error: any) {
// // // // //             console.error("Error setting session and fetching profile:", error);
// // // // //             // If we can't get the profile, the user is not truly logged in. Sign them out.
// // // // //             await get().signOut();
// // // // //           }
// // // // //         } else {
// // // // //           // If there is no session, clear all user data
// // // // //           set({ user: null, session: null, hospitalId: null, isAuthenticated: false });
// // // // //         }
// // // // //       },

// // // // //       signIn: async (email: string, password: string) => {
// // // // //         const { error } = await supabase.auth.signInWithPassword({ email, password });
// // // // //         if (error) {
// // // // //           return { success: false, error: error.message };
// // // // //         }
// // // // //         // onAuthStateChange will handle setting the session and profile
// // // // //         return { success: true };
// // // // //       },

// // // // //       signOut: async () => {
// // // // //         await supabase.auth.signOut();
// // // // //         // The onAuthStateChange listener will clear the state
// // // // //       },
// // // // //     }),
// // // // //     {
// // // // //       name: 'auth-storage',
// // // // //       // Only persist the session object itself. All other state will be derived from it on load.
// // // // //       partialize: (state) => ({ session: state.session }),
// // // // //     }
// // // // //   )
// // // // // );

// // // // // // Initialize auth state once when the app is loaded
// // // // // useAuthStore.getState().initialize();

// // // // // // This is the single source of truth for auth changes.
// // // // // supabase.auth.onAuthStateChange((_event, session) => {
// // // // //   // We compare access tokens to prevent unnecessary re-renders
// // // // //   if (session?.access_token !== useAuthStore.getState().session?.access_token) {
// // // // //     useAuthStore.getState().setSession(session);
// // // // //   }
// // // // // });



// // // // import { create } from 'zustand'
// // // // import { persist } from 'zustand/middleware'
// // // // import { supabase } from '@/lib/supabase'
// // // // import type { User, Session } from '@supabase/supabase-js'

// // // // // Define a more specific type for your user profile
// // // // type UserProfile = User & { 
// // // //   role: string;
// // // //   is_active: boolean;
// // // //   hospital_id: string;
// // // //   hospitals: { id: string; name: string }; // Define the shape of the nested hospital object
// // // // };

// // // // interface AuthState {
// // // //   user: UserProfile | null;
// // // //   session: Session | null;
// // // //   loading: boolean;
// // // //   hospitalId: string | null;
// // // //   isAuthenticated: boolean;
  
// // // //   initialize: () => void;
// // // //   setSession: (session: Session | null) => Promise<void>;
// // // //   signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
// // // //   signOut: () => Promise<void>;
// // // // }

// // // // export const useAuthStore = create<AuthState>()(
// // // //   persist(
// // // //     (set, get) => ({
// // // //       user: null,
// // // //       session: null,
// // // //       loading: true, // Start in loading state
// // // //       hospitalId: null,
// // // //       isAuthenticated: false,

// // // //       initialize: () => {
// // // //         // onAuthStateChange will handle everything, but we can check the initial session
// // // //         // to speed up the first load.
// // // //         supabase.auth.getSession().then(({ data: { session } }) => {
// // // //           get().setSession(session);
// // // //           set({ loading: false });
// // // //         });
// // // //       },

// // // //       setSession: async (session: Session | null) => {
// // // //         if (session) {
// // // //           try {
// // // //             // This is the corrected, specific query that will not fail
// // // //             const { data: userProfile, error } = await supabase
// // // //               .from('users')
// // // //               .select(`
// // // //                 id, email, role, is_active, hospital_id,
// // // //                 hospitals ( id, name )
// // // //               `)
// // // //               .eq('id', session.user.id)
// // // //               .single();

// // // //             if (error) throw error;
            
// // // //             if (userProfile) {
// // // //               set({
// // // //                 user: userProfile as UserProfile,
// // // //                 session,
// // // //                 isAuthenticated: true, // This is the key state update
// // // //                 hospitalId: userProfile.hospital_id,
// // // //               });
// // // //             } else {
// // // //               throw new Error("User profile not found after login.");
// // // //             }
// // // //           } catch (error: any) {
// // // //             console.error("Error setting session and fetching profile:", error);
// // // //             // If we can't get the profile, the user is not truly logged in. Sign them out.
// // // //             await get().signOut();
// // // //           }
// // // //         } else {
// // // //           // If there is no session, clear all user data
// // // //           set({ user: null, session: null, hospitalId: null, isAuthenticated: false });
// // // //         }
// // // //       },

// // // //       signIn: async (email: string, password: string) => {
// // // //         const { error } = await supabase.auth.signInWithPassword({ email, password });
// // // //         if (error) {
// // // //           return { success: false, error: error.message };
// // // //         }
// // // //         // onAuthStateChange will handle setting the session and profile
// // // //         return { success: true };
// // // //       },

// // // //       signOut: async () => {
// // // //         await supabase.auth.signOut();
// // // //         // The onAuthStateChange listener will clear the state
// // // //       },
// // // //     }),
// // // //     {
// // // //       name: 'auth-storage',
// // // //       // Only persist the session object itself. All other state will be derived from it on load.
// // // //       partialize: (state) => ({ session: state.session }),
// // // //     }
// // // //   )
// // // // );

// // // // // Initialize auth state once when the app is loaded
// // // // useAuthStore.getState().initialize();

// // // // // This is the single source of truth for auth changes.
// // // // supabase.auth.onAuthStateChange((_event, session) => {
// // // //   // We compare access tokens to prevent unnecessary re-renders
// // // //   if (session?.access_token !== useAuthStore.getState().session?.access_token) {
// // // //     useAuthStore.getState().setSession(session);
// // // //   }
// // // // });


// // // import { create } from 'zustand'
// // // import { persist } from 'zustand/middleware'
// // // import { supabase } from '@/lib/supabase'
// // // import type { User, Session } from '@supabase/supabase-js'

// // // // Define a more specific type for your user profile
// // // type UserProfile = User & { 
// // //   role: string;
// // //   is_active: boolean;
// // //   hospital_id: string;
// // //   hospitals: { id: string; name: string }; // Define the shape of the nested hospital object
// // // };

// // // interface AuthState {
// // //   user: UserProfile | null;
// // //   session: Session | null;
// // //   loading: boolean;
// // //   hospitalId: string | null;
// // //   isAuthenticated: boolean;
  
// // //   initialize: () => void;
// // //   setSession: (session: Session | null) => Promise<void>;
// // //   signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
// // //   signOut: () => Promise<void>;
// // // }

// // // export const useAuthStore = create<AuthState>()(
// // //   persist(
// // //     (set, get) => ({
// // //       user: null,
// // //       session: null,
// // //       loading: true, // Start in loading state
// // //       hospitalId: null,
// // //       isAuthenticated: false,

// // //       initialize: () => {
// // //         // onAuthStateChange will handle everything, but we can check the initial session
// // //         // to speed up the first load.
// // //         supabase.auth.getSession().then(({ data: { session } }) => {
// // //           get().setSession(session);
// // //           set({ loading: false });
// // //         });
// // //       },

// // //       setSession: async (session: Session | null) => {
// // //         if (session) {
// // //           try {
// // //             // This is the corrected, specific query that will not fail
// // //             const { data: userProfile, error } = await supabase
// // //               .from('users')
// // //               .select(`
// // //                 id, email, role, is_active, hospital_id,
// // //                 hospitals ( id, name )
// // //               `)
// // //               .eq('id', session.user.id)
// // //               .single();

// // //             if (error) throw error;
            
// // //             if (userProfile) {
// // //               set({
// // //                 user: userProfile as UserProfile,
// // //                 session,
// // //                 isAuthenticated: true, // This is the key state update
// // //                 hospitalId: userProfile.hospital_id,
// // //               });
// // //             } else {
// // //               throw new Error("User profile not found after login.");
// // //             }
// // //           } catch (error: any) {
// // //             console.error("Error setting session and fetching profile:", error);
// // //             // If we can't get the profile, the user is not truly logged in. Sign them out.
// // //             await get().signOut();
// // //           }
// // //         } else {
// // //           // If there is no session, clear all user data
// // //           set({ user: null, session: null, hospitalId: null, isAuthenticated: false });
// // //         }
// // //       },

// // //       signIn: async (email: string, password: string) => {
// // //         const { error } = await supabase.auth.signInWithPassword({ email, password });
// // //         if (error) {
// // //           return { success: false, error: error.message };
// // //         }
// // //         // onAuthStateChange will handle setting the session and profile
// // //         return { success: true };
// // //       },

// // //       signOut: async () => {
// // //         await supabase.auth.signOut();
// // //         // The onAuthStateChange listener will clear the state
// // //       },
// // //     }),
// // //     {
// // //       name: 'auth-storage',
// // //       // Only persist the session object itself. All other state will be derived from it on load.
// // //       partialize: (state) => ({ session: state.session }),
// // //     }
// // //   )
// // // );

// // // // Initialize auth state once when the app is loaded
// // // useAuthStore.getState().initialize();

// // // // This is the single source of truth for auth changes.
// // // supabase.auth.onAuthStateChange((_event, session) => {
// // //   // We compare access tokens to prevent unnecessary re-renders
// // //   if (session?.access_token !== useAuthStore.getState().session?.access_token) {
// // //     useAuthStore.getState().setSession(session);
// // //   }
// // // });
// // import { create } from 'zustand'
// // import { persist } from 'zustand/middleware'
// // import { supabase } from '@/lib/supabase'
// // import type { User, Session } from '@supabase/supabase-js'

// // // Define a more specific type for your user profile
// // type UserProfile = User & { 
// //   role: string;
// //   is_active: boolean;
// //   hospital_id: string;
// //   hospitals: { id: string; name: string }; // Define the shape of the nested hospital object
// // };

// // interface AuthState {
// //   user: UserProfile | null;
// //   session: Session | null;
// //   loading: boolean;
// //   hospitalId: string | null;
// //   isAuthenticated: boolean;
  
// //   initialize: () => void;
// //   setSession: (session: Session | null) => Promise<void>;
// //   signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
// //   signOut: () => Promise<void>;
// // }

// // export const useAuthStore = create<AuthState>()(
// //   persist(
// //     (set, get) => ({
// //       user: null,
// //       session: null,
// //       loading: true, // Start in loading state
// //       hospitalId: null,
// //       isAuthenticated: false,

// //       initialize: () => {
// //         // onAuthStateChange will handle everything, but we can check the initial session
// //         // to speed up the first load.
// //         supabase.auth.getSession().then(({ data: { session } }) => {
// //           get().setSession(session);
// //           set({ loading: false });
// //         });
// //       },

// //       setSession: async (session: Session | null) => {
// //         if (session) {
// //           try {
// //             // This is the corrected, specific query that will not fail
// //             const { data: userProfile, error } = await supabase
// //               .from('users')
// //               .select(`
// //                 id, email, role, is_active, hospital_id,
// //                 hospitals!inner ( id, name )
// //               `)
// //               .eq('id', session.user.id)
// //               .single();

// //             if (error) throw error;
            
// //             if (userProfile) {
// //               set({
// //                 user: userProfile as UserProfile,
// //                 session,
// //                 isAuthenticated: true, // This is the key state update
// //                 hospitalId: userProfile.hospital_id,
// //               });
// //             } else {
// //               throw new Error("User profile not found after login.");
// //             }
// //           } catch (error: any) {
// //             console.error("Error setting session and fetching profile:", error);
// //             // If we can't get the profile, the user is not truly logged in. Sign them out.
// //             await get().signOut();
// //           }
// //         } else {
// //           // If there is no session, clear all user data
// //           set({ user: null, session: null, hospitalId: null, isAuthenticated: false });
// //         }
// //       },

// //       signIn: async (email: string, password: string) => {
// //         const { error } = await supabase.auth.signInWithPassword({ email, password });
// //         if (error) {
// //           return { success: false, error: error.message };
// //         }
// //         // onAuthStateChange will handle setting the session and profile
// //         return { success: true };
// //       },

// //       signOut: async () => {
// //         await supabase.auth.signOut();
// //         // The onAuthStateChange listener will clear the state
// //       },
// //     }),
// //     {
// //       name: 'auth-storage',
// //       // Only persist the session object itself. All other state will be derived from it on load.
// //       partialize: (state) => ({ session: state.session }),
// //     }
// //   )
// // );

// // // Initialize auth state once when the app is loaded
// // useAuthStore.getState().initialize();

// // // This is the single source of truth for auth changes.
// // supabase.auth.onAuthStateChange((_event, session) => {
// //   // We compare access tokens to prevent unnecessary re-renders
// //   if (session?.access_token !== useAuthStore.getState().session?.access_token) {
// //     useAuthStore.getState().setSession(session);
// //   }
// // });


// import { create } from 'zustand'
// import { persist } from 'zustand/middleware'
// import { supabase } from '@/lib/supabase'
// import type { User, Session } from '@supabase/supabase-js'

// // Define a more specific type for your user profile
// type UserProfile = User & { 
//   role: string;
//   is_active: boolean;
//   hospital_id: string;
//   hospitals: { id: string; name: string }; // Define the shape of the nested hospital object
// };

// interface AuthState {
//   user: UserProfile | null;
//   session: Session | null;
//   loading: boolean;
//   hospitalId: string | null;
//   isAuthenticated: boolean;
  
//   initialize: () => void;
//   setSession: (session: Session | null) => Promise<void>;
//   signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
//   signOut: () => Promise<void>;
// }

// export const useAuthStore = create<AuthState>()(
//   persist(
//     (set, get) => ({
//       user: null,
//       session: null,
//       loading: true, // Start in loading state
//       hospitalId: null,
//       isAuthenticated: false,

//       initialize: () => {
//         // onAuthStateChange will handle everything, but we can check the initial session
//         // to speed up the first load.
//         supabase.auth.getSession().then(({ data: { session } }) => {
//           get().setSession(session);
//           set({ loading: false });
//         });
//       },

//       setSession: async (session: Session | null) => {
//         if (session) {
//           try {
//             // This is the corrected, specific query that will not fail
//             const { data: userProfile, error } = await supabase
//               .from('users')
//               .select(`
//                 id, email, role, is_active, hospital_id,
//                 hospitals!inner ( id, name )
//               `)
//               .eq('id', session.user.id)
//               .single();

//             if (error) throw error;
            
//             if (userProfile) {
//               set({
//                 user: userProfile as UserProfile,
//                 session,
//                 isAuthenticated: true, // This is the key state update
//                 hospitalId: userProfile.hospital_id,
//               });
//             } else {
//               throw new Error("User profile not found after login.");
//             }
//           } catch (error: any) {
//             console.error("Error setting session and fetching profile:", error);
//             // If we can't get the profile, the user is not truly logged in. Sign them out.
//             await get().signOut();
//           }
//         } else {
//           // If there is no session, clear all user data
//           set({ user: null, session: null, hospitalId: null, isAuthenticated: false });
//         }
//       },

//       signIn: async (email: string, password: string) => {
//         const { error } = await supabase.auth.signInWithPassword({ email, password });
//         if (error) {
//           return { success: false, error: error.message };
//         }
//         // onAuthStateChange will handle setting the session and profile
//         return { success: true };
//       },

//       signOut: async () => {
//         await supabase.auth.signOut();
//         // The onAuthStateChange listener will clear the state
//       },
//     }),
//     {
//       name: 'auth-storage',
//       // Only persist the session object itself. All other state will be derived from it on load.
//       partialize: (state) => ({ session: state.session }),
//     }
//   )
// );

// // Initialize auth state once when the app is loaded
// useAuthStore.getState().initialize();

// // This is the single source of truth for auth changes.
// supabase.auth.onAuthStateChange((_event, session) => {
//   // We compare access tokens to prevent unnecessary re-renders
//   if (session?.access_token !== useAuthStore.getState().session?.access_token) {
//     useAuthStore.getState().setSession(session);
//   }
// });

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

// Define a more specific type for your user profile
type UserProfile = User & { 
  role: string;
  is_active: boolean;
  hospital_id: string;
  hospitals: { id: string; name: string }; // Define the shape of the nested hospital object
};

interface AuthState {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  hospitalId: string | null;
  isAuthenticated: boolean;
  
  initialize: () => void;
  setSession: (session: Session | null) => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: true, // Start in loading state
      hospitalId: null,
      isAuthenticated: false,

      initialize: () => {
        // onAuthStateChange will handle everything, but we can check the initial session
        // to speed up the first load.
        supabase.auth.getSession().then(({ data: { session } }) => {
          get().setSession(session);
          set({ loading: false });
        });
      },

      setSession: async (session: Session | null) => {
        if (session) {
          try {
            // This is the corrected, specific query that will not fail
            const { data: userProfile, error } = await supabase
              .from('users')
              .select(`
                id, email, role, is_active, hospital_id,
                hospitals ( id, name )
              `)
              .eq('id', session.user.id)
              .single();

            if (error) throw error;
            
            if (userProfile) {
              set({
                user: userProfile as UserProfile,
                session,
                isAuthenticated: true, // This is the key state update
                hospitalId: userProfile.hospital_id,
              });
            } else {
              throw new Error("User profile not found after login.");
            }
          } catch (error: any) {
            console.error("Error setting session and fetching profile:", error);
            // If we can't get the profile, the user is not truly logged in. Sign them out.
            await get().signOut();
          }
        } else {
          // If there is no session, clear all user data
          set({ user: null, session: null, hospitalId: null, isAuthenticated: false });
        }
      },

      signIn: async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          return { success: false, error: error.message };
        }
        // onAuthStateChange will handle setting the session and profile
        return { success: true };
      },

      signOut: async () => {
        await supabase.auth.signOut();
        // The onAuthStateChange listener will clear the state
      },
    }),
    {
      name: 'auth-storage',
      // Only persist the session object itself. All other state will be derived from it on load.
      partialize: (state) => ({ session: state.session }),
    }
  )
);

// Initialize auth state once when the app is loaded
useAuthStore.getState().initialize();

// This is the single source of truth for auth changes.
supabase.auth.onAuthStateChange((_event, session) => {
  // We compare access tokens to prevent unnecessary re-renders
  if (session?.access_token !== useAuthStore.getState().session?.access_token) {
    useAuthStore.getState().setSession(session);
  }
});