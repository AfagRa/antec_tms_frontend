import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { groupsApi } from '../api/groups'
import { lessonsApi } from '../api/lessons'
import { teacherPortalApi } from '../api/teacherPortal'
import type { Group, CreateLessonPayload } from '../types'
import Spinner from '../components/ui/Spinner'

export default function LessonCreate() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [teacherId, setTeacherId] = useState<number | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [groupId, setGroupId] = useState('')
  const [topic, setTopic] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [groupLessons, setGroupLessons] = useState<{ id: number; lesson_date: string; topic: string }[]>([])

  useEffect(() => {
    const init = async () => {
      try {
        const me = await teacherPortalApi.getMe()
        setTeacherId(me.id)
        const res = await groupsApi.list({ teacher_id: me.id })
        const grps = res.data ?? []
        setGroups(grps)
        if (grps.length > 0) {
          setGroupId(String(grps[0].id))
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
    if (!groupId) return
    const load = async () => {
      try {
        const data = await lessonsApi.getByGroup(Number(groupId))
        setGroupLessons(data)
      } catch {
        setGroupLessons([])
      }
    }
    load()
  }, [groupId])

  const handleComplete = async () => {
    if (!teacherId || !groupId || !topic.trim()) {
      alert('Zəhmət olmasa qrup və mövzu seçin.')
      return
    }
    setSaving(true)
    try {
      const payload: CreateLessonPayload = {
        group_id: Number(groupId),
        teacher_id: teacherId,
        lesson_date: new Date().toISOString(),
        topic: topic.trim(),
        note: note.trim() || undefined,
        status: 'scheduled',
      }
      await lessonsApi.create(payload)
      // Navigate to groups page since we don't know the new lesson ID
      navigate(ROUTES.TEACHER_GROUPS)
    } catch (err) {
      console.error('Failed to create lesson', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text-base">Jurnal / Dərs Yarat</h1>

      <div className="mx-auto max-w-2xl rounded-neu bg-surface shadow-neu-sm p-8">
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-base">
              Qrup Seçimi<span className="ml-0.5 text-red-500">*</span>
            </label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full rounded-md border border-surface-dark/20 px-3 py-2 text-sm text-text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            {groupId && (
              <p className="mt-1 text-xs text-text-base/50">
                Tələbə sayı: {groups.find((g) => String(g.id) === groupId)?.students_count ?? '—'}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-base">
              Mövzu<span className="ml-0.5 text-red-500">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Dərs mövzusunu daxil edin"
              className="w-full rounded-md border border-surface-dark/20 px-3 py-2 text-sm text-text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-base">
              Dərs Qeydi
            </label>
            <textarea
              rows={5}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Dərs haqqında əlavə qeydlər..."
              className="w-full rounded-md border border-surface-dark/20 px-3 py-2 text-sm text-text-base focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {groupLessons.length > 0 && (
            <div className="rounded-lg border border-surface-dark/20 bg-surface-light p-4">
              <p className="mb-2 text-sm font-semibold text-text-base">Son dərslər</p>
              <ul className="space-y-1 text-sm text-text-base/50">
                {groupLessons.slice(0, 5).map((l) => (
                  <li key={l.id}>{new Date(l.lesson_date).toLocaleDateString('az-AZ')} — {l.topic}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Link to={ROUTES.TEACHER_GROUPS} className="text-sm text-text-base/50 hover:text-text-base">
            Ləğv et / Geri
          </Link>
          <button
            type="button"
            onClick={handleComplete}
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60 cursor-pointer"
          >
            {saving ? 'Yaradılır...' : 'Dərsi Yarat və Davamiyyətə Keç'}
          </button>
        </div>
      </div>
    </div>
  )
}
