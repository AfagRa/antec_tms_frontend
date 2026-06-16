import { File, Youtube, HardDrive, Link2 } from 'lucide-react'
import { MATERIAL_TYPE_CONFIG, type MaterialTypeName } from '../../types'

const ICON_MAP = { File, Youtube, HardDrive, Link2 }

interface Props {
  type: MaterialTypeName
  size?: 'sm' | 'md'
}

export function MaterialTypeBadge({ type, size = 'md' }: Props) {
  const cfg = MATERIAL_TYPE_CONFIG[type]
  if (!cfg) return null

  const IconComponent = ICON_MAP[cfg.icon as keyof typeof ICON_MAP]
  const iconSize = size === 'sm' ? 11 : 13
  const padding  = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1'
  const text     = size === 'sm' ? 'text-[11px]' : 'text-xs'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border font-medium ${cfg.bg} ${cfg.text} ${cfg.border} ${padding} ${text}`}>
      {IconComponent && (
        <IconComponent size={iconSize} className={cfg.iconColor} />
      )}
      {type}
    </span>
  )
}
