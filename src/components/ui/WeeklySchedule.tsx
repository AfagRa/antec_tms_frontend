const DAYS = ['Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə'];

export interface ScheduleLesson {
  id: string;
  groupId: string;
  groupName: string;
  topic: string;
  timeSlot: string;
  day: 0 | 1 | 2 | 3 | 4;
}

interface WeeklyScheduleProps {
  lessons: ScheduleLesson[];
  onLessonClick: (groupId: string) => void;
}

export default function WeeklySchedule({ lessons, onLessonClick }: WeeklyScheduleProps) {
  const lessonsByDay = DAYS.map((_, dayIdx) =>
    lessons.filter((l) => l.day === dayIdx)
  );

  return (
    <div className="grid grid-cols-5 gap-3">
      {DAYS.map((day, dayIdx) => {
        const dayLessons = lessonsByDay[dayIdx];
        return (
          <div key={day} className="flex flex-col gap-2">
            <div className="text-xs font-medium text-text-base/50 uppercase tracking-wide text-center pb-1 border-b border-surface-dark/20">
              {day}
            </div>
            {dayLessons.length > 0
              ? dayLessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => onLessonClick(lesson.groupId)}
                    className="rounded-neu bg-surface shadow-neu-sm text-left p-3 hover:border-success hover:shadow-md transition-all cursor-pointer group w-full"
                  >
                    <p className="text-sm font-medium text-text-base group-hover:text-success transition-colors truncate">
                      {lesson.groupName}
                    </p>
                    <p className="text-xs text-text-base/50 mt-0.5 truncate">
                      {lesson.topic}
                    </p>
                    <p className="text-xs text-success mt-1 font-medium">
                      {lesson.timeSlot}
                    </p>
                  </button>
                ))
              : (
                  <div className="text-xs text-text-base/50 text-center py-4 italic">—</div>
                )}
          </div>
        );
      })}
    </div>
  );
}
