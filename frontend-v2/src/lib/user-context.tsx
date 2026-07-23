import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

interface UserContextType {
  profile: Record<string, unknown> | null
  setProfile: React.Dispatch<React.SetStateAction<Record<string, unknown> | null>>
  profileReady: boolean
  setProfileReady: React.Dispatch<React.SetStateAction<boolean>>
}

const UserContext = createContext<UserContextType>({
  profile: null,
  setProfile: () => {},
  profileReady: false,
  setProfileReady: () => {},
})

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null)
  const [profileReady, setProfileReady] = useState(false)

  const value = useMemo(() => ({ profile, setProfile, profileReady, setProfileReady }), [profile, profileReady])

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export function useUserContext() {
  return useContext(UserContext)
}
