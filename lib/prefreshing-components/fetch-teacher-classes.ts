import type { QueryClient } from "@tanstack/react-query";
import { fetchUserData } from "./fetch-user-data";
import { backendGet } from "./backend-get";

// the server and the client share this key, so the prefetched data is picked up
export const teacherClassesKey = (teacherId: string | null) =>
  ["classes", teacherId] as const;

export async function fetchTeacherClasses(teacherId: string, cookie?: string) {
  const data = await backendGet<{ classes: { id: string; name: string }[] }>(
    `/api/classes/by-teacher/${teacherId}`,
    "Failed to fetch classes",
    cookie,
  );
  return data.classes;
}

// server only: the signed-in teacher's classes. The client hooks key them on
// userData.user.id (useTeacherScope, StudentClassMenu), so read the id the same way.
// If anything fails, nothing is cached and the client fetches as before.
export async function prefetchTeacherClasses(
  queryClient: QueryClient,
  cookie: string,
) {
  if (!cookie) return;

  try {
    const userData = await fetchUserData(cookie);
    const teacherId: string | undefined = userData?.user?.id;
    if (!teacherId) return;

    await queryClient.prefetchQuery({
      queryKey: teacherClassesKey(teacherId),
      queryFn: () => fetchTeacherClasses(teacherId, cookie),
    });
  } catch {
    // client falls back to fetching
  }
}
