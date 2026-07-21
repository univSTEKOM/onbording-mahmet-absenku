import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUpdateUser } from '@/hooks/useUsers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function ProfilPage() {
  const { user } = useAuth()
  const mutation = useUpdateUser()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    nama: user?.nama || '',
    email: user?.email || '',
    jabatan: user?.jabatan || '',
    phone: user?.phone || '',
    alamat: user?.alamat || '',
  })

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    mutation.mutate(
      { id: user.id, data: form },
      {
        onSuccess: () => setEditing(false),
      }
    )
  }

  const initials = user?.nama
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  if (!user) return null

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{user.nama}</CardTitle>
            <p className="text-sm text-muted-foreground">{user.jabatan}</p>
          </div>
        </CardHeader>
        <CardContent>
          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama</Label>
                <Input
                  id="nama"
                  value={form.nama}
                  onChange={(e) =>
                    setForm({ ...form, nama: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jabatan">Jabatan</Label>
                <Input
                  id="jabatan"
                  value={form.jabatan}
                  onChange={(e) =>
                    setForm({ ...form, jabatan: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telepon</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat</Label>
                <Input
                  id="alamat"
                  value={form.alamat}
                  onChange={(e) =>
                    setForm({ ...form, alamat: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditing(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Jabatan</p>
                  <p className="font-medium">{user.jabatan}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Telepon</p>
                  <p className="font-medium">{user.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Role</p>
                  <p className="font-medium capitalize">{user.role}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Alamat</p>
                  <p className="font-medium">{user.alamat || '-'}</p>
                </div>
              </div>
              <Button onClick={() => setEditing(true)} className="w-full">
                Edit Profil
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
