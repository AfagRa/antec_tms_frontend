import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { studentPortalApi } from '../../api/studentPortal'
import { getFileUrl } from '../../api/client'
import { MaterialTypeBadge } from '../../components/ui/MaterialTypeBadge'
import NoteCell from '../../components/ui/NoteCell'
import type { MyMaterialDetail, MaterialTypeName } from '../../types'
import Spinner from '../../components/ui/Spinner'

const TYPE_TO_LABEL: Record<string, MaterialTypeName> = {
  file:         'Fayl',
  youtube:      'YouTube',
  video_link:   'YouTube',
  google_drive: 'Google Drive',
  link:         'Linklər',
  document:     'Fayl',
}

function normalizeType(rawType: string): MaterialTypeName {
  return TYPE_TO_LABEL[rawType] ?? 'Linklər'
}

export default function StudentMaterials() {
  const [searchParams] = useSearchParams()
  const topicFilter = searchParams.get('topic')
  const [materials, setMaterials] = useState<MyMaterialDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('Hamısı')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  useEffect(() => {
    const load = async () => {
      try {
        const data = await studentPortalApi.getMaterials()
        setMaterials(data)
      } catch (err) {
        console.warn('Failed to load materials', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => { setCurrentPage(1) }, [selectedType])

  const filtered = materials
    .filter((m) => selectedType === 'Hamısı' || normalizeType(m.type) === selectedType)
    .filter((m) => !topicFilter || m.lesson_topic === topicFilter)

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const typeOptions = ['Hamısı', ...Array.from(new Set(materials.map((m) => normalizeType(m.type))))]

  if (loading) return <Spinner />

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-text-base">Dərs Materialları</h1>

      <div className="rounded-neu bg-surface shadow-neu-sm p-5 mb-5">
        <div className="flex items-end gap-6 flex-wrap">
          <div className="flex flex-col">
            <span className="text-xs text-text-base/50 mb-1 block font-semibold">Materialın Tipi</span>
            <div className="flex items-center gap-2 flex-wrap min-h-[38px]">
              {typeOptions.map((opt) => (
                <button key={opt} onClick={() => setSelectedType(opt)}
                  className={selectedType === opt
                    ? 'border-2 border-primary bg-primary/10 text-primary font-medium rounded-full px-4 py-1.5 text-sm transition-all shadow-neu-inset-sm cursor-pointer'
                    : 'border border-surface-dark/20 bg-surface text-text-base/50 rounded-full px-4 py-1.5 text-sm transition-all shadow-neu-sm hover:border-primary hover:text-primary cursor-pointer'}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-neu bg-surface shadow-neu-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse text-left">
            <colgroup>
              <col style={{ width: '200px' }} />
              <col style={{ width: '150px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '180px' }} />
            </colgroup>
            <thead>
              <tr className="text-xs font-semibold text-text-base/50 uppercase tracking-wide">
                <th className="pb-2 px-3 pt-4">Materialın Adı</th>
                <th className="pb-2 px-3 pt-4">Aid Olduğu Dərs</th>
                <th className="pb-2 px-3 pt-4">Tipi</th>
                <th className="pb-2 px-3 pt-4">Tarix</th>
                <th className="pb-2 px-3 pt-4">Qeyd</th>
              </tr>
              <tr><td colSpan={5} className="p-0 pb-1"><div className="bg-surface-dark/20 h-px w-full" /></td></tr>
            </thead>
            <tbody>
              {paginated.map((row, index) => {
                const fileUrl = getFileUrl(row.file_path)
                const hasLink = !!fileUrl
                return (
                  <tr
                    key={row.id || index}
                    onClick={() => {
                      if (hasLink) window.open(fileUrl!, '_blank', 'noopener,noreferrer')
                    }}
                    className={`transition-colors ${hasLink ? 'cursor-pointer hover:bg-surface-dark/10' : 'cursor-default'}`}
                  >
                    <td className="py-3.5 text-sm text-text-base font-medium whitespace-normal break-words px-3">{row.title}</td>
                    <td className="py-3.5 text-sm text-text-base/50 px-3">Mövzu: {row.lesson_topic}</td>
                    <td className="py-3.5 text-sm px-3"><MaterialTypeBadge type={normalizeType(row.type)} /></td>
                    <td className="py-3.5 text-sm text-text-base/50 px-3">{new Date(row.lesson_date).toLocaleDateString('az-AZ')}</td>
                    <td className="py-3.5 px-3" onClick={e => e.stopPropagation()}>
                      {row.description
                        ? <NoteCell note={row.description} meta={row.title} />
                        : <span className="text-sm text-text-base/50">—</span>}
                    </td>
                  </tr>
                )
              })}
              {paginated.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-sm text-text-base/50 px-3">Material tapılmadı.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-center gap-1 pt-4 pb-4 border-t border-surface-dark/20">
          <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
            className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-1.5 text-sm text-text-base shadow-neu-sm hover:shadow-neu-inset-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">◀◀</button>
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
            className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-1.5 text-sm text-text-base shadow-neu-sm hover:shadow-neu-inset-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">◀</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setCurrentPage(p)}
              className={p === currentPage
                ? 'rounded-neu-sm bg-surface-dark/30 shadow-neu-inset-sm px-3 py-1.5 text-sm font-medium text-primary select-none'
                : 'rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-1.5 text-sm text-text-base shadow-neu-sm hover:shadow-neu-inset-sm transition-all cursor-pointer'}>{p}</button>
          ))}
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
            className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-1.5 text-sm text-text-base shadow-neu-sm hover:shadow-neu-inset-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">▶</button>
          <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
            className="rounded-neu-sm border border-surface-dark/20 bg-surface px-3 py-1.5 text-sm text-text-base shadow-neu-sm hover:shadow-neu-inset-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">▶▶</button>
        </div>
      </div>
    </div>
  )
}
