"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radio, UsersIcon, type LucideIcon } from "lucide-react";

const LINKS: {
  label: string;
  // phones: a shorter label so both tabs fit beside the avatar
  shortLabel: string;
  href: string;
  match: string[];
  icon: LucideIcon;
}[] = [
  {
    label: "Students",
    shortLabel: "Students",
    href: "/teacher/students",
    // the student pages reached from the roster count as Students too
    match: [
      "/teacher/students",
      "/teacher/student-detail",
      "/teacher/view-student-grade",
      "/teacher/toddler-progress-report",
    ],
    icon: UsersIcon,
  },
  {
    label: "Student Monitoring",
    shortLabel: "Monitoring",
    href: "/teacher/tracking/live",
    match: ["/teacher/tracking", "/teacher/scanner"],
    icon: Radio,
  },
];

// the header tabs; smaller and with short labels on phones
export default function TeacherNavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Teacher" className="flex items-center gap-1.5 md:gap-2">
      {LINKS.map(({ label, shortLabel, href, match, icon: Icon }) => {
        const active = match.some((path) => pathname.startsWith(path));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex h-10 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium whitespace-nowrap transition-colors md:h-11 md:gap-2 md:px-4 md:text-[15px] ${
              active
                ? "bg-slate-800 text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Icon className="size-4 shrink-0 md:size-5" />
            <span className="md:hidden">{shortLabel}</span>
            <span className="hidden md:inline">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
