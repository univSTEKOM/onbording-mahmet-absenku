import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useUsers } from '@/hooks/useUsers'
import { MAX_NAMA_LENGTH, MAX_EMAIL_LENGTH, MAX_JABATAN_LENGTH, MAX_PHONE_DIGITS, MIN_PHONE_DIGITS, MAX_ALAMAT_LENGTH } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhoneInput } from '@/components/ui/phone-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { LoadingState } from '@/components/shared/LoadingState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Search, PlusCircle, Pencil, Trash2, RefreshCw } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import api from '@/api/axios'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage } from '@/lib/utils'
import type { User } from '@/types'

export default function AdminKaryawanPage() {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const { data: users, isLoading, refetch, isFetching } = useUsers()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<User | null>(null)
  const [form, setForm] = useState<Partial<User>>({ nama: '', email: '', jabatan: '', role: 'karyawan' as const, phone: '', alamat: '' })
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)

  const filtered = users?.filter(
    (u) =>
      (u.nama || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.jabatan || '').toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  function openCreate() {
    setEditTarget(null)
    setForm({ nama: '', email: '', jabatan: '', role: 'karyawan', phone: '', alamat: '' })
    setFormError('')
    setFieldErrors({})
    setModalOpen(true)
  }

  function openEdit(user: User) {
    setEditTarget(user)
    setForm({ nama: user.nama, email: user.email, jabatan: user.jabatan, role: user.role, phone: user.phone || '', alamat: user.alamat || '' })
    setFormError('')
    setFieldErrors({})
    setModalOpen(true)
  }

  async function handleSave() {
    setFormError('')
    const errs: Record<string, string> = {}
    if (!form.nama?.trim()) errs.nama = 'Nama harus diisi'
    else if (form.nama.length > MAX_NAMA_LENGTH) errs.nama = `Maksimal ${MAX_NAMA_LENGTH} karakter`
    if (!form.email?.trim()) errs.email = 'Email harus diisi'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Format email tidak valid'
    if (!form.jabatan?.trim()) errs.jabatan = 'Jabatan harus diisi'
    else if (form.jabatan.length > MAX_JABATAN_LENGTH) errs.jabatan = `Maksimal ${MAX_JABATAN_LENGTH} karakter`
    if (form.phone) {
      const digits = form.phone.replace(/\D/g, '')
      if (digits.length < MIN_PHONE_DIGITS) errs.phone = `Minimal ${MIN_PHONE_DIGITS} angka`
      else if (digits.length > MAX_PHONE_DIGITS) errs.phone = `Maksimal ${MAX_PHONE_DIGITS} angka`
    }
    if (form.alamat && form.alamat.length > MAX_ALAMAT_LENGTH) errs.alamat = `Maksimal ${MAX_ALAMAT_LENGTH} karakter`
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return }

    setSaving(true)
    try {
      if (editTarget) {
        await api.patch(`/api/users/${editTarget.id}`, form as Partial<User>)
        toast.success('Karyawan berhasil diupdate')
      } else {
        await api.post('/api/register', { ...form, password: 'password', name: form.nama, role: form.role })
        toast.success('Karyawan berhasil ditambahkan (password: password)')
      }
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setModalOpen(false)
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, 'Gagal menyimpan')
      setFormError(msg)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await api.delete(`/api/users/${deleteTarget.id}`)
      toast.success('Karyawan berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    } catch {
      toast.error('Gagal menghapus karyawan')
    }
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kelola Karyawan</h1>
          <p className="text-muted-foreground">{filtered?.length || 0} karyawan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button className="gap-2" onClick={openCreate}>
            <PlusCircle className="h-4 w-4" /> Tambah Karyawan
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cari karyawan..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <LoadingState />
      ) : filtered?.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Jabatan</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id} className={currentUser?.role === 'admin' ? 'cursor-pointer' : ''} onClick={() => { if (currentUser?.role === 'admin') navigate({ to: '/admin/profile', state: { user: u } }) }}>
                <TableCell>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={u.foto && !u.foto.startsWith('[') ? u.foto : undefined} />
                    <AvatarFallback className="text-xs">{u.nama?.charAt(0)?.toUpperCase() || '?'}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium hover:text-primary transition-colors">{u.nama || '-'}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.jabatan || '-'}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={u.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(u) }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {u.id !== currentUser?.id && (
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteTarget(u) }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {search ? 'Karyawan tidak ditemukan' : 'Belum ada data karyawan'}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Karyawan' : 'Tambah Karyawan'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input value={form.nama} maxLength={MAX_NAMA_LENGTH} onChange={(e) => { setForm({ ...form, nama: e.target.value }); setFieldErrors((p) => ({ ...p, nama: '' })) }}
                className={fieldErrors.nama ? 'border-destructive' : ''} />
              {fieldErrors.nama && <p className="text-xs text-destructive">{fieldErrors.nama}</p>}
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} maxLength={MAX_EMAIL_LENGTH} onChange={(e) => { setForm({ ...form, email: e.target.value }); setFieldErrors((p) => ({ ...p, email: '' })) }}
                disabled={!!editTarget} className={fieldErrors.email ? 'border-destructive' : ''} />
              {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
            </div>
            {!editTarget && <p className="text-xs text-muted-foreground">Password default: <code>password</code></p>}
            <div className="space-y-2">
              <Label>Jabatan</Label>
              <Input value={form.jabatan} maxLength={MAX_JABATAN_LENGTH} onChange={(e) => { setForm({ ...form, jabatan: e.target.value }); setFieldErrors((p) => ({ ...p, jabatan: '' })) }}
                className={fieldErrors.jabatan ? 'border-destructive' : ''} />
              {fieldErrors.jabatan && <p className="text-xs text-destructive">{fieldErrors.jabatan}</p>}
            </div>
            <div className="space-y-2">
              <Label>Telepon</Label>
              <PhoneInput value={form.phone || ''} onChange={(v) => { setForm({ ...form, phone: v }); setFieldErrors((p) => ({ ...p, phone: '' })) }} error={fieldErrors.phone} />
              {fieldErrors.phone && <p className="text-xs text-destructive">{fieldErrors.phone}</p>}
            </div>
            <div className="space-y-2">
              <Label>Alamat</Label>
              <textarea className={`flex min-h-[60px] w-full rounded-lg border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${fieldErrors.alamat ? 'border-destructive' : 'border-input'}`}
                value={form.alamat || ''} maxLength={MAX_ALAMAT_LENGTH} onChange={(e) => { setForm({ ...form, alamat: e.target.value }); setFieldErrors((p) => ({ ...p, alamat: '' })) }} />
              {fieldErrors.alamat && <p className="text-xs text-destructive">{fieldErrors.alamat}</p>}
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: (v || 'karyawan') as 'admin' | 'karyawan' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="karyawan">Karyawan</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>
              {editTarget ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}
        title="Hapus Karyawan"
        actions={[{ label: 'Hapus', onClick: handleDelete, variant: 'destructive' }]}
      >
        <p className="text-sm">Yakin ingin menghapus <strong>{deleteTarget?.nama}</strong>? Data absensi terkait juga akan terhapus.</p>
      </ConfirmDialog>
    </div>
  )
}

