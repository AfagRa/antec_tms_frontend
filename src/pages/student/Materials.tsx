import React, { useState, useEffect } from 'react'
import {
  useAcademic, getStudentMaterials,
} from '../../store/academicStore'

const MOCK_STUDENT_ID = 's1'

const typeFilterMap: Record<string, 'Fayl' | 'YouTube' | 'Google Drive' | 'Linklər' | null> = {
  'Hamısı': null,
  'Fayllar': 'Fayl',
  'Linklər': 'Linklər',
  'Videolar': 'YouTube',
  'Google Drive': 'Google Drive',
  'YouTube': 'YouTube',
}

const filterOptions = ['Hamısı', 'Fayllar', 'Linklər', 'Videolar', 'Google Drive', 'YouTube']

export default function StudentMaterials() {
  const allMaterials = getStudentMaterials(MOCK_STUDENT_ID)

  const groupOptions = ['Bütün Qruplar', ...Array.from(new Set(allMaterials.map((m) => m.groupName)))]

  const [selectedGroup, setSelectedGroup] = useState<string>('Bütün Qruplar')
  const [selectedType, setSelectedType] = useState<string>('Hamısı')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const ITEMS_PER_PAGE = 5

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedGroup, selectedType])

  const filteredMaterials = allMaterials
    .filter((m) => selectedGroup === 'Bütün Qruplar' || m.groupName === selectedGroup)
    .filter((m) => selectedType === 'Hamısı' || m.type === typeFilterMap[selectedType])

  const totalPages = Math.max(1, Math.ceil(filteredMaterials.length / ITEMS_PER_PAGE))
  const paginatedMaterials = filteredMaterials.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const handleFirstPage = () => {
    if (currentPage > 1) setCurrentPage(1)
  }

  const handleLastPage = () => {
    if (currentPage < totalPages) setCurrentPage(totalPages)
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-text-base">
        Dərs Materialları
      </h1>

      <div className="rounded-neu bg-surface shadow-neu-sm p-5 mb-5">
        <div className="flex items-end gap-6 flex-wrap">
          <div className="flex flex-col">
            <label htmlFor="group-select" className="text-xs text-text-base/50 mb-1 block font-semibold">
              Group
            </label>
            <select
              id="group-select"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-2 text-sm text-text-base outline-none focus:ring-2 focus:ring-primary/30 w-[180px] h-[38px] cursor-pointer"
            >
              {groupOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-text-base/50 mb-1 block font-semibold">
              Materialın Tipi
            </span>
            <div className="flex items-center gap-2 flex-wrap min-h-[38px]">
              {filterOptions.map((opt) => {
                const isSelected = selectedType === opt
                return (
                  <button
                    key={opt}
                    onClick={() => setSelectedType(opt)}
                    className={
                      isSelected
                        ? 'border-2 border-primary bg-primary/10 text-primary font-medium rounded-full px-4 py-1.5 text-sm transition-all shadow-neu-inset-sm cursor-pointer'
                        : 'border border-surface-dark/20 bg-surface text-text-base/50 rounded-full px-4 py-1.5 text-sm transition-all shadow-neu-sm hover:border-primary hover:text-primary cursor-pointer'
                    }
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-neu bg-surface shadow-neu-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-left">
            <colgroup>
              <col style={{ width: '220px' }} />
              <col style={{ width: '160px' }} />
              <col style={{ width: '150px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '150px' }} />
              <col style={{ width: '120px' }} />
            </colgroup>
            <thead>
              <tr className="text-xs font-semibold text-text-base/50 uppercase tracking-wide">
                <th className="pb-2 px-4 pt-4">Materialın Adı / Başlığı</th>
                <th className="pb-2 px-4 pt-4">Aid Olduğu Dərs / Mövzu</th>
                <th className="pb-2 px-4 pt-4">Paylaşan Müəllim</th>
                <th className="pb-2 px-4 pt-4">Materialın Tipi</th>
                <th className="pb-2 px-4 pt-4">Yüklənmə / Baxış Tarixi</th>
                <th className="pb-2 px-4 pt-4">Keçid / Fəaliyyət</th>
              </tr>
              <tr>
                <td colSpan={6} className="p-0 pb-1">
                  <div className="bg-surface-dark/20 h-px w-full" />
                </td>
              </tr>
            </thead>
            <tbody>
              {paginatedMaterials.map((row, index) => (
                <React.Fragment key={row.id}>
                  <tr>
                    <td className="py-3.5 text-sm text-text-base font-medium whitespace-normal break-words pr-2 px-4">
                      {row.title}
                    </td>
                    <td className="py-3.5 text-sm text-text-base/50 pr-2 px-4">
                      Mövzu: {row.lessonTopic}
                    </td>
                    <td className="py-3.5 text-sm text-text-base pr-2 px-4">
                      {row.teacherName}
                    </td>
                    <td className="py-3.5 text-sm pr-2 px-4">
                      <span className="rounded-md bg-gray-100 text-gray-700 px-2.5 py-1 text-xs font-medium inline-block">
                        {row.type}
                      </span>
                    </td>
                    <td className="py-3.5 text-sm text-text-base/50 pr-2 px-4">
                      {row.uploadDate}
                    </td>
                    <td className="py-3.5 text-sm px-4">
                      {row.type === 'Fayl' || row.type === 'YouTube' ? (
                        <span
                          onClick={() => window.open(row.url, '_blank')}
                          className="text-primary text-sm font-medium hover:underline cursor-pointer"
                        >
                          [Aç / Yüklə]
                        </span>
                      ) : (
                        <span
                          onClick={() => window.open(row.url, '_blank')}
                          className="text-primary text-sm font-medium hover:underline cursor-pointer"
                        >
                          [Bax]
                        </span>
                      )}
                    </td>
                  </tr>
                  {index < paginatedMaterials.length - 1 && (
                    <tr>
                      <td colSpan={6} className="p-0">
                        <div className="bg-surface-dark/20 h-px w-full" />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {paginatedMaterials.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-text-base/50 px-4">
                    Uyğun gələn məlumat tapılmadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-center gap-1 pt-4 pb-4 border-t border-surface-dark/20">
          <button
            onClick={handleFirstPage}
            disabled={currentPage === 1}
            className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-1.5 text-sm text-text-base shadow-neu-sm hover:shadow-neu-inset-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            ◀◀
          </button>

          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-1.5 text-sm text-text-base shadow-neu-sm hover:shadow-neu-inset-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            ◀
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const isActive = p === currentPage
            return isActive ? (
              <button
                key={p}
                className="rounded-neu-sm bg-surface-dark/30 shadow-neu-inset-sm px-3 py-1.5 text-sm font-medium text-primary select-none"
              >
                {p}
              </button>
            ) : (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-1.5 text-sm text-text-base shadow-neu-sm hover:shadow-neu-inset-sm transition-all cursor-pointer"
              >
                {p}
              </button>
            )
          })}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-1.5 text-sm text-text-base shadow-neu-sm hover:shadow-neu-inset-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            ▶
          </button>

          <button
            onClick={handleLastPage}
            disabled={currentPage === totalPages}
            className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-1.5 text-sm text-text-base shadow-neu-sm hover:shadow-neu-inset-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            ▶▶
          </button>
        </div>
      </div>
    </div>
  )
}
