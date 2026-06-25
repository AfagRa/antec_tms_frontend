import { useState, useEffect, useMemo } from 'react'
import { AlertCircle } from 'lucide-react'
import DateRangePicker from '../../components/ui/DateRangePicker'
import { studentPortalApi } from '../../api/studentPortal'
import type { MyGradeItem, GradeCategory } from '../../types'
import Spinner from '../../components/ui/Spinner'

export default function StudentGrades() {
  const [grades, setGrades] = useState<MyGradeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sorting, setSorting] = useState('Ən yeni')
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    const load = async () => {
      try {
        const data = await studentPortalApi.getGrades()
        setGrades(data)
      } catch {
        setError('Qiymətlər yüklənə bilmədi. Səhifəni yeniləyin.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [retryCount])

  const safePct = (score: number, maxScore: number): number => {
    if (!maxScore || maxScore === 0) return 0
    return Math.round((score / maxScore) * 100)
  }

  const groupOptions = useMemo(
    () => Array.from(new Set(grades.map(g => g.group_name).filter(Boolean))),
    [grades],
  )

  useEffect(() => {
    if (groupOptions.length > 0 && !selectedGroup) {
      setSelectedGroup(groupOptions[0])
    }
  }, [groupOptions, selectedGroup])

  useEffect(() => { setCurrentPage(1) }, [selectedGroup, startDate, endDate, sorting])

  const scores = grades.filter((g) => g.score !== null).map((g) => g.score)
  const stats = {
    count: grades.length,
    avg: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    highest: scores.length ? Math.max(...scores) : 0,
    lowest: scores.length ? Math.min(...scores) : 0,
  }

  const groupGrades = useMemo(
    () => grades.filter(g => g.group_name === selectedGroup),
    [grades, selectedGroup],
  )

  const categoryAvg = (cat: GradeCategory): number | null => {
    const items = groupGrades.filter(g => g.category === cat)
    if (items.length === 0) return null
    const pct = items.map(g => g.max_score ? (g.score / g.max_score) * 100 : 0)
    return pct.reduce((a, b) => a + b, 0) / pct.length
  }

  const yekunQiymet = useMemo(() => {
    const labAvg   = categoryAvg('lab')
    const modulAvg = categoryAvg('modul')
    const finalAvg = categoryAvg('final')
    if (labAvg === null || modulAvg === null || finalAvg === null) return null
    return Math.round((0.5 * labAvg + 0.5 * modulAvg) * 0.6 + finalAvg * 0.4)
  }, [groupGrades])

  const filtered = useMemo(() => {
    return grades
      .filter((r) => {
        if (selectedGroup && r.group_name !== selectedGroup) return false
        const d = new Date(r.lesson_date)
        if (startDate && d < new Date(startDate)) return false
        if (endDate && d > new Date(endDate)) return false
        return true
      })
      .sort((a, b) => {
        const ta = new Date(a.lesson_date).getTime()
        const tb = new Date(b.lesson_date).getTime()
        if (sorting === 'Ən yeni') return tb - ta
        if (sorting === 'Ən köhnə') return ta - tb
        if (sorting === 'Ən yüksək bal') return b.score - a.score
        if (sorting === 'Ən aşağı bal') return a.score - b.score
        return 0
      })
  }, [grades, startDate, endDate, sorting])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

  const getFaizColorClass = (pct: number) => {
    if (pct >= 90) return 'text-green-600 font-medium'
    if (pct >= 70) return 'text-blue-600 font-medium'
    if (pct >= 50) return 'text-amber-600 font-medium'
    return 'text-red-500 font-medium'
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
      <h1 className="text-2xl font-semibold text-text-base">Qiymət Jurnalı</h1>

      <div className="rounded-neu bg-surface shadow-neu-sm p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-text-base/50 mb-1">Qrup</label>
            <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}
              className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-2 text-sm text-text-base outline-none focus:ring-2 focus:ring-primary/30 h-[38px] cursor-pointer w-fit min-w-[120px]">
              {groupOptions.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-text-base/50 mb-1">Tarix aralığı</span>
            <DateRangePicker startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-text-base/50 mb-1">Sıralama</label>
            <select value={sorting} onChange={(e) => setSorting(e.target.value)}
              className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-2 text-sm text-text-base outline-none focus:ring-2 focus:ring-primary/30 h-[38px] cursor-pointer w-fit min-w-[140px]">
              <option value="Ən yeni">Ən yeni</option>
              <option value="Ən köhnə">Ən köhnə</option>
              <option value="Ən yüksək bal">Ən yüksək bal</option>
              <option value="Ən aşağı bal">Ən aşağı bal</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div className="rounded-neu bg-surface shadow-neu-sm p-4 flex flex-col justify-between">
          <span className="text-xs text-text-base/50 mb-1">Ümumi Qiymətlər</span>
          <span className="text-2xl font-bold text-text-base">{stats.count} dərs</span>
        </div>
        <div className="rounded-neu bg-surface shadow-neu-sm p-4 flex flex-col justify-between">
          <span className="text-xs text-text-base/50 mb-1">Yekun Qiymət</span>
          <span className="text-2xl font-bold text-text-base">
            {yekunQiymet !== null ? `${yekunQiymet}%` : '—'}
          </span>
          {yekunQiymet === null && (
            <span className="text-[10px] text-text-base/40 mt-0.5">
              Lab/Modul/Final qiymətləri tam deyil
            </span>
          )}
        </div>
        <div className="rounded-neu bg-surface shadow-neu-sm p-4 flex flex-col justify-between">
          <span className="text-xs text-text-base/50 mb-1">Ən Yüksək Bal</span>
          <span className="text-2xl font-bold text-text-base">{stats.highest}</span>
        </div>
        <div className="rounded-neu bg-surface shadow-neu-sm p-4 flex flex-col justify-between">
          <span className="text-xs text-text-base/50 mb-1">Ən Aşağı Bal</span>
          <span className="text-2xl font-bold text-text-base">{stats.lowest}</span>
        </div>
      </div>

      <div className="rounded-neu bg-surface shadow-neu-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-left">
            <colgroup>
              <col style={{ width: '120px' }} />
              <col />
              <col style={{ width: '80px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '80px' }} />
            </colgroup>
            <thead>
              <tr>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50 px-3 pt-4">Dərs tarixi</th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50 px-3 pt-4">Mövzu</th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50 px-3 pt-4">Bal</th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50 px-3 pt-4">Maksimum</th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50 px-3 pt-4">Faiz(%)</th>
              </tr>
              <tr><td colSpan={5} className="p-0 pb-1"><div className="bg-surface-dark/20 h-px w-full" /></td></tr>
            </thead>
            <tbody>
              {paginated.map((row, index) => {
                const pct = safePct(row.score, row.max_score)
                return (
                  <tr key={row.id || index}>
                  <td className="py-3.5 text-sm text-text-base px-3">{new Date(row.lesson_date).toLocaleDateString('az-AZ')}</td>
                  <td className="py-3.5 text-sm text-text-base truncate px-3">{row.lesson_topic}</td>
                  <td className="py-3.5 text-sm text-text-base px-3">{row.score}</td>
                  <td className="py-3.5 text-sm text-text-base px-3">{row.max_score}</td>
                  <td className={`py-3.5 text-sm px-3 ${getFaizColorClass(pct)}`}>{pct}%</td>
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
          <span className="text-xs text-text-base/50">{filtered.length > 0 ? `Nəticə ${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} (${filtered.length})` : 'Nəticə yoxdur'}</span>
        </div>
      </div>
    </div>
  )
}
