const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

// Browser: credentials:"include" sends the cookies.
// Server: the caller passes the request's cookie header in.
async function backendGet<T>(path: string, cookie?: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: cookie ? { cookie } : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Request failed: ${path}`);
  }
  return res.json();
}

// ---- query keys (single source of truth) ----
export const studentByIdKey = (studentId: string | null) =>
  ["students", studentId] as const;

export const studentsByClassKey = (classId: string | null) =>
  ["students", "by-class", classId] as const;

export const CLASSES_QUERY_KEY = ["classes"] as const; // must match useFetchClasses

// ---- fetchers (return exactly what the hooks return) ----
export async function fetchStudentById(studentId: string, cookie?: string) {
  const data = await backendGet<{ student: any }>(
    `/api/students/get-by-id/${studentId}`,
    cookie,
  );
  return data.student;
}

export async function fetchStudentsByClass(classId: string, cookie?: string) {
  const data = await backendGet<{ students: any[] }>(
    `/api/students/by-class/${classId}`,
    cookie,
  );
  return data.students;
}

export async function fetchClasses(cookie?: string) {
  // useFetchClasses reads data.classes, so return the whole payload
  return backendGet<{ classes: { id: string; name: string }[] }>(
    `/api/classes/get-all`, // ← use the same URL useFetchClasses calls
    cookie,
  );
}
