import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function MainLayout() {
  return (
    <div className="flex min-h-svh">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto bg-background">
        <Outlet />
      </main>
    </div>
  )
}
