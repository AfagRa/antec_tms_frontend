import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Pencil, Plus, Search, Trash2, UserX, X } from 'lucide-react'
import { teachersApi } from '@/api/teachers'
import type { Teacher, TeacherPayload } from '@/types'
import Button from '@/components/ui/Button'
import Table from '@/components/ui/Table'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Badge from '@/components/ui/Badge'
import { useToast } from '@/hooks/useToast'

const emptyForm: TeacherPayload = {
  name: '',
  surname: '',
  email: '',
  password: '',
  phone: '',
  specialization: '',
  bio: '',
  status: 'active',
}

export default function TeachersPage() {
  const { addToast } = useToast()
  const [items, setItems] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Teacher | null>(null)
  const [form, setForm] = useState<TeacherPayload>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [hardDeleteTarget, setHardDeleteTarget] = useState<Teacher | null>(null)
  const [hardDeleting, setHardDeleting] = useState(false)
  const [changePassword, setChangePassword] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const response = await teachersApi.list({ search: search || undefined })
      setItems(response.data)
    } catch {
      addToast('Müəllimlər yüklənmədi', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(
    () => items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()) || item.surname.toLowerCase().includes(search.toLowerCase()) || item.email.toLowerCase().includes(search.toLowerCase())),
    [items, search],
  )

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (teacher: Teacher) => {
    setEditing(teacher)
    setChangePassword(false)
    setForm({
      name: teacher.name,
      surname: teacher.surname,
      email: teacher.email,
      password: '',
      phone: teacher.phone ?? '',
      specialization: teacher.specialization ?? '',
      bio: teacher.bio ?? '',
      status: teacher.status,
    })
    setOpen(true)
  }

  const handleSave = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.name.trim() || !form.surname.trim() || !form.email.trim() || (!editing && !form.password?.trim())) {
      addToast('Zəhmət olmasa bütün məcburi sahələri doldurun', 'warning')
      return
    }

    setSaving(true)
    try {
      if (editing) {
        const { password: pw, ...payload } = form
        const updated = await teachersApi.update(editing.id, changePassword && pw ? { ...payload, password: pw } : payload)
        setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
        addToast('Müəllim yeniləndi', 'success')
      } else {
        const created = await teachersApi.create(form)
        setItems((prev) => [created, ...prev])
        addToast('Müəllim yaradıldı', 'success')
      }
      setOpen(false)
    } catch {
      addToast('Əməliyyat uğursuz oldu', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await teachersApi.remove(deleteTarget.id)
      setItems((prev) => prev.map((item) => item.id === deleteTarget.id ? { ...item, status: 'inactive' } : item))
      addToast('Müəllim deaktiv edildi', 'success')
      setDeleteTarget(null)
    } catch {
      addToast('Müəllim deaktiv edilə bilmədi', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const handleHardDelete = async () => {
    if (!hardDeleteTarget) return
    setHardDeleting(true)
    try {
      await teachersApi.hardRemove(hardDeleteTarget.id)
      setItems((prev) => prev.filter((item) => item.id !== hardDeleteTarget.id))
      addToast('Müəllim tamamilə silindi', 'success')
      setHardDeleteTarget(null)
    } catch {
      addToast('Müəllim silinə bilmədi', 'error')
    } finally {
      setHardDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-base">Müəllimlər</h1>
          <p className="mt-1 text-sm text-text-base/50">Cəmi {filtered.length} müəllim</p>
        </div>
        <Button icon={<Plus size={15} />} onClick={openCreate}>
          Müəllim yarat
        </Button>
      </div>

      <div className="max-w-sm">
        <div className="relative">
          <Input
            placeholder="Ad / email ilə axtar..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            leftIcon={<Search size={15} />}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-base/40 hover:text-text-base transition-colors"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      <Table
        columns={[
          { key: 'idx', header: '#', render: (_: Teacher, index) => index + 1 },
          { key: 'name', header: 'Ad Soyad', render: (teacher: Teacher) => <span className={`font-bold ${teacher.status === 'inactive' ? 'text-text-base/40' : ''}`}>{teacher.full_name ?? `${teacher.name} ${teacher.surname}`}</span> },
          { key: 'email', header: 'Email', render: (teacher: Teacher) => <span className={`text-text-base/60 ${teacher.status === 'inactive' ? 'text-text-base/30' : ''}`}>{teacher.email}</span> },
          { key: 'phone', header: 'Telefon', render: (teacher: Teacher) => <span className={`text-text-base/60 ${teacher.status === 'inactive' ? 'text-text-base/30' : ''}`}>{teacher.phone || '—'}</span> },
          { key: 'specialization', header: 'İxtisas', render: (teacher: Teacher) => <span className={`text-text-base/60 ${teacher.status === 'inactive' ? 'text-text-base/30' : ''}`}>{teacher.specialization || '—'}</span> },
          { key: 'status', header: 'Status', render: (teacher: Teacher) => <Badge status={teacher.status} /> },
          {
            key: 'actions',
            header: 'Əməliyyatlar',
            render: (teacher: Teacher) => (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => openEdit(teacher)} aria-label="Redaktə et">
                  <Pencil size={13} />
                </Button>
                {teacher.status === 'active' ? (
                  <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(teacher)} aria-label="Deaktiv et">
                    <UserX size={13} />
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" onClick={async () => { try { await teachersApi.update(teacher.id, { status: 'active' }); setItems((prev) => prev.map((item) => item.id === teacher.id ? { ...item, status: 'active' } : item)); addToast('Müəllim aktiv edildi', 'success'); } catch { addToast('Müəllim aktiv edilə bilmədi', 'error'); } }} aria-label="Aktiv et">
                    <UserX size={13} />
                  </Button>
                )}
                <Button variant="danger" size="sm" onClick={() => setHardDeleteTarget(teacher)} aria-label="Sil">
                  <Trash2 size={13} />
                </Button>
              </div>
            ),
          },
        ]}
        data={filtered}
        loading={loading}
        rowKey={(teacher) => teacher.id}
        rowClassName={(teacher) => teacher.status === 'inactive' ? 'opacity-50' : ''}
        emptyMessage="Müəllim tapılmadı"
      />

      <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Müəllimi redaktə et' : 'Yeni müəllim yarat'} size="lg">
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Ad" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
          <Input label="Soyad" value={form.surname} onChange={(event) => setForm((prev) => ({ ...prev, surname: event.target.value }))} />
          <Input label="Email" type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
          {!editing ? (
            <Input label="Şifrə" type="password" value={form.password ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} />
          ) : (
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm text-text-base/70 cursor-pointer">
                <input type="checkbox" checked={changePassword} onChange={(e) => setChangePassword(e.target.checked)} className="rounded" />
                Şifrəni dəyiş
              </label>
              {changePassword && (
                <Input label="Yeni şifrə" type="password" value={form.password ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} className="mt-2" />
              )}
            </div>
          )}
          <Input label="Telefon" value={form.phone ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} />
          <Input label="İxtisas" value={form.specialization ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, specialization: event.target.value }))} />
          <div className="md:col-span-2">
            <Textarea label="Bio" value={form.bio ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <Select label="Status" value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as TeacherPayload['status'] }))}>
              <option value="active">Aktiv</option>
              <option value="inactive">Qeyri-aktiv</option>
            </Select>
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>
              Ləğv et
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? 'Yadda saxla' : 'Yarat'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message={`"${deleteTarget?.name} ${deleteTarget?.surname}" müəllimi deaktiv edilsin?`}
        confirmLabel="Deaktiv et"
      />

      <ConfirmDialog
        isOpen={!!hardDeleteTarget}
        onClose={() => setHardDeleteTarget(null)}
        onConfirm={handleHardDelete}
        loading={hardDeleting}
        message={`"${hardDeleteTarget?.name} ${hardDeleteTarget?.surname}" müəllimi tamamilə silinsin? Bütün məlumatları itiriləcək.`}
        confirmLabel="Sil"
      />
    </div>
  )
}
