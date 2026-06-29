import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { studentPortalApi } from '../../api/studentPortal'
import { MaterialTypeBadge } from '../../components/ui/MaterialTypeBadge'
import NoteCell from '../../components/ui/NoteCell'
import { getMaterialHref } from '../../utils/material'
import type { MyMaterialDetail, MaterialTypeName } from '../../types'
import Spinner from '../../components/ui/Spinner'

const TYPE_TO_LABEL: Record<string, MaterialTypeName> = {
  file:         'Fayl',
  youtube:      'YouTube',
  video_link:   'Video',
  google_drive: 'Google Drive',
  link:         'Linklər',
  document:     'Sənəd',
}

function normalizeType(rawType: string): MaterialTypeName {
  return TYPE_TO_LABEL[rawType] ?? 'Linklər'
}

const PILL_COLORS: Record<string, { idle: string; active: string }> = {
  'Hamısı':       { idle: 'bg-gray-100 text-gray-600 border-gray-200', active: 'bg-gray-500 text-white border-gray-500' },
  'Fayl':         { idle: 'bg-blue-100 text-blue-700 border-blue-200', active: 'bg-blue-500 text-white border-blue-500' },
  'YouTube':      { idle: 'bg-red-100 text-red-700 border-red-200', active: 'bg-red-500 text-white border-red-500' },
  'Video':        { idle: 'bg-orange-100 text-orange-700 border-orange-200', active: 'bg-orange-500 text-white border-orange-500' },
  'Google Drive': { idle: 'bg-green-100 text-green-700 border-green-200', active: 'bg-green-500 text-white border-green-500' },
  'Sənəd':        { idle: 'bg-emerald-100 text-emerald-700 border-emerald-200', active: 'bg-emerald-500 text-white border-emerald-500' },
  'Linklər':      { idle: 'bg-purple-100 text-purple-700 border-purple-200', active: 'bg-purple-500 text-white border-purple-500' },
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
        const lessons = await studentPortalApi.getLessons()
        const flat: MyMaterialDetail[] = []
        for (const lesson of lessons) {
          for (const m of lesson.materials) {
            flat.push({
              id: m.id,
              title: m.title,
              description: m.description,
              type: m.type,
              file_path: m.file_path,
              url: m.url,
              lesson_topic: lesson.topic,
              lesson_date: lesson.lesson_date,
            })
          }
        }
        setMaterials(flat)
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
      <h1 className="text-2xl font-bold text-text-base">Dərs Materialları</h1>

      <div className="rounded-neu bg-surface shadow-neu-sm p-5 mb-5">
        <div className="flex items-end gap-6 flex-wrap">
          <div className="flex flex-col">
            <span className="text-xs text-text-base/50 mb-1 block font-semibold">Materialın Tipi</span>
            <div className="flex items-center gap-2 flex-wrap min-h-[38px]">
              {typeOptions.map((opt) => {
                const c = PILL_COLORS[opt] ?? PILL_COLORS['Hamısı']
                return (
                  <button key={opt} onClick={() => setSelectedType(opt)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all cursor-pointer border ${selectedType === opt ? c.active : c.idle + ' shadow-neu-sm hover:shadow-neu-inset-sm'}`}>
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
              <col style={{ width: '200px' }} />
              <col style={{ width: '150px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '180px' }} />
            </colgroup>
            <thead>
              <tr className="bg-surface-dark/20">
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Materialın Adı</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Mövzu</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Tipi</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Tarix</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60">Qeyd</th>
              </tr>
              <tr><td colSpan={5} className="p-0 pb-1"><div className="bg-surface-dark/20 h-px w-full" /></td></tr>
            </thead>
            <tbody>
              {paginated.map((row, index) => {
                const href = getMaterialHref(row)
                return (
                  <tr key={row.id || index} className="transition-colors hover:bg-surface-dark/10">
                    <td className="py-3.5 text-sm text-text-base font-medium whitespace-normal break-words px-3">
                      {href
                        ? <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline">{row.title}</a>
                        : <span>{row.title}</span>}
                    </td>
                    <td className="py-3.5 text-sm text-text-base/50 px-3">{row.lesson_topic}</td>
                    <td className="py-3.5 text-sm px-3"><MaterialTypeBadge type={normalizeType(row.type)} /></td>
                    <td className="py-3.5 text-sm text-text-base/50 px-3">{new Date(row.lesson_date).toLocaleDateString('az-AZ')}</td>
                    <td className="py-3.5 px-3">
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
