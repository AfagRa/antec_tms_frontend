import React, { useState, useMemo, useEffect } from 'react'
import DateRangePicker from '../../components/ui/DateRangePicker'
import NoteCell from '../../components/ui/NoteCell'
import type { GradeCategory } from '../../types'
import { GRADE_CATEGORY_LABELS, GRADE_CATEGORY_STYLES } from '../../types'
import { useAuth } from '../../hooks/useAuth'
import {
  useAcademic, getStudentGrades, resolveStudentId,
} from '../../store/academicStore'

export default function StudentGrades() {
  const { state } = useAcademic()
  const { user } = useAuth()
  const studentId = resolveStudentId(user?.id)

  const allGrades = useMemo(
    () => getStudentGrades(state, studentId)
      .map((g) => ({ ...g, percent: Math.round((g.score ?? 0) / g.maxScore * 100) })),
    [state.grades],
  )

  const groupOptions = useMemo(
    () => ['Hamısı', ...Array.from(new Set(allGrades.map((g) => g.groupName)))],
    [allGrades],
  )

  const [selectedGroup, setSelectedGroup] = useState<string>('Hamısı')
  const [startDate, setStartDate] = useState('2026-05-01')
  const [endDate, setEndDate] = useState('2026-05-31')
  const [selectedCategory, setSelectedCategory] = useState<GradeCategory | 'all'>('all')
  const [sorting, setSorting] = useState<string>('Ən yeni')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedGroup, startDate, endDate, selectedCategory, sorting])

  const scores = allGrades.filter((g) => g.score !== null).map((g) => g.score as number)
  const stats = {
    count:   allGrades.length,
    avg:     scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    highest: scores.length ? Math.max(...scores) : 0,
    lowest:  scores.length ? Math.min(...scores) : 0,
  }

  const filteredGrades = useMemo(() => {
    return allGrades
      .filter((r) => selectedGroup === 'Hamısı' || r.groupName === selectedGroup)
      .filter((r) => {
        if (selectedCategory !== 'all' && r.category !== selectedCategory) return false
        return true
      })
      .filter((r) => {
        if (!startDate && !endDate) return true
        const d = new Date(r.lessonDate.split('.').reverse().join('-'))
        if (startDate && d < new Date(startDate)) return false
        if (endDate && d > new Date(endDate)) return false
        return true
      })
      .sort((a, b) => {
        const da = new Date(a.lessonDate.split('.').reverse().join('-')).getTime()
        const db = new Date(b.lessonDate.split('.').reverse().join('-')).getTime()
        if (sorting === 'Ən yeni') return db - da
        if (sorting === 'Ən köhnə') return da - db
        if (sorting === 'Ən yüksək bal') return (b.score ?? 0) - (a.score ?? 0)
        if (sorting === 'Ən aşağı bal') return (a.score ?? 0) - (b.score ?? 0)
        return 0
      })
  }, [allGrades, selectedGroup, startDate, endDate, selectedCategory, sorting])

  const totalPages = Math.max(1, Math.ceil(filteredGrades.length / ITEMS_PER_PAGE))

  const paginatedGrades = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages)
    return filteredGrades.slice(
      (safePage - 1) * ITEMS_PER_PAGE,
      safePage * ITEMS_PER_PAGE,
    )
  }, [filteredGrades, currentPage, totalPages])

  const getFaizColorClass = (percent: number): string => {
    if (percent >= 90) return 'text-green-600 font-medium'
    if (percent >= 70) return 'text-blue-600 font-medium'
    if (percent >= 50) return 'text-amber-600 font-medium'
    return 'text-red-500 font-medium'
  }

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (currentPage <= 3) return [1, 2, 3, null, totalPages]
    if (currentPage >= totalPages - 2) return [1, null, totalPages - 2, totalPages - 1, totalPages]
    return [1, null, currentPage - 1, currentPage, currentPage + 1, null, totalPages]
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-text-base">
        Qiymət Jurnalı
      </h1>

      <div className="rounded-neu bg-surface shadow-neu-sm p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_1fr_1fr] gap-4 items-end">
          <div className="flex flex-col">
            <label htmlFor="group-select" className="text-xs font-semibold text-text-base/50 mb-1">
              Group
            </label>
            <select
              id="group-select"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-2 text-sm text-text-base outline-none focus:ring-2 focus:ring-primary/30 h-[38px] cursor-pointer"
            >
              {groupOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-semibold text-text-base/50 mb-1">
              Tarix aralığı
            </span>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="category-select" className="text-xs font-semibold text-text-base/50 mb-1">
              Kateqoriya
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as GradeCategory | 'all')}
              className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-2 text-sm text-text-base outline-none focus:ring-2 focus:ring-primary/30 h-[38px] cursor-pointer"
            >
              <option value="all">Bütün kateqoriyalar</option>
              {Object.entries(GRADE_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="sort-select" className="text-xs font-semibold text-text-base/50 mb-1">
              Sıralama
            </label>
            <select
              id="sort-select"
              value={sorting}
              onChange={(e) => setSorting(e.target.value)}
              className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-2 text-sm text-text-base outline-none focus:ring-2 focus:ring-primary/30 h-[38px] cursor-pointer"
            >
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
          <span className="text-xs text-text-base/50 mb-1 leading-snug">
            Ümumi Qiymətləndirilmiş Dərslər
          </span>
          <span className="text-2xl font-bold text-text-base">
            {stats.count} dərs
          </span>
        </div>
        <div className="rounded-neu bg-surface shadow-neu-sm p-4 flex flex-col justify-between">
          <span className="text-xs text-text-base/50 mb-1 leading-snug">
            Ortalama Faiz Balı (%)
          </span>
          <span className="text-2xl font-bold text-text-base">
            {stats.avg}%
          </span>
        </div>
        <div className="rounded-neu bg-surface shadow-neu-sm p-4 flex flex-col justify-between">
          <span className="text-xs text-text-base/50 mb-1 leading-snug">
            Ən Yüksək Bal
          </span>
          <span className="text-2xl font-bold text-text-base">
            {stats.highest}
          </span>
        </div>
        <div className="rounded-neu bg-surface shadow-neu-sm p-4 flex flex-col justify-between">
          <span className="text-xs text-text-base/50 mb-1 leading-snug">
            Ən Aşağı Bal
          </span>
          <span className="text-2xl font-bold text-text-base">
            {stats.lowest}
          </span>
        </div>
      </div>

      <div className="rounded-neu bg-surface shadow-neu-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-left">
            <colgroup>
              <col style={{ width: '110px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '130px' }} />
              <col />
              <col style={{ width: '70px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '80px' }} />
              <col style={{ width: '180px' }} />
            </colgroup>
            <thead>
              <tr>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50 px-4 pt-4">
                  Dərs tarixi
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50 px-4 pt-4">
                  Group Name
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50 px-4 pt-4">
                  Kateqoriya
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50 px-4 pt-4">
                  Lesson Topic
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50 px-4 pt-4">
                  Bal
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50 px-4 pt-4">
                  Maksimum bal
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50 px-4 pt-4">
                  Faiz (%)
                </th>
                {/* HIDDEN: müəllim qeydi column — kept for future use */}
                <th className="hidden pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50 px-4 pt-4">
                  Müəllim qeydi
                </th>
              </tr>
              <tr>
                <td colSpan={8} className="p-0 pb-1">
                  <div className="bg-surface-dark/20 h-px w-full" />
                </td>
              </tr>
            </thead>
            <tbody>
              {paginatedGrades.map((row, index) => (
                <React.Fragment key={row.lessonId + row.studentId}>
                  <tr>
                    <td className="py-3.5 text-sm text-text-base pr-2 px-4">
                      {row.lessonDate}
                    </td>
                    <td className="py-3.5 text-sm text-text-base truncate pr-2 px-4" title={row.groupName}>
                      {row.groupName}
                    </td>
                    <td className="py-3 pr-4">
                      {row.category ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-neu-sm ${GRADE_CATEGORY_STYLES[row.category]}`}>
                          {GRADE_CATEGORY_LABELS[row.category]}
                        </span>
                      ) : (
                        <span className="text-text-base/50 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3.5 text-sm text-text-base truncate pr-2 px-4" title={row.lessonTopic}>
                      {row.lessonTopic}
                    </td>
                    <td className="py-3.5 text-sm text-text-base pr-2 px-4">
                      {row.score ?? '—'}
                    </td>
                    <td className="py-3.5 text-sm text-text-base pr-2 px-4">
                      {row.maxScore}
                    </td>
                    <td className={`py-3.5 text-sm pr-2 px-4 ${getFaizColorClass(row.percent)}`}>
                      {row.percent}%
                    </td>
                    {/* HIDDEN: müəllim qeydi — kept for future use */}
                    <td className="hidden py-3 pr-4">
                      <NoteCell
                        note={row.teacherNote}
                        meta={`${row.lessonTopic} | ${row.lessonDate}`}
                      />
                    </td>
                  </tr>
                  {index < paginatedGrades.length - 1 && (
                    <tr>
                      <td colSpan={8} className="p-0">
                        <div className="bg-surface-dark/20 h-px w-full" />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {paginatedGrades.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-sm text-text-base/50 px-4">
                    Uyğun gələn məlumat tapılmadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 pb-4 pt-4 border-t border-surface-dark/20">
          <div />
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-1.5 text-sm text-text-base shadow-neu-sm hover:shadow-neu-inset-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >‹</button>

            {getPageNumbers().map((page, idx) =>
              page === null ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-text-base/50">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page as number)}
                  className={
                    currentPage === page
                      ? 'rounded-neu-sm bg-surface-dark/30 shadow-neu-inset-sm px-3 py-1.5 text-sm font-medium text-primary select-none'
                      : 'rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-1.5 text-sm text-text-base shadow-neu-sm hover:shadow-neu-inset-sm transition-all cursor-pointer'
                  }
                >{page}</button>
              )
            )}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-1.5 text-sm text-text-base shadow-neu-sm hover:shadow-neu-inset-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >›</button>
          </div>
          <span className="text-xs text-text-base/50">
            Nəticə {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredGrades.length)} ({filteredGrades.length})
          </span>
        </div>
      </div>
    </div>
  )
}
