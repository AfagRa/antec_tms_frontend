import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Grid, Link2, Video } from 'lucide-react'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import {
  useAcademic, SHARED_GROUPS, SHARED_LESSONS, SHARED_STUDENTS,
  SHARED_MATERIALS, getStudentAttendance, getStudentGrades,
  resolveStudentId,
} from '../../store/academicStore'

type GroupStatus = 'Aktiv'
type LessonMaterial = { type: 'sanad' | 'video'; label: string }

export default function StudentGroups() {
  const { state } = useAcademic()
  const { user } = useAuth()
  const studentId = resolveStudentId(user?.id)
  const student = SHARED_STUDENTS.find((s) => s.studentId === studentId)
  const myGroupIds = student?.groupIds ?? []

  const [activeGroupId, setActiveGroupId] = useState<string>('all')
  const lessonsRef = useRef<HTMLDivElement>(null)

  const groups = SHARED_GROUPS
    .filter((g) => myGroupIds.includes(g.id))
    .map((g) => {
      const att = getStudentAttendance(state, studentId, g.id)
      const gr = getStudentGrades(state, studentId, g.id)
        .filter((x) => x.score !== null)
        .map((x) => x.score as number)
      const attPct = att.length
        ? Math.round(att.filter((a) => a.status === 'present' || a.status === 'late').length / att.length * 100)
        : 0
      const avgGrade = gr.length
        ? Math.round(gr.reduce((a, b) => a + b, 0) / gr.length)
        : 0
      const lessons = SHARED_LESSONS.filter((l) => l.groupId === g.id)
      return {
        id: g.id,
        name: g.name,
        courseName: 'Python ve Massivler',
        teacherName: 'Əli Həsənov',
        joinedAt: '01.06.2026',
        status: 'Aktiv' as GroupStatus,
        lessonCount: lessons.length,
        attendancePercent: attPct,
        avgGrade,
      }
    })

  const lessons = SHARED_LESSONS
    .filter((l) => myGroupIds.includes(l.groupId))
    .map((l) => {
      const group = SHARED_GROUPS.find((g) => g.id === l.groupId)
      const mats = SHARED_MATERIALS.filter((m) => m.lessonId === l.id)
      return {
        id: l.id,
        groupId: l.groupId,
        date: l.date,
        topic: l.topic,
        teacherName: 'Əli Həsənov',
        materials: mats.map((m) => ({
          type: (m.type === 'YouTube' || m.type === 'Linklər' ? 'video' : 'sanad') as LessonMaterial['type'],
          label: m.type === 'YouTube' ? 'Video' : 'Sənəd',
        })),
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))

  const filteredLessons = activeGroupId === 'all'
    ? lessons
    : lessons.filter((l) => l.groupId === activeGroupId)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-text-base">
        Mənim Qruplarım və Kurslarım
      </h1>

      <div className="rounded-neu bg-surface shadow-neu-sm p-5">
        <div className="mb-4">
          <div className="inline-flex items-center gap-2 rounded-neu bg-surface-dark/30 shadow-neu-inset-sm px-4 py-2 text-sm font-medium">
            <Grid size={16} className="text-primary" />
            <span className="text-text-base">Ümumi Aktiv Qruplarım: {groups.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-left">
            <colgroup>
              <col style={{ width: '120px' }} />
              <col style={{ width: '160px' }} />
              <col style={{ width: '150px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '80px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '220px' }} />
            </colgroup>
            <thead>
              <tr>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">
                  Qrup adı
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">
                  Kurs adı
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">
                  Müəllimin adı
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">
                  Qrupa qoşulma tarixi
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">
                  Status
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">
                  Davamiyyət faizi (%)
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">
                  Ortalama bal (%)
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">
                </th>
              </tr>
              <tr>
                <td colSpan={8} className="p-0 pb-1">
                  <div className="bg-surface-dark/20 h-px w-full" />
                </td>
              </tr>
            </thead>
            <tbody>
              {groups.map((group, index) => (
                <React.Fragment key={group.id}>
                  <tr>
                    <td className="py-3.5 text-sm text-text-base truncate pr-2" title={group.name}>
                      {group.name}
                    </td>
                    <td className="py-3.5 text-sm text-text-base truncate pr-2" title={group.courseName}>
                      {group.courseName}
                    </td>
                    <td className="py-3.5 text-sm text-text-base truncate pr-2" title={group.teacherName}>
                      {group.teacherName}
                    </td>
                    <td className="py-3.5 text-sm text-text-base pr-2">
                      {group.joinedAt}
                    </td>
                    <td className="py-3.5 text-sm">
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-medium shadow-neu-sm bg-primary/10 text-primary">
                        {group.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-sm text-text-base pr-2">
                      {group.attendancePercent}%
                    </td>
                    <td className="py-3.5 text-sm text-text-base pr-2">
                      {group.avgGrade}%
                    </td>
                    <td className="py-3.5 text-sm">
                      <div className="flex gap-4 items-center">
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setActiveGroupId(group.id)
                            lessonsRef.current?.scrollIntoView({ behavior: 'smooth' })
                          }}
                          className="text-primary text-sm font-medium hover:underline cursor-pointer"
                        >
                          Dərslərimə Bax
                        </a>
                        <Link
                          to={`${ROUTES.STUDENT_MATERIALS}?group=${group.id}`}
                          className="text-primary text-sm font-medium hover:underline"
                        >
                          Materiallarıma Bax
                        </Link>
                      </div>
                    </td>
                  </tr>
                  {index < groups.length - 1 && (
                    <tr>
                      <td colSpan={8} className="p-0">
                        <div className="bg-surface-dark/20 h-px w-full" />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div ref={lessonsRef} className="rounded-neu bg-surface shadow-neu-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text-base">
            Mənim Dərslərim
          </h2>
          {activeGroupId !== 'all' && (
            <button
              onClick={() => setActiveGroupId('all')}
              className="text-xs text-primary font-medium hover:underline bg-transparent border-0 cursor-pointer"
            >
              Filteri sıfırla (Hamısını göstər)
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-left">
            <colgroup>
              <col style={{ width: '120px' }} />
              <col />
              <col style={{ width: '200px' }} />
              <col style={{ width: '180px' }} />
            </colgroup>
            <thead>
              <tr>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">
                  Dərs tarixi
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">
                  Mövzu
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">
                  Müəllim
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50">
                  Materiallar
                </th>
              </tr>
              <tr>
                <td colSpan={4} className="p-0 pb-1">
                  <div className="bg-surface-dark/20 h-px w-full" />
                </td>
              </tr>
            </thead>
            <tbody>
              {filteredLessons.map((lesson, index) => (
                <React.Fragment key={lesson.id}>
                  <tr>
                    <td className="py-3.5 text-sm text-text-base pr-2">
                      {lesson.date}
                    </td>
                    <td className="py-3.5 text-sm text-text-base truncate pr-2" title={lesson.topic}>
                      {lesson.topic}
                    </td>
                    <td className="py-3.5 text-sm text-text-base truncate pr-2" title={lesson.teacherName}>
                      {lesson.teacherName}
                    </td>
                    <td className="py-3.5 text-sm">
                      {lesson.materials && lesson.materials.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {lesson.materials.map((mat, mIdx) => {
                            const isSanad = mat.type === 'sanad'
                            const Icon = isSanad ? Link2 : Video
                            const colorClass = isSanad ? 'text-primary' : 'text-red-500'
                            return (
                              <a
                                key={mIdx}
                                href="#"
                                onClick={(e) => e.preventDefault()}
                                className={`inline-flex items-center gap-1 text-sm font-medium hover:underline ${colorClass}`}
                              >
                                <Icon size={12} />
                                <span>{mat.label}</span>
                              </a>
                            )
                          })}
                        </div>
                      ) : (
                        <span className="text-text-base/50">—</span>
                      )}
                    </td>
                  </tr>
                  {index < filteredLessons.length - 1 && (
                    <tr>
                      <td colSpan={4} className="p-0">
                        <div className="bg-surface-dark/20 h-px w-full" />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredLessons.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-text-base/50">
                    Seçilmiş qrup üçün dərs tapılmadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
