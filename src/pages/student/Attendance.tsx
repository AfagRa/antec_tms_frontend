import React, { useState, useMemo, useEffect } from 'react'
import DateRangePicker from '../../components/ui/DateRangePicker'
import NoteCell from '../../components/ui/NoteCell'

type AttendanceStatus = 'Dərsdə' | 'Qaib (üzrsüz)' | 'Gecikdi' | 'Qaib (üzrlü)'

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
    statusLabel: 'Dərsdə',
    minutesLate: 0,
    reason: '',
    teacherNote: 'Tapşırığı tam yerinə yetirib',
  },
  {
    id: '2',
    date: '02.06.2026',
    groupName: 'Python-A1',
    topic: 'Funksiyalar va Return ifadesi',
    statusLabel: 'Qaib (üzrsüz)',
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
    statusLabel: 'Dərsdə',
    minutesLate: 0,
    reason: '',
    teacherNote: 'Tapşırığı tam yerinə yetirib',
  },
  {
    id: '6',
    date: '02.06.2026',
    groupName: 'Python-A1',
    topic: 'Funksiyalar va Return ifadesi',
    statusLabel: 'Dərsdə',
    minutesLate: 0,
    reason: '',
    teacherNote: 'Tapşırığı tam yerinə yetirib',
  },
  {
    id: '7',
    date: '01.06.2026',
    groupName: 'Python-A1',
    topic: 'Giriş dərsi',
    statusLabel: 'Qaib (üzrlü)',
    minutesLate: 0,
    reason: 'Xəstəlik',
    teacherNote: 'Növbəti dərsə hazırlaşsın',
  },
  {
    id: '8',
    date: '01.06.2026',
    groupName: 'Python-A2',
    topic: 'Massivlərlə iş',
    statusLabel: 'Dərsdə',
    minutesLate: 0,
    reason: '',
    teacherNote: 'Aktiv iştirak etdi',
  },
]

export default function StudentAttendance() {
  const [selectedGroup, setSelectedGroup] = useState<string>('Python-A1')
  const [selectedStatus, setSelectedStatus] = useState<string>('Filter')
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
        if (selectedStatus === 'Filter') return true
        if (selectedStatus === 'Dərsdə') return r.statusLabel === 'Dərsdə'
        if (selectedStatus === 'Qaib (üzrlü)') return r.statusLabel === 'Qaib (üzrlü)'
        if (selectedStatus === 'Qaib (üzrsüz)') return r.statusLabel === 'Qaib (üzrsüz)'
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
      case 'Dərsdə':
        return <span className="rounded-full px-2.5 py-0.5 text-xs font-medium shadow-neu-sm bg-green-100 text-green-700">Dərsdə</span>
      case 'Qaib (üzrsüz)':
        return <span className="rounded-full px-2.5 py-0.5 text-xs font-medium shadow-neu-sm bg-red-100 text-red-600">Qaib (üzrsüz)</span>
      case 'Gecikdi':
        return <span className="rounded-full px-2.5 py-0.5 text-xs font-medium shadow-neu-sm bg-amber-100 text-amber-700">Gecikdi</span>
      case 'Qaib (üzrlü)':
        return <span className="rounded-full px-2.5 py-0.5 text-xs font-medium shadow-neu-sm bg-blue-100 text-blue-600">Qaib (üzrlü)</span>
      default:
        return null
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-text-base">
        Davamiyyət Jurnalı
      </h1>

      <div className="rounded-neu bg-surface shadow-neu-sm p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label htmlFor="group-select" className="text-xs font-semibold text-text-base/50 mb-1">
              Qrup
            </label>
            <select
              id="group-select"
              value={selectedGroup}
              onChange={(e) => {
                setSelectedGroup(e.target.value)
                setCurrentPage(1)
              }}
              className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-2 text-sm text-text-base outline-none focus:ring-2 focus:ring-primary/30 h-[38px] cursor-pointer"
            >
              <option value="Python-A1">Python-A1</option>
              <option value="Python-A2">Python-A2</option>
              <option value="Bütün Qruplar">Bütün Qruplar</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="status-select" className="text-xs font-semibold text-text-base/50 mb-1">
              Statusu
            </label>
            <select
              id="status-select"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value)
                setCurrentPage(1)
              }}
              className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-2 text-sm text-text-base outline-none focus:ring-2 focus:ring-primary/30 h-[38px] cursor-pointer"
            >
              <option value="Filter">Hamısı</option>
              <option value="Dərsdə">İştirak edir</option>
              <option value="Qaib (üzrlü)">Qaib (üzrlü)</option>
              <option value="Qaib (üzrsüz)">Qaib (üzrsüz)</option>
              <option value="Gecikdi">Gecikdi</option>
            </select>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-semibold text-text-base/50 mb-1">
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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
        <div className="rounded-neu bg-surface shadow-neu-sm py-4 px-4 flex flex-col justify-between">
          <span className="text-sm font-semibold text-green-600 leading-snug">
            Dərsdə
          </span>
          <span className="text-2xl font-bold text-text-base mt-1">
            18 dərs
          </span>
        </div>

        <div className="rounded-neu bg-surface shadow-neu-sm py-4 px-4 flex flex-col justify-between">
          <span className="text-sm font-semibold text-blue-500 leading-snug">
            Qaib (üzrlü)
          </span>
          <span className="text-2xl font-bold text-text-base mt-1">
            1 dərs
          </span>
        </div>

        <div className="rounded-neu bg-surface shadow-neu-sm py-4 px-4 flex flex-col justify-between">
          <span className="text-sm font-semibold text-red-500 leading-snug">
            Qaib (üzrsüz)
          </span>
          <span className="text-2xl font-bold text-text-base mt-1">
            2 dərs
          </span>
        </div>

        <div className="rounded-neu bg-surface shadow-neu-sm py-4 px-4 flex flex-col justify-between">
          <span className="text-sm font-semibold text-amber-500 leading-snug">
            Gecikdi
          </span>
          <span className="text-2xl font-bold text-text-base mt-1">
            3 dərs
          </span>
        </div>

        <div className="rounded-neu bg-surface shadow-neu-sm py-4 px-4 flex flex-col justify-between col-span-2 md:col-span-1">
          <span className="text-sm font-semibold text-text-base/50 leading-snug">
            Ümumi Davamiyyət Faizi
          </span>
          <span className="text-3xl font-bold text-text-base mt-1">
            85%
          </span>
        </div>
      </div>

      <div className="rounded-neu bg-surface shadow-neu-sm overflow-hidden">
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
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50 px-4 pt-4">
                  Dərs tarixi
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50 px-4 pt-4">
                  Qrup adı
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50 px-4 pt-4">
                  Dərs mövzusu
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50 px-4 pt-4">
                  Status
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50 px-4 pt-4">
                  Gecikma dəqiqəsi
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50 px-4 pt-4">
                  Səbəb
                </th>
                <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-text-base/50 px-4 pt-4">
                  Müəllim qeydi
                </th>
              </tr>
              <tr>
                <td colSpan={7} className="p-0 pb-1">
                  <div className="bg-surface-dark/20 h-px w-full" />
                </td>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map((row, index) => (
                <React.Fragment key={row.id}>
                  <tr>
                    <td className="py-3.5 text-sm text-text-base pr-2 px-4">
                      {row.date}
                    </td>
                    <td className="py-3.5 text-sm text-text-base truncate pr-2 px-4" title={row.groupName}>
                      {row.groupName}
                    </td>
                    <td className="py-3.5 text-sm text-text-base truncate pr-2 px-4" title={row.topic}>
                      {row.topic}
                    </td>
                    <td className="py-3.5 text-sm px-4">
                      {getStatusBadge(row.statusLabel)}
                    </td>
                    <td className="py-3.5 text-sm text-text-base pr-2 px-4">
                      {row.minutesLate > 0 ? `${row.minutesLate} daq` : '—'}
                    </td>
                    <td className="py-3.5 text-sm text-text-base truncate pr-2 px-4" title={row.reason}>
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
                        <div className="bg-surface-dark/20 h-px w-full" />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {paginatedRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-sm text-text-base/50 px-4">
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
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-1.5 text-sm text-text-base shadow-neu-sm hover:shadow-neu-inset-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >›</button>
          </div>
          <span className="text-xs text-text-base/50">
            Nəticə {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredRecords.length)} ({filteredRecords.length})
          </span>
        </div>
      </div>
    </div>
  )
}