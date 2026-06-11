import React, { useState, useMemo, useEffect } from 'react'
import DateRangePicker from '../../components/ui/DateRangePicker'
import NoteCell from '../../components/ui/NoteCell'
import type { GradeCategory } from '../../types'
import { GRADE_CATEGORY_LABELS, GRADE_CATEGORY_STYLES } from '../../types'

interface GradeRow {
  id: string;
  date: string;
  groupName: string;
  topic: string;
  score: number;
  maxScore: number;
  teacherNote: string;
  category?: GradeCategory;
}

const grades: GradeRow[] = [
  {
    id: '1',
    date: '02.06.2026',
    groupName: 'Python-A1',
    topic: 'Obyekt yönümlü proqramlaşdırma',
    score: 90,
    maxScore: 100,
    teacherNote: 'Layihə işi mükəmməldir',
    category: 'daily',
  },
  {
    id: '2',
    date: '29.05.2026',
    groupName: 'Python-A1',
    topic: 'Funksiyalar va Return ifadası',
    score: 95,
    maxScore: 100,
    teacherNote: 'Super!',
    category: 'homework',
  },
  {
    id: '3',
    date: '22.05.2026',
    groupName: 'Python-A1',
    topic: 'Şərt operatorları (if, else)',
    score: 80,
    maxScore: 100,
    teacherNote: 'Daha çox çalışmaq lazımdır',
    category: 'module',
  },
  {
    id: '4',
    date: '15.05.2026',
    groupName: 'Python-A1',
    topic: 'Dəyişənlər va Malumat Tipləri',
    score: 100,
    maxScore: 100,
    teacherNote: 'Əla nəticə!',
    category: 'final',
  },
]

export default function StudentGrades() {
  const [selectedGroup, setSelectedGroup] = useState<string>('Python-A1')
  const [startDate, setStartDate] = useState('2026-05-01')
  const [endDate, setEndDate] = useState('2026-05-31')
  const [selectedCategory, setSelectedCategory] = useState<GradeCategory | 'all'>('all')
  const [sorting, setSorting] = useState<string>('Ən yeni')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedGroup, startDate, endDate, selectedCategory, sorting])

  const filteredGrades = useMemo(() => {
    return grades
      .filter(r => selectedGroup === 'Hamısı' || r.groupName === selectedGroup)
      .filter(r => {
        if (selectedCategory !== 'all' && r.category !== selectedCategory) return false
        return true
      })
      .filter(r => {
        if (!startDate && !endDate) return true
        const d = new Date(r.date.split('.').reverse().join('-'))
        if (startDate && d < new Date(startDate)) return false
        if (endDate   && d > new Date(endDate))   return false
        return true
      })
      .sort((a, b) => {
        const da = new Date(a.date.split('.').reverse().join('-')).getTime()
        const db = new Date(b.date.split('.').reverse().join('-')).getTime()
        if (sorting === 'Ən yeni') return db - da
        if (sorting === 'Ən köhnə') return da - db
        if (sorting === 'Ən yüksək bal') return b.score - a.score
        if (sorting === 'Ən aşağı bal') return a.score - b.score
        return 0
      })
  }, [selectedGroup, startDate, endDate, selectedCategory, sorting])

  const totalPages = Math.max(1, Math.ceil(filteredGrades.length / ITEMS_PER_PAGE))

  const paginatedGrades = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages)
    return filteredGrades.slice(
      (safePage - 1) * ITEMS_PER_PAGE,
      safePage * ITEMS_PER_PAGE
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
      <h1 className="text-2xl font-semibold text-lms-student-text">
        Qiymət Jurnalı
      </h1>

      {/* FILTER BAR */}
      <div className="neu-card mb-5">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_1fr_1fr] gap-4 items-end">
          <div className="flex flex-col">
            <label htmlFor="group-select" className="text-xs font-semibold text-lms-student-muted mb-1">
              Group
            </label>
            <select
              id="group-select"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="neu-input h-[38px] cursor-pointer"
            >
              <option value="Python-A1">Python-A1</option>
              <option value="Python-A2">Python-A2</option>
              <option value="Hamısı">Hamısı</option>
            </select>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-semibold text-lms-student-muted mb-1">
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
            <label htmlFor="category-select" className="text-xs font-semibold text-lms-student-muted mb-1">
              Kateqoriya
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as GradeCategory | 'all')}
              className="neu-input h-[38px] cursor-pointer"
            >
              <option value="all">Bütün kateqoriyalar</option>
              {Object.entries(GRADE_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="sort-select" className="text-xs font-semibold text-lms-student-muted mb-1">
              Sorting
            </label>
            <select
              id="sort-select"
              value={sorting}
              onChange={(e) => setSorting(e.target.value)}
              className="neu-input h-[38px] cursor-pointer"
            >
              <option value="Ən yeni">Ən yeni</option>
              <option value="Ən köhnə">Ən köhnə</option>
              <option value="Ən yüksək bal">Ən yüksək bal</option>
              <option value="Ən aşağı bal">Ən aşağı bal</option>
            </select>
          </div>
        </div>
      </div>

      {/* STAT CARDS ROW: 4 cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div className="neu-card p-4 flex flex-col justify-between">
          <span className="text-xs text-lms-student-muted mb-1 leading-snug">
            Ümumi Qiymətləndirilmiş Dərslər
          </span>
          <span className="text-2xl font-bold text-lms-student-text">
            15 dərs
          </span>
        </div>
        <div className="neu-card p-4 flex flex-col justify-between">
          <span className="text-xs text-lms-student-muted mb-1 leading-snug">
            Ortalama Faiz Balı (%)
          </span>
          <span className="text-2xl font-bold text-lms-student-text">
            88%
          </span>
        </div>
        <div className="neu-card p-4 flex flex-col justify-between">
          <span className="text-xs text-lms-student-muted mb-1 leading-snug">
            Ən Yüksək Bal
          </span>
          <span className="text-2xl font-bold text-lms-student-text">
            100
          </span>
        </div>
        <div className="neu-card p-4 flex flex-col justify-between">
          <span className="text-xs text-lms-student-muted mb-1 leading-snug">
            Ən Aşağı Bal
          </span>
          <span className="text-2xl font-bold text-lms-student-text">
            70
          </span>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="neu-card">
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
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-lms-student-muted">
                  Dərs tarixi
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-lms-student-muted">
                  Group Name
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-lms-student-muted">
                  Kateqoriya
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-lms-student-muted">
                  Lesson Topic
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-lms-student-muted">
                  Bal
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-lms-student-muted">
                  Maksimum bal
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-lms-student-muted">
                  Faiz (%)
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-lms-student-muted">
                  Müəllim qeydi
                </th>
              </tr>
              <tr>
                <td colSpan={8} className="p-0 pb-1">
                  <div className="bg-lms-student-inset h-px w-full" />
                </td>
              </tr>
            </thead>
            <tbody>
              {paginatedGrades.map((row, index) => {
                const faiz = Math.round((row.score / row.maxScore) * 100)
                return (
                  <React.Fragment key={row.id}>
                    <tr>
                      <td className="py-3.5 text-sm text-lms-student-text pr-2">
                        {row.date}
                      </td>
                      <td className="py-3.5 text-sm text-lms-student-text truncate pr-2" title={row.groupName}>
                        {row.groupName}
                      </td>
                      <td className="py-3 pr-4">
                        {row.category ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium neu-badge ${GRADE_CATEGORY_STYLES[row.category]}`}>
                            {GRADE_CATEGORY_LABELS[row.category]}
                          </span>
                        ) : (
                          <span className="text-lms-student-muted text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3.5 text-sm text-lms-student-text truncate pr-2" title={row.topic}>
                        {row.topic}
                      </td>
                      <td className="py-3.5 text-sm text-lms-student-text pr-2">
                        {row.score}
                      </td>
                      <td className="py-3.5 text-sm text-lms-student-text pr-2">
                        {row.maxScore}
                      </td>
                      <td className={`py-3.5 text-sm pr-2 ${getFaizColorClass(faiz)}`}>
                        {faiz}%
                      </td>
                      <td className="py-3 pr-4">
                        <NoteCell
                          note={row.teacherNote}
                          meta={`${row.topic} | ${row.date}`}
                        />
                      </td>
                    </tr>
                    {index < paginatedGrades.length - 1 && (
                      <tr>
                        <td colSpan={8} className="p-0">
                          <div className="bg-lms-student-inset h-px w-full" />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
              {paginatedGrades.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-sm text-lms-student-muted">
                    Uyğun gələn məlumat tapılmadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-lms-student-inset">
          <div />
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`neu-btn-primary px-3 py-1.5 ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
            >‹</button>

            {getPageNumbers().map((page, idx) =>
              page === null ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-lms-student-muted">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page as number)}
                  className={
                    currentPage === page
                      ? 'neu-card-inset !px-3 !py-1.5 !rounded-lg text-lms-student-accent font-medium select-none text-sm'
                      : 'neu-btn-primary px-3 py-1.5 text-sm'
                  }
                >{page}</button>
              )
            )}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`neu-btn-primary px-3 py-1.5 ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : ''}`}
            >›</button>
          </div>
          <span className="text-xs text-lms-student-muted">
            Nəticə {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredGrades.length)} ({filteredGrades.length})
          </span>
        </div>
      </div>
    </div>
  )
}
