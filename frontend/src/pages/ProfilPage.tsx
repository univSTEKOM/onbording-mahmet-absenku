import { useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUpdateUser } from '@/hooks/useUsers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Loader2 } from 'lucide-react'

export default function ProfilPage() {
  const { user, updateUser } = useAuth()
  const mutation = useUpdateUser()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    nama: user?.nama || '',
    email: user?.email || '',
    jabatan: user?.jabatan || '',
    phone: user?.phone || '',
    alamat: user?.alamat || '',
  })
  const [fotoPreview, setFotoPreview] = useState(user?.foto || '')
  const [fotoFile, setFotoFile] = useState<string | null>(null)

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.nama.trim()) errs.nama = 'Nama harus diisi'
    if (!form.email.trim()) errs.email = 'Email harus diisi'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Format email tidak valid'
    if (!form.jabatan.trim()) errs.jabatan = 'Jabatan harus diisi'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, foto: 'File harus berupa gambar' }))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setFotoPreview(dataUrl)
      setFotoFile(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!validate() || !user) return

    const data: Record<string, string> = { ...form }
    if (fotoFile) data.foto = fotoFile

    mutation.mutate(
      { id: user.id, data },
      {
        onSuccess: () => {
          updateUser(data)
          setEditing(false)
          setErrors({})
        },
      }
    )
  }

  function handleCancel() {
    setEditing(false)
    setErrors({})
    setForm({
      nama: user?.nama || '',
      email: user?.email || '',
      jabatan: user?.jabatan || '',
      phone: user?.phone || '',
      alamat: user?.alamat || '',
    })
    setFotoPreview(user?.foto || '')
    setFotoFile(null)
  }

  const initials = user?.nama
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  if (!user) return null

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={fotoPreview || undefined} />
              <AvatarFallback className="text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            {editing && (
              <button
                type="button"
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground shadow"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFotoChange}
            />
          </div>
          <div>
            <CardTitle className="text-xl">{user.nama}</CardTitle>
            <p className="text-sm text-muted-foreground">{user.jabatan}</p>
          </div>
        </CardHeader>
        <CardContent>
          {errors.foto && (
            <p className="text-sm text-destructive mb-4">{errors.foto}</p>
          )}

          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama">
                  Nama <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nama"
                  value={form.nama}
                  onChange={(e) =>
                    setForm({ ...form, nama: e.target.value })
                  }
                  className={errors.nama ? 'border-destructive' : ''}
                />
                {errors.nama && (
                  <p className="text-xs text-destructive">{errors.nama}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
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
                <Label htmlFor="jabatan">
                  Jabatan <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="jabatan"
                  value={form.jabatan}
                  onChange={(e) =>
                    setForm({ ...form, jabatan: e.target.value })
                  }
                  className={errors.jabatan ? 'border-destructive' : ''}
                />
                {errors.jabatan && (
                  <p className="text-xs text-destructive">
                    {errors.jabatan}
                  </p>
                )}
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
                <textarea
                  id="alamat"
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
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
                  onClick={handleCancel}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan'
                  )}
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
