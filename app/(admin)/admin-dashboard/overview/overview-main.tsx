"use client";

import { useState } from "react";
import { useFetchUserData } from "@/hooks/use-users-info";
import { formatDay, getSchoolToday } from "@/lib/attendance-dates";
import TeacherFormLocationSelect from "../teachers/teacher-form-location-select";
import TodayRow from "./today-row";
import TotalsGrid from "./totals-grid";
import AttendanceTrendRow from "./attendance-trend-row";

// the attendance summary needs one campus, so admins who can see both pick one
const DEFAULT_LOCATION = "Old Road";

export default function OverviewMain() {
  const { data: userData } = useFetchUserData();
  // campus-bound admins only ever see their own campus
  const ownLocation: string | null = userData?.user?.location || null;
  const [pickedLocation, setPickedLocation] = useState(DEFAULT_LOCATION);
  const location = ownLocation ?? pickedLocation;
  const today = getSchoolToday();

  return (
    <div className="mt-4 space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          {formatDay(today, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
          {" · "}
          {location}
        </p>
        {!ownLocation && (
          <div className="w-full sm:w-48">
            <TeacherFormLocationSelect
              value={pickedLocation}
              onChange={setPickedLocation}
            />
          </div>
        )}
      </div>

      <TodayRow location={location} />
      <TotalsGrid />
      <AttendanceTrendRow location={location} />
    </div>
  );
}
