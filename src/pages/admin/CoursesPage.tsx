import { useEffect, useMemo, useState } from 'react'
import { Eye, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { coursesApi } from '@/api/courses'
import type { Course, CoursePayload } from '@/types'
import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Badge from '@/components/ui/Badge'
import { useToast } from '@/hooks/useToast'

const emptyForm: CoursePayload = { name: '', description: '', status: 'active' }

export default function CoursesPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [items, setItems] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [form, setForm] = useState<CoursePayload>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchItems = async () => {
    setLoading(true)
    try {
      const response = await coursesApi.list({ search: search || undefined })
      setItems(response.data)
    } catch {
      addToast('Kurslar yüklənmədi', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [search])

  const filtered = useMemo(
    () => items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())),
    [items, search],
  )

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (course: Course) => {
    setEditing(course)
    setForm({ name: course.name, description: course.description ?? '', status: course.status })
    setOpen(true)
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.name.trim()) {
      addToast('Kurs adı məcburidir', 'warning')
      return
    }

    setSaving(true)
    try {
      if (editing) {
        const updated = await coursesApi.update(editing.id, form)
        setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
        addToast('Kurs yeniləndi', 'success')
      } else {
        const created = await coursesApi.create(form)
        setItems((prev) => [created, ...prev])
        addToast('Kurs yaradıldı', 'success')
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
      await coursesApi.remove(deleteTarget.id)
      setItems((prev) => prev.filter((item) => item.id !== deleteTarget.id))
      addToast('Kurs silindi', 'success')
      setDeleteTarget(null)
    } catch {
      addToast('Kurs silinə bilmədi', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-base">Kurslar</h1>
          <p className="mt-1 text-sm text-text-base/50">Cəmi {filtered.length} kurs</p>
        </div>
        <Button icon={<Plus size={15} />} onClick={openCreate}>
          Kurs yarat
        </Button>
      </div>

      <div className="max-w-sm">
        <div className="relative">
          <Input
            placeholder="Kurs adına görə axtar..."
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
          { key: 'idx', header: '#', render: (_: Course, index) => index + 1 },
          { key: 'name', header: 'Kurs adı', render: (course: Course) => <span className="font-bold">{course.name}</span> },
          { key: 'description', header: 'Təsvir', render: (course: Course) => <span className="text-text-base/60">{course.description || '—'}</span> },
          { key: 'status', header: 'Status', render: (course: Course) => <Badge status={course.status} /> },
          {
            key: 'created_at',
            header: 'Tarix',
            render: (course: Course) => <span className="text-xs text-text-base/40">{new Date(course.created_at).toLocaleDateString('az-AZ')}</span>,
          },
          {
            key: 'actions',
            header: 'Əməliyyatlar',
            render: (course: Course) => (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => navigate(`/admin/courses/${course.id}`)} aria-label="Detallar">
                  <Eye size={13} />
                </Button>
                <Button variant="secondary" size="sm" onClick={() => openEdit(course)} aria-label="Redaktə et">
                  <Pencil size={13} />
                </Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteTarget(course)} aria-label="Sil">
                  <Trash2 size={13} />
                </Button>
              </div>
            ),
          },
        ]}
        data={filtered}
        loading={loading}
        rowKey={(course) => course.id}
        emptyMessage="Kurs tapılmadı"
      />

      <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Kursu redaktə et' : 'Yeni kurs yarat'}>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input label="Kurs adı" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} required />
          <Textarea label="Təsvir" value={form.description ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
          <Select label="Status" value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as CoursePayload['status'] }))}>
            <option value="active">Aktiv</option>
            <option value="inactive">Passiv</option>
          </Select>
          <div className="flex justify-end gap-3 pt-2">
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
        message={`"${deleteTarget?.name}" kursu silinəcək.`}
      />
    </div>
  )
}
