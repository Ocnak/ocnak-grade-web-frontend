import type {
  AttendanceStatus,
  DayStatus,
} from "@/lib/types/student-attendance-shared";

export const ATTENDANCE_STATUS_ORDER: AttendanceStatus[] = [
  "present",
  "tardy",
  "absent",
  "excused",
  "sick",
];

type DayStyle = {
  label: string;
  cell: string;
  dot: string;
  optionActive: string;
};

// full class names, so Tailwind keeps them in the build
export const DAY_STATUS_STYLES: Record<DayStatus, DayStyle> = {
  present: {
    label: "On time",
    cell: "border-green-200 bg-green-50 text-green-700",
    dot: "bg-green-500",
    optionActive: "border-green-600 bg-green-600 text-white hover:bg-green-700",
  },
  tardy: {
    label: "Late",
    cell: "border-amber-200 bg-amber-50 text-amber-800",
    dot: "bg-amber-500",
    optionActive: "border-amber-500 bg-amber-500 text-white hover:bg-amber-600",
  },
  absent: {
    label: "Absent",
    cell: "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-500",
    optionActive: "border-red-600 bg-red-600 text-white hover:bg-red-700",
  },
  excused: {
    label: "Excused",
    cell: "border-sky-200 bg-sky-50 text-sky-700",
    dot: "bg-sky-500",
    optionActive: "border-sky-600 bg-sky-600 text-white hover:bg-sky-700",
  },
  sick: {
    label: "Sick",
    cell: "border-purple-200 bg-purple-50 text-purple-700",
    dot: "bg-purple-500",
    optionActive:
      "border-purple-600 bg-purple-600 text-white hover:bg-purple-700",
  },
  no_school: {
    label: "Holiday",
    cell: "border-gray-200 bg-gray-100 text-gray-500",
    dot: "",
    optionActive: "",
  },
  not_arrived: {
    label: "Not yet",
    cell: "border-dashed border-gray-300 bg-white text-gray-500",
    dot: "",
    optionActive: "",
  },
  upcoming: {
    label: "",
    cell: "border-transparent bg-transparent",
    dot: "",
    optionActive: "",
  },
  not_enrolled: {
    label: "",
    cell: "border-transparent bg-transparent",
    dot: "",
    optionActive: "",
  },
};

export const OPTION_IDLE =
  "border-gray-300 bg-white text-slate-700 hover:border-gray-400 hover:bg-gray-50";
