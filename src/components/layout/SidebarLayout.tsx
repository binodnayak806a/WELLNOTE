import React, { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  UserCheck, 
  Receipt, 
  FileText, 
  Building2, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  Settings, 
  User, 
  Bell, 
  Bed, 
  Stethoscope, 
  Pill, 
  FlaskRound as Flask, 
  Activity, 
  Clipboard, 
  Thermometer, 
  Microscope, 
  Layers, 
  ShieldAlert, 
  Database, 
  HelpCircle,
  QrCode
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  badge?: number
  requiredRole?: string[]
  children?: NavigationItem[]
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard'
  },
  {
    id: 'patients',
    label: 'Patients',
    icon: Users,
    path: '/patients',
    children: [
      {
        id: 'patient-list',
        label: 'Patient List',
        icon: Users,
        path: '/patients'
      },
      {
        id: 'register-patient',
        label: 'Register Patient',
        icon: Clipboard,
        path: '/opd/register'
      },
      {
        id: 'patient-history',
        label: 'Patient History',
        icon: FileText,
        path: '/patients/history'
      }
    ]
  },
  {
    id: 'appointments',
    label: 'Appointments',
    icon: Calendar,
    path: '/appointments',
    badge: 5,
    children: [
      {
        id: 'appointment-list',
        label: 'Appointment List',
        icon: Calendar,
        path: '/appointments'
      },
      {
        id: 'add-appointment',
        label: 'Add Appointment',
        icon: Calendar,
        path: '/appointments/new'
      },
      {
        id: 'appointment-calendar',
        label: 'Calendar View',
        icon: Calendar,
        path: '/appointments/calendar'
      }
    ]
  },
  {
    id: 'doctors',
    label: 'Doctors',
    icon: UserCheck,
    path: '/doctors',
    requiredRole: ['admin', 'hospital_admin'],
    children: [
      {
        id: 'doctor-list',
        label: 'Doctor List',
        icon: UserCheck,
        path: '/doctors'
      },
      {
        id: 'doctor-schedule',
        label: 'Doctor Schedule',
        icon: Calendar,
        path: '/doctors/schedule'
      },
      {
        id: 'doctor-leaves',
        label: 'Leave Management',
        icon: Calendar,
        path: '/doctors/leaves'
      }
    ]
  },
  {
    id: 'departments',
    label: 'Departments',
    icon: Building2,
    path: '/departments',
    requiredRole: ['admin', 'hospital_admin']
  },
  {
    id: 'clinical',
    label: 'Clinical',
    icon: Stethoscope,
    path: '/clinical',
    children: [
      {
        id: 'consultations',
        label: 'Consultations',
        icon: Stethoscope,
        path: '/consultation'
      },
      {
        id: 'prescriptions',
        label: 'Prescriptions',
        icon: Pill,
        path: '/prescriptions'
      },
      {
        id: 'lab-orders',
        label: 'Lab Orders',
        icon: Flask,
        path: '/lab-orders'
      },
      {
        id: 'vitals',
        label: 'Vitals',
        icon: Activity,
        path: '/vitals'
      }
    ]
  },
  {
    id: 'ipd',
    label: 'IPD',
    icon: Bed,
    path: '/ipd',
    children: [
      {
        id: 'bed-board',
        label: 'Bed Board',
        icon: Bed,
        path: '/ipd/bed-board'
      },
      {
        id: 'admission',
        label: 'Admission',
        icon: Clipboard,
        path: '/ipd/admission'
      },
      {
        id: 'ward-management',
        label: 'Ward Management',
        icon: Building2,
        path: '/ipd/wards'
      }
    ]
  },
  {
    id: 'laboratory',
    label: 'Laboratory',
    icon: Microscope,
    path: '/laboratory',
    children: [
      {
        id: 'lab-dashboard',
        label: 'Lab Dashboard',
        icon: Microscope,
        path: '/laboratory'
      },
      {
        id: 'test-order',
        label: 'Test Order',
        icon: Clipboard,
        path: '/laboratory/test-order'
      },
      {
        id: 'sample-collection',
        label: 'Sample Collection',
        icon: Flask,
        path: '/laboratory/sample-collection'
      },
      {
        id: 'results-entry',
        label: 'Results Entry',
        icon: FileText,
        path: '/laboratory/results'
      }
    ]
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: Receipt,
    path: '/billing',
    children: [
      {
        id: 'billing-dashboard',
        label: 'Billing Dashboard',
        icon: Receipt,
        path: '/billing'
      },
      {
        id: 'opd-billing',
        label: 'OPD Billing',
        icon: Receipt,
        path: '/billing/opd'
      },
      {
        id: 'ipd-billing',
        label: 'IPD Billing',
        icon: Receipt,
        path: '/billing/ipd'
      },
      {
        id: 'invoices',
        label: 'Invoices',
        icon: FileText,
        path: '/billing/invoices'
      }
    ]
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Layers,
    path: '/inventory',
    requiredRole: ['admin', 'hospital_admin', 'pharmacist'],
    children: [
      {
        id: 'inventory-dashboard',
        label: 'Inventory Dashboard',
        icon: Layers,
        path: '/inventory'
      },
      {
        id: 'pharmacy',
        label: 'Pharmacy',
        icon: Pill,
        path: '/inventory/pharmacy'
      },
      {
        id: 'stock-management',
        label: 'Stock Management',
        icon: Layers,
        path: '/inventory/stock'
      }
    ]
  },
  {
    id: 'masters',
    label: 'Master Data',
    icon: Database,
    path: '/masters',
    requiredRole: ['admin', 'hospital_admin'],
    children: [
      {
        id: 'rx-master',
        label: 'Rx Master',
        icon: Pill,
        path: '/masters/rx'
      },
      {
        id: 'diagnosis-master',
        label: 'Diagnosis Master',
        icon: Stethoscope,
        path: '/masters/diagnosis'
      },
      {
        id: 'investigation-master',
        label: 'Investigation Master',
        icon: Microscope,
        path: '/masters/investigation'
      },
      {
        id: 'advice-master',
        label: 'Advice Master',
        icon: FileText,
        path: '/masters/advice'
      }
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: FileText,
    path: '/reports',
    children: [
      {
        id: 'clinical-reports',
        label: 'Clinical Reports',
        icon: Clipboard,
        path: '/reports/clinical'
      },
      {
        id: 'financial-reports',
        label: 'Financial Reports',
        icon: Receipt,
        path: '/reports/financial'
      },
      {
        id: 'operational-reports',
        label: 'Operational Reports',
        icon: Activity,
        path: '/reports/operational'
      }
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
    requiredRole: ['admin', 'hospital_admin'],
    children: [
      {
        id: 'general-settings',
        label: 'General Settings',
        icon: Settings,
        path: '/settings'
      },
      {
        id: 'offline-settings',
        label: 'Offline Mode',
        icon: Database,
        path: '/settings/offline'
      },
      {
        id: 'compliance-settings',
        label: 'Compliance',
        icon: ShieldAlert,
        path: '/settings/compliance'
      },
      {
        id: 'abdm-settings',
        label: 'ABDM Integration',
        icon: QrCode,
        path: '/settings/abdm'
      },
      {
        id: 'audit-logs',
        label: 'Audit Logs',
        icon: FileText,
        path: '/settings/audit-logs'
      }
    ]
  }
]

export default function SidebarLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut, hospitalId } = useAuth()

  // Mock hospital data - in real app, fetch from hospital_id
  const hospitalName = "Apollo Medical Center"

  const handleNavigation = (path: string) => {
    navigate(path)
    setIsMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success("Signed Out", {
        description: "You have been successfully signed out."
      })
    } catch (error) {
      toast.error("Sign Out Error", {
        description: "Failed to sign out. Please try again."
      })
    }
  }

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const toggleExpandItem = (itemId: string) => {
    if (expandedItems.includes(itemId)) {
      setExpandedItems(expandedItems.filter(id => id !== itemId))
    } else {
      setExpandedItems([...expandedItems, itemId])
    }
  }

  // Filter navigation items based on user role
  const filteredNavigationItems = navigationItems.filter(item => {
    if (!item.requiredRole) return true
    if (!user) return false
    return item.requiredRole.includes(user.role)
  })

  const getUserInitials = () => {
    if (!user?.full_name) return 'U'
    return user.full_name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const renderNavItem = (item: NavigationItem, isChild = false) => {
    const Icon = item.icon
    const isActive = isActiveRoute(item.path)
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.id)
    
    return (
      <div key={item.id}>
        <button
          onClick={() => hasChildren ? toggleExpandItem(item.id) : handleNavigation(item.path)}
          className={cn(
            "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            "hover:bg-gray-100 dark:hover:bg-gray-700",
            isActive 
              ? "bg-medical-50 text-medical-700 border border-medical-200 dark:bg-medical-900/20 dark:text-medical-300 dark:border-medical-800" 
              : "text-gray-700 dark:text-gray-300",
            isSidebarCollapsed && !isChild && "justify-center",
            isChild && "pl-10"
          )}
        >
          <Icon className={cn(
            "w-5 h-5 flex-shrink-0",
            isActive ? "text-medical-600 dark:text-medical-400" : "text-gray-500 dark:text-gray-400"
          )} />
          
          {(!isSidebarCollapsed || isChild) && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
              {hasChildren && (
                <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              )}
            </>
          )}
        </button>
        
        {hasChildren && isExpanded && !isSidebarCollapsed && (
          <div className="mt-1 ml-2 space-y-1">
            {item.children?.map(child => renderNavItem(child, true))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out",
        "lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        isSidebarCollapsed ? "w-16" : "w-64"
      )}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {!isSidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-medical-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="hidden lg:block">
                <h1 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  Aarogya Sahayak
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">HMS NextGen</p>
              </div>
            </div>
          )}
          
          {/* Mobile Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Desktop Collapse Button */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredNavigationItems.map(item => renderNavItem(item))}
        </nav>

        {/* Sidebar Footer */}
        {!isSidebarCollapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="w-8 h-8 bg-medical-600 rounded-full flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                  {hospitalName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ID: {hospitalId?.slice(0, 8)}...
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isSidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
      )}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Hospital Name - Desktop */}
            <div className="hidden lg:block">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {hospitalName}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Hospital Management System
              </p>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Help Button */}
              <Button variant="ghost" size="icon" onClick={() => navigate('/help')}>
                <HelpCircle className="w-5 h-5" />
              </Button>
              
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs">
                  3
                </Badge>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 px-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.avatar_url || ''} alt={user?.full_name || ''} />
                      <AvatarFallback className="bg-medical-600 text-white text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {user?.role?.replace('_', ' ') || 'User'}
                      </p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}