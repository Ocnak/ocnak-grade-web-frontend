import { BusIcon, HouseIcon, SchoolIcon, type LucideIcon } from "lucide-react";
import type { TrackingStatus } from "@/lib/types/student-attendance-shared";

export const TRACKING_STATUS_ORDER: TrackingStatus[] = [
  "at_school",
  "on_bus",
  "off_campus",
];

type StatusStyle = {
  label: string;
  icon: LucideIcon;
  badge: string;
  iconBg: string;
  cardActive: string;
  optionActive: string;
  optionIdle: string;
};

// full class names, so Tailwind keeps them in the build
export const TRACKING_STATUS_STYLES: Record<TrackingStatus, StatusStyle> = {
  at_school: {
    label: "At School",
    icon: SchoolIcon,
    badge: "bg-green-100 text-green-800",
    iconBg: "bg-green-100 text-green-700",
    cardActive: "border-green-500 bg-green-50",
    optionActive: "border-green-600 bg-green-600 text-white hover:bg-green-700",
    optionIdle:
      "border-gray-300 bg-white text-slate-700 hover:border-green-400 hover:bg-green-50 hover:text-green-700",
  },
  on_bus: {
    label: "On Bus",
    icon: BusIcon,
    badge: "bg-amber-100 text-amber-800",
    iconBg: "bg-amber-100 text-amber-700",
    cardActive: "border-amber-400 bg-amber-50",
    optionActive: "border-amber-500 bg-amber-500 text-white hover:bg-amber-600",
    optionIdle:
      "border-gray-300 bg-white text-slate-700 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700",
  },
  off_campus: {
    label: "Off Campus",
    icon: HouseIcon,
    badge: "bg-slate-200 text-slate-700",
    iconBg: "bg-slate-200 text-slate-700",
    cardActive: "border-slate-500 bg-slate-100",
    optionActive: "border-slate-700 bg-slate-700 text-white hover:bg-slate-800",
    optionIdle:
      "border-gray-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-800",
  },
};
