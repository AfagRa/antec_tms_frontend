import { ROUTES } from '../constants/routes';
import {
  DEFAULT_GROUP_ID,
  MOCK_GROUPS,
  MOCK_LESSONS,
  MOCK_MATERIALS,
  MOCK_STUDENTS,
} from '../data/teacherMock';

export type SearchResultCategory = 'Qruplar' | 'Tələbələr' | 'Dərslər' | 'Materiallar';

export type SearchResultType = 'group' | 'student' | 'lesson' | 'material';

export interface GlobalSearchResult {
  id: string;
  label: string;
  category: SearchResultCategory;
  type: SearchResultType;
  to: string;
}

function matchesQuery(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

export function searchGlobal(query: string): GlobalSearchResult[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const results: GlobalSearchResult[] = [];

  for (const group of MOCK_GROUPS) {
    if (
      matchesQuery(group.name, trimmed) ||
      matchesQuery(group.courseName, trimmed)
    ) {
      results.push({
        id: `group-${group.id}`,
        label: group.name,
        category: 'Qruplar',
        type: 'group',
        to: ROUTES.TEACHER_GROUP(group.id),
      });
    }
  }

  for (const student of MOCK_STUDENTS) {
    const fullName = `${student.name} ${student.surname}`;
    if (
      matchesQuery(student.name, trimmed) ||
      matchesQuery(student.surname, trimmed) ||
      matchesQuery(fullName, trimmed) ||
      matchesQuery(student.email, trimmed)
    ) {
      results.push({
        id: `student-${student.id}`,
        label: fullName,
        category: 'Tələbələr',
        type: 'student',
        to: ROUTES.TEACHER_GROUP(DEFAULT_GROUP_ID),
      });
    }
  }

  for (const lesson of MOCK_LESSONS) {
    if (
      matchesQuery(lesson.topic, trimmed) ||
      matchesQuery(lesson.groupName, trimmed)
    ) {
      results.push({
        id: `lesson-${lesson.id}`,
        label: lesson.topic,
        category: 'Dərslər',
        type: 'lesson',
        to: ROUTES.TEACHER_ATTENDANCE(lesson.id),
      });
    }
  }

  for (const material of MOCK_MATERIALS) {
    if (matchesQuery(material.title, trimmed)) {
      results.push({
        id: `material-${material.id}`,
        label: material.title,
        category: 'Materiallar',
        type: 'material',
        to: ROUTES.TEACHER_MATERIAL,
      });
    }
  }

  return results;
}
