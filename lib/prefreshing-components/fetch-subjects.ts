import { backendGet } from "./backend-get";

// the server and the client share this key, so the prefetched data is picked up
export const subjectsByClassKey = (classId: string | null) =>
  ["subjects", "by-class", classId] as const;

export async function fetchSubjectsByClass(classId: string, cookie?: string) {
  const data = await backendGet<{ subjects: { id: string; name: string }[] }>(
    `/api/subjects/by-class/${classId}`,
    "Failed to fetch subjects for class",
    cookie,
  );
  return data.subjects;
}
