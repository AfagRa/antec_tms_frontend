import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { MOCK_GROUPS } from '../../data/teacherMock';
import type { GroupStatus } from '../../types';

function statusBadgeClass(status: GroupStatus) {
  switch (status) {
    case 'Aktiv':
      return 'bg-lms-navy-light text-lms-navy';
    case 'Tamamlanmış':
      return 'bg-lms-badge-done-bg text-lms-badge-done-text';
    default:
      return 'bg-lms-badge-passive-bg text-lms-badge-passive-text';
  }
}

export default function Groups() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-lms-heading">Mənim Qruplarım</h1>

      <div className="lms-card">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-lms-heading">
            Cəmi Qruplar: <span className="font-semibold">{MOCK_GROUPS.length}</span>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-lms-border bg-gray-50">
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-lms-muted">
                  #
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-lms-muted">
                  Qrup adı
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-lms-muted">
                  Kurs adı
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-lms-muted">
                  Tələbə sayı
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-lms-muted">
                  Başlama tarixi
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-lms-muted">
                  Bitmə tarixi
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-lms-muted">
                  Status
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-lms-muted">
                  Son dərs tarixi
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-lms-muted">
                  Əməliyyatlar
                </th>
              </tr>
            </thead>
            <tbody>
              {MOCK_GROUPS.map((group, index) => (
                <tr key={group.id} className="border-b border-lms-border last:border-0">
                  <td className="px-3 py-3 text-sm text-lms-heading">{index + 1}</td>
                  <td className="px-3 py-3 text-sm text-lms-heading">{group.name}</td>
                  <td className="px-3 py-3 text-sm text-lms-heading">{group.courseName}</td>
                  <td className="px-3 py-3 text-sm text-lms-heading">{group.studentCount}</td>
                  <td className="px-3 py-3 text-sm text-lms-heading">{group.startDate}</td>
                  <td className="px-3 py-3 text-sm text-lms-heading">{group.endDate}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(group.status)}`}
                    >
                      {group.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm text-lms-heading">{group.lastLessonDate ?? '—'}</td>
                  <td className="px-3 py-3">
                    <Link
                      to={ROUTES.TEACHER_GROUP(group.id)}
                      className="text-sm font-medium text-lms-navy hover:underline"
                    >
                      Detallara Bax
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
