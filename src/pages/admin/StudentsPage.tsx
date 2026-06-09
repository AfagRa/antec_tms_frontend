import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { studentsApi } from '@/api/students'
import { groupsApi } from '@/api/groups'
import type { Group, Student, StudentPayload } from '@/types'
import Button from '@/components/ui/Button'
import Table from '@/components/ui/Table'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Badge from '@/components/ui/Badge'
import { useToast } from '@/hooks/useToast'

const emptyForm: StudentPayload = {
  name: '',
  surname: '',
  email: '',
  password: '',
  phone: '',
  birth_date: '',
  note: '',
  status: 'active',
}

export default function StudentsPage() {
  const { addToast } = useToast()
  const [items, setItems] = useState<Student[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [form, setForm] = useState<StudentPayload>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [groupModalOpen, setGroupModalOpen] = useState(false)
  const [groupTarget, setGroupTarget] = useState<Student | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [assigning, setAssigning] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [studentList, groupList] = await Promise.all([studentsApi.list(), groupsApi.list()])
      setItems(studentList.data)
      setGroups(groupList.data)
    } catch {
      addToast('Məlumatlar yüklənmədi', 'error')
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

  const openEdit = (student: Student) => {
    setEditing(student)
    setForm({
      name: student.name,
      surname: student.surname,
      email: student.email,
      phone: student.phone ?? '',
      birth_date: student.birth_date ?? '',
      note: student.note ?? '',
      status: student.status,
    })
    setOpen(true)
  }

  const openGroupAssign = (student: Student) => {
    setGroupTarget(student)
    setSelectedGroupId(null)
    setGroupModalOpen(true)
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
        const { password, ...payload } = form
        const updated = await studentsApi.update(editing.id, payload)
        setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
        addToast('Tələbə yeniləndi', 'success')
      } else {
        const created = await studentsApi.create(form)
        setItems((prev) => [created, ...prev])
        addToast('Tələbə yaradıldı', 'success')
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
      await studentsApi.remove(deleteTarget.id)
      setItems((prev) => prev.filter((item) => item.id !== deleteTarget.id))
      addToast('Tələbə silindi', 'success')
      setDeleteTarget(null)
    } catch {
      addToast('Tələbə silinə bilmədi', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const handleAssignGroup = async () => {
    if (!groupTarget || !selectedGroupId) return
    setAssigning(true)
    try {
      await groupsApi.addStudent(selectedGroupId, groupTarget.id)
      setItems((prev) =>
        prev.map((item) =>
          item.id === groupTarget.id
            ? { ...item, groups: [...(item.groups ?? []), { id: selectedGroupId, name: groups.find((group) => group.id === selectedGroupId)?.name ?? 'Qrup' }] }
            : item,
        ),
      )
      addToast('Tələbə qrupa əlavə edildi', 'success')
      setGroupModalOpen(false)
    } catch {
      addToast('Tələbə qrupa əlavə edilə bilmədi', 'error')
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-base">Tələbələr</h1>
          <p className="mt-1 text-sm text-text-base/50">Cəmi {filtered.length} tələbə</p>
        </div>
        <Button icon={<Plus size={15} />} onClick={openCreate}>
          Tələbə yarat
        </Button>
      </div>

      <div className="max-w-sm">
        <Input
          placeholder="Ad / email ilə axtar..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          leftIcon={<Search size={15} />}
        />
      </div>

      <Table
        columns={[
          { key: 'idx', header: '#', render: (_: Student, index) => index + 1 },
          { key: 'name', header: 'Ad Soyad', render: (student: Student) => <span className="font-bold">{student.full_name ?? `${student.name} ${student.surname}`}</span> },
          { key: 'email', header: 'Email', render: (student: Student) => <span className="text-text-base/60">{student.email}</span> },
          { key: 'phone', header: 'Telefon', render: (student: Student) => <span className="text-text-base/60">{student.phone || '—'}</span> },
          { key: 'group', header: 'Qrup', render: (student: Student) => <span className="text-text-base/60">{student.groups?.map((group) => group.name).join(', ') || '—'}</span> },
          { key: 'status', header: 'Status', render: (student: Student) => <Badge status={student.status} /> },
          {
            key: 'actions',
            header: 'Əməliyyatlar',
            render: (student: Student) => (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => openGroupAssign(student)} title="Qrupa əlavə et">
                  👥
                </Button>
                <Button variant="secondary" size="sm" onClick={() => openEdit(student)} aria-label="Redaktə et">
                  <Pencil size={13} />
                </Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteTarget(student)} aria-label="Sil">
                  <Trash2 size={13} />
                </Button>
              </div>
            ),
          },
        ]}
        data={filtered}
        loading={loading}
        rowKey={(student) => student.id}
        emptyMessage="Tələbə tapılmadı"
      />

      <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Tələbəni redaktə et' : 'Yeni tələbə yarat'} size="lg">
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Ad" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
          <Input label="Soyad" value={form.surname} onChange={(event) => setForm((prev) => ({ ...prev, surname: event.target.value }))} />
          <Input label="Email" type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
          {!editing && <Input label="Şifrə" type="password" value={form.password ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} />}
          <Input label="Telefon" value={form.phone ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} />
          <Input label="Doğum tarixi" type="date" value={form.birth_date ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, birth_date: event.target.value }))} />
          <div className="md:col-span-2">
            <Textarea label="Qeyd" value={form.note ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <Select label="Status" value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as StudentPayload['status'] }))}>
              <option value="active">Aktiv</option>
              <option value="inactive">Passiv</option>
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

      <Modal isOpen={groupModalOpen} onClose={() => setGroupModalOpen(false)} title="Qrupa əlavə et">
        <div className="space-y-4">
          <p className="text-sm text-text-base/60">
            Tələbə: <strong className="text-text-base">{groupTarget?.full_name ?? `${groupTarget?.name} ${groupTarget?.surname}`}</strong>
          </p>
          <Select label="Qrup" value={selectedGroupId ?? 0} onChange={(event) => setSelectedGroupId(Number(event.target.value))}>
            <option value={0}>Qrup seçin...</option>
            {groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
          </Select>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setGroupModalOpen(false)}>
              Ləğv et
            </Button>
            <Button onClick={handleAssignGroup} loading={assigning} disabled={!selectedGroupId}>
              Əlavə et
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message={`"${deleteTarget?.full_name ?? `${deleteTarget?.name} ${deleteTarget?.surname}`}" tələbəsi silinəcək.`}
      />
    </div>
  )
}
