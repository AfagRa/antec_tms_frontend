import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Eye, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { coursesApi } from '@/api/courses'
import { groupsApi } from '@/api/groups'
import { teachersApi } from '@/api/teachers'
import type { Course, Group, GroupPayload, ScheduleRow, Teacher } from '@/types'
import Button from '@/components/ui/Button'
import Table from '@/components/ui/Table'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Badge from '@/components/ui/Badge'
import { useToast } from '@/hooks/useToast'

const emptyForm: GroupPayload = {
  name: '',
  course_id: 0,
  teacher_id: 0,
  start_date: '',
  end_date: '',
  status: 'active',
}

const DAY_OPTIONS = [
  { value: 'Monday',    label: 'Bazar ertəsi' },
  { value: 'Tuesday',   label: 'Çərşənbə axşamı' },
  { value: 'Wednesday', label: 'Çərşənbə' },
  { value: 'Thursday',  label: 'Cümə axşamı' },
  { value: 'Friday',    label: 'Cümə' },
  { value: 'Saturday',  label: 'Şənbə' },
  { value: 'Sunday',    label: 'Bazar' },
]

function emptyScheduleRow(): ScheduleRow {
  return { day_of_week: '', start_time: '', end_time: '', room_or_note: '' }
}

export default function GroupsPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [groups, setGroups] = useState<Group[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Group | null>(null)
  const [form, setForm] = useState<GroupPayload>(emptyForm)
  const [scheduleRows, setScheduleRows] = useState<ScheduleRow[]>([])
  const [timeErrors, setTimeErrors] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [groupList, courseList, teacherList] = await Promise.all([
        groupsApi.list(),
        coursesApi.list(),
        teachersApi.list(),
      ])
      setGroups(groupList.data)
      setCourses(courseList.data)
      setTeachers(teacherList.data)
    } catch {
      addToast('Məlumatlar yüklənmədi', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [search])

  const filtered = useMemo(
    () => groups.filter((group) => group.name.toLowerCase().includes(search.toLowerCase())),
    [groups, search],
  )

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setScheduleRows([])
    setTimeErrors({})
    setOpen(true)
  }

  const openEdit = (group: Group) => {
    setEditing(group)
    setForm({
      name: group.name,
      course_id: group.course.id,
      teacher_id: group.teacher.id,
      start_date: group.start_date,
      end_date: group.end_date ?? '',
      status: group.status,
    })
    setScheduleRows(group.schedules && group.schedules.length > 0 ? [...group.schedules] : [])
    setTimeErrors({})
    setOpen(true)
  }

  const updateScheduleRow = (index: number, field: keyof ScheduleRow, value: string) => {
    setScheduleRows((prev) => {
      const next = prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
      return next
    })
    if (field === 'start_time' || field === 'end_time') {
      setTimeErrors((prev) => {
        const next = { ...prev }
        delete next[index]
        return next
      })
    }
  }

  const removeScheduleRow = (index: number) => {
    setScheduleRows((prev) => prev.filter((_, i) => i !== index))
  }

  const addScheduleRow = () => {
    setScheduleRows((prev) => [...prev, emptyScheduleRow()])
  }

  const validateSchedule = (): boolean => {
    const errors: Record<number, string> = {}
    let valid = true
    scheduleRows.forEach((row, i) => {
      if (!row.day_of_week || !row.start_time || !row.end_time) {
        errors[i] = 'Gün, başlama və bitmə vaxtı məcburidir'
        valid = false
      } else if (row.start_time >= row.end_time) {
        errors[i] = 'Bitmə vaxtı başlama vaxtından sonra olmalıdır'
        valid = false
      }
    })
    setTimeErrors(errors)
    return valid
  }

  const handleSave = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.name.trim() || !form.course_id || !form.teacher_id || !form.start_date) {
      addToast('Zəhmət olmasa bütün məcburi sahələri doldurun', 'warning')
      return
    }

    if (form.end_date && form.start_date > form.end_date) {
      addToast('Bitmə tarixi başlama tarixindən əvvəl ola bilməz', 'warning')
      return
    }

    if (scheduleRows.length > 0 && !validateSchedule()) {
      addToast('Cədvəl məlumatlarını düzgün doldurun', 'warning')
      return
    }

    setSaving(true)
    try {
      const payload: GroupPayload = { ...form }
      if (scheduleRows.length > 0) {
        payload.schedules = [...scheduleRows]
      }
      if (editing) {
        await groupsApi.update(editing.id, payload)
        const refreshed = await groupsApi.list()
        setGroups(refreshed.data)
        addToast('Qrup yeniləndi', 'success')
      } else {
        await groupsApi.create(payload)
        const refreshed = await groupsApi.list()
        setGroups(refreshed.data)
        addToast('Qrup yaradıldı', 'success')
      }
      setOpen(false)
    } catch (err: any) {
      console.error('Submit error:', err?.response?.data ?? err)
      addToast('Əməliyyat uğursuz oldu', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await groupsApi.remove(deleteTarget.id)
      setGroups((prev) => prev.filter((group) => group.id !== deleteTarget.id))
      addToast('Qrup silindi', 'success')
      setDeleteTarget(null)
    } catch {
      addToast('Qrup silinə bilmədi', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-base">Qruplar</h1>
          <p className="mt-1 text-sm text-text-base/50">Cəmi {filtered.length} qrup</p>
        </div>
        <Button icon={<Plus size={15} />} onClick={openCreate}>
          Qrup yarat
        </Button>
      </div>

      <div className="max-w-sm">
        <div className="relative">
          <Input
            placeholder="Qrup adına görə axtar..."
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
          { key: 'idx', header: '#', render: (_: Group, index) => index + 1 },
          { key: 'name', header: 'Qrup adı', render: (group: Group) => <span className="font-bold">{group.name}</span> },
          { key: 'course', header: 'Kurs', render: (group: Group) => <span className="text-text-base/70">{group.course.name}</span> },
          { key: 'teacher', header: 'Müəllim', render: (group: Group) => <span className="text-text-base/70">{group.teacher.full_name ?? `${group.teacher.name} ${group.teacher.surname}`}</span> },
          { key: 'students_count', header: 'Tələbə', render: (group: Group) => <span className="font-mono text-sm">{group.students_count}</span> },
          { key: 'start_date', header: 'Başlama', render: (group: Group) => <span className="text-xs text-text-base/40">{new Date(group.start_date).toLocaleDateString('az-AZ')}</span> },
          { key: 'status', header: 'Status', render: (group: Group) => <Badge status={group.status} /> },
          {
            key: 'actions',
            header: 'Əməliyyatlar',
            render: (group: Group) => (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => navigate(`/admin/groups/${group.id}`)} aria-label="Detallar">
                  <Eye size={13} />
                </Button>
                <Button variant="secondary" size="sm" onClick={() => openEdit(group)} aria-label="Redaktə et">
                  <Pencil size={13} />
                </Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteTarget(group)} aria-label="Sil">
                  <Trash2 size={13} />
                </Button>
              </div>
            ),
          },
        ]}
        data={filtered}
        loading={loading}
        rowKey={(group) => group.id}
        emptyMessage="Qrup tapılmadı"
      />

      <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Qrupu redaktə et' : 'Yeni qrup yarat'} size="lg">
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input label="Qrup adı" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} required />
          </div>
          <Select label="Kurs" value={form.course_id} onChange={(event) => setForm((prev) => ({ ...prev, course_id: Number(event.target.value) }))}>
            <option value={0}>Seçin...</option>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
          </Select>
          <Select label="Müəllim" value={form.teacher_id} onChange={(event) => setForm((prev) => ({ ...prev, teacher_id: Number(event.target.value) }))}>
            <option value={0}>Seçin...</option>
            {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.full_name ?? `${teacher.name} ${teacher.surname}`}</option>)}
          </Select>
          <Input label="Başlama tarixi" type="date" value={form.start_date} onChange={(event) => setForm((prev) => ({ ...prev, start_date: event.target.value }))} />
          <Input label="Bitmə tarixi" type="date" value={form.end_date ?? ''} onChange={(event) => setForm((prev) => ({ ...prev, end_date: event.target.value }))} />
          <div className="md:col-span-2">
            <Select label="Status" value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as GroupPayload['status'] }))}>
              <option value="active">Aktiv</option>
              <option value="inactive">Qeyri-aktiv</option>
            </Select>
          </div>

          <div className="md:col-span-2 border-t border-surface-dark/20 pt-4">
            <h3 className="mb-3 text-base font-bold text-text-base">Həftəlik Cədvəl</h3>
            {scheduleRows.length === 0 && (
              <p className="mb-3 text-sm text-text-base/50">Hələ cədvəl sətri əlavə edilməyib.</p>
            )}
            <div className="space-y-3">
              {scheduleRows.map((row, i) => (
                <div key={i} className="flex flex-wrap items-end gap-3 rounded-neu-sm bg-surface-dark/10 p-3">
                  <div className="w-full sm:w-[180px]">
                    <label className="mb-1 block text-xs font-bold text-text-base/60">Gün</label>
                    <select
                      value={row.day_of_week}
                      onChange={(e) => updateScheduleRow(i, 'day_of_week', e.target.value)}
                      className="w-full rounded-neu-sm border border-surface-dark/30 bg-surface px-3 py-2 text-sm text-text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Seçin...</option>
                      {DAY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-text-base/60">Başlama vaxtı</label>
                    <input
                      type="time"
                      value={row.start_time}
                      onChange={(e) => updateScheduleRow(i, 'start_time', e.target.value)}
                      className="w-full sm:w-[150px] rounded-neu-sm border border-surface-dark/30 bg-surface px-3 py-2 text-sm text-text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-text-base/60">Bitmə vaxtı</label>
                    <input
                      type="time"
                      value={row.end_time}
                      onChange={(e) => updateScheduleRow(i, 'end_time', e.target.value)}
                      className="w-full sm:w-[150px] rounded-neu-sm border border-surface-dark/30 bg-surface px-3 py-2 text-sm text-text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-text-base/60">Otaq/Qeyd</label>
                    <input
                      type="text"
                      value={row.room_or_note ?? ''}
                      onChange={(e) => updateScheduleRow(i, 'room_or_note', e.target.value)}
                      placeholder="İstəyə bağlı"
                      className="w-full sm:w-[150px] rounded-neu-sm border border-surface-dark/30 bg-surface px-3 py-2 text-sm text-text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeScheduleRow(i)}
                    className="p-2 rounded-md text-danger/60 hover:text-danger transition-colors"
                    aria-label="Cədvəl sətirini sil"
                  >
                    <Trash2 size={16} />
                  </button>
                  {timeErrors[i] && (
                    <p className="w-full text-xs text-danger">{timeErrors[i]}</p>
                  )}
                </div>
              ))}
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={addScheduleRow} className="mt-3">
              <Plus size={14} />
              Cədvəl sətri əlavə et
            </Button>
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
        message={`"${deleteTarget?.name}" qrupu silinəcək.`}
      />
    </div>
  )
}
