import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { MOCK_GROUPS } from '../../data/teacherMock';
import type { GroupStatus } from '../../types';

function statusBadgeClass(status: GroupStatus) {
  switch (status) {
    case 'Aktiv':
      return 'bg-primary/10 text-primary';
    case 'Tamamlanmış':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

export default function Groups() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text-base">Mənim Qruplarım</h1>

      <div className="rounded-neu bg-surface shadow-neu-sm p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-text-base">
            Cəmi Qruplar: <span className="font-semibold">{MOCK_GROUPS.length}</span>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-surface-dark/20 bg-surface-light">
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">
                  #
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">
                  Qrup adı
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">
                  Kurs adı
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">
                  Tələbə sayı
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">
                  Başlama tarixi
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">
                  Bitmə tarixi
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">
                  Status
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">
                  Son dərs tarixi
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-base/50">
                  Əməliyyatlar
                </th>
              </tr>
            </thead>
            <tbody>
              {MOCK_GROUPS.map((group, index) => (
                <tr key={group.id} className="border-b border-surface-dark/20 last:border-0">
                  <td className="px-3 py-3 text-sm text-text-base">{index + 1}</td>
                  <td className="px-3 py-3 text-sm text-text-base">{group.name}</td>
                  <td className="px-3 py-3 text-sm text-text-base">{group.courseName}</td>
                  <td className="px-3 py-3 text-sm text-text-base">{group.studentCount}</td>
                  <td className="px-3 py-3 text-sm text-text-base">{group.startDate}</td>
                  <td className="px-3 py-3 text-sm text-text-base">{group.endDate}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(group.status)}`}
                    >
                      {group.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm text-text-base">{group.lastLessonDate ?? '—'}</td>
                  <td className="px-3 py-3">
                    <Link
                      to={ROUTES.TEACHER_GROUP(group.id)}
                      className="text-sm font-medium text-primary hover:underline"
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
