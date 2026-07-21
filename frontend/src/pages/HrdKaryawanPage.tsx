import { useState } from 'react'
import { useUsers, useUpdateUser } from '@/hooks/useUsers'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { LoadingState } from '@/components/shared/LoadingState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Search, PlusCircle, Pencil, Trash2, RefreshCw } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import api from '@/api/axios'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import type { User } from '@/types'

export default function HrdKaryawanPage() {
  const { user: currentUser } = useAuth()
  const { data: users, isLoading, refetch, isFetching } = useUsers()
  const updateUserMutation = useUpdateUser()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<User | null>(null)
  const [form, setForm] = useState({ nama: '', email: '', jabatan: '', role: 'karyawan' })
  const [formError, setFormError] = useState('')

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)

  const filtered = users?.filter(
    (u) =>
      (u.nama || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.jabatan || '').toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  function openCreate() {
    setEditTarget(null)
    setForm({ nama: '', email: '', jabatan: '', role: 'karyawan' })
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(user: User) {
    setEditTarget(user)
    setForm({ nama: user.nama, email: user.email, jabatan: user.jabatan, role: user.role })
    setFormError('')
    setModalOpen(true)
  }

  async function handleSave() {
    setFormError('')
    if (!form.nama.trim() || !form.email.trim() || !form.jabatan.trim()) {
      setFormError('Nama, Email, dan Jabatan harus diisi')
      return
    }

    try {
      if (editTarget) {
        await updateUserMutation.mutateAsync({ id: editTarget.id, data: form })
        toast.success('Karyawan berhasil diupdate')
      } else {
        await api.post('/api/auth/register', { ...form, password: 'password' })
        toast.success('Karyawan berhasil ditambahkan (password: password)')
      }
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setModalOpen(false)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menyimpan'
      setFormError(msg)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await api.delete(`/users/${deleteTarget.id}`)
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
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Jabatan</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.nama || '-'}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.jabatan || '-'}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={u.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(u)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {u.id !== currentUser?.id && (
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(u)}>
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
              <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={!!editTarget} />
            </div>
            {!editTarget && <p className="text-xs text-muted-foreground">Password default: <code>password</code></p>}
            <div className="space-y-2">
              <Label>Jabatan</Label>
              <Input value={form.jabatan} onChange={(e) => setForm({ ...form, jabatan: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
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
            <Button onClick={handleSave} disabled={updateUserMutation.isPending}>
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
