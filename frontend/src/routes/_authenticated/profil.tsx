import { createFileRoute } from '@tanstack/react-router'
import ProfilPage from '@/pages/ProfilPage'

export const Route = createFileRoute('/_authenticated/profil')({
  component: ProfilPage,
})
