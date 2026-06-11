import React, { useState, useMemo, useEffect } from 'react'
import DateRangePicker from '../../components/ui/DateRangePicker'
import NoteCell from '../../components/ui/NoteCell'

type AttendanceStatus = 'İştirak etdi' | 'Üzrsüz' | 'Gecikdi' | 'Üzrlü'

interface AttendanceRecord {
  id: string;
  date: string;
  groupName: string;
  topic: string;
  statusLabel: AttendanceStatus;
  minutesLate: number;
  reason: string;
  teacherNote: string;
}

const records: AttendanceRecord[] = [
  {
    id: '1',
    date: '02.06.2026',
    groupName: 'Python-A1',
    topic: 'Funksiyalar va Return ifadesi',
    statusLabel: 'İştirak etdi',
    minutesLate: 0,
    reason: '',
    teacherNote: 'Tapşırığı tam yerinə yetirib',
  },
  {
    id: '2',
    date: '02.06.2026',
    groupName: 'Python-A1',
    topic: 'Funksiyalar va Return ifadesi',
    statusLabel: 'Üzrsüz',
    minutesLate: 0,
    reason: '',
    teacherNote: 'Tapşırığı tam yerinə yetirib',
  },
  {
    id: '3',
    date: '02.06.2026',
    groupName: 'Python-A1',
    topic: 'Funksiyalar va Return ifadesi',
    statusLabel: 'Gecikdi',
    minutesLate: 15,
    reason: '',
    teacherNote: 'Tapşırığı tam yerinə yetirib',
  },
  {
    id: '4',
    date: '02.06.2026',
    groupName: 'Python-A1',
    topic: 'Funksiyalar va Return ifadesi',
    statusLabel: 'Gecikdi',
    minutesLate: 15,
    reason: 'Sazrü qayı',
    teacherNote: 'Tapşırığı tam yerinə yetirib',
  },
  {
    id: '5',
    date: '02.06.2026',
    groupName: 'Python-A1',
    topic: 'Funksiyalar va Return ifadesi',
    statusLabel: 'İştirak etdi',
    minutesLate: 0,
    reason: '',
    teacherNote: 'Tapşırığı tam yerinə yetirib',
  },
  {
    id: '6',
    date: '02.06.2026',
    groupName: 'Python-A1',
    topic: 'Funksiyalar va Return ifadesi',
    statusLabel: 'İştirak etdi',
    minutesLate: 0,
    reason: '',
    teacherNote: 'Tapşırığı tam yerinə yetirib',
  },
  {
    id: '7',
    date: '01.06.2026',
    groupName: 'Python-A1',
    topic: 'Giriş dərsi',
    statusLabel: 'Üzrlü',
    minutesLate: 0,
    reason: 'Xəstəlik',
    teacherNote: 'Növbəti dərsə hazırlaşsın',
  },
  {
    id: '8',
    date: '01.06.2026',
    groupName: 'Python-A2',
    topic: 'Massivlərlə iş',
    statusLabel: 'İştirak etdi',
    minutesLate: 0,
    reason: '',
    teacherNote: 'Aktiv iştirak etdi',
  },
]

export default function StudentAttendance() {
  const [selectedGroup, setSelectedGroup] = useState<string>('Python-A1')
  const [selectedStatus, setSelectedStatus] = useState<string>('Tilter')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const ITEMS_PER_PAGE = 6

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedGroup, selectedStatus, startDate, endDate])

  const filteredRecords = useMemo(() => {
    return records
      .filter(r => selectedGroup === 'Bütün Qruplar' || r.groupName === selectedGroup)
      .filter(r => {
        if (selectedStatus === 'Tilter') return true
        if (selectedStatus === 'İştirak etdi') return r.statusLabel === 'İştirak etdi'
        if (selectedStatus === 'Üzrlü qayıb') return r.statusLabel === 'Üzrlü'
        if (selectedStatus === 'Üzrsüz qayıb') return r.statusLabel === 'Üzrsüz'
        if (selectedStatus === 'Gecikdi') return r.statusLabel === 'Gecikdi'
        return true
      })
      .filter(r => {
        if (!startDate && !endDate) return true
        const rowDate = new Date(r.date.split('.').reverse().join('-'))
        const from = startDate ? new Date(startDate) : null
        const to   = endDate   ? new Date(endDate)   : null
        if (from && rowDate < from) return false
        if (to   && rowDate > to)   return false
        return true
      })
  }, [selectedGroup, selectedStatus, startDate, endDate])

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / ITEMS_PER_PAGE))

  const paginatedRecords = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages)
    return filteredRecords.slice(
      (safePage - 1) * ITEMS_PER_PAGE,
      safePage * ITEMS_PER_PAGE
    )
  }, [filteredRecords, currentPage, totalPages])

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (currentPage <= 3) return [1, 2, 3, null, totalPages]
    if (currentPage >= totalPages - 2) return [1, null, totalPages - 2, totalPages - 1, totalPages]
    return [1, null, currentPage - 1, currentPage, currentPage + 1, null, totalPages]
  }

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'İştirak etdi':
        return <span className="neu-badge bg-green-100 text-green-700">İştirak etdi</span>
      case 'Üzrsüz':
        return <span className="neu-badge bg-red-100 text-red-600">Üzrsüz</span>
      case 'Gecikdi':
        return <span className="neu-badge bg-amber-100 text-amber-700">Gecikdi</span>
      case 'Üzrlü':
        return <span className="neu-badge bg-blue-100 text-blue-600">Üzrlü</span>
      default:
        return null
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-lms-student-text">
        Davamiyyət Jurnalı
      </h1>

      {/* FILTER BAR: 3-column grid inside .neu-card mb-5 */}
      <div className="neu-card mb-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Qrup filter */}
          <div className="flex flex-col">
            <label htmlFor="group-select" className="text-xs font-semibold text-lms-student-muted mb-1">
              Qrup
            </label>
            <select
              id="group-select"
              value={selectedGroup}
              onChange={(e) => {
                setSelectedGroup(e.target.value)
                setCurrentPage(1)
              }}
              className="neu-input h-[38px] cursor-pointer"
            >
              <option value="Python-A1">Python-A1</option>
              <option value="Python-A2">Python-A2</option>
              <option value="Bütün Qruplar">Bütün Qruplar</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex flex-col">
            <label htmlFor="status-select" className="text-xs font-semibold text-lms-student-muted mb-1">
              Statusu
            </label>
            <select
              id="status-select"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value)
                setCurrentPage(1)
              }}
              className="neu-input h-[38px] cursor-pointer"
            >
              <option value="Tilter">Tilter</option>
              <option value="İştirak etdi">İştirak etdi</option>
              <option value="Üzrlü qayıb">Üzrlü qayıb</option>
              <option value="Üzrsüz qayıb">Üzrsüz qayıb</option>
              <option value="Gecikdi">Gecikdi</option>
            </select>
          </div>

          {/* Data filter */}
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-lms-student-muted mb-1">
              Data
            </span>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
            />
          </div>
        </div>
      </div>

      {/* STAT CARDS ROW: 5 cards below filter bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
        {/* Card 1 */}
        <div className="neu-card py-4 px-4 flex flex-col justify-between">
          <span className="text-sm font-semibold text-green-600 leading-snug">
            İştirak etdi
          </span>
          <span className="text-2xl font-bold text-lms-student-text mt-1">
            18 dərs
          </span>
        </div>

        {/* Card 2 */}
        <div className="neu-card py-4 px-4 flex flex-col justify-between">
          <span className="text-sm font-semibold text-blue-500 leading-snug">
            Üzrlü qayıb
          </span>
          <span className="text-2xl font-bold text-lms-student-text mt-1">
            1 dərs
          </span>
        </div>

        {/* Card 3 */}
        <div className="neu-card py-4 px-4 flex flex-col justify-between">
          <span className="text-sm font-semibold text-red-500 leading-snug">
            Üzrsüz qayıb
          </span>
          <span className="text-2xl font-bold text-lms-student-text mt-1">
            2 dərs
          </span>
        </div>

        {/* Card 4 */}
        <div className="neu-card py-4 px-4 flex flex-col justify-between">
          <span className="text-sm font-semibold text-amber-500 leading-snug">
            Gecikdi
          </span>
          <span className="text-2xl font-bold text-lms-student-text mt-1">
            3 dərs
          </span>
        </div>

        {/* Card 5 */}
        <div className="neu-card py-4 px-4 flex flex-col justify-between col-span-2 md:col-span-1">
          <span className="text-sm font-semibold text-lms-student-muted leading-snug">
            Ümumi Davamiyyət Faizi
          </span>
          <span className="text-3xl font-bold text-lms-student-text mt-1">
            85%
          </span>
        </div>
      </div>

      {/* MAIN TABLE: inside .neu-card */}
      <div className="neu-card">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-left">
            <colgroup>
              <col style={{ width: '110px' }} />
              <col style={{ width: '110px' }} />
              <col />
              <col style={{ width: '130px' }} />
              <col style={{ width: '140px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '200px' }} />
            </colgroup>
            <thead>
              <tr>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-lms-student-muted">
                  Dərs tarixi
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-lms-student-muted">
                  Qrup adı
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-lms-student-muted">
                  Dərs mövzusu
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-lms-student-muted">
                  Status
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-lms-student-muted">
                  Gecikma dəqiqəsi
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-lms-student-muted">
                  Səbəb
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-lms-student-muted">
                  Müəllim qeydi
                </th>
              </tr>
              <tr>
                <td colSpan={7} className="p-0 pb-1">
                  <div className="bg-lms-student-inset h-px w-full" />
                </td>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map((row, index) => (
                <React.Fragment key={row.id}>
                  <tr>
                    <td className="py-3.5 text-sm text-lms-student-text pr-2">
                      {row.date}
                    </td>
                    <td className="py-3.5 text-sm text-lms-student-text truncate pr-2" title={row.groupName}>
                      {row.groupName}
                    </td>
                    <td className="py-3.5 text-sm text-lms-student-text truncate pr-2" title={row.topic}>
                      {row.topic}
                    </td>
                    <td className="py-3.5 text-sm">
                      {getStatusBadge(row.statusLabel)}
                    </td>
                    <td className="py-3.5 text-sm text-lms-student-text pr-2">
                      {row.minutesLate > 0 ? `${row.minutesLate} daq` : '—'}
                    </td>
                    <td className="py-3.5 text-sm text-lms-student-text truncate pr-2" title={row.reason}>
                      {row.reason ? row.reason : '—'}
                    </td>
                    <td className="py-3 pr-4">
                      <NoteCell
                        note={row.teacherNote}
                        meta={`Dərs: ${row.topic} | ${row.date}`}
                      />
                    </td>
                  </tr>
                  {index < paginatedRecords.length - 1 && (
                    <tr>
                      <td colSpan={7} className="p-0">
                        <div className="bg-lms-student-inset h-px w-full" />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {paginatedRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-sm text-lms-student-muted">
                    Uyğun gələn məlumat tapılmadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION: below table, inside .neu-card */}
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
            Nəticə {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredRecords.length)} ({filteredRecords.length})
          </span>
        </div>
      </div>
    </div>
  )
}
