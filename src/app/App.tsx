import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'

// Auth components
import LoginPage from '@/components/auth/LoginPage'
import HospitalRegisterPage from '@/components/auth/HospitalRegisterPage'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

// Layout components
import DashboardLayout from '@/components/layout/DashboardLayout'
import OfflineStatusBar from '@/components/layout/OfflineStatusBar'

// Page components
import DashboardPage from '@/pages/DashboardPage'
import PatientsPage from '@/pages/PatientsPage'
import AppointmentsPage from '@/pages/AppointmentsPage'
import DoctorsPage from '@/pages/DoctorsPage'
import DepartmentsPage from '@/pages/DepartmentsPage'
import BillingPage from '@/pages/BillingPage'
import InventoryPage from '@/pages/InventoryPage'
import ReportsPage from '@/pages/ReportsPage'
import SettingsPage from '@/pages/SettingsPage'
import OfflinePage from '@/pages/settings/OfflinePage'
import CompliancePage from '@/pages/settings/CompliancePage'
import AuditLogsPage from '@/pages/settings/AuditLogsPage'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

function AppContent() {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Aarogya Sahayak HMS...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
          } 
        />
        
        <Route 
          path="/register" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <HospitalRegisterPage />
          } 
        />
        
        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            
            {/* Settings sub-pages */}
            <Route path="/settings/offline" element={<OfflinePage />} />
            <Route path="/settings/compliance" element={<CompliancePage />} />
            <Route path="/settings/audit-logs" element={<AuditLogsPage />} />
          </Route>
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      
      {/* Offline Status Bar */}
      <OfflineStatusBar />
    </>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <AppContent />
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App