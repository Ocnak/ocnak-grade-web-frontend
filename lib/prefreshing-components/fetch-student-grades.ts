import { backendGet } from "./backend-get";

// the server and the client share this key, so the prefetched data is picked up
export const studentGradesKey = (studentId: string) =>
  ["student-grades", studentId] as const;

export async function fetchStudentGrades(studentId: string, cookie?: string) {
  const data = await backendGet<{ grades: any }>(
    `/api/student-grades/by-student/${studentId}`,
    "Failed to fetch student grades",
    cookie,
  );
  return data.grades;
}
