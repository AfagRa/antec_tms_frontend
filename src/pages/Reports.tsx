import { useState, useEffect } from 'react'
import { Users, BookOpen, CalendarCheck, PenLine } from 'lucide-react'
import { teacherPortalApi } from '../api/teacherPortal'
import { groupsApi } from '../api/groups'
import { reportsApi } from '../api/reports'
import type { Group, AttendanceReportResult, GradesReportResult } from '../types'
import Spinner from '../components/ui/Spinner'

export default function Reports() {
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [attReport, setAttReport] = useState<AttendanceReportResult | null>(null)
  const [gradeReport, setGradeReport] = useState<GradesReportResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const me = await teacherPortalApi.getMe()
        const res = await groupsApi.list({ teacher_id: me.id })
        const grps = res.data ?? []
        setGroups(grps)
        if (grps.length > 0) setSelectedGroupId(grps[0].id)
      } catch (err) {
        console.warn('Failed to load groups', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (!selectedGroupId) return
    const load = async () => {
      setLoading(true)
      try {
        const [att, gr] = await Promise.all([
          reportsApi.attendance(selectedGroupId),
          reportsApi.grades(selectedGroupId),
        ])
        setAttReport(att)
        setGradeReport(gr)
      } catch (err) {
        console.warn('Failed to load reports', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [selectedGroupId])

  if (loading) return <Spinner />

  const selectedGroup = groups.find((g) => g.id === selectedGroupId)

  const attendanceRows = attReport ? [
    { label: 'İştirak edib', value: attReport.present, color: 'bg-green-500' },
    { label: 'Gecikdi', value: attReport.late, color: 'bg-amber-400' },
    { label: 'Qaib (üzrlü)', value: attReport.excused, color: 'bg-blue-400' },
    { label: 'Qaib (üzrsüz)', value: attReport.absent, color: 'bg-red-400' },
  ] : []

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-base mb-6">Hesabatlar</h1>

      <div className="flex items-center gap-3 mb-5">
        <span className="text-sm text-text-base/50">Qrup:</span>
        {groups.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGroupId(g.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all cursor-pointer
              ${selectedGroupId === g.id
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-text-base/50 border-surface-dark/20 hover:border-primary/50'}`}
          >
            {g.name}
          </button>
        ))}
        {groups.length === 0 && (
          <span className="text-sm text-text-base/50">Heç bir qrup tapılmadı</span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { icon: <Users size={20} />, label: 'Ümumi Tələbə', value: selectedGroup?.students_count ?? 0 },
          { icon: <BookOpen size={20} />, label: 'Ümumi Dərs', value: attReport?.total_lessons ?? 0 },
          { icon: <CalendarCheck size={20} />, label: 'Davamiyyət Faizi', value: attReport ? `${attReport.attendance_percentage}%` : '—' },
          { icon: <PenLine size={20} />, label: 'Ortalama Qiymət', value: gradeReport ? `${gradeReport.overall_percentage}%` : '—' },
        ].map((card) => (
          <div key={card.label} className="rounded-neu bg-surface shadow-neu-sm p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">{card.icon}</div>
            <div>
              <div className="text-2xl font-bold text-text-base">{card.value}</div>
              <div className="text-sm text-text-base/50">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-4 mb-4">
        <div className="rounded-neu bg-surface shadow-neu-sm p-5">
          <h3 className="text-base font-semibold mb-4 text-text-base">Davamiyyət xülasəsi</h3>
          {attReport ? (
            <>
              {attendanceRows.map((row) => {
                const total = attReport.total_records || 1
                return (
                  <div key={row.label} className="mb-3 last:mb-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-text-base">{row.label}</span>
                      <span className="text-sm font-medium text-text-base/50">{row.value} ({Math.round((row.value / total) * 100)}%)</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2.5">
                      <div className={`${row.color} h-2.5 rounded-full`} style={{ width: `${Math.round((row.value / total) * 100)}%` }} />
                    </div>
                  </div>
                )
              })}
              <div className="flex flex-wrap gap-2 mt-4">
                {attendanceRows.map((row) => (
                  <span key={row.label} className="flex items-center gap-1.5 text-xs text-text-base/50">
                    <span className={`w-2.5 h-2.5 rounded-full ${row.color}`} /> {row.label}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-text-base/50">Məlumat yoxdur</p>
          )}
        </div>

        <div className="rounded-neu bg-surface shadow-neu-sm p-5">
          <h3 className="text-base font-semibold mb-4 text-text-base">Qiymət statistikası</h3>
          {gradeReport ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-base">Ümumi qiymətlər</span>
                <span className="text-sm font-medium">{gradeReport.total_records}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-base">Ortalama bal</span>
                <span className="text-sm font-medium">{gradeReport.average_score} / {gradeReport.average_max_score}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-base">Ümumi faiz</span>
                <span className="text-lg font-bold text-primary">{gradeReport.overall_percentage}%</span>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-text-base mb-3">Tələbə üzrə nəticələr</h4>
                {gradeReport.details.slice(0, 10).map((d, i) => (
                  <div key={d.student_id} className="flex items-center justify-between py-2 border-b border-surface-dark/20 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">{i + 1}</span>
                      <span className="text-sm text-text-base">{d.student_name || `Tələbə #${d.student_id}`}</span>
                    </div>
                    <span className="text-sm font-medium">{d.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-text-base/50">Məlumat yoxdur</p>
          )}
        </div>
      </div>
    </div>
  )
}
