import { useEffect } from 'react'
import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { useAuthContext } from '@/lib/auth-context'
import { areModelsLoaded, loadModels } from '@/lib/faceDetection'

export const Route = createFileRoute('/_authenticated/_karyawan')({
  component: KaryawanGuard,
})

function KaryawanPreload() {
  useEffect(() => {
    if (areModelsLoaded()) return
    loadModels().catch(() => {})
  }, [])

  return null
}

function KaryawanGuard() {
  const { user } = useAuthContext()
  if (!user || user.role !== 'karyawan') return <Navigate to="/admin/dashboard" replace />
  return (
    <>
      <KaryawanPreload />
      <Outlet />
    </>
  )
}

