import { useState, type FormEvent, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import MaterialTypePicker from '../../components/ui/MaterialTypePicker';
import { ROUTES } from '../../constants/routes';
import {
  DEFAULT_GROUP_ID,
  DEFAULT_LESSON_ID,
  MOCK_GROUPS,
  getLessonsByGroupId,
} from '../../data/teacherMock';
import type { Material, MaterialType } from '../../types';

interface MaterialFormState {
  groupId: string;
  lessonId: string;
  title: string;
  type: MaterialType;
  resourceUrl: string;
  description: string;
}

type FormErrors = Partial<Record<keyof MaterialFormState, string>>;

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

const inputClassName =
  'w-full rounded-md border border-surface-dark/20 px-3 py-2 text-sm text-text-base focus:outline-none focus:ring-2 focus:ring-primary/30';

function FormField({ label, required, error, children }: FormFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-text-base">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

function fieldClassName(hasError: boolean) {
  return hasError ? `${inputClassName} border-red-500` : inputClassName;
}

function toMaterialPayload(formState: MaterialFormState): Material {
  const isFile = formState.type === 'file';

  return {
    id: crypto.randomUUID(),
    lessonId: formState.lessonId,
    groupId: formState.groupId,
    title: formState.title,
    type: formState.type,
    url: isFile ? undefined : formState.resourceUrl,
    filePath: isFile ? formState.resourceUrl : undefined,
    description: formState.description || undefined,
    createdAt: new Date().toISOString(),
  };
}

export default function MaterialUpload() {
  const initialLessons = getLessonsByGroupId(DEFAULT_GROUP_ID);

  const [formState, setFormState] = useState<MaterialFormState>({
    groupId: DEFAULT_GROUP_ID,
    lessonId: initialLessons[0]?.id ?? DEFAULT_LESSON_ID,
    title: '',
    type: 'file',
    resourceUrl: '',
    description: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const lessonsForGroup = getLessonsByGroupId(formState.groupId);

  function updateField<K extends keyof MaterialFormState>(
    field: K,
    value: MaterialFormState[K],
  ) {
    setFormState((prev) => {
      const next = { ...prev, [field]: value };

      if (field === 'groupId') {
        const groupLessons = getLessonsByGroupId(String(value));
        next.lessonId = groupLessons[0]?.id ?? '';
      }

      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSuccessMessage(null);
  }

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};

    if (!formState.groupId.trim()) {
      nextErrors.groupId = 'Qrup seçilməlidir';
    }
    if (!formState.lessonId.trim()) {
      nextErrors.lessonId = 'Dərs seçilməlidir';
    }
    if (!formState.title.trim()) {
      nextErrors.title = 'Materialın başlığı daxil edilməlidir';
    }
    if (!formState.type) {
      nextErrors.type = 'Materialın tipi seçilməlidir';
    }
    if (!formState.resourceUrl.trim()) {
      nextErrors.resourceUrl = 'Resurs linki və ya sənəd ünvanı daxil edilməlidir';
    }

    return nextErrors;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSuccessMessage(null);
      return;
    }

    const material = toMaterialPayload(formState);
    console.log(material);
    setSuccessMessage('Material uğurla paylaşıldı!');
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text-base">Yeni Material Əlavə Et</h1>

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-2xl rounded-neu bg-surface shadow-neu-sm p-8"
      >
        {successMessage && (
          <div className="mb-6 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
            {successMessage}
          </div>
        )}

        <div className="space-y-5">
          <FormField label="Qrup Seçimi" required error={errors.groupId}>
            <select
              value={formState.groupId}
              onChange={(event) => updateField('groupId', event.target.value)}
              className={fieldClassName(Boolean(errors.groupId))}
            >
              {MOCK_GROUPS.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Aid Olduğu Dərs" required error={errors.lessonId}>
            <select
              value={formState.lessonId}
              onChange={(event) => updateField('lessonId', event.target.value)}
              className={fieldClassName(Boolean(errors.lessonId))}
            >
              {lessonsForGroup.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  Dərslər: {lesson.topic}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Materialın Başlığı" required error={errors.title}>
            <input
              type="text"
              value={formState.title}
              onChange={(event) => updateField('title', event.target.value)}
              placeholder="Masalən: Dərs 05 - Massivlər və Obyektlər"
              className={fieldClassName(Boolean(errors.title))}
            />
          </FormField>

          <FormField label="Materialın Tipi" required error={errors.type}>
            <MaterialTypePicker
              value={formState.type}
              onChange={(type) => updateField('type', type)}
            />
          </FormField>

          <FormField
            label="Resurs Linki və ya Sənəd Ünvanı"
            required
            error={errors.resourceUrl}
          >
            <input
              type="text"
              value={formState.resourceUrl}
              onChange={(event) => updateField('resourceUrl', event.target.value)}
              placeholder="Resurs Linki və ya Sənəd Ünvanı *"
              className={fieldClassName(Boolean(errors.resourceUrl))}
            />
          </FormField>

          <FormField label="Açıqlama / Qeyd (optional)">
            <textarea
              rows={4}
              value={formState.description}
              onChange={(event) => updateField('description', event.target.value)}
              className={`${inputClassName} resize-none`}
            />
          </FormField>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Link
            to={ROUTES.TEACHER_GROUPS}
            className="text-sm text-text-base/50 hover:text-text-base"
          >
            Ləğv et / Geri
          </Link>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Materialı Paylaş
            <Check size={16} strokeWidth={2} />
          </button>
        </div>
      </form>
    </div>
  );
}
