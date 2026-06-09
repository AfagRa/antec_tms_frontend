import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import {
  MOCK_STUDENTS,
  getGroupById,
  getLessonsByGroupId,
  getMaterialsByGroupId,
} from '../../data/teacherMock';
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
      return 'bg-lms-navy-light text-lms-navy';
    case 'Tamamlanmış':
      return 'bg-lms-badge-done-bg text-lms-badge-done-text';
    default:
      return 'bg-lms-badge-passive-bg text-lms-badge-passive-text';
  }
}

function studentStatusBadgeClass(status: 'Aktiv' | 'Passiv') {
  return status === 'Aktiv'
    ? 'bg-lms-navy-light text-lms-navy'
    : 'bg-lms-badge-passive-bg text-lms-badge-passive-text';
}

function lessonStatusBadgeClass(status: LessonStatus) {
  return status === 'completed'
    ? 'bg-lms-navy-light text-lms-navy'
    : 'bg-lms-badge-draft-bg text-lms-badge-draft-text';
}

export default function GroupDetail() {
  const { id = '1' } = useParams();
  const group = getGroupById(id);
  const [activeTab, setActiveTab] = useState<TabId>('students');

  const lessons = getLessonsByGroupId(id);
  const materials = getMaterialsByGroupId(id);

  if (!group) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-lms-heading">Qrup tapılmadı</h1>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold text-lms-heading">
          Qrup Detalları: {group.name}
        </h1>
        <span className="shrink-0 text-xs text-lms-muted">
          Muellim_Telebe_Paneli_Spesifikasiya_v1.0.docx
        </span>
      </div>

      <div className="lms-card mb-6">
        <h2 className="mb-4 text-sm font-semibold text-lms-heading">Qrup Məlumat Kartı</h2>
        <div className="grid grid-cols-2 gap-6 text-sm md:grid-cols-3 lg:grid-cols-6">
          <div>
            <p className="mb-1 text-xs text-lms-muted">Qrup adı</p>
            <p className="font-medium text-lms-heading">{group.name}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-lms-muted">Kurs adı</p>
            <p className="font-medium text-lms-heading">{group.courseName}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-lms-muted">Başlama tarixi</p>
            <p className="font-medium text-lms-heading">{group.startDate}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-lms-muted">Bitmə tarixi</p>
            <p className="font-medium text-lms-heading">{group.endDate}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-lms-muted">Tələbə sayı</p>
            <p className="font-medium text-lms-heading">{group.studentCount}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-lms-muted">Status</p>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${groupStatusBadgeClass(group.status)}`}
            >
              {group.status}
            </span>
          </div>
        </div>
      </div>

      <div className="lms-card p-0">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-lms-border px-5 pt-4">
          <div className="flex gap-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-lms-navy text-lms-heading'
                    : 'border-transparent text-lms-muted hover:text-lms-heading'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Link
            to={ROUTES.TEACHER_LESSON_CREATE}
            className="mb-3 flex items-center gap-1.5 rounded-lg bg-lms-navy px-4 py-2 text-sm font-medium text-white hover:bg-lms-navy-dark"
          >
            <Plus size={16} strokeWidth={1.5} />
            Yeni Dərs Yarat
          </Link>
        </div>

        <div className="p-5">
          {activeTab === 'students' && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-lms-border bg-gray-50">
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-lms-heading">
                      #
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-lms-heading">
                      Ad
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-lms-heading">
                      Soyad
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-lms-heading">
                      Email
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-lms-heading">
                      Telefon
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-lms-heading">
                      Qrupa qoşulma tarixi
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-lms-heading">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_STUDENTS.map((student, index) => (
                    <tr key={student.id} className="border-b border-lms-border last:border-0">
                      <td className="px-3 py-3 text-sm text-lms-heading">{index + 1}</td>
                      <td className="px-3 py-3 text-sm text-lms-heading">{student.name}</td>
                      <td className="px-3 py-3 text-sm text-lms-heading">{student.surname}</td>
                      <td className="px-3 py-3 text-sm text-lms-heading">{student.email}</td>
                      <td className="px-3 py-3 text-sm text-lms-heading">{student.phone}</td>
                      <td className="px-3 py-3 text-sm text-lms-heading">{student.joinedAt}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${studentStatusBadgeClass(student.status)}`}
                        >
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'lessons' && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-lms-border bg-gray-50">
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-lms-heading">
                      #
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-lms-heading">
                      Tarix
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-lms-heading">
                      Mövzu
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-lms-heading">
                      Status
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-lms-heading">
                      Əməliyyatlar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-sm text-lms-muted">
                        Bu qrup üçün dərs tapılmadı.
                      </td>
                    </tr>
                  ) : (
                    lessons.map((lesson, index) => (
                      <tr key={lesson.id} className="border-b border-lms-border last:border-0">
                        <td className="px-3 py-3 text-sm text-lms-heading">{index + 1}</td>
                        <td className="px-3 py-3 text-sm text-lms-heading">{lesson.lessonDate}</td>
                        <td className="px-3 py-3 text-sm text-lms-heading">{lesson.topic}</td>
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
                              className="text-sm font-medium text-lms-navy hover:underline"
                            >
                              Davamiyyət
                            </Link>
                            <Link
                              to={ROUTES.TEACHER_GRADES(lesson.id)}
                              className="text-sm font-medium text-lms-navy hover:underline"
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
                  <tr className="border-b border-lms-border bg-gray-50">
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-lms-heading">
                      #
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-lms-heading">
                      Başlıq
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-lms-heading">
                      Tip
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-lms-heading">
                      Tarix
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-lms-heading">
                      Əməliyyatlar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {materials.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-sm text-lms-muted">
                        Material tapılmadı.
                      </td>
                    </tr>
                  ) : (
                    materials.map((material, index) => (
                      <tr key={material.id} className="border-b border-lms-border last:border-0">
                        <td className="px-3 py-3 text-sm text-lms-heading">{index + 1}</td>
                        <td className="px-3 py-3 text-sm text-lms-heading">{material.title}</td>
                        <td className="px-3 py-3 text-sm capitalize text-lms-muted">
                          {material.type.replace('_', ' ')}
                        </td>
                        <td className="px-3 py-3 text-sm text-lms-heading">{material.createdAt}</td>
                        <td className="px-3 py-3">
                          <Link
                            to={ROUTES.TEACHER_MATERIAL}
                            className="text-sm font-medium text-lms-navy hover:underline"
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
                  className="text-sm font-medium text-lms-navy hover:underline"
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
