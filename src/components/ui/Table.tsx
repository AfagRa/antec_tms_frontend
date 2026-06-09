import type { ReactNode } from 'react'
import Spinner from './Spinner'

interface Column<T> {
  key: string
  header: string
  render?: (row: T, index: number) => ReactNode
  className?: string
}

interface Props<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  rowKey: (row: T) => string | number
}

export default function Table<T>({
  columns,
  data,
  loading,
  emptyMessage = 'Məlumat tapılmadı',
  rowKey,
}: Props<T>) {
  return (
    <div className="overflow-x-auto rounded-neu-lg shadow-neu">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-surface-dark/20">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-text-base/60 ${column.className ?? ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-text-base/40">
                <div className="flex justify-center">
                  <Spinner size="lg" />
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-text-base/40">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={rowKey(row)} className="border-t border-surface-dark/20 transition-colors hover:bg-surface-dark/10">
                {columns.map((column) => (
                  <td key={column.key} className={`px-4 py-3 ${column.className ?? ''}`}>
                    {column.render ? column.render(row, index) : String((row as Record<string, unknown>)[column.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
