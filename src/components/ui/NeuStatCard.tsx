interface Props {
  value: number | string
  label: string
  accent?: boolean
}

export default function NeuStatCard({ value, label, accent }: Props) {
  return (
    <div className="neu-card">
      <div className={`text-4xl font-bold ${accent ? 'text-lms-student-accent' : 'text-lms-student-text'}`}>
        {value}
      </div>
      <div className="text-sm text-lms-student-muted mt-2 leading-snug">
        {label}
      </div>
    </div>
  )
}
