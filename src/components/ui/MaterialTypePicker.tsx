import { CloudUpload, File, Link, Play, Video } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { MaterialType } from '../../types';

interface MaterialTypePickerProps {
  value: MaterialType;
  onChange: (value: MaterialType) => void;
}

const MATERIAL_TYPES: { value: MaterialType; label: string; icon: LucideIcon }[] = [
  { value: 'file', label: 'Fayl', icon: File },
  { value: 'link', label: 'Link', icon: Link },
  { value: 'video_link', label: 'Video Link', icon: Video },
  { value: 'google_drive', label: 'Google Drive', icon: CloudUpload },
  { value: 'youtube', label: 'YouTube', icon: Play },
];

export default function MaterialTypePicker({ value, onChange }: MaterialTypePickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {MATERIAL_TYPES.map(({ value: typeValue, label, icon: Icon }) => {
        const selected = value === typeValue;

        return (
          <button
            key={typeValue}
            type="button"
            onClick={() => onChange(typeValue)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
              selected
                ? 'border-2 border-primary bg-primary/10 font-medium text-primary'
                : 'border border-surface-dark/20 bg-surface text-text-base/60 hover:border-primary/50'
            }`}
          >
            <Icon size={18} strokeWidth={1.5} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
