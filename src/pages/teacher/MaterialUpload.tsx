import { useState, useRef, type FormEvent, type ReactNode } from 'react';
import { Check, Upload, FileCheck, X, AlertCircle } from 'lucide-react';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (field === 'type' && value !== 'file') {
        setSelectedFile(null);
        setFilePreview('');
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
    if (formState.type === 'file') {
      if (!selectedFile) {
        nextErrors.resourceUrl = 'Fayl seçilməyib';
      }
    } else {
      if (!formState.resourceUrl.trim()) {
        nextErrors.resourceUrl = 'Resurs linki daxil edilməyib';
      }
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
    console.log('Material upload payload:', {
      ...material,
      ...(formState.type === 'file'
        ? { fileName: selectedFile?.name, fileSize: selectedFile?.size }
        : {}),
    });
    // TODO: POST FormData to POST /materials when API is ready
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

          {formState.type === 'file' ? (
            <FormField label="Fayl seçin" required error={errors.resourceUrl}>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.png,.jpg,.jpeg,.mp4,.mp3"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setSelectedFile(file);
                  setFilePreview(file ? file.name : '');
                  if (errors.resourceUrl) setErrors((prev) => ({ ...prev, resourceUrl: undefined }));
                }}
              />

              {!selectedFile ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-lms-border rounded-xl p-8 text-center hover:border-lms-green hover:bg-lms-green-light/10 transition-all cursor-pointer group"
                >
                  <Upload size={28} className="mx-auto text-lms-muted group-hover:text-lms-green transition-colors mb-2" />
                  <p className="text-sm font-medium text-lms-heading">
                    Faylı buraya çəkin və ya <span className="text-lms-green">seçin</span>
                  </p>
                  <p className="text-xs text-lms-muted mt-1">
                    PDF, Word, Excel, PPT, şəkil, video — maks. 50MB
                  </p>
                </button>
              ) : (
                <div className="lms-card flex items-center gap-3 p-3">
                  <div className="w-10 h-10 rounded-lg bg-lms-green-light flex items-center justify-center flex-shrink-0">
                    <FileCheck size={20} className="text-lms-green" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-lms-heading truncate">{selectedFile.name}</p>
                    <p className="text-xs text-lms-muted mt-0.5">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · {selectedFile.type || 'fayl'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedFile(null); setFilePreview(''); }}
                    className="flex-shrink-0 text-lms-muted hover:text-red-500 transition-colors p-1"
                    title="Faylı sil"
                  >
                    <X size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0 text-lms-muted hover:text-lms-green transition-colors text-xs border border-lms-border rounded-md px-2 py-1"
                  >
                    Dəyiş
                  </button>
                </div>
              )}
            </FormField>
          ) : (
            <FormField label="Resurs Linki" required error={errors.resourceUrl}>
              <input
                type="text"
                value={formState.resourceUrl}
                onChange={(event) => updateField('resourceUrl', event.target.value)}
                placeholder="Resurs Linki *"
                className={fieldClassName(Boolean(errors.resourceUrl))}
              />
            </FormField>
          )}

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
