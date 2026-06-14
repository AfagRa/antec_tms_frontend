interface Props {
  value: number | string
  label: string
  accent?: boolean
}

export default function NeuStatCard({ value, label, accent }: Props) {
  return (
    <div className="rounded-neu bg-surface shadow-neu-sm p-5">
      <div className={`text-4xl font-bold ${accent ? 'text-primary' : 'text-text-base'}`}>
        {value}
      </div>
      <div className="text-sm text-text-base/50 mt-2 leading-snug">
        {label}
      </div>
    </div>
  )
}
