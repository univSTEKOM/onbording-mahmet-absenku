import { createAuthClient } from "better-auth/react"

let _authClient: ReturnType<typeof createAuthClient> | null = null

export function getAuthClient() {
  if (!_authClient) {
    try {
      _authClient = createAuthClient({
        baseURL: "http://localhost:3001",
        fetchOptions: {
          credentials: "include",
        },
      })
    } catch (e) {
      console.error('[AuthClient] Failed to initialize:', e)
      throw e
    }
  }
  return _authClient
}
