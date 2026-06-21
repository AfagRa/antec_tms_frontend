import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
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
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-surface-dark/20 bg-surface-light">
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">#</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">Tarix</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">Mövzu</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">Əməliyyatlar</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-sm text-text-base/50">
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
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                            lesson.status === 'completed' ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {lesson.status === 'completed' ? 'Tamamlanmış' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex gap-3">
                            <Link
                              to={ROUTES.TEACHER_ATTENDANCE(String(lesson.id))}
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              Davamiyyət
                            </Link>
                            <Link
                              to={ROUTES.TEACHER_GRADES(String(lesson.id))}
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              Qiymət
                            </Link>
                          </div>
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
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-surface-dark/20 bg-surface-light">
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">#</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">Başlıq</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">Tip</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">Tarix</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-sm text-text-base/50">
                        Material tapılmadı.
                      </td>
                    </tr>
                  ) : (
                    materials.map((material, index) => (
                      <tr key={material.id} className="border-b border-surface-dark/20 last:border-0">
                        <td className="px-3 py-3 text-sm text-text-base">{index + 1}</td>
                        <td className="px-3 py-3 text-sm text-text-base">{material.title}</td>
                        <td className="px-3 py-3 text-sm capitalize text-text-base/50">
                          {material.type?.replace('_', ' ')}
                        </td>
                        <td className="px-3 py-3 text-sm text-text-base">
                          {new Date(material.created_at).toLocaleDateString('az-AZ')}
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
    </div>
  )
}
