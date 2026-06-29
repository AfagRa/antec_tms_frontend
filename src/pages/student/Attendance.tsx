import { useState, useEffect, useMemo } from 'react'
import { AlertCircle } from 'lucide-react'
import DateRangePicker from '../../components/ui/DateRangePicker'
import { studentPortalApi } from '../../api/studentPortal'
import Spinner from '../../components/ui/Spinner'

const STATUS_LABELS: Record<string, string> = {
  Present: 'İştirak edib',
  Late: 'Gecikib',
  AbsentExcused: 'Üzürlü qaib',
  AbsentUnexcused: 'Üzrsüz qaib',
  present: 'İştirak edib',
  late: 'Gecikib',
  absent_excused: 'Üzürlü qaib',
  absent_unexcused: 'Üzrsüz qaib',
}

const STATUS_OPTIONS = ['Hamısı', 'İştirak edib', 'Gecikib', 'Üzürlü qaib', 'Üzrsüz qaib']

export default function StudentAttendance() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [selectedGroup, setSelectedGroup] = useState('Hamısı')
  const [selectedStatus, setSelectedStatus] = useState('Hamısı')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 6
  const [attSummary, setAttSummary] = useState({ present_count: 0, excused_count: 0, absent_count: 0, late_count: 0, percentage: 0 })
  const [groupOptions, setGroupOptions] = useState<string[]>(['Hamısı'])
  const [lessons, setLessons] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const [response, groups, allLessons] = await Promise.all([
          studentPortalApi.getAttendanceJournal(),
          studentPortalApi.getMyGroups(),
          studentPortalApi.getLessons(),
        ])
        const sorted = [...response.items].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setRecords(sorted)
        setAttSummary({
          present_count: response.present_count,
          excused_count: response.excused_count,
          absent_count: response.absent_count,
          late_count: response.late_count,
          percentage: response.percentage,
        })
        setGroupOptions(['Hamısı', ...groups.map((g: any) => g.name)])
        setLessons(allLessons)
      } catch (err) {
        console.warn('Failed to load attendance', err)
        setError('Davamiyyət məlumatları yüklənə bilmədi. Səhifəni yeniləyin.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [retryCount])

  useEffect(() => { setCurrentPage(1) }, [selectedGroup, selectedStatus, startDate, endDate])

  const groupFilteredRecords = useMemo(() => {
    if (selectedGroup === 'Hamısı') return records
    const groupLessonDates = new Set(
      lessons
        .filter(l => l.group_name === selectedGroup)
        .map(l => {
          const d = new Date(l.lesson_date)
          return isNaN(d.getTime()) ? '' : d.toDateString()
        })
        .filter(Boolean)
    )
    if (groupLessonDates.size === 0) return records
    return records.filter(r => {
      const d = new Date(r.created_at)
      return groupLessonDates.has(d.toDateString())
    })
  }, [records, lessons, selectedGroup])

  const computedSummary = useMemo(() => {
    if (selectedGroup === 'Hamısı') return null
    const items = groupFilteredRecords
    const count = (statuses: string[]) => items.filter((r: any) => statuses.some(s => r.status === s)).length
    const present = count(['Present', 'present'])
    const excused = count(['AbsentExcused', 'absent_excused'])
    const absent = count(['AbsentUnexcused', 'absent_unexcused'])
    const late = count(['Late', 'late'])
    const total = present + excused + absent + late
    const pct = total > 0 ? Math.round(((present + late) / total) * 100) : 0
    return { present, excused, unexcused: absent, late, total, pct }
  }, [selectedGroup, groupFilteredRecords])

  const summaryStats = useMemo(() => {
    if (computedSummary) return computedSummary
    return {
      present: attSummary.present_count,
      excused: attSummary.excused_count,
      unexcused: attSummary.absent_count,
      late: attSummary.late_count,
      total: attSummary.present_count + attSummary.excused_count + attSummary.absent_count + attSummary.late_count,
      pct: attSummary.percentage,
    }
  }, [computedSummary, attSummary])

  const baseRecords = selectedGroup === 'Hamısı' ? records : groupFilteredRecords

  const filtered = useMemo(() => {
    return baseRecords.filter((r) => {
      if (selectedStatus !== 'Hamısı' && STATUS_LABELS[r.status] !== selectedStatus) return false
      const d = new Date(r.created_at)
      if (startDate && d < new Date(startDate)) return false
      if (endDate && d > new Date(endDate)) return false
      return true
    })
  }, [baseRecords, selectedStatus, startDate, endDate])

  const deduped = useMemo(() => {
    const seen = new Set<string>()
    return filtered.filter(r => {
      const d = new Date(r.created_at)
      if (isNaN(d.getTime())) return true
      const ds = d.toDateString()
      const lessonOnDay = lessons.find(l => {
        const ld = new Date(l.lesson_date)
        return !isNaN(ld.getTime()) && ld.toDateString() === ds
      })
      const key = `${ds}_${lessonOnDay?.topic ?? ''}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [filtered, lessons])

  const totalPages = Math.max(1, Math.ceil(deduped.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = deduped.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      Present: 'bg-success/10 text-success',
      Late: 'bg-primary/10 text-primary',
      AbsentExcused: 'bg-surface-dark/40 text-text-base',
      AbsentUnexcused: 'bg-danger/10 text-danger',
      present: 'bg-success/10 text-success',
      late: 'bg-primary/10 text-primary',
      absent_excused: 'bg-surface-dark/40 text-text-base',
      absent_unexcused: 'bg-danger/10 text-danger',
    }
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-bold tracking-wide ${map[status] || ''}`}>
        {STATUS_LABELS[status] || status}
      </span>
    )
  }

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (currentPage <= 3) return [1, 2, 3, null, totalPages]
    if (currentPage >= totalPages - 2) return [1, null, totalPages - 2, totalPages - 1, totalPages]
    return [1, null, currentPage - 1, currentPage, currentPage + 1, null, totalPages]
  }

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <AlertCircle size={32} className="text-danger" />
      <p className="text-sm text-text-base/70">{error}</p>
      <button
        onClick={() => { setError(''); setLoading(true); setRetryCount(c => c + 1) }}
        className="text-sm text-primary hover:underline"
      >
        Yenidən cəhd et
      </button>
    </div>
  )

  if (loading) return <Spinner />

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-text-base">Davamiyyət Jurnalı</h1>

      <div className="rounded-neu bg-surface shadow-neu-sm p-5 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-text-base/50 mb-1">Qrup</label>
            <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}
              className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-2 text-sm text-text-base outline-none focus:ring-2 focus:ring-primary/30 h-[38px] cursor-pointer w-full min-w-0">
              {groupOptions.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-text-base/50 mb-1">Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-2 text-sm text-text-base outline-none focus:ring-2 focus:ring-primary/30 h-[38px] cursor-pointer w-full min-w-0">
              {STATUS_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="flex flex-col sm:col-span-2 md:col-span-2">
            <span className="text-xs font-semibold text-text-base/50 mb-1">Tarix</span>
            <DateRangePicker startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-5">
        <div className="rounded-neu bg-surface shadow-neu-sm py-4 px-4 flex flex-col justify-between">
          <span className="text-sm font-semibold text-green-600">İştirak edib</span>
          <span className="text-2xl font-bold text-text-base mt-1">{summaryStats.present} dərs</span>
        </div>
        <div className="rounded-neu bg-surface shadow-neu-sm py-4 px-4 flex flex-col justify-between">
          <span className="text-sm font-semibold text-blue-500">Qaib (üzrlü)</span>
          <span className="text-2xl font-bold text-text-base mt-1">{summaryStats.excused} dərs</span>
        </div>
        <div className="rounded-neu bg-surface shadow-neu-sm py-4 px-4 flex flex-col justify-between">
          <span className="text-sm font-semibold text-red-500">Qaib (üzrsüz)</span>
          <span className="text-2xl font-bold text-text-base mt-1">{summaryStats.unexcused} dərs</span>
        </div>
        <div className="rounded-neu bg-surface shadow-neu-sm py-4 px-4 flex flex-col justify-between">
          <span className="text-sm font-semibold text-amber-500">Gecikdi</span>
          <span className="text-2xl font-bold text-text-base mt-1">{summaryStats.late} dərs</span>
        </div>
        <div className="rounded-neu bg-surface shadow-neu-sm py-4 px-4 flex flex-col justify-between col-span-2 md:col-span-1">
          <span className="text-sm font-semibold text-text-base/50">Ümumi Davamiyyət Faizi</span>
          <span className="text-3xl font-bold text-text-base mt-1">{summaryStats.pct.toFixed(1)}%</span>
        </div>
      </div>

      <div className="rounded-neu bg-surface shadow-neu-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse text-left">
              <colgroup>
                <col style={{ width: '120px' }} />
                <col style={{ width: '130px' }} />
                <col style={{ width: '180px' }} />
                <col style={{ width: '140px' }} />
                <col style={{ width: '100px' }} />
              </colgroup>
              <thead>
              <tr className="bg-surface-dark/20">
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Dərs tarixi</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Qrup</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Mövzu</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Gecikmə</th>
              </tr>
                <tr><td colSpan={5} className="p-0 pb-1"><div className="bg-surface-dark/20 h-px w-full" /></td></tr>
              </thead>
              <tbody>
                {paginated.map((row, index) => {
                  const d = new Date(row.created_at)
                  const dateStr = isNaN(d.getTime()) ? '—' : d.toLocaleDateString('az-AZ')
                  const lessonOnDay = lessons.find(l => {
                    const ld = new Date(l.lesson_date)
                    return !isNaN(ld.getTime()) && ld.toDateString() === d.toDateString()
                  })
                  return (
                    <tr key={row.id || index}>
                      <td className="py-3.5 text-sm text-text-base px-4 whitespace-nowrap">{dateStr}</td>
                      <td className="py-3.5 text-sm text-text-base truncate px-4">{lessonOnDay?.group_name ?? '—'}</td>
                      <td className="py-3.5 text-sm text-text-base truncate px-4">{lessonOnDay?.topic ?? '—'}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(row.status)}</td>
                      <td className="py-3.5 text-sm text-text-base px-4 whitespace-nowrap">{row.minutes_late != null ? `${row.minutes_late} dəq` : '—'}</td>
                    </tr>
                  )
                })}
              {paginated.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-sm text-text-base/50 px-3">Məlumat tapılmadı.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 pb-4 pt-4 border-t border-surface-dark/20">
          <div />
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-1.5 text-sm text-text-base shadow-neu-sm hover:shadow-neu-inset-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">‹</button>
            {getPageNumbers().map((page, idx) =>
              page === null ? <span key={`e-${idx}`} className="px-2 text-text-base/50">...</span>
                : <button key={page} onClick={() => setCurrentPage(page as number)}
                    className={currentPage === page
                      ? 'rounded-neu-sm bg-surface-dark/30 shadow-neu-inset-sm px-3 py-1.5 text-sm font-medium text-primary select-none'
                      : 'rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-1.5 text-sm text-text-base shadow-neu-sm hover:shadow-neu-inset-sm transition-all cursor-pointer'}>{page}</button>
            )}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-1.5 text-sm text-text-base shadow-neu-sm hover:shadow-neu-inset-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">›</button>
          </div>
          <span className="text-xs text-text-base/50">
            {deduped.length === 0
              ? 'Nəticə tapılmadı'
              : `Nəticə ${(safePage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(safePage * ITEMS_PER_PAGE, deduped.length)} (${deduped.length})`}
          </span>
        </div>
      </div>
    </div>
  )
}
