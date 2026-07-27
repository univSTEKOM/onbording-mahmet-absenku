import { memo, useRef, useState, useEffect } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { RoleBadge } from '@/components/shared/RoleBadge'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Pencil, Trash2, Briefcase, CalendarDays } from 'lucide-react'
import type { User } from '@/types'

interface KaryawanUserCardProps {
  user: User
  currentUserId: string
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  onClick: (user: User) => void
}

const KaryawanUserCard = memo(function KaryawanUserCard(p: KaryawanUserCardProps) {
  const u = p.user
  const nameRef = useRef<HTMLParagraphElement>(null)
  const [isOverflow, setIsOverflow] = useState(false)

  useEffect(function() {
    const el = nameRef.current
    if (el) setIsOverflow(el.scrollWidth > el.clientWidth)
  }, [u.nama])

  const initials = (u.nama || '?').charAt(0).toUpperCase()
  const joinedDate = u.createdAt
    ? new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : '-'

  return (
    <div
      className="group flex flex-col lg:flex-row rounded-xl border border-border hover:border-primary/30 transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
      onClick={function() { p.onClick(u) }}
    >
      <div className="flex flex-1 min-w-0 rounded-t-xl lg:rounded-l-xl lg:rounded-tr-none bg-card">
        <div className="flex items-start gap-2.5 p-3.5 flex-1 min-w-0">
          <Avatar className="h-9 w-9 ring-2 ring-border/50 shrink-0">
            <AvatarImage src={u.foto || undefined} />
            <AvatarFallback className={u.role === 'admin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 text-xs' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400 text-xs'}>
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 self-center">
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1 overflow-hidden">
                <p
                  ref={nameRef}
                  className={'text-sm font-semibold whitespace-nowrap ' + (isOverflow ? 'marquee' : 'truncate')}
                  title={u.nama}
                >
                  {u.nama || '-'}
                </p>
              </div>
              <RoleBadge role={u.role} />
            </div>
            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-0.5 text-[11px] text-muted-foreground">
              {u.jabatan && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3 shrink-0" />
                  {u.jabatan}
                </span>
              )}
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3 shrink-0" />
                {joinedDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-col rounded-r-xl overflow-hidden border-l border-border/40 w-16">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Edit"
              className="flex-1 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white transition-colors min-h-[56px]"
              onClick={function(e) { e.stopPropagation(); p.onEdit(u) }}
            >
              <Pencil className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom"><p>Edit pengguna</p></TooltipContent>
        </Tooltip>
        {u.id !== p.currentUserId && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Hapus"
                className="flex-1 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white transition-colors border-t border-white/20 min-h-[56px]"
                onClick={function(e) { e.stopPropagation(); p.onDelete(u) }}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><p>Hapus pengguna</p></TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="flex lg:hidden rounded-b-xl overflow-hidden border-t border-border/40">
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-sm font-medium transition-colors min-h-[44px]"
          onClick={function(e) { e.stopPropagation(); p.onEdit(u) }}
        >
          <Pencil className="h-4 w-4" /> Edit
        </button>
        {u.id !== p.currentUserId && (
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 text-sm font-medium transition-colors border-l border-white/20 min-h-[44px]"
            onClick={function(e) { e.stopPropagation(); p.onDelete(u) }}
          >
            <Trash2 className="h-4 w-4" /> Hapus
          </button>
        )}
      </div>
    </div>
  )
})

export { KaryawanUserCard }
export type { KaryawanUserCardProps }
