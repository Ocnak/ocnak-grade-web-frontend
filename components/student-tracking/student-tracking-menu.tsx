"use client";

import { usePathname, useRouter } from "next/navigation";
import { ButtonGroup } from "@/components/ui/button-group";
import { RippleButton } from "@/components/ui/ripple-button";
import {
  QrCodeIcon,
  CalendarCheckIcon,
  Radio,
  ScanLineIcon,
  type LucideIcon,
} from "lucide-react";

export type TrackingTab = { label: string; href: string; icon: LucideIcon };

const ADMIN_BASE = "/admin-dashboard/tracking";
const TEACHER_BASE = "/teacher/tracking";
const SCANNER_BASE = "/scanner/tracking";

export const ADMIN_TRACKING_TABS: TrackingTab[] = [
  { label: "QR Cards", href: ADMIN_BASE, icon: QrCodeIcon },
  { label: "Scanner", href: "/admin-dashboard/scanner", icon: ScanLineIcon },
  { label: "Live Status", href: `${ADMIN_BASE}/live`, icon: Radio },
  {
    label: "Attendance",
    href: `${ADMIN_BASE}/attendance`,
    icon: CalendarCheckIcon,
  },
];

// teachers don't manage QR cards
export const TEACHER_TRACKING_TABS: TrackingTab[] = [
  { label: "Scanner", href: "/teacher/scanner", icon: ScanLineIcon },
  { label: "Live Status", href: `${TEACHER_BASE}/live`, icon: Radio },
  {
    label: "Attendance",
    href: `${TEACHER_BASE}/attendance`,
    icon: CalendarCheckIcon,
  },
];

// scanner accounts: Scanner and Live Status only, no Attendance (that's for
// admins and teachers). The scan page is /scanner/scan, not /scanner, so no
// tab's href is a prefix of another's
export const SCANNER_TRACKING_TABS: TrackingTab[] = [
  { label: "Scanner", href: "/scanner/scan", icon: ScanLineIcon },
  { label: "Live Status", href: `${SCANNER_BASE}/live`, icon: Radio },
];

const TABS_BY_ROLE = {
  admin: ADMIN_TRACKING_TABS,
  teacher: TEACHER_TRACKING_TABS,
  scanner: SCANNER_TRACKING_TABS,
};

// takes the role, not the tabs: icons can't be passed from a server layout
export default function StudentTrackingMenu({
  role,
}: {
  role: "admin" | "teacher" | "scanner";
}) {
  const tabs = TABS_BY_ROLE[role];
  // QR Cards' href is a prefix of the others, so it only matches itself
  const exactHref = role === "admin" ? ADMIN_BASE : undefined;
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    href === exactHref ? pathname === href : pathname.startsWith(href);

  const onHandleNavigate = (href: string) => router.push(href);
  const onHandlePrefetch = (href: string) => router.prefetch(href);

  const renderTab = (
    { label, href, icon: Icon }: TrackingTab,
    className: string,
  ) => {
    const active = isActive(href);

    return (
      <RippleButton
        key={href}
        variant={active ? "default" : "outline"}
        aria-current={active ? "page" : undefined}
        onClick={() => onHandleNavigate(href)}
        onMouseEnter={() => onHandlePrefetch(href)}
        className={`cursor-pointer gap-2 ${className}`}
      >
        <Icon className="size-5 shrink-0 sm:size-6" />
        <span>{label}</span>
      </RippleButton>
    );
  };

  return (
    <>
      {/* phones: two columns of separate buttons */}
      <div className="grid w-full grid-cols-2 gap-2 sm:hidden">
        {tabs.map((tab) =>
          renderTab(tab, "h-11 w-full min-w-0 rounded-md px-2 text-sm"),
        )}
      </div>

      {/* tablets and up: one joined row */}
      <ButtonGroup className="hidden sm:flex">
        {tabs.map((tab) => renderTab(tab, "h-11.5 w-38 px-6 text-base"))}
      </ButtonGroup>
    </>
  );
}
