import { useState, useRef, useEffect, type FormEvent, type ReactNode } from 'react'
import { Check, Upload, FileCheck, X, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import MaterialTypePicker from '../../components/ui/MaterialTypePicker'
import { ROUTES } from '../../constants/routes'
import { groupsApi } from '../../api/groups'
import { lessonsApi } from '../../api/lessons'
import { materialsApi } from '../../api/materials'
import { teacherPortalApi } from '../../api/teacherPortal'
import type { Group, GroupLessonItem, CreateMaterialPayload, MaterialType } from '../../types'
import Spinner from '../../components/ui/Spinner'

function FormField({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-text-base">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default function MaterialUpload() {
  const [loading, setLoading] = useState(true)
  const [teacherId, setTeacherId] = useState<number | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [lessons, setLessons] = useState<GroupLessonItem[]>([])

  const [groupId, setGroupId] = useState('')
  const [lessonId, setLessonId] = useState('')
  const [title, setTitle] = useState('')
  const [type, setType] = useState<string>('file')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const me = await teacherPortalApi.getMe()
        setTeacherId(me.id)
        const res = await groupsApi.list({ teacher_id: me.id })
        setGroups(res.data ?? [])
        if (res.data.length > 0) {
          setGroupId(String(res.data[0].id))
        }
      } catch (err) {
        console.warn('Failed to load teacher/groups', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (!groupId) {
      setLessons([])
      return
    }
    const fetchLessons = async () => {
      try {
        const data = await lessonsApi.getByGroup(Number(groupId))
        setLessons(data)
        if (data.length > 0) {
          setLessonId(String(data[0].id))
        }
      } catch {
        setLessons([])
      }
    }
    fetchLessons()
  }, [groupId])

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!groupId) e.groupId = 'Qrup seçilməlidir'
    if (!lessonId) e.lessonId = 'Dərs seçilməlidir'
    if (!title.trim()) e.title = 'Başlıq daxil edilməlidir'
    if (type === 'file' && !selectedFile) e.file = 'Fayl seçilməyib'
    if (type !== 'file' && !url.trim()) e.url = 'Link daxil edilməlidir'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validate() || !teacherId) return
    setSaving(true)

    try {
      if (type === 'file' && selectedFile) {
        await materialsApi.upload(
          Number(lessonId),
          Number(groupId),
          teacherId,
          title.trim(),
          type,
          selectedFile,
          description.trim() || undefined,
        )
      } else {
        const payload: CreateMaterialPayload = {
          lesson_id: Number(lessonId),
          group_id: Number(groupId),
          teacher_id: teacherId,
          title: title.trim(),
          type,
          url: type !== 'file' ? url.trim() : undefined,
          description: description.trim() || undefined,
        }
        await materialsApi.create(payload)
      }
      setSuccess(true)
      setTitle('')
      setUrl('')
      setDescription('')
      setSelectedFile(null)
    } catch (err) {
      console.error('Failed to create material', err)
      setErrors(prev => ({
        ...prev,
        submit: 'Material əlavə edilə bilmədi. Yenidən cəhd edin.',
      }))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text-base">Yeni Material Əlavə Et</h1>

      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl rounded-neu bg-surface shadow-neu-sm p-8">
        {success && (
          <div className="mb-6 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
            Material uğurla paylaşıldı!
          </div>
        )}

        <div className="space-y-5">
          <FormField label="Qrup Seçimi" required error={errors.groupId}>
            <select
              value={groupId}
              onChange={(e) => { setGroupId(e.target.value); setLessonId('') }}
              className="w-full rounded-md border border-surface-dark/20 px-3 py-2 text-sm text-text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Aid Olduğu Dərs" required error={errors.lessonId}>
            <select
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              className="w-full rounded-md border border-surface-dark/20 px-3 py-2 text-sm text-text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>Dərs: {l.topic} ({new Date(l.lesson_date).toLocaleDateString('en-GB')})</option>
              ))}
            </select>
          </FormField>

          <FormField label="Materialın Başlığı" required error={errors.title}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Məsələn: Dərs 05 - Massivlər və Obyektlər"
              className="w-full rounded-md border border-surface-dark/20 px-3 py-2 text-sm text-text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </FormField>

          <FormField label="Materialın Tipi">
            <MaterialTypePicker value={type as MaterialType} onChange={(t) => setType(t)} />
          </FormField>

          {type === 'file' ? (
            <FormField label="Fayl seçin" required error={errors.file}>
              <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.png,.jpg,.jpeg,.mp4,.mp3" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
              {!selectedFile ? (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-surface-dark/20 rounded-xl p-8 text-center hover:border-success hover:bg-success/10 transition-all cursor-pointer group">
                  <Upload size={28} className="mx-auto text-text-base/50 group-hover:text-success transition-colors mb-2" />
                  <p className="text-sm font-medium text-text-base">Faylı buraya çəkin və ya <span className="text-success">seçin</span></p>
                  <p className="text-xs text-text-base/50 mt-1">PDF, Word, Excel, PPT, şəkil, video — maks. 50MB</p>
                </button>
              ) : (
                <div className="rounded-neu bg-surface shadow-neu-sm flex items-center gap-3 p-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0"><FileCheck size={20} className="text-success" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-base truncate">{selectedFile.name}</p>
                    <p className="text-xs text-text-base/50 mt-0.5">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button type="button" onClick={() => setSelectedFile(null)} className="flex-shrink-0 text-text-base/50 hover:text-red-500 transition-colors p-1"><X size={16} /></button>
                </div>
              )}
            </FormField>
          ) : (
            <FormField label="Resurs Linki" required error={errors.url}>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-md border border-surface-dark/20 px-3 py-2 text-sm text-text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </FormField>
          )}

          <FormField label="Açıqlama / Qeyd (optional)">
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-surface-dark/20 px-3 py-2 text-sm text-text-base focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </FormField>
        </div>

        {errors.submit && (
          <p className="mt-3 flex items-center gap-1 text-sm text-red-500">
            <AlertCircle size={14} />
            {errors.submit}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Link to={ROUTES.TEACHER_GROUPS} className="text-sm text-text-base/50 hover:text-text-base">Ləğv et / Geri</Link>
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60 cursor-pointer">
            {saving ? 'Paylaşılır...' : 'Materialı Paylaş'} <Check size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}
