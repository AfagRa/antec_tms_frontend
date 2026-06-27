import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import type { WeeklyScheduleItem } from '../../types'

interface Props {
  lessons: WeeklyScheduleItem[]
  onLessonClick: (groupId: number) => void
}

const DAY_LABELS = ['BE', 'ÇA', 'Ç', 'CA', 'C', 'Ş']
const DAY_COUNT = 6

function formatHour(start: number): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(start)}:00-${pad(start + 2)}:00`
}

export default function WeeklySchedule({ lessons, onLessonClick }: Props) {
  const navigate = useNavigate()

  if (lessons.length === 0) {
    return (
      <div className="rounded-neu bg-surface shadow-neu-sm p-6 text-center text-sm text-text-base/50 italic">
        Bu həftə üçün dərs cədvəli yoxdur.
      </div>
    )
  }

  const blocks = [...new Set(lessons.map(l => Math.floor(l.hour / 2) * 2))].sort((a, b) => a - b)

  const getLessons = (dayIdx: number, block: number) =>
    lessons.filter(l => l.day_of_week_index === dayIdx && Math.floor(l.hour / 2) * 2 === block)

  return (
    <div className="rounded-neu bg-surface shadow-neu-sm overflow-auto">
      <div
        className="grid min-w-[600px]"
        style={{ gridTemplateColumns: `110px repeat(${DAY_COUNT}, 1fr)` }}
      >
        <div className="sticky top-0 z-10 bg-surface border-b border-r border-surface-dark/20 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-text-base/50" />
        {DAY_LABELS.map(label => (
          <div
            key={label}
            className="sticky top-0 z-10 bg-surface border-b border-r border-surface-dark/20 px-2 py-2 text-center text-xs font-semibold text-text-base/50 uppercase tracking-wide"
          >
            {label}
          </div>
        ))}

        {blocks.map(block => (
          <div key={block} className="contents">
            <div className="border-b border-r border-surface-dark/20 px-3 py-3 text-xs font-medium text-text-base/70 whitespace-nowrap">
              {formatHour(block)}
            </div>
            {Array.from({ length: DAY_COUNT }, (_, dayIdx) => {
              const cellLessons = getLessons(dayIdx, block)
              return (
                <div
                  key={`${dayIdx}-${block}`}
                  className="border-b border-r border-surface-dark/20 px-2 py-2 min-h-[60px]"
                >
                  {cellLessons.length > 0 ? (
                    <div className="flex flex-col gap-1.5">
                      {cellLessons.map(lesson => (
                        <button
                          key={lesson.lesson_id}
                          onClick={() => onLessonClick(lesson.group_id)}
                          className="rounded-neu bg-surface shadow-neu-sm text-left p-2 hover:border-success hover:shadow-md transition-all cursor-pointer group w-full"
                        >
                          <p className="text-xs font-medium text-text-base group-hover:text-success transition-colors truncate">
                            {lesson.group_name}
                          </p>
                          <p className="text-[10px] text-text-base/50 mt-0.5 truncate">
                            {lesson.topic}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-text-base/30 italic">—</div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
