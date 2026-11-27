import Link from "next/link";
import { Fredoka } from "next/font/google";
import type { ComponentType } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// the same card as the Student Monitoring status cards, but as a link
export default function StatCard({
  href,
  label,
  value,
  icon: Icon,
  iconBg,
  loading = false,
}: {
  href: string;
  label: string;
  value: number | string | null | undefined;
  icon: ComponentType<{ className?: string }>;
  iconBg: string;
  loading?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border-2 border-gray-200 bg-white p-4 transition-colors hover:border-slate-800"
    >
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-full ${iconBg}`}
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-medium text-gray-500">
          {label}
        </span>
        {loading ? (
          <Skeleton className="mt-1 h-7 w-12" />
        ) : (
          <span
            className={`${fredoka.className} text-[28px] leading-none font-semibold text-slate-800`}
          >
            {value ?? "–"}
          </span>
        )}
      </span>
    </Link>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className={`${fredoka.className} text-[20px] font-semibold`}>
      {children}
    </h2>
  );
}
