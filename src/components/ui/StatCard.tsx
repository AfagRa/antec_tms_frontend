interface StatCardProps {
  value: number | string;
  label: string;
}

export default function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="lms-card">
      <p className="text-3xl font-bold text-lms-heading">{value}</p>
      <p className="mt-1 text-sm text-lms-muted">{label}</p>
    </div>
  );
}
