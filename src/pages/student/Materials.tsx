import React, { useState, useEffect } from 'react'

interface MaterialRow {
  id: string;
  title: string;
  topic: string;
  groupName: string;
  teacherName: string;
  type: 'Fayl' | 'YouTube' | 'Google Drive' | 'Linklər';
  uploadDate: string;
  url: string;
}

const materials: MaterialRow[] = [
  {
    id: '1',
    title: 'Dərs 05 - OOP Prinsipləri və İrsi Keçmə',
    topic: 'Python-A1',
    groupName: 'Python-A1',
    teacherName: 'Aahan Hakrın Aman',
    type: 'Fayl',
    uploadDate: '04.06.2026',
    url: '#',
  },
  {
    id: '2',
    title: 'Dərs 04 - OOP Prinsipləri və İri Keçmə',
    topic: 'Python-A1',
    groupName: 'Python-A1',
    teacherName: 'Barian HakarMak',
    type: 'YouTube',
    uploadDate: '04.06.2026',
    url: 'https://youtube.com',
  },
  {
    id: '3',
    title: 'Dərs 03 - OOP Prinsipləri və İrsi Keçmə',
    topic: 'Python-A1',
    groupName: 'Python-A1',
    teacherName: 'Bahan HakarMak',
    type: 'Google Drive',
    uploadDate: '04.06.2026',
    url: 'https://drive.google.com',
  },
  {
    id: '4',
    title: 'Dərs 02 - OOP Prinsipləri və İrsi Keçmə',
    topic: 'Python-A1',
    groupName: 'Python-A1',
    teacherName: 'Aahan Hakrın Aman',
    type: 'Fayl',
    uploadDate: '04.06.2026',
    url: '#',
  },
  {
    id: '5',
    title: 'Dərs 05 - OOP Prinsipləri və İri Keçmə',
    topic: 'Python-A1',
    groupName: 'Python-A1',
    teacherName: 'Barian HakarMak',
    type: 'Google Drive',
    uploadDate: '04.06.2026',
    url: 'https://drive.google.com',
  },
  {
    id: '6',
    title: 'Dərs 01 - Giriş və Sintaksis',
    topic: 'Python-A1',
    groupName: 'Python-A1',
    teacherName: 'Aahan Hakrın Aman',
    type: 'Fayl',
    uploadDate: '20.05.2026',
    url: '#',
  },
  {
    id: '7',
    title: 'Dərs 02 - Dəyişənlər və Operatorlar',
    topic: 'Python-A2',
    groupName: 'Python-A2',
    teacherName: 'Aahan Hakrın Aman',
    type: 'YouTube',
    uploadDate: '22.05.2026',
    url: 'https://youtube.com',
  },
  {
    id: '8',
    title: 'Dərs 03 - Şərt və Döngə Operatorları',
    topic: 'Python-A2',
    groupName: 'Python-A2',
    teacherName: 'Barian HakarMak',
    type: 'Google Drive',
    uploadDate: '25.05.2026',
    url: 'https://drive.google.com',
  },
  {
    id: '9',
    title: 'Dərs 04 - Siyahılar (Lists) və Lüğətlər (Dicts)',
    topic: 'Python-A2',
    groupName: 'Python-A2',
    teacherName: 'Barian HakarMak',
    type: 'Linklər',
    uploadDate: '28.05.2026',
    url: 'https://google.com',
  },
  {
    id: '10',
    title: 'Dərs 05 - Metodlar və Funksiyalar',
    topic: 'Python-A1',
    groupName: 'Python-A1',
    teacherName: 'Bahan HakarMak',
    type: 'Fayl',
    uploadDate: '01.06.2026',
    url: '#',
  },
  {
    id: '11',
    title: 'Dərs 06 - Fildər və Modullar',
    topic: 'Python-A1',
    groupName: 'Python-A1',
    teacherName: 'Aahan Hakrın Aman',
    type: 'Linklər',
    uploadDate: '03.06.2026',
    url: '#',
  },
]

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
  const [selectedGroup, setSelectedGroup] = useState<string>('Python-A1')
  const [selectedType, setSelectedType] = useState<string>('Hamısı')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const ITEMS_PER_PAGE = 5

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedGroup, selectedType])

  // Filter logic
  const filteredMaterials = materials
    .filter(m => selectedGroup === 'Bütün Qruplar' || m.groupName === selectedGroup)
    .filter(m => selectedType === 'Hamısı' || m.type === typeFilterMap[selectedType])

  const totalPages = Math.max(1, Math.ceil(filteredMaterials.length / ITEMS_PER_PAGE))
  const paginatedMaterials = filteredMaterials.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleFirstPage = () => {
    if (currentPage > 1) {
      setCurrentPage(1)
    }
  }

  const handleLastPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(totalPages)
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-lms-student-text">
        Dərs Materialları
      </h1>

      {/* FILTER BAR: flex items-center gap-4 flex-wrap inside .neu-card mb-5 */}
      <div className="neu-card mb-5">
        <div className="flex items-end gap-6 flex-wrap">
          {/* Group dropdown */}
          <div className="flex flex-col">
            <label htmlFor="group-select" className="text-xs text-lms-student-muted mb-1 block font-semibold">
              Group
            </label>
            <select
              id="group-select"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="neu-input w-[180px] h-[38px] cursor-pointer"
            >
              <option value="Python-A1">Python-A1</option>
              <option value="Python-A2">Python-A2</option>
              <option value="Bütün Qruplar">Bütün Qruplar</option>
            </select>
          </div>

          {/* Type filter pill buttons */}
          <div className="flex flex-col">
            <span className="text-xs text-lms-student-muted mb-1 block font-semibold">
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
                        ? "border-2 border-lms-student-accent bg-lms-student-accentLt text-lms-student-accent font-medium rounded-full px-4 py-1.5 text-sm transition-all shadow-[inset_4px_4px_8px_#C8D0D8,inset_-4px_-4px_8px_#FFFFFF] cursor-pointer"
                        : "border border-lms-student-inset bg-lms-student-surface text-lms-student-muted rounded-full px-4 py-1.5 text-sm transition-all shadow-[4px_4px_8px_#C8D0D8,-4px_-4px_8px_#FFFFFF] hover:border-lms-student-accent hover:text-lms-student-accent cursor-pointer"
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

      {/* MAIN TABLE: inside .neu-card */}
      <div className="neu-card">
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
              <tr className="text-xs font-semibold text-lms-student-muted uppercase tracking-wide">
                <th className="pb-2">Materialın Adı / Başlığı</th>
                <th className="pb-2">Aid Olduğu Dərs / Mövzu</th>
                <th className="pb-2">Paylaşan Müəllim</th>
                <th className="pb-2">Materialın Tipi</th>
                <th className="pb-2">Yüklənmə / Baxış Tarixi</th>
                <th className="pb-2">Keçid / Fəaliyyət</th>
              </tr>
              <tr>
                <td colSpan={6} className="p-0 pb-1">
                  <div className="bg-lms-student-inset h-px w-full" />
                </td>
              </tr>
            </thead>
            <tbody>
              {paginatedMaterials.map((row, index) => (
                <React.Fragment key={row.id}>
                  <tr>
                    <td className="py-3.5 text-sm text-lms-student-text font-medium whitespace-normal break-words pr-2">
                      {row.title}
                    </td>
                    <td className="py-3.5 text-sm text-lms-student-muted pr-2">
                      Mövzu: {row.topic}
                    </td>
                    <td className="py-3.5 text-sm text-lms-student-text pr-2">
                      {row.teacherName}
                    </td>
                    <td className="py-3.5 text-sm pr-2">
                      <span className="rounded-md bg-gray-100 text-gray-700 px-2.5 py-1 text-xs font-medium inline-block">
                        {row.type}
                      </span>
                    </td>
                    <td className="py-3.5 text-sm text-lms-student-muted pr-2">
                      {row.uploadDate}
                    </td>
                    <td className="py-3.5 text-sm">
                      {row.type === 'Fayl' || row.type === 'YouTube' ? (
                        <span
                          onClick={() => window.open(row.url, '_blank')}
                          className="text-lms-student-accent text-sm font-medium hover:underline cursor-pointer"
                        >
                          [Aç / Yüklə]
                        </span>
                      ) : (
                        <span
                          onClick={() => window.open(row.url, '_blank')}
                          className="text-lms-student-accent text-sm font-medium hover:underline cursor-pointer"
                        >
                          [Bax]
                        </span>
                      )}
                    </td>
                  </tr>
                  {index < paginatedMaterials.length - 1 && (
                    <tr>
                      <td colSpan={6} className="p-0">
                        <div className="bg-lms-student-inset h-px w-full" />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {paginatedMaterials.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-lms-student-muted">
                    Uyğun gələn məlumat tapılmadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION: [◀◀] [◀] [1] [2] [▶] [▶▶] */}
        <div className="flex items-center justify-center gap-1 pt-4 mt-4 border-t border-lms-student-inset">
          {/* First page jump (◀◀) */}
          <button
            onClick={handleFirstPage}
            disabled={currentPage === 1}
            className={`neu-btn-primary px-3 py-1.5 text-sm ${currentPage === 1 ? 'opacity-50 cursor-not-allowed active:scale-100' : ''}`}
          >
            ◀◀
          </button>

          {/* Prev page (◀) */}
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`neu-btn-primary px-3 py-1.5 text-sm ${currentPage === 1 ? 'opacity-50 cursor-not-allowed active:scale-100' : ''}`}
          >
            ◀
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const isActive = p === currentPage
            if (isActive) {
              return (
                <button
                  key={p}
                  className="neu-card-inset !px-3 !py-1.5 !rounded-lg text-lms-student-accent font-medium select-none text-sm"
                >
                  {p}
                </button>
              )
            } else {
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className="neu-btn-primary px-3 py-1.5 text-sm"
                >
                  {p}
                </button>
              )
            }
          })}

          {/* Next page (▶) */}
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`neu-btn-primary px-3 py-1.5 text-sm ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed active:scale-100' : ''}`}
          >
            ▶
          </button>

          {/* Last page jump (▶▶) */}
          <button
            onClick={handleLastPage}
            disabled={currentPage === totalPages}
            className={`neu-btn-primary px-3 py-1.5 text-sm ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed active:scale-100' : ''}`}
          >
            ▶▶
          </button>
        </div>
      </div>
    </div>
  )
}
