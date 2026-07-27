import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useUsers } from '@/hooks/useUsers'
import { useDebounce } from '@/hooks/useDebounce'
import { MAX_NAMA_LENGTH, MAX_EMAIL_LENGTH, MAX_JABATAN_LENGTH, MAX_ALAMAT_LENGTH } from '@/lib/constants'
import { Button } from '@/components/ui/button'
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

import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { Separator } from '@/components/ui/separator'
import { KaryawanUserCard } from '@/components/shared/KaryawanUserCard'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { PasswordInput } from '@/components/shared/PasswordInput'
import { Search, PlusCircle, RefreshCw, Users, Trash2, Key } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import api from '@/api/axios'

export default function AdminKaryawanPageV3() {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const isSearching = search !== debouncedSearch

  const filterParams = useMemo(function() {
    const p: Record<string, string> = {}
    if (debouncedSearch) p.q = debouncedSearch
    if (roleFilter) p.role = roleFilter
    return p
  }, [debouncedSearch, roleFilter])

  const { data: users, isLoading, refetch, isFetching } = useUsers(filterParams)
  const queryClient = useQueryClient()
  const [saving, setSaving] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<User | null>(null)
  const [form, setForm] = useState<Partial<User>>({ nama: '', email: '', jabatan: '', role: 'karyawan' as const, phone: '', alamat: '' })
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [resetFace, setResetFace] = useState(false)
  const [passwordMode, setPasswordMode] = useState<'default' | 'custom'>('default')
  const [customPassword, setCustomPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const filtered = users

  const adminCount = filtered?.filter(function(u) { return u.role === 'admin' }).length || 0
  const karyawanCount = filtered?.filter(function(u) { return u.role === 'karyawan' }).length || 0

  function openCreate() {
    setEditTarget(null)
    setForm({ nama: '', email: '', jabatan: '', role: 'karyawan', phone: '', alamat: '' })
    setFormError('')
    setFieldErrors({})
    setResetFace(false)
    setPasswordMode('default')
    setCustomPassword('')
    setConfirmPassword('')
    setModalOpen(true)
  }

  function openEdit(user: User) {
    setEditTarget(user)
    setForm({ nama: user.nama, email: user.email, jabatan: user.jabatan, role: user.role, phone: user.phone || '', alamat: user.alamat || '' })
    setFormError('')
    setFieldErrors({})
    setResetFace(false)
    setModalOpen(true)
  }

  async function handleSave() {
    setFormError('')
    const errs: Record<string, string> = {}
    if (!form.nama?.trim()) errs.nama = 'Nama harus diisi'
    else if (form.nama.length > MAX_NAMA_LENGTH) errs.nama = 'Maksimal ' + MAX_NAMA_LENGTH + ' karakter'
    if (!form.email?.trim()) errs.email = 'Email harus diisi'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Format email tidak valid'
    if (!form.jabatan?.trim()) errs.jabatan = 'Jabatan harus diisi'
    else if (form.jabatan.length > MAX_JABATAN_LENGTH) errs.jabatan = 'Maksimal ' + MAX_JABATAN_LENGTH + ' karakter'
    if (form.phone) {
      const digits = form.phone.replace(/\D/g, '')
      if (digits.length < MIN_PHONE_DIGITS) errs.phone = 'Minimal ' + MIN_PHONE_DIGITS + ' angka'
      else if (digits.length > MAX_PHONE_DIGITS) errs.phone = 'Maksimal ' + MAX_PHONE_DIGITS + ' angka'
    }
    if (form.alamat && form.alamat.length > MAX_ALAMAT_LENGTH) errs.alamat = 'Maksimal ' + MAX_ALAMAT_LENGTH + ' karakter'
    if (!editTarget && passwordMode === 'custom') {
      if (!customPassword) errs.customPassword = 'Password harus diisi'
      else if (customPassword.length < 8) errs.customPassword = 'Minimal 8 karakter'
      else if (customPassword !== confirmPassword) errs.confirmPassword = 'Password tidak cocok'
    }
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return }

    setSaving(true)
    try {
      if (editTarget) {
        await api.patch('/api/users/' + editTarget.id, { ...form, ...(resetFace ? { faceDescriptor: '' } : {}) } as Partial<User>)
        toast.success('Karyawan berhasil diupdate')
      } else {
        const password = passwordMode === 'custom' ? customPassword : 'password'
        await api.post('/api/register', { ...form, password, name: form.nama, role: form.role })
        toast.success('Karyawan berhasil ditambahkan')
      }
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setModalOpen(false)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan'
      console.error('Save user error:', err)
      toast.error(msg)
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

  function hasFaceData(fd: string | undefined): boolean {
    return fd?.startsWith('[') ?? false
  }

  const roleOptions = [
    { value: '', label: 'Semua' },
    { value: 'karyawan', label: 'Karyawan' },
    { value: 'admin', label: 'Admin' },
  ]

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Kelola Pengguna</h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            {filtered?.length || 0} orang
            {filtered && karyawanCount > 0 && ' · ' + karyawanCount + ' Karyawan'}
            {filtered && adminCount > 0 && ' · ' + adminCount + ' Admin'}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Refresh" onClick={function() { refetch() }} disabled={isFetching}>
                <RefreshCw className={'h-4 w-4 ' + (isFetching ? 'animate-spin' : '')} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><p>Muat ulang data</p></TooltipContent>
          </Tooltip>
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
            className={'pl-9 h-9 ' + (isSearching ? 'pr-8' : '')}
            value={search}
            onChange={function(e) { setSearch(e.target.value) }}
          />
          {isSearching && <span className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          {Array.from({ length: 4 }, function(_, i) { return { id: 'kr-sk-' + i } }).map(function(item) {
            return <Skeleton key={item.id} className="h-20 w-full rounded-xl" />
          })}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          {filtered.map(function(u) {
            return (
              <KaryawanUserCard
                key={u.id}
                user={u}
                currentUserId={currentUser?.id || ''}
                onEdit={function(user) { openEdit(user) }}
                onDelete={function(user) { setDeleteTarget(user) }}
                onClick={function(user) { navigate({ to: '/admin/profile', state: { user: user } }) }}
              />
            )
          })}
        </div>
      ) : (
        <EmptyState
          message={search || roleFilter ? 'Karyawan tidak ditemukan' : 'Belum ada data karyawan'}
          icon={Users}
        />
      )}

      <style>{`
        @keyframes marquee {
          0%, 10% { transform: translateX(0); }
          45%, 55% { transform: translateX(calc(-100% + 150px)); }
          90%, 100% { transform: translateX(0); }
        }
        .marquee {
          animation: marquee 8s ease-in-out infinite;
          display: inline-block;
          white-space: nowrap;
          padding-right: 4px;
        }
        .marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

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
            <div className="space-y-2">
              <Label>Alamat</Label>
              <Textarea value={form.alamat || ''} maxLength={MAX_ALAMAT_LENGTH} onChange={function(e) { setForm({ ...form, alamat: e.target.value }); setFieldErrors(function(p) { return { ...p, alamat: '' } }) }}
                className={fieldErrors.alamat ? 'border-destructive' : ''} />
              {fieldErrors.alamat && <p className="text-xs text-destructive">{fieldErrors.alamat}</p>}
            </div>
            <div className="space-y-2">
              <Label>Telepon</Label>
              <PhoneInput value={form.phone || ''} onChange={function(v) { setForm({ ...form, phone: v }); setFieldErrors(function(p) { return { ...p, phone: '' } }) }} error={fieldErrors.phone} />
              {fieldErrors.phone && <p className="text-xs text-destructive">{fieldErrors.phone}</p>}
            </div>
            {!editTarget && (
              <div className="space-y-3">
                <Separator />
                <Label>Password</Label>
                <div className="flex gap-2">
                  <Button type="button" variant={passwordMode === 'default' ? 'default' : 'outline'} size="sm" onClick={function() { setPasswordMode('default') }} className="flex-1 gap-2">
                    <Key className="h-3.5 w-3.5" /> Default
                  </Button>
                  <Button type="button" variant={passwordMode === 'custom' ? 'default' : 'outline'} size="sm" onClick={function() { setPasswordMode('custom') }} className="flex-1 gap-2">
                    Custom
                  </Button>
                </div>
                {passwordMode === 'default' ? (
                  <p className="text-xs text-muted-foreground">Password default: <code className="text-xs">password</code></p>
                ) : (
                  <div className="space-y-3">
                    <PasswordInput
                      id="customPassword"
                      value={customPassword}
                      onChange={function(e) { setCustomPassword(e.target.value); setFieldErrors(function(p) { return { ...p, customPassword: '' } }) }}
                      error={fieldErrors.customPassword}
                      placeholder="Minimal 8 karakter"
                    />
                    <PasswordInput
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={function(e) { setConfirmPassword(e.target.value); setFieldErrors(function(p) { return { ...p, confirmPassword: '' } }) }}
                      error={fieldErrors.confirmPassword}
                      placeholder="Ulangi password"
                      matchValue={customPassword}
                    />
                  </div>
                )}
              </div>
            )}
            {editTarget && hasFaceData(editTarget.faceDescriptor) && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="size-2 rounded-full bg-green-500" />
                    <span className="text-green-600 dark:text-green-400 font-medium">Wajah terdaftar</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Data verifikasi wajah tersedia untuk absensi</p>
                  {resetFace ? (
                    <div className="flex items-center gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
                      <p className="text-xs text-destructive flex-1">Data wajah akan dihapus saat menyimpan</p>
                      <Button type="button" variant="outline" size="xs" onClick={function() { setResetFace(false) }}>
                        Batal
                      </Button>
                    </div>
                  ) : (
                    <Button type="button" variant="destructive" size="sm" className="gap-2" onClick={function() { setResetFace(true) }}>
                      <Trash2 className="h-4 w-4" /> Hapus Data Wajah
                    </Button>
                  )}
                </div>
              </>
            )}
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

