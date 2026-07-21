import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import HrdDashboardPage from '@/pages/HrdDashboardPage'
import AbsensiPage from '@/pages/AbsensiPage'
import RiwayatPage from '@/pages/RiwayatPage'
import PengajuanListPage from '@/pages/PengajuanListPage'
import PengajuanFormPage from '@/pages/PengajuanFormPage'
import ProfilPage from '@/pages/ProfilPage'
import HrdRiwayatPage from '@/pages/HrdRiwayatPage'
import HrdKaryawanPage from '@/pages/HrdKaryawanPage'
import HrdPengajuanPage from '@/pages/HrdPengajuanPage'
import MainLayout from '@/components/layout/MainLayout'
import AuthLayout from '@/components/layout/AuthLayout'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AdminRoute from '@/components/layout/AdminRoute'

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <TooltipProvider>
          <ErrorBoundary>
            <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/absensi" element={<AbsensiPage />} />
              <Route path="/absensi/riwayat" element={<RiwayatPage />} />
              <Route path="/pengajuan" element={<PengajuanListPage />} />
              <Route path="/pengajuan/baru" element={<PengajuanFormPage />} />
              <Route path="/profil" element={<ProfilPage />} />
              <Route element={<AdminRoute />}>
                <Route path="/hrd/dashboard" element={<HrdDashboardPage />} />
                <Route path="/hrd/riwayat" element={<HrdRiwayatPage />} />
                <Route path="/hrd/pengajuan" element={<HrdPengajuanPage />} />
                <Route path="/hrd/karyawan" element={<HrdKaryawanPage />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster position="top-right" richColors />
          </ErrorBoundary>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
