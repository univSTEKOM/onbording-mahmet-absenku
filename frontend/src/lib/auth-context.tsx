import { createContext, useContext } from 'react'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
}

const AuthContext = createContext<AuthContextValue>({ user: null })

export const AuthContextProvider = AuthContext.Provider

export function useAuthContext() {
  return useContext(AuthContext)
}
