import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import {
  MOCK_STUDENTS,
  getGroupById,
  getLessonsByGroupId,
  getMaterialsByGroupId,
} from '../../data/teacherMock';
import { STUDENT_STATUS_CONFIG, type StudentGroupStatus } from '../../types';
import type { GroupStatus, LessonStatus } from '../../types';

type TabId = 'students' | 'lessons' | 'materials';

const TABS: { id: TabId; label: string }[] = [
  { id: 'students', label: 'Tab 1 — Tələbə Siyahısı' },
  { id: 'lessons', label: 'Tab 2 — Dərslər' },
  { id: 'materials', label: 'Tab 3 — Materiallar' },
];

function groupStatusBadgeClass(status: GroupStatus) {
  switch (status) {
    case 'Aktiv':
      return 'bg-primary/10 text-primary';
    case 'Tamamlanmış':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

function lessonStatusBadgeClass(status: LessonStatus) {
  return status === 'completed'
    ? 'bg-primary/10 text-primary'
    : 'bg-amber-100 text-amber-700';
}

export default function GroupDetail() {
  const { id = '1' } = useParams();
  const group = getGroupById(id);
  const [activeTab, setActiveTab] = useState<TabId>('students');
  const [statusFilter, setStatusFilter] = useState<StudentGroupStatus | 'all'>('all');

  const filteredStudents = statusFilter === 'all'
    ? MOCK_STUDENTS
    : MOCK_STUDENTS.filter((s) => (s.status as StudentGroupStatus) === statusFilter);

  const lessons = getLessonsByGroupId(id);
  const materials = getMaterialsByGroupId(id);

  if (!group) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-text-base">Qrup tapılmadı</h1>
      </div>
    );
  }

  const navigate = useNavigate();

  return (
    <div>
      <button
        onClick={() => navigate(ROUTES.TEACHER_GROUPS)}
        className="flex items-center gap-1.5 text-sm text-lms-muted hover:text-lms-heading transition-colors mb-4 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        Mənim Qruplarıma Qayıt
      </button>

      <div className="mb-6 flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold text-text-base">
          Qrup Detalları: {group.name}
        </h1>
      </div>

      <div className="rounded-neu bg-surface shadow-neu-sm p-6 mb-6">
        <h2 className="mb-4 text-sm font-semibold text-text-base">Qrup Məlumat Kartı</h2>
        <div className="grid grid-cols-2 gap-6 text-sm md:grid-cols-3 lg:grid-cols-6">
          <div>
            <p className="mb-1 text-xs text-text-base/50">Qrup adı</p>
            <p className="font-medium text-text-base">{group.name}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-text-base/50">Kurs adı</p>
            <p className="font-medium text-text-base">{group.courseName}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-text-base/50">Başlama tarixi</p>
            <p className="font-medium text-text-base">{group.startDate}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-text-base/50">Bitmə tarixi</p>
            <p className="font-medium text-text-base">{group.endDate}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-text-base/50">Tələbə sayı</p>
            <p className="font-medium text-text-base">{group.studentCount}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-text-base/50">Status</p>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${groupStatusBadgeClass(group.status)}`}
            >
              {group.status}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-neu bg-surface shadow-neu-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-dark/20 px-5 pt-4">
          <div className="flex gap-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-text-base'
                    : 'border-transparent text-text-base/50 hover:text-text-base'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Link
            to={ROUTES.TEACHER_LESSON_CREATE}
            className="mb-3 flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            <Plus size={16} strokeWidth={1.5} />
            Yeni Dərs Yarat
          </Link>
        </div>

        <div className="p-5">
          {activeTab === 'students' && (
            <div className="overflow-x-auto">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-lms-muted">Status:</span>
                {(['all', 'Aktiv', 'Passiv', 'Çıxıb', 'Məzun'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      statusFilter === s
                        ? 'bg-lms-green text-white border-lms-green'
                        : 'bg-white text-lms-muted border-lms-border hover:border-lms-green/50'
                    }`}
                  >
                    {s === 'all' ? 'Hamısı' : s}
                  </button>
                ))}
              </div>
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-surface-dark/20 bg-surface-light">
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">
                      #
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">
                      Ad
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">
                      Soyad
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">
                      Email
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">
                      Telefon
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">
                      Qrupa qoşulma tarixi
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => {
                    const cfg = STUDENT_STATUS_CONFIG[student.status as StudentGroupStatus]
                      ?? STUDENT_STATUS_CONFIG['Aktiv']
                    return (
                      <tr key={student.id} className="border-b border-surface-dark/20 last:border-0">
                        <td className="px-3 py-3 text-sm text-text-base">{index + 1}</td>
                        <td className="px-3 py-3 text-sm text-text-base">{student.name}</td>
                        <td className="px-3 py-3 text-sm text-text-base">{student.surname}</td>
                        <td className="px-3 py-3 text-sm text-text-base">{student.email}</td>
                        <td className="px-3 py-3 text-sm text-text-base">{student.phone}</td>
                        <td className="px-3 py-3 text-sm text-text-base">{student.joinedAt}</td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
                          >
                            {cfg.label}
                          </span>
                        </td>
                      </tr>
                    )})}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'lessons' && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-surface-dark/20 bg-surface-light">
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">
                      #
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">
                      Tarix
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">
                      Mövzu
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">
                      Status
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">
                      Əməliyyatlar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-sm text-text-base/50">
                        Bu qrup üçün dərs tapılmadı.
                      </td>
                    </tr>
                  ) : (
                    lessons.map((lesson, index) => (
                      <tr key={lesson.id} className="border-b border-surface-dark/20 last:border-0">
                        <td className="px-3 py-3 text-sm text-text-base">{index + 1}</td>
                        <td className="px-3 py-3 text-sm text-text-base">{lesson.lessonDate}</td>
                        <td className="px-3 py-3 text-sm text-text-base">{lesson.topic}</td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${lessonStatusBadgeClass(lesson.status)}`}
                          >
                            {lesson.status === 'draft' ? 'Draft' : 'Tamamlanmış'}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex gap-3">
                            <Link
                              to={ROUTES.TEACHER_ATTENDANCE(lesson.id)}
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              Davamiyyət
                            </Link>
                            <Link
                              to={ROUTES.TEACHER_GRADES(lesson.id)}
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              Qiymət
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-surface-dark/20 bg-surface-light">
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">
                      #
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">
                      Başlıq
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">
                      Tip
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">
                      Tarix
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-base">
                      Əməliyyatlar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {materials.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-sm text-text-base/50">
                        Material tapılmadı.
                      </td>
                    </tr>
                  ) : (
                    materials.map((material, index) => (
                      <tr key={material.id} className="border-b border-surface-dark/20 last:border-0">
                        <td className="px-3 py-3 text-sm text-text-base">{index + 1}</td>
                        <td className="px-3 py-3 text-sm text-text-base">{material.title}</td>
                        <td className="px-3 py-3 text-sm capitalize text-text-base/50">
                          {material.type.replace('_', ' ')}
                        </td>
                        <td className="px-3 py-3 text-sm text-text-base">{material.createdAt}</td>
                        <td className="px-3 py-3">
                          <Link
                            to={ROUTES.TEACHER_MATERIAL}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            Bax
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div className="mt-4 flex justify-end">
                <Link
                  to={ROUTES.TEACHER_MATERIAL}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  + Material əlavə et
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
