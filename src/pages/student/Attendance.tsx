import { useState, useEffect, useMemo } from 'react'
import DateRangePicker from '../../components/ui/DateRangePicker'
import { studentPortalApi } from '../../api/studentPortal'
import type { MyAttendanceItem } from '../../types'
import Spinner from '../../components/ui/Spinner'

const STATUS_LABELS: Record<string, string> = {
  present: 'İştirak edib',
  late: 'Gecikdi',
  absent_excused: 'Qaib (üzrlü)',
  absent_unexcused: 'Qaib (üzrsüz)',
}

const STATUS_OPTIONS = ['Hamısı', 'İştirak edib', 'Qaib (üzrlü)', 'Qaib (üzrsüz)', 'Gecikdi']

export default function StudentAttendance() {
  const [records, setRecords] = useState<MyAttendanceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState('Hamısı')
  const [selectedStatus, setSelectedStatus] = useState('Hamısı')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 6

  useEffect(() => {
    const load = async () => {
      try {
        const data = await studentPortalApi.getAttendance()
        setRecords(data.sort((a, b) => new Date(b.lesson_date).getTime() - new Date(a.lesson_date).getTime()))
      } catch (err) {
        console.warn('Failed to load attendance', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const groupOptions = useMemo(
    () => ['Hamısı', ...Array.from(new Set(records.map(r => r.group_name).filter(Boolean)))],
    [records],
  )

  useEffect(() => { setCurrentPage(1) }, [selectedGroup, selectedStatus, startDate, endDate])

  const summaryStats = useMemo(() => {
    const present = records.filter((a) => a.status === 'present').length
    const excused = records.filter((a) => a.status === 'absent_excused').length
    const unexcused = records.filter((a) => a.status === 'absent_unexcused').length
    const late = records.filter((a) => a.status === 'late').length
    const total = records.length
    const pct = total > 0 ? Math.round(((present + late) / total) * 100) : 0
    return { present, excused, unexcused, late, total, pct }
  }, [records])

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (selectedGroup !== 'Hamısı' && r.group_name !== selectedGroup) return false
      if (selectedStatus !== 'Hamısı' && STATUS_LABELS[r.status] !== selectedStatus) return false
      const d = new Date(r.lesson_date)
      if (startDate && d < new Date(startDate)) return false
      if (endDate && d > new Date(endDate)) return false
      return true
    })
  }, [records, selectedGroup, selectedStatus, startDate, endDate])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      present: 'bg-green-100 text-green-700',
      absent_unexcused: 'bg-red-100 text-red-600',
      late: 'bg-amber-100 text-amber-700',
      absent_excused: 'bg-blue-100 text-blue-600',
    }
    return (
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium shadow-neu-sm ${map[status] || ''}`}>
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

  if (loading) return <Spinner />

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-text-base">Davamiyyət Jurnalı</h1>

      <div className="rounded-neu bg-surface shadow-neu-sm p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-text-base/50 mb-1">Qrup</label>
            <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}
              className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-2 text-sm text-text-base outline-none focus:ring-2 focus:ring-primary/30 h-[38px] cursor-pointer w-fit min-w-[120px]">
              {groupOptions.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-text-base/50 mb-1">Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-2 text-sm text-text-base outline-none focus:ring-2 focus:ring-primary/30 h-[38px] cursor-pointer w-fit min-w-[110px]">
              {STATUS_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="flex flex-col md:col-span-2">
            <span className="text-xs font-semibold text-text-base/50 mb-1">Tarix</span>
            <DateRangePicker startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
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
          <span className="text-3xl font-bold text-text-base mt-1">{summaryStats.pct}%</span>
        </div>
      </div>

      <div className="rounded-neu bg-surface shadow-neu-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-left">
            <colgroup>
              <col style={{ width: '120px' }} />
              <col />
              <col style={{ width: '130px' }} />
              <col style={{ width: '100px' }} />
            </colgroup>
            <thead>
              <tr>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50 px-3 pt-4">Dərs tarixi</th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50 px-3 pt-4">Mövzu</th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50 px-3 pt-4">Status</th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50 px-3 pt-4">Gecikmə</th>
              </tr>
              <tr><td colSpan={4} className="p-0 pb-1"><div className="bg-surface-dark/20 h-px w-full" /></td></tr>
            </thead>
            <tbody>
              {paginated.map((row, index) => (
                <tr key={row.id || index}>
                  <td className="py-3.5 text-sm text-text-base px-3">{new Date(row.lesson_date).toLocaleDateString('az-AZ')}</td>
                  <td className="py-3.5 text-sm text-text-base truncate px-3">{row.lesson_topic}</td>
                  <td className="py-3.5 px-3">{getStatusBadge(row.status)}</td>
                  <td className="py-3.5 text-sm text-text-base px-3">{row.minutes_late ? `${row.minutes_late} dəq` : '—'}</td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={4} className="py-6 text-center text-sm text-text-base/50 px-3">Məlumat tapılmadı.</td></tr>
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
          <span className="text-xs text-text-base/50">Nəticə {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} ({filtered.length})</span>
        </div>
      </div>
    </div>
  )
}
