"use client";

import { useMemo } from "react";
import { useTeacherClasses } from "@/hooks/use-classes";
import { useFetchUserData } from "@/hooks/use-users-info";

export type TrackingScope = {
  classIds: string[];
  // null when the teacher's location isn't known; the backend still limits it
  location: string | null;
};

// The backend already limits teachers to their own classes and location.
// This filters the lists again on the client in case it ever sends more.
export function useTeacherScope() {
  const { data: userData, isLoading: userLoading } = useFetchUserData();
  const teacherId: string | null = userData?.user?.id ?? null;
  const { data: classes, isLoading: classesLoading } =
    useTeacherClasses(teacherId);

  const location: string | null = userData?.user?.location || null;

  const sortedClasses = useMemo(
    () =>
      [...((classes ?? []) as { id: string; name: string }[])].sort(
        (a, b) => getGradeNum(a.name) - getGradeNum(b.name),
      ),
    [classes],
  );

  const scope = useMemo<TrackingScope>(
    () => ({ classIds: sortedClasses.map((cls) => cls.id), location }),
    [sortedClasses, location],
  );

  return {
    scope,
    classes: sortedClasses,
    // also loading until the user id is known, since the class query waits on it
    isLoading: userLoading || !teacherId || classesLoading,
  };
}

export const getGradeNum = (name: string) => {
  const match = name.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
};

// no scope (admin) lets every student through
export const isInScope = (
  scope: TrackingScope | undefined,
  student: { location: string; class: { id: string } | null },
) => {
  if (!scope) return true;
  const inClass = !!student.class && scope.classIds.includes(student.class.id);
  const inLocation = scope.location
    ? student.location === scope.location
    : true;
  return inClass && inLocation;
};
