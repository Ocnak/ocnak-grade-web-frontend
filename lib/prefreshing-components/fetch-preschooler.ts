import { backendGet } from "./backend-get";

export type PreschoolerCategoryWithQuestions = {
  id: string;
  categoryName: string | null;
  questions: { id: string; questionText: string | null }[];
};

export type PreschoolerAnswer = {
  id: string;
  status: string | null;
  questionId: string;
  reportCardId: string;
};

// the report card shows this semester until another one is picked
export const DEFAULT_PRESCHOOLER_SEMESTER = "Semester 1";

// the server and the client share these keys, so the prefetched data is picked up
export const PRESCHOOLER_QUESTIONS_QUERY_KEY = [
  "preschooler_categories_with_questions",
] as const;

export const preschoolerAnswersKey = (
  studentId: string | null,
  semester: string,
) => ["preschooler_answers", "by-student", studentId, semester] as const;

export async function fetchPreschoolerQuestions(cookie?: string) {
  const data = await backendGet<{
    categories: PreschoolerCategoryWithQuestions[];
  }>(
    `/api/preschooler/categories-with-questions`,
    "Failed to fetch preschooler categories with questions",
    cookie,
  );
  return data.categories;
}

export async function fetchPreschoolerAnswers(
  studentId: string,
  semester: string,
  cookie?: string,
) {
  const data = await backendGet<{ answers: PreschoolerAnswer[] }>(
    `/api/preschooler/answers/by-student/${studentId}?semester=${encodeURIComponent(semester)}`,
    "Failed to fetch preschooler answers",
    cookie,
  );
  return data.answers;
}
