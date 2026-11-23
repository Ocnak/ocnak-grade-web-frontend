"use client";

import StudentInputSearch from "@/components/student-tracking/student-input-search";
import StudentSelectLocation from "@/components/student-tracking/student-select-location";
import StudentSelectClass from "@/components/student-tracking/student-select-class";
import { useTeacherScope } from "@/components/student-tracking/use-teacher-scope";

export default function TeacherTrackingFilters() {
  const { scope } = useTeacherScope();
  // a teacher with a known location only sees that location, so the filter adds nothing
  const showLocation = !scope.location;

  return (
    <div className="mt-11.25 mb-8 grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="w-full">
        <StudentInputSearch />
      </div>
      <div
        className={`grid gap-4 ${showLocation ? "grid-cols-2" : "grid-cols-1"}`}
      >
        {showLocation && <StudentSelectLocation />}
        <StudentSelectClass role="teacher" />
      </div>
    </div>
  );
}
