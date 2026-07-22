import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { ThemeProvider } from '@/components/theme-provider'
import { UserProvider } from '@/lib/user-context'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useAuth } from '@/hooks/useAuth'
import WelcomePage from '@/pages/WelcomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import HrdDashboardPage from '@/pages/HrdDashboardPage'
import AbsensiPage from '@/pages/AbsensiPage'
import RiwayatPage from '@/pages/RiwayatPage'
import PengajuanListPage from '@/pages/PengajuanListPage'
import PengajuanFormPage from '@/pages/PengajuanFormPage'
import ProfilPage from '@/pages/ProfilPage'
import StatusAkunPage from '@/pages/StatusAkunPage'
import HrdRiwayatPage from '@/pages/HrdRiwayatPage'
import HrdKaryawanPage from '@/pages/HrdKaryawanPage'
import HrdPengajuanPage from '@/pages/HrdPengajuanPage'
import HrdVerifikasiPage from '@/pages/HrdVerifikasiPage'
import MainLayout from '@/components/layout/MainLayout'
import AuthLayout from '@/components/layout/AuthLayout'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AdminRoute from '@/components/layout/AdminRoute'
import KaryawanRoute from '@/components/layout/KaryawanRoute'

function RoleDashboard() {
  const { user } = useAuth()
  if (user?.role === 'admin') return <HrdDashboardPage />
  return <DashboardPage />
}

function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  if (user.status === 'pending' || user.status === 'rejected') return <Navigate to="/status" replace />
  if (user.role === 'admin') return <Navigate to="/hrd/dashboard" replace />
  return <Navigate to="/dashboard" replace />
}

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <UserProvider>
      <TooltipProvider>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<RoleDashboard />} />
                <Route path="/status" element={<StatusAkunPage />} />
                <Route path="/absensi" element={<KaryawanRoute><AbsensiPage /></KaryawanRoute>} />
                <Route path="/absensi/riwayat" element={<KaryawanRoute><RiwayatPage /></KaryawanRoute>} />
                <Route path="/pengajuan" element={<KaryawanRoute><PengajuanListPage /></KaryawanRoute>} />
                <Route path="/pengajuan/baru" element={<KaryawanRoute><PengajuanFormPage /></KaryawanRoute>} />
                <Route path="/profil" element={<ProfilPage />} />
                <Route element={<AdminRoute />}>
                  <Route path="/hrd/dashboard" element={<HrdDashboardPage />} />
                  <Route path="/hrd/verifikasi" element={<HrdVerifikasiPage />} />
                  <Route path="/hrd/riwayat" element={<HrdRiwayatPage />} />
                  <Route path="/hrd/pengajuan" element={<HrdPengajuanPage />} />
                  <Route path="/hrd/karyawan" element={<HrdKaryawanPage />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<RoleRedirect />} />
          </Routes>
          <Toaster position="top-right" richColors />
        </ErrorBoundary>
      </TooltipProvider>
      </UserProvider>
    </ThemeProvider>
  )
}

export default App
