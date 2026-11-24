import { backendGet } from "./backend-get";

const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/parents`;

export type ParentWithStudents = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  locations: string[];
  students: {
    id: string;
    firstName: string;
    lastName: string;
    location: string | null;
    classId: string | null;
    className: string | null;
  }[];
};

// the server and the client share this key, so the prefetched data is picked up
export const PARENTS_WITH_STUDENTS_QUERY_KEY = [
  "parents",
  "with-students",
] as const;

// cookie: only passed on the server, where the browser's cookies aren't sent automatically
export async function fetchParentsWithStudents(
  cookie?: string,
): Promise<ParentWithStudents[]> {
  const res = await fetch(`${BASE_URL}/with-students`, {
    credentials: "include",
    headers: cookie ? { cookie } : undefined,
    // signed-in data: never cache it on the server
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error ?? "Failed to fetch parents with students");
  }

  const data = await res.json();
  return data.parents as ParentWithStudents[];
}

export type ParentMe = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contact: string | null;
  students: ParentWithStudents["students"];
};

export type ParentStudentGrade = {
  id: string;
  subjectId: string;
  periodId: string;
  numericGrade: number | null;
  letterGrade: string | null;
  subjectName: string;
  periodNumber: number | null;
};

export const PARENT_ME_QUERY_KEY = ["parents", "me"] as const;

export const parentStudentGradesKey = (
  parentId: string | null,
  studentId: string | null,
) => ["parents", parentId, "students", studentId, "grades"] as const;

// the logged-in parent, with their children
export async function fetchParentMe(cookie?: string): Promise<ParentMe> {
  const data = await backendGet<{ parent: ParentMe }>(
    `/api/parents/me`,
    "Failed to fetch parent",
    cookie,
  );
  return data.parent;
}

export async function fetchParentStudentGrades(
  parentId: string,
  studentId: string,
  cookie?: string,
): Promise<ParentStudentGrade[]> {
  const data = await backendGet<{ grades: ParentStudentGrade[] }>(
    `/api/parents/${parentId}/students/${studentId}/grades`,
    "Failed to fetch student's grades",
    cookie,
  );
  return data.grades;
}
