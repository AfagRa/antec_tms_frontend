import { useState, useEffect, useMemo } from 'react'
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import DateRangePicker from '../../components/ui/DateRangePicker'
import { studentPortalApi } from '../../api/studentPortal'
import Spinner from '../../components/ui/Spinner'

export default function StudentGrades() {
  const [grades, setGrades] = useState<any[]>([])
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [finalGrade, setFinalGrade] = useState<number | null>(null)
  const [isEligibleForFinal, setIsEligibleForFinal] = useState(false)
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
        const [response, allLessons] = await Promise.all([
          studentPortalApi.getMyGrades(),
          studentPortalApi.getLessons(),
        ])
        const raw = response.recentGrades ?? response.recent_grades ?? []
        setGrades(Array.isArray(raw) ? raw : [])
        setLessons(Array.isArray(allLessons) ? allLessons : [])
        const fg = response.finalGrade ?? response.final_grade
        setFinalGrade(fg != null ? fg : null)
        setIsEligibleForFinal(response.isEligibleForFinal ?? response.is_eligible_for_final ?? false)
      } catch (err: any) {
        console.error('Grades load error:', err, err?.response?.data)
        setError('Qiymətlər yüklənə bilmədi. Səhifəni yeniləyin.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [retryCount])

  const lessonDateMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const l of lessons) {
      const topic = l.topic ?? l.topic
      const date = l.lessonDate ?? l.lesson_date
      if (topic && date) map.set(topic, date)
    }
    return map
  }, [lessons])

  const getGradeDate = (grade: any): string => {
    const topic = grade.lessonTopic ?? grade.lesson_topic
    return topic ? lessonDateMap.get(topic) ?? '' : ''
  }

  const safePct = (score: number, maxScore: number): number => {
    if (!maxScore || maxScore === 0) return 0
    return Math.round((score / maxScore) * 100)
  }

  useEffect(() => { setCurrentPage(1) }, [startDate, endDate, sorting])

  const scores = grades.filter((g) => g.score != null).map((g) => g.score)
  const stats = {
    count: grades.length,
    avg: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    highest: scores.length ? Math.max(...scores) : 0,
    lowest: scores.length ? Math.min(...scores) : 0,
  }

  const filtered = useMemo(() => {
    return grades
      .filter((r: any) => {
        const d = new Date(getGradeDate(r))
        if (isNaN(d.getTime())) return !startDate && !endDate
        if (startDate && d < new Date(startDate)) return false
        if (endDate && d > new Date(endDate)) return false
        return true
      })
      .sort((a: any, b: any) => {
        if (sorting === 'Ən yüksək bal') return (b.score ?? 0) - (a.score ?? 0)
        if (sorting === 'Ən aşağı bal') return (a.score ?? 0) - (b.score ?? 0)
        const ta = new Date(getGradeDate(a)).getTime()
        const tb = new Date(getGradeDate(b)).getTime()
        if (isNaN(ta) || isNaN(tb)) return isNaN(ta) ? 1 : -1
        if (sorting === 'Ən köhnə') return ta - tb
        return tb - ta
      })
  }, [grades, lessons, startDate, endDate, sorting])

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
      <h1 className="text-2xl font-bold text-text-base">Qiymət Jurnalı</h1>

      <div className="rounded-neu bg-surface shadow-neu-sm p-5 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-text-base/50 mb-1">Tarix aralığı</span>
            <DateRangePicker startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-text-base/50 mb-1">Sıralama</label>
            <select value={sorting} onChange={(e) => setSorting(e.target.value)}
              className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-2 text-sm text-text-base outline-none focus:ring-2 focus:ring-primary/30 h-[38px] cursor-pointer w-full min-w-0">
              <option value="Ən yeni">Ən yeni</option>
              <option value="Ən köhnə">Ən köhnə</option>
              <option value="Ən yüksək bal">Ən yüksək bal</option>
              <option value="Ən aşağı bal">Ən aşağı bal</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        <div className="rounded-neu bg-surface shadow-neu-sm p-4 flex flex-col text-center min-h-[100px]">
          <span className="text-xs text-text-base/50 mb-1">Ümumi Qiymətlər</span>
          <span className="text-2xl font-bold text-text-base">{stats.count} dərs</span>
        </div>
        <div className="rounded-neu bg-surface shadow-neu-sm p-4 flex flex-col text-center min-h-[100px]">
          <span className="text-xs text-text-base/50 mb-1">Yekun Qiymət</span>
          <span className="text-2xl font-bold text-text-base">
            {finalGrade !== null ? `${finalGrade.toFixed(1)}%` : '—'}
          </span>
        </div>
        <div className="rounded-neu bg-surface shadow-neu-sm p-4 flex flex-col text-center min-h-[100px]">
          <span className="text-xs text-text-base/50 mb-1">Ən Yüksək Bal</span>
          <span className="text-2xl font-bold text-text-base">{stats.highest}</span>
        </div>
        <div className="rounded-neu bg-surface shadow-neu-sm p-4 flex flex-col text-center min-h-[100px]">
          <span className="text-xs text-text-base/50 mb-1">Ən Aşağı Bal</span>
          <span className="text-2xl font-bold text-text-base">{stats.lowest}</span>
        </div>
      </div>

      <div className={`text-xs flex items-center gap-1.5 mb-4 ${isEligibleForFinal ? 'text-green-600' : 'text-red-500'}`}>
        {isEligibleForFinal ? <CheckCircle size={14} /> : <XCircle size={14} />}
        {isEligibleForFinal ? 'Final imtahanına buraxılır' : 'Buraxılmır'}
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
              <tr className="bg-surface-dark/20">
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Dərs tarixi</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Mövzu</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Bal</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Maksimum</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Faiz(%)</th>
              </tr>
              <tr><td colSpan={5} className="p-0 pb-1"><div className="bg-surface-dark/20 h-px w-full" /></td></tr>
            </thead>
            <tbody>
              {paginated.map((row: any, index: number) => {
                const topic = row.lessonTopic ?? row.lesson_topic ?? '—'
                const score = row.score ?? 0
                const maxScore = row.maxScore ?? row.max_score ?? 0
                const pct = safePct(score, maxScore)
                const dateStr = (() => {
                  const d = new Date(getGradeDate(row))
                  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('az-AZ')
                })()
                return (
                  <tr key={row.id || index}>
                  <td className="py-3.5 text-sm text-text-base px-3">{dateStr}</td>
                  <td className="py-3.5 text-sm text-text-base truncate px-3">{topic}</td>
                  <td className="py-3.5 text-sm text-text-base px-3">{score}</td>
                  <td className="py-3.5 text-sm text-text-base px-3">{maxScore}</td>
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
