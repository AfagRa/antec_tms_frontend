import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Plus, Pencil, Trash2, X, Check, AlertCircle, ExternalLink } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { groupsApi } from '../../api/groups'
import { lessonsApi } from '../../api/lessons'
import { materialsApi } from '../../api/materials'
import type { Group, GroupLessonItem, Material } from '../../types'
import { STATUS_LABELS } from '../../types'
import Spinner from '../../components/ui/Spinner'

type TabId = 'students' | 'lessons' | 'materials'

const TABS: { id: TabId; label: string }[] = [
  { id: 'students', label: 'Tab 1 — Tələbə Siyahısı' },
  { id: 'lessons', label: 'Tab 2 — Dərslər' },
  { id: 'materials', label: 'Tab 3 — Materiallar' },
]

export default function GroupDetail() {
  const { id = '1' } = useParams()
  const navigate = useNavigate()
  const [group, setGroup] = useState<Group | null>(null)
  const [lessons, setLessons] = useState<GroupLessonItem[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'lessons' ? 'lessons' : 'students'
  const [activeTab, setActiveTab] = useState<TabId>(initialTab)
  const [loading, setLoading] = useState(true)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [deletingMaterial, setDeletingMaterial] = useState<Material | null>(null)
  const [editForm, setEditForm] = useState({ title: '', type: 'file' as string, url: '', file_path: '', description: '' })
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})
  const [editSaving, setEditSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [g, ls, ms] = await Promise.all([
          groupsApi.get(Number(id)),
          lessonsApi.getByGroup(Number(id)),
          materialsApi.getByGroup(Number(id)),
        ])
        setGroup(g)
        setLessons(ls)
        setMaterials(ms)
      } catch (err) {
        console.warn('Failed to load group detail', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return <Spinner />

  if (!group) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-text-base">Qrup tapılmadı</h1>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => navigate(ROUTES.TEACHER_GROUPS)}
        className="flex items-center gap-1.5 text-sm text-text-base/50 hover:text-text-base transition-colors mb-4 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        Mənim Qruplarıma Qayıt
      </button>

      <div className="mb-6 flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold text-text-base">
          Qrup Detalları: {group.name}
        </h1>
      </div>

      <div className="rounded-neu bg-surface shadow-neu-sm p-6 mb-6">
        <h2 className="mb-4 text-sm font-semibold text-text-base">Qrup Məlumat Kartı</h2>
        <div className="grid grid-cols-2 gap-6 text-sm md:grid-cols-3 lg:grid-cols-6">
          <div>
            <p className="mb-1 text-xs text-text-base/50">Qrup adı</p>
            <p className="font-medium text-text-base">{group.name}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-text-base/50">Kurs adı</p>
            <p className="font-medium text-text-base">{group.course?.name ?? '—'}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-text-base/50">Başlama tarixi</p>
            <p className="font-medium text-text-base">
              {group.start_date ? new Date(group.start_date).toLocaleDateString('az-AZ') : '—'}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs text-text-base/50">Bitmə tarixi</p>
            <p className="font-medium text-text-base">
              {group.end_date ? new Date(group.end_date).toLocaleDateString('az-AZ') : '—'}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs text-text-base/50">Tələbə sayı</p>
            <p className="font-medium text-text-base">{group.students_count}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-text-base/50">Status</p>
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
              group.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'
            }`}>
              {STATUS_LABELS[group.status] ?? group.status}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-neu bg-surface shadow-neu-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-dark/20 px-5 pt-4">
          <div className="flex gap-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 pb-3 text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-primary text-text-base'
                    : 'border-transparent text-text-base/50 hover:text-text-base'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* HIDDEN: lesson creation moved to Journal page */}
          <Link
            to={ROUTES.TEACHER_LESSON_CREATE}
            className="hidden"
          >
            <Plus size={16} strokeWidth={1.5} />
            Yeni Dərs Yarat
          </Link>
        </div>

        <div className="p-5">
          {activeTab === 'students' && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-surface-dark/20 bg-surface-light">
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">#</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">Ad</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">Soyad</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {group.students && group.students.length > 0 ? (
                    group.students.map((student, index) => (
                      <tr key={student.id} className="border-b border-surface-dark/20 last:border-0">
                        <td className="px-3 py-3 text-sm text-text-base">{index + 1}</td>
                        <td className="px-3 py-3 text-sm text-text-base">{student.name}</td>
                        <td className="px-3 py-3 text-sm text-text-base">{student.surname}</td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {STATUS_LABELS[student.status] ?? student.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-sm text-text-base/50">
                        Bu qrupda tələbə yoxdur.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'lessons' && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-surface-dark/20 bg-surface-light">
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">#</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">Tarix</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">Mövzu</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">Kategoriya</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-sm text-text-base/50">
                        Bu qrup üçün dərs tapılmadı.
                      </td>
                    </tr>
                  ) : (
                    lessons.map((lesson, index) => (
                      <tr key={lesson.id} className="border-b border-surface-dark/20 last:border-0">
                        <td className="px-3 py-3 text-sm text-text-base">{index + 1}</td>
                        <td className="px-3 py-3 text-sm text-text-base">
                          {new Date(lesson.lesson_date).toLocaleDateString('az-AZ')}
                        </td>
                        <td className="px-3 py-3 text-sm text-text-base">{lesson.topic}</td>
                        <td className="px-3 py-3">
                          <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary capitalize">
                            {lesson.category === 'lab' ? 'Lab'
                              : lesson.category === 'modul' ? 'Modul'
                              : lesson.category === 'final' ? 'Final'
                              : 'Dərs'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-surface-dark/20 bg-surface-light">
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">#</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">Başlıq</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">Tip</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">Tarix</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base" />
                  </tr>
                </thead>
                <tbody>
                  {materials.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-sm text-text-base/50">
                        Material tapılmadı.
                      </td>
                    </tr>
                  ) : (
                    materials.map((material, index) => (
                      <tr key={material.id} className="border-b border-surface-dark/20 last:border-0">
                        <td className="px-3 py-3 text-sm text-text-base">{index + 1}</td>
                        <td className="px-3 py-3 text-sm text-text-base">
                          {material.url || material.file_path ? (
                            <a
                              href={material.url || material.file_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                            >
                              {material.title}
                              <ExternalLink size={12} />
                            </a>
                          ) : (
                            material.title
                          )}
                        </td>
                        <td className="px-3 py-3 text-sm capitalize text-text-base/50">
                          {material.type?.replace('_', ' ')}
                        </td>
                        <td className="px-3 py-3 text-sm text-text-base">
                          {new Date(material.created_at).toLocaleDateString('az-AZ')}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingMaterial(material)
                                setEditForm({
                                  title: material.title,
                                  type: material.type,
                                  url: material.url ?? '',
                                  file_path: material.file_path ?? '',
                                  description: material.description ?? '',
                                })
                                setEditErrors({})
                              }}
                              className="p-1.5 rounded-md text-text-base/50 hover:text-primary hover:bg-primary/10 transition-colors"
                              title="Redaktə et"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setDeletingMaterial(material)}
                              className="p-1.5 rounded-md text-text-base/50 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Sil"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div className="mt-4 flex justify-end">
                <Link
                  to={ROUTES.TEACHER_MATERIAL}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  + Material əlavə et
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {editingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setEditingMaterial(null)}>
          <div className="rounded-neu bg-surface shadow-neu-sm p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-base">Materialı Redaktə Et</h3>
              <button onClick={() => setEditingMaterial(null)} className="p-1 rounded-md text-text-base/50 hover:text-text-base"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-base">Başlıq <span className="text-red-500">*</span></label>
                <input type="text" value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} className="w-full rounded-md border border-surface-dark/20 px-3 py-2 text-sm text-text-base focus:outline-none focus:ring-2 focus:ring-primary/30" />
                {editErrors.title && <p className="mt-1 text-sm text-red-500">{editErrors.title}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-base">Tip</label>
                <select value={editForm.type} onChange={e => setEditForm(p => ({ ...p, type: e.target.value }))} className="w-full rounded-md border border-surface-dark/20 px-3 py-2 text-sm text-text-base focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="file">Fayl</option>
                  <option value="link">Link</option>
                  <option value="google_drive">Google Drive</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>
              {editForm.type !== 'file' ? (
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-base">URL</label>
                  <input type="text" value={editForm.url} onChange={e => setEditForm(p => ({ ...p, url: e.target.value }))} className="w-full rounded-md border border-surface-dark/20 px-3 py-2 text-sm text-text-base focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-base">Fayl seçin</label>
                  <input
                    type="file"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) setEditForm(p => ({ ...p, file_path: file.name }))
                    }}
                    className="w-full text-sm text-text-base file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20"
                  />
                  {editForm.file_path && <p className="mt-1 text-xs text-text-base/50">Seçilmiş fayl: {editForm.file_path}</p>}
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-text-base">Açıqlama</label>
                <textarea rows={3} value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} className="w-full rounded-md border border-surface-dark/20 px-3 py-2 text-sm text-text-base focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              {editErrors.submit && (
                <p className="flex items-center gap-1 text-sm text-red-500"><AlertCircle size={14} />{editErrors.submit}</p>
              )}
            </div>
            <div className="mt-6 flex items-center justify-between">
              <button onClick={() => setEditingMaterial(null)} className="text-sm text-text-base/50 hover:text-text-base">Ləğv et</button>
              <button
                onClick={async () => {
                  if (!editForm.title.trim()) { setEditErrors({ title: 'Başlıq daxil edilməlidir' }); return }
                  setEditSaving(true)
                  try {
                    await materialsApi.update(editingMaterial.id, {
                      title: editForm.title.trim(),
                      type: editForm.type,
                      url: editForm.type !== 'file' ? editForm.url.trim() || undefined : undefined,
                      file_path: editForm.type === 'file' ? editForm.file_path.trim() || undefined : undefined,
                      description: editForm.description.trim() || undefined,
                    })
                    setMaterials(prev => prev.map(m => m.id === editingMaterial.id ? { ...m, ...editForm, title: editForm.title.trim() } : m))
                    setEditingMaterial(null)
                  } catch {
                    setEditErrors({ submit: 'Yenilənə bilmədi. Yenidən cəhd edin.' })
                  } finally {
                    setEditSaving(false)
                  }
                }}
                disabled={editSaving}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
              >
                {editSaving ? 'Yadda saxlanılır...' : 'Yadda Saxla'} <Check size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setDeletingMaterial(null)}>
          <div className="rounded-neu bg-surface shadow-neu-sm p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-text-base mb-2">Materialı Sil</h3>
            <p className="text-sm text-text-base/70 mb-6">
              "<strong>{deletingMaterial.title}</strong>" materialını silmək istədiyinizə əminsiniz? Bu əməliyyat geri alına bilməz.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDeletingMaterial(null)} className="rounded-lg border border-surface-dark/20 px-4 py-2 text-sm font-medium text-text-base hover:bg-surface-dark/10">Ləğv et</button>
              <button
                onClick={async () => {
                  try {
                    await materialsApi.remove(deletingMaterial.id)
                    setMaterials(prev => prev.filter(m => m.id !== deletingMaterial.id))
                    setDeletingMaterial(null)
                  } catch {
                    alert('Silinə bilmədi. Yenidən cəhd edin.')
                  }
                }}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
