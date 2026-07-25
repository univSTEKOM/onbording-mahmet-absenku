import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useUsers } from '@/hooks/useUsers'
import { MAX_NAMA_LENGTH, MAX_EMAIL_LENGTH, MAX_JABATAN_LENGTH, MAX_PHONE_DIGITS, MIN_PHONE_DIGITS, MAX_ALAMAT_LENGTH } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PhoneInput } from '@/components/ui/phone-input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { RoleBadge } from '@/components/shared/RoleBadge'
import { Search, PlusCircle, Pencil, Trash2, RefreshCw, Users } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import api from '@/api/axios'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import type { User } from '@/types'

export default function AdminKaryawanPageV1() {
  var navigate = useNavigate()
  var { user: currentUser } = useAuth()
  var { data: users, isLoading, refetch, isFetching } = useUsers()
  var queryClient = useQueryClient()
  var [search, setSearch] = useState('')
  var [saving, setSaving] = useState(false)

  var [modalOpen, setModalOpen] = useState(false)
  var [editTarget, setEditTarget] = useState<User | null>(null)
  var [form, setForm] = useState<Partial<User>>({ nama: '', email: '', jabatan: '', role: 'karyawan' as const, phone: '', alamat: '' })
  var [formError, setFormError] = useState('')
  var [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  var [deleteTarget, setDeleteTarget] = useState<User | null>(null)

  var filtered = users?.filter(
    function(u) {
      return (u.nama || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.jabatan || '').toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    }
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
    var errs: Record<string, string> = {}
    if (!form.nama?.trim()) errs.nama = 'Nama harus diisi'
    else if (form.nama.length > MAX_NAMA_LENGTH) errs.nama = 'Maksimal ' + MAX_NAMA_LENGTH + ' karakter'
    if (!form.email?.trim()) errs.email = 'Email harus diisi'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Format email tidak valid'
    if (!form.jabatan?.trim()) errs.jabatan = 'Jabatan harus diisi'
    else if (form.jabatan.length > MAX_JABATAN_LENGTH) errs.jabatan = 'Maksimal ' + MAX_JABATAN_LENGTH + ' karakter'
    if (form.phone) {
      var digits = form.phone.replace(/\D/g, '')
      if (digits.length < MIN_PHONE_DIGITS) errs.phone = 'Minimal ' + MIN_PHONE_DIGITS + ' angka'
      else if (digits.length > MAX_PHONE_DIGITS) errs.phone = 'Maksimal ' + MAX_PHONE_DIGITS + ' angka'
    }
    if (form.alamat && form.alamat.length > MAX_ALAMAT_LENGTH) errs.alamat = 'Maksimal ' + MAX_ALAMAT_LENGTH + ' karakter'
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return }

    setSaving(true)
    try {
      if (editTarget) {
        await api.patch('/api/users/' + editTarget.id, form as Partial<User>)
        toast.success('Karyawan berhasil diupdate')
      } else {
        var generatedPassword = Math.random().toString(36).slice(2, 14)
        await api.post('/api/register', { ...form, password: generatedPassword, name: form.nama, role: form.role })
        toast.success('Karyawan berhasil ditambahkan')
      }
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setModalOpen(false)
    } catch (err: unknown) {
      var msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan'
      setFormError(msg)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await api.delete('/api/users/' + deleteTarget.id)
      toast.success('Karyawan berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    } catch {
      toast.error('Gagal menghapus karyawan')
    }
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Kelola Karyawan</h1>
          <p className="text-xs md:text-sm text-muted-foreground">{filtered?.length || 0} karyawan</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="icon" onClick={function() { refetch() }} disabled={isFetching}>
            <RefreshCw className={'h-4 w-4 ' + (isFetching ? 'animate-spin' : '')} />
          </Button>
          <Button className="gap-2" onClick={openCreate}>
            <PlusCircle className="h-4 w-4" /> Tambah
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input placeholder="Cari karyawan..." className="pl-9 h-9" value={search} onChange={function(e) { setSearch(e.target.value) }} />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }, function(_, i) { return { id: 'kr-sk-' + i } }).map(function(item) {
            return <Skeleton key={item.id} className="h-12 w-full rounded-lg" />
          })}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="overflow-x-auto -mx-4 md:-mx-6">
          <div className="min-w-[600px] px-4 md:px-6">
            <div className="rounded-lg border">
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
                  {filtered.map(function(u) {
                    return (
                      <TableRow
                        key={u.id}
                        className="hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={function() { navigate({ to: '/admin/profile', state: { user: u } }) }}
                      >
                        <TableCell>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={u.foto || undefined} />
                            <AvatarFallback className="text-xs">{u.nama?.charAt(0)?.toUpperCase() || '?'}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium hover:text-primary transition-colors">{u.nama || '-'}</TableCell>
                        <TableCell className="text-sm">{u.email}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{u.jabatan || '-'}</TableCell>
                        <TableCell>
                          <RoleBadge role={u.role} />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon-sm" onClick={function(e) { e.stopPropagation(); openEdit(u) }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {u.id !== currentUser?.id && (
                              <Button variant="ghost" size="icon-sm" onClick={function(e) { e.stopPropagation(); setDeleteTarget(u) }}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState message={search ? 'Karyawan tidak ditemukan' : 'Belum ada data karyawan'} icon={Users} />
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
              <Input value={form.nama} maxLength={MAX_NAMA_LENGTH} onChange={function(e) { setForm({ ...form, nama: e.target.value }); setFieldErrors(function(p) { return { ...p, nama: '' } }) }}
                className={fieldErrors.nama ? 'border-destructive' : ''} />
              {fieldErrors.nama && <p className="text-xs text-destructive">{fieldErrors.nama}</p>}
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} maxLength={MAX_EMAIL_LENGTH} onChange={function(e) { setForm({ ...form, email: e.target.value }); setFieldErrors(function(p) { return { ...p, email: '' } }) }}
                disabled={!!editTarget} className={fieldErrors.email ? 'border-destructive' : ''} />
              {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
            </div>
            {!editTarget && <p className="text-xs text-muted-foreground">Password akan digenerate otomatis</p>}
            <div className="space-y-2">
              <Label>Jabatan</Label>
              <Input value={form.jabatan} maxLength={MAX_JABATAN_LENGTH} onChange={function(e) { setForm({ ...form, jabatan: e.target.value }); setFieldErrors(function(p) { return { ...p, jabatan: '' } }) }}
                className={fieldErrors.jabatan ? 'border-destructive' : ''} />
              {fieldErrors.jabatan && <p className="text-xs text-destructive">{fieldErrors.jabatan}</p>}
            </div>
            <div className="space-y-2">
              <Label>Telepon</Label>
              <PhoneInput value={form.phone || ''} onChange={function(v) { setForm({ ...form, phone: v }); setFieldErrors(function(p) { return { ...p, phone: '' } }) }} error={fieldErrors.phone} />
              {fieldErrors.phone && <p className="text-xs text-destructive">{fieldErrors.phone}</p>}
            </div>
            <div className="space-y-2">
              <Label>Alamat</Label>
              <Textarea value={form.alamat || ''} maxLength={MAX_ALAMAT_LENGTH} onChange={function(e) { setForm({ ...form, alamat: e.target.value }); setFieldErrors(function(p) { return { ...p, alamat: '' } }) }}
                className={fieldErrors.alamat ? 'border-destructive' : ''} />
              {fieldErrors.alamat && <p className="text-xs text-destructive">{fieldErrors.alamat}</p>}
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={function(v) { setForm({ ...form, role: (v || 'karyawan') as 'admin' | 'karyawan' }) }}>
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
            <Button variant="outline" onClick={function() { setModalOpen(false) }}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>
              {editTarget ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={function(o) { if (!o) setDeleteTarget(null) }}
        title="Hapus Karyawan"
        actions={[{ label: 'Hapus', onClick: handleDelete, variant: 'destructive' as const }]}
      >
        <p className="text-sm">Yakin ingin menghapus <strong>{deleteTarget?.nama}</strong>? Data absensi terkait juga akan terhapus.</p>
      </ConfirmDialog>
    </div>
  )
}

