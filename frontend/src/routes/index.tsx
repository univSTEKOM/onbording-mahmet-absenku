import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import ProtectedRoute from './layouts/ProtectedRoute'
import AdminRoute from './guards/AdminRoute'
import KaryawanRoute from './guards/KaryawanRoute'
import MainLayout from '@/components/layout/MainLayout'
import RoleDashboard from '@/components/shared/RoleDashboard'
import RoleRedirect from '@/components/shared/RoleRedirect'

function lazyPage(path: string) {
  return () => import(`../pages/${path}.tsx`).then(m => ({ Component: m.default }))
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      /* Public */
      { index: true, lazy: lazyPage('WelcomePage') },
      { path: 'login', lazy: lazyPage('LoginPage') },
      { path: 'register', lazy: lazyPage('RegisterPage') },

      /* Protected — butuh login */
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <MainLayout />,
            children: [
              { path: 'dashboard', element: <RoleDashboard /> },
              { path: 'status', lazy: lazyPage('StatusAkunPage') },

              /* Karyawan only */
              {
                element: <KaryawanRoute />,
                children: [
                  { path: 'absensi', lazy: lazyPage('AbsensiPage') },
                  { path: 'absensi/riwayat', lazy: lazyPage('RiwayatPage') },
                  { path: 'pengajuan', lazy: lazyPage('PengajuanListPage') },
                  { path: 'pengajuan/baru', lazy: lazyPage('PengajuanFormPage') },
                ],
              },

              /* Shared */
              { path: 'profil', lazy: lazyPage('ProfilPage') },

              /* Admin only */
              {
                element: <AdminRoute />,
                children: [
                  { path: 'hrd/dashboard', lazy: lazyPage('HrdDashboardPage') },
                  { path: 'hrd/riwayat', lazy: lazyPage('HrdRiwayatPage') },
                  { path: 'hrd/pengajuan', lazy: lazyPage('HrdPengajuanPage') },
                  { path: 'hrd/karyawan', lazy: lazyPage('HrdKaryawanPage') },
                  { path: 'hrd/verifikasi', lazy: lazyPage('HrdVerifikasiPage') },
                ],
              },
            ],
          },
        ],
      },

      /* Catch-all */
      { path: '*', element: <RoleRedirect /> },
    ],
  },
])
