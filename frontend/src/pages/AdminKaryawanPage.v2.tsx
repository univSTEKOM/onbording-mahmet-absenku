import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useUsers } from '@/hooks/useUsers'
import { MAX_NAMA_LENGTH, MAX_EMAIL_LENGTH, MAX_JABATAN_LENGTH, MAX_PHONE_DIGITS, MIN_PHONE_DIGITS, MAX_ALAMAT_LENGTH } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PhoneInput } from '@/components/ui/phone-input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { Search, PlusCircle, Pencil, Trash2, RefreshCw, Users, Briefcase, CalendarDays, Shield } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import api from '@/api/axios'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import type { User } from '@/types'

export default function AdminKaryawanPageV2() {
  var navigate = useNavigate()
  var { user: currentUser } = useAuth()
  var { data: users, isLoading, refetch, isFetching } = useUsers()
  var queryClient = useQueryClient()
  var [search, setSearch] = useState('')
  var [roleFilter, setRoleFilter] = useState('')
  var [saving, setSaving] = useState(false)

  var [modalOpen, setModalOpen] = useState(false)
  var [editTarget, setEditTarget] = useState<User | null>(null)
  var [form, setForm] = useState<Partial<User>>({ nama: '', email: '', jabatan: '', role: 'karyawan' as const, phone: '', alamat: '' })
  var [formError, setFormError] = useState('')
  var [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  var [deleteTarget, setDeleteTarget] = useState<User | null>(null)

  var filtered = users?.filter(function(u) {
    var matchSearch = !search ||
      (u.nama || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.jabatan || '').toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    var matchRole = !roleFilter || u.role === roleFilter
    return matchSearch && matchRole
  })

  var adminCount = filtered?.filter(function(u) { return u.role === 'admin' }).length || 0
  var karyawanCount = filtered?.filter(function(u) { return u.role === 'karyawan' }).length || 0

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
        await api.post('/api/register', { ...form, password: 'password', name: form.nama, role: form.role })
        toast.success('Karyawan berhasil ditambahkan (password: password)')
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

  var roleOptions = [
    { value: '', label: 'Semua' },
    { value: 'karyawan', label: 'Karyawan' },
    { value: 'admin', label: 'Admin' },
  ]

  function UserCard(u: User) {
    var initials = (u.nama || '?').charAt(0).toUpperCase()
    var joinedDate = u.createdAt
      ? new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      : '-'
    return (
      <Card
        key={u.id}
        className="group hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
        onClick={function() { navigate({ to: '/admin/profile', state: { user: u } }) }}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-border/50 shrink-0">
              <AvatarImage src={u.foto && !u.foto.startsWith('[') ? u.foto : undefined} />
              <AvatarFallback className={u.role === 'admin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 text-sm' : 'bg-muted text-muted-foreground text-sm'}>
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{u.nama || '-'}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <Badge variant="secondary" className={
                  u.role === 'admin'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0 shrink-0 text-[11px] px-2 py-0.5'
                    : 'bg-muted text-muted-foreground border-0 shrink-0 text-[11px] px-2 py-0.5'
                }>
                  <Shield className="h-3 w-3 mr-1" />
                  {u.role === 'admin' ? 'Admin' : 'Karyawan'}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-muted-foreground">
                {u.jabatan && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {u.jabatan}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {joinedDate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-border/40">
            <Button
              variant="ghost"
              size="xs"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={function(e) { e.stopPropagation(); openEdit(u) }}
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
            {u.id !== currentUser?.id && (
              <Button
                variant="ghost"
                size="xs"
                className="gap-1.5 text-destructive/70 hover:text-destructive"
                onClick={function(e) { e.stopPropagation(); setDeleteTarget(u) }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Hapus
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Kelola Karyawan</h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            {filtered?.length || 0} orang
            {filtered && karyawanCount > 0 && ' · ' + karyawanCount + ' Karyawan'}
            {filtered && adminCount > 0 && ' · ' + adminCount + ' Admin'}
          </p>
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

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Cari nama, email, atau jabatan..."
            className="pl-9 h-9"
            value={search}
            onChange={function(e) { setSearch(e.target.value) }}
          />
        </div>
        <div className="flex gap-1.5 shrink-0">
          {roleOptions.map(function(opt) {
            return (
              <button
                key={opt.value}
                type="button"
                onClick={function() { setRoleFilter(opt.value) }}
                className={'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ' + (
                  roleFilter === opt.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 4 }, function(_, i) { return { id: 'kr-sk-' + i } }).map(function(item) {
            return <Skeleton key={item.id} className="h-32 w-full rounded-xl" />
          })}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(function(u) { return UserCard(u) })}
        </div>
      ) : (
        <EmptyState
          message={search || roleFilter ? 'Karyawan tidak ditemukan' : 'Belum ada data karyawan'}
          icon={Users}
        />
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Karyawan' : 'Tambah Karyawan'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            {!editTarget && <p className="text-xs text-muted-foreground">Password default: <code>password</code></p>}
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
