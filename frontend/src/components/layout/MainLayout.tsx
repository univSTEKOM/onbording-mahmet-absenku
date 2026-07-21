import { Outlet } from 'react-router-dom'
import { Sheet } from '@/components/ui/sheet'
import { Navbar } from './Navbar'
import { DesktopSidebar, MobileSidebar } from './Sidebar'

export default function MainLayout() {
  return (
    <Sheet>
      <div className="flex min-h-svh">
        <DesktopSidebar />
        <div className="flex flex-1 flex-col">
          <Navbar />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
      <MobileSidebar />
    </Sheet>
  )
}
