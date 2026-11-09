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

const BASE_PATH = "/admin-dashboard/tracking";

const TABS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "QR Cards", href: BASE_PATH, icon: QrCodeIcon },
  { label: "Scanner", href: "/admin-dashboard/scanner", icon: ScanLineIcon },
  { label: "Live Status", href: `${BASE_PATH}/live`, icon: Radio },
  {
    label: "Attendance",
    href: `${BASE_PATH}/attendance`,
    icon: CalendarCheckIcon,
  },
];

export default function StudentTrackingMenu() {
  const pathname = usePathname();
  const router = useRouter();

  // QR Cards owns only /tracking itself, so it isn't highlighted on /tracking/live
  const isActive = (href: string) =>
    href === BASE_PATH ? pathname === href : pathname.startsWith(href);

  const onHandleNavigate = (href: string) => router.push(href);
  const onHandlePrefetch = (href: string) => router.prefetch(href);

  const renderTab = (
    { label, href, icon: Icon }: (typeof TABS)[number],
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
        {TABS.map((tab) =>
          renderTab(tab, "h-11 w-full min-w-0 rounded-md px-2 text-sm"),
        )}
      </div>

      {/* tablets and up: one joined row */}
      <ButtonGroup className="hidden sm:flex">
        {TABS.map((tab) => renderTab(tab, "h-11.5 w-38 px-6 text-base"))}
      </ButtonGroup>
    </>
  );
}
