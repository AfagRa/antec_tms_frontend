import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import {
  DEFAULT_GROUP_ID,
  MOCK_GROUPS,
  getLessonsByGroupId,
} from '../data/teacherMock';
import type { LessonStatus } from '../types';

interface LessonFormState {
  groupId: string;
  lessonDate: string;
  topic: string;
  note: string;
}

const inputClassName =
  'w-full rounded-md border border-surface-dark/20 px-3 py-2 text-sm text-text-base focus:outline-none focus:ring-2 focus:ring-primary/30';

export default function LessonCreate() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState<LessonFormState>({
    groupId: DEFAULT_GROUP_ID,
    lessonDate: '07.05.2023',
    topic: '',
    note: '',
  });
  const [savedAs, setSavedAs] = useState<LessonStatus | null>(null);

  const selectedGroup = MOCK_GROUPS.find((group) => group.id === formState.groupId);
  const groupLessons = getLessonsByGroupId(formState.groupId);

  function handleSaveDraft(event: FormEvent) {
    event.preventDefault();
    console.log({ ...formState, status: 'draft' as LessonStatus });
    setSavedAs('draft');
  }

  function handleComplete() {
    console.log({ ...formState, status: 'completed' as LessonStatus });
    setSavedAs('completed');
    navigate(ROUTES.TEACHER_ATTENDANCE('1'));
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text-base">Jurnal / Dərs Yarat</h1>

      <form className="mx-auto max-w-2xl rounded-neu bg-surface shadow-neu-sm p-8">
        {savedAs && (
          <div className="mb-6 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
            {savedAs === 'draft'
              ? 'Dərs qeydi draft kimi saxlanıldı.'
              : 'Dərs tamamlandı — davamiyyətə keçə bilərsiniz.'}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-base">
              Qrup Seçimi<span className="ml-0.5 text-red-500">*</span>
            </label>
            <select
              value={formState.groupId}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, groupId: event.target.value }))
              }
              className={inputClassName}
            >
              {MOCK_GROUPS.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            {selectedGroup && (
              <p className="mt-1 text-xs text-text-base/50">
                Kurs: {selectedGroup.courseName} · Tələbə sayı: {selectedGroup.studentCount}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-base">
              Dərs Tarixi<span className="ml-0.5 text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formState.lessonDate}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, lessonDate: event.target.value }))
              }
              placeholder="DD.MM.YYYY"
              className={inputClassName}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-base">
              Mövzu<span className="ml-0.5 text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formState.topic}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, topic: event.target.value }))
              }
              placeholder="Dərs mövzusunu daxil edin"
              className={inputClassName}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-text-base">
              Dərs Qeydi
            </label>
            <textarea
              rows={5}
              value={formState.note}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, note: event.target.value }))
              }
              placeholder="Dərs haqqında əlavə qeydlər..."
              className={`${inputClassName} resize-none`}
            />
          </div>

          {groupLessons.length > 0 && (
            <div className="rounded-lg border border-surface-dark/20 bg-surface-light p-4">
              <p className="mb-2 text-sm font-semibold text-text-base">Son dərslər</p>
              <ul className="space-y-1 text-sm text-text-base/50">
                {groupLessons.slice(0, 3).map((lesson) => (
                  <li key={lesson.id}>
                    {lesson.lessonDate} — {lesson.topic}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Link
            to={ROUTES.TEACHER_GROUPS}
            className="text-sm text-text-base/50 hover:text-text-base"
          >
            Ləğv et / Geri
          </Link>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10"
            >
              Saxla — Draft Kimi
            </button>
            <button
              type="button"
              onClick={handleComplete}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Tamamla və Davamiyyəti Daxil Et
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
