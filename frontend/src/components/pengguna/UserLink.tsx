import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import type { User } from '@/types'
import type { ReactNode } from 'react'

interface UserLinkProps {
  user: User
  showAvatar?: boolean
  className?: string
  children?: ReactNode
}

export function UserLink({ user, showAvatar = true, className, children }: UserLinkProps) {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  function handleClick() {
    if (isAdmin) navigate({ to: '/admin/profile', state: { user } })
  }

  const initials = user.nama?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <span
      className={`inline-flex items-center gap-2 ${isAdmin ? 'cursor-pointer hover:text-primary transition-colors' : ''} ${className || ''}`}
      onClick={handleClick}
      role={isAdmin ? 'button' : undefined}
      tabIndex={isAdmin ? 0 : undefined}
      onKeyDown={isAdmin ? (e) => { if (e.key === 'Enter') handleClick() } : undefined}
    >
      {showAvatar && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={user.foto && !user.foto.startsWith('[') ? user.foto : undefined} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      )}
      {children || <span className="font-medium truncate">{user.nama}</span>}
    </span>
  )
}

