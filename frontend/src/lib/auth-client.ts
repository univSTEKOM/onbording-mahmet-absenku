import { createAuthClient } from "better-auth/react"

let _authClient: ReturnType<typeof createAuthClient> | null = null
let _stubClient: ReturnType<typeof createAuthClient> | null = null

function getStubClient() {
  if (!_stubClient) {
    _stubClient = {
      useSession: () => ({
        data: null,
        isPending: false,
        error: null,
        refetch: () => Promise.resolve({ data: null, error: null }),
      }),
      signIn: {
        email: () => Promise.resolve({
          data: null,
          error: { message: 'Gagal terhubung ke server. Periksa koneksi Anda.' },
        }),
      },
      signOut: () => Promise.resolve({ data: null, error: null }),
    } as unknown as ReturnType<typeof createAuthClient>
  }
  return _stubClient
}

try {
  _authClient = createAuthClient({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
    fetchOptions: {
      credentials: "include",
    },
  })
} catch {
  // silent fallback to stub client
}

export function getAuthClient() {
  return _authClient ?? getStubClient()
}
