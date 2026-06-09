import { Briefcase, Mail, User } from 'lucide-react';

interface ProfileField {
  label: string;
  value: string;
}

const PROFILE = {
  fullName: 'Admin',
  role: 'Baş Müəllim',
  roleBadge: 'Admin',
  email: 'admin@tedrismerkezi.az',
  phone: '+994 12 345 67 89',
  registeredAt: '15.01.2022',
  department: 'İT və Proqramlaşdırma',
  subjects: ['Python', 'Frontend Web Development'],
  employeeId: 'EMP-2022-0041',
  status: 'Aktiv',
};

const PERSONAL_FIELDS: ProfileField[] = [
  { label: 'E-poçt ünvanı', value: PROFILE.email },
  { label: 'Telefon nömrəsi', value: PROFILE.phone },
  { label: 'Qeydiyyat tarixi', value: PROFILE.registeredAt },
];

const PROFESSIONAL_FIELDS: ProfileField[] = [
  { label: 'Şöbə / İxtisas', value: PROFILE.department },
  { label: 'Əsas fənlər', value: PROFILE.subjects.join(', ') },
  { label: 'İşçi ID', value: PROFILE.employeeId },
  { label: 'Status', value: PROFILE.status },
];

function InfoSection({
  title,
  icon: Icon,
  fields,
}: {
  title: string;
  icon: typeof Mail;
  fields: ProfileField[];
}) {
  return (
    <div className="rounded-neu bg-surface shadow-neu-sm p-6">
      <div className="mb-4 flex items-center gap-2 border-b border-surface-dark/20 pb-3">
        <Icon size={18} strokeWidth={1.5} className="text-primary" />
        <h2 className="text-base font-semibold text-text-base">{title}</h2>
      </div>
      <dl className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label}>
            <dt className="mb-1 text-xs font-medium uppercase tracking-wide text-text-base/50">
              {field.label}
            </dt>
            <dd className="text-sm font-medium text-text-base">{field.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function Profile() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text-base">İstifadəçi Profili</h1>

      <div className="rounded-neu bg-surface shadow-neu-sm p-6 mb-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <User size={40} strokeWidth={1.5} className="text-primary" />
          </div>
          <div className="flex flex-1 flex-col items-center text-center sm:items-start sm:text-left">
            <h2 className="text-xl font-semibold text-text-base">{PROFILE.fullName}</h2>
            <p className="mt-1 text-sm text-text-base/50">Müəllim Adı</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
                {PROFILE.role}
              </span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {PROFILE.roleBadge}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <InfoSection title="Şəxsi Məlumatlar" icon={Mail} fields={PERSONAL_FIELDS} />
        <InfoSection title="Peşəkar Məlumatlar" icon={Briefcase} fields={PROFESSIONAL_FIELDS} />
      </div>
    </div>
  );
}
