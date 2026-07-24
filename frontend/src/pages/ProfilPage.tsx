import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { User } from '@/types'
import { MAX_NAMA_LENGTH, MAX_JABATAN_LENGTH, MAX_ALAMAT_LENGTH, MAX_FOTO_SIZE_MB } from '@/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PhoneInput } from '@/components/ui/phone-input'
import { toast } from 'sonner'
import { Camera, Loader2, Save, Pencil } from 'lucide-react'
import { ImageCropperDialog } from '@/components/shared/ImageCropperDialog'

export default function ProfilPage() {
  const { user, updateUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nama: user?.nama || '', email: user?.email || '', jabatan: user?.jabatan || '', phone: user?.phone || '', alamat: user?.alamat || '' })
  const [fotoPreview, setFotoPreview] = useState(user?.foto || '')
  const [photoChanged, setPhotoChanged] = useState(false)
  const [cropSource, setCropSource] = useState<string | null>(null)

  useEffect(() => {
    if (!editing) return
    setForm({ nama: user?.nama || '', email: user?.email || '', jabatan: user?.jabatan || '', phone: user?.phone || '', alamat: user?.alamat || '' })
    setFotoPreview(user?.foto || '')
    setPhotoChanged(false)
  }, [editing, user?.nama, user?.email, user?.jabatan, user?.phone, user?.alamat, user?.foto])

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.nama.trim()) errs.nama = 'Nama harus diisi'
    else if (form.nama.length > MAX_NAMA_LENGTH) errs.nama = `Maksimal ${MAX_NAMA_LENGTH} karakter`
    if (!form.jabatan.trim()) errs.jabatan = 'Jabatan harus diisi'
    else if (form.jabatan.length > MAX_JABATAN_LENGTH) errs.jabatan = `Maksimal ${MAX_JABATAN_LENGTH} karakter`
    if (form.phone) {
      const digitsOnly = form.phone.replace(/\D/g, '')
      if (digitsOnly.length < 10) errs.phone = 'Minimal 10 angka'
      else if (digitsOnly.length > 15) errs.phone = 'Maksimal 15 angka'
    }
    if (form.alamat && form.alamat.length > MAX_ALAMAT_LENGTH) errs.alamat = `Maksimal ${MAX_ALAMAT_LENGTH} karakter`
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const errs: Record<string, string> = {}
    if (!file.type.startsWith('image/')) errs.foto = 'File harus gambar'
    else if (file.size > MAX_FOTO_SIZE_MB * 1024 * 1024) errs.foto = `Maksimal ${MAX_FOTO_SIZE_MB}MB`
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    const reader = new FileReader()
    reader.onload = () => { setCropSource(reader.result as string) }
    reader.readAsDataURL(file)
    setErrors({})
    e.target.value = ''
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!validate() || !user) return
    const data: Partial<User> = { ...form }
    if (photoChanged && fotoPreview) { data.foto = fotoPreview }
    setSaving(true)
    try {
      await updateUser(data)
      setEditing(false)
      setErrors({})
    } catch {
      toast.error('Gagal menyimpan profil')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setEditing(false); setErrors({})
    setForm({ nama: user?.nama || '', email: user?.email || '', jabatan: user?.jabatan || '', phone: user?.phone || '', alamat: user?.alamat || '' })
    setFotoPreview(user?.foto || '')
    setPhotoChanged(false)
    setCropSource(null)
  }

  const initials = user?.nama?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  if (!user) return null

  function handleCropComplete(croppedDataUrl: string) {
    setFotoPreview(croppedDataUrl)
    setPhotoChanged(true)
    setCropSource(null)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil</h1>
        <p className="text-muted-foreground">Kelola data diri Anda</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-2 ring-border">
                <AvatarImage src={fotoPreview || undefined} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              {editing && (
                <button type="button" className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground shadow-sm"
                  onClick={() => fileInputRef.current?.click()}>
                  <Camera className="h-3.5 w-3.5" />
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold">{user.nama}</h2>
              <p className="text-sm text-muted-foreground">{user.jabatan}</p>
              <p className="text-xs text-muted-foreground capitalize mt-0.5">{user.role}</p>
            </div>
          </div>

          <Separator className="mb-6" />

          {errors.foto && <p className="text-xs text-destructive mb-4">{errors.foto}</p>}

          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama</Label>
                  <Input value={form.nama} maxLength={MAX_NAMA_LENGTH} onChange={(e) => setForm({ ...form, nama: e.target.value })} className={errors.nama ? 'border-destructive' : ''} />
                  {errors.nama && <p className="text-xs text-destructive">{errors.nama}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={form.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Jabatan</Label>
                  <Input value={form.jabatan} maxLength={MAX_JABATAN_LENGTH} onChange={(e) => setForm({ ...form, jabatan: e.target.value })} className={errors.jabatan ? 'border-destructive' : ''} />
                  {errors.jabatan && <p className="text-xs text-destructive">{errors.jabatan}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Telepon</Label>
                  <PhoneInput
                    value={form.phone}
                    onChange={(v) => { setForm({ ...form, phone: v }); setErrors((p) => ({ ...p, phone: '' })) }}
                    error={errors.phone}
                  />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Alamat</Label>
                <textarea className={`flex min-h-[60px] w-full rounded-lg border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${errors.alamat ? 'border-destructive' : 'border-input'}`}
                  value={form.alamat} maxLength={MAX_ALAMAT_LENGTH} onChange={(e) => { setForm({ ...form, alamat: e.target.value }); setErrors((p) => ({ ...p, alamat: '' })) }} />
                {errors.alamat && <p className="text-xs text-destructive">{errors.alamat}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={handleCancel}>Batal</Button>
                <Button type="submit" className="flex-1 gap-2" disabled={saving}>
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</> : <><Save className="h-4 w-4" /> Simpan</>}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {[
                  { label: 'Email', value: user.email },
                  { label: 'Jabatan', value: user.jabatan },
                  { label: 'Telepon', value: user.phone || '-' },
                  { label: 'Role', value: user.role },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-muted-foreground text-xs">{item.label}</p>
                    <p className="font-medium mt-0.5">{item.value}</p>
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <p className="text-muted-foreground text-xs">Alamat</p>
                  <p className="font-medium mt-0.5">{user.alamat || '-'}</p>
                </div>
              </div>
              <Button onClick={() => setEditing(true)} className="w-full gap-2">
                <Pencil className="h-4 w-4" /> Edit Profil
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ImageCropperDialog
        open={!!cropSource}
        imageSrc={cropSource || ''}
        onCropComplete={handleCropComplete}
        onCancel={() => setCropSource(null)}
      />
    </div>
  )
}
