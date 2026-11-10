"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Fredoka } from "next/font/google";
import { BusIcon, HouseIcon, SchoolIcon, type LucideIcon } from "lucide-react";
import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { useScanStudent } from "@/hooks/use-student-tracking";
import type { ScanStatus } from "@/lib/types/student-attendance-shared";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// the camera only exists in the browser, so never render the scanner on the server
const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-square w-full animate-pulse rounded-xl bg-slate-200" />
    ),
  },
);

const MODE_STORAGE_KEY = "ocnak-scanner-mode";
const REPEAT_SCAN_WINDOW_MS = 3000;

type ScanMode = {
  status: ScanStatus;
  label: string;
  hint: string;
  doneText: string;
  icon: LucideIcon;
  buttonActive: string;
  buttonIdle: string;
  frame: string;
  result: string;
};

// full class names, so Tailwind keeps them in the build
const SCAN_MODES: ScanMode[] = [
  {
    status: "at_school",
    label: "At School",
    hint: "Marks the student present",
    doneText: "Checked in",
    icon: SchoolIcon,
    buttonActive: "border-green-600 bg-green-600 text-white hover:bg-green-700",
    buttonIdle:
      "border-gray-300 bg-white text-slate-700 hover:border-green-400 hover:bg-green-50 hover:text-green-700",
    frame: "border-green-500",
    result: "border-green-500 bg-green-50 text-green-800",
  },
  {
    status: "on_bus",
    label: "On Bus",
    hint: "Doesn't mark the student present",
    doneText: "On the bus",
    icon: BusIcon,
    buttonActive: "border-amber-500 bg-amber-500 text-white hover:bg-amber-600",
    buttonIdle:
      "border-gray-300 bg-white text-slate-700 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700",
    frame: "border-amber-400",
    result: "border-amber-400 bg-amber-50 text-amber-800",
  },
  {
    status: "off_campus",
    label: "Off Campus",
    hint: "The student has left school",
    doneText: "Checked out",
    icon: HouseIcon,
    buttonActive: "border-slate-700 bg-slate-700 text-white hover:bg-slate-800",
    buttonIdle:
      "border-gray-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-800",
    frame: "border-slate-600",
    result: "border-slate-500 bg-slate-100 text-slate-800",
  },
];

type ScanFeedback = {
  id: number;
  kind: "updated" | "already_set" | "error";
  name: string | null;
  message: string;
  mode: ScanMode;
  at: Date;
};

const formatTime = (date: Date) =>
  date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export default function StudentScannerMain() {
  const [modeStatus, setModeStatus] = useState<ScanStatus>("at_school");
  const [feedback, setFeedback] = useState<ScanFeedback[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const { mutate } = useScanStudent();

  // refs, so a burst of camera reads never sends the same scan twice
  const isBusyRef = useRef(false);
  const lastScanRef = useRef<{ token: string; at: number } | null>(null);
  const feedbackIdRef = useRef(0);

  const mode = SCAN_MODES.find((m) => m.status === modeStatus) ?? SCAN_MODES[0];
  const latest = feedback[0];

  // the scanner can hold an old onScan, so it reads the mode from a ref, never the closure
  const modeRef = useRef(mode);
  modeRef.current = mode;

  // each device remembers its mode: a gate phone stays on "At School"
  useEffect(() => {
    const saved = localStorage.getItem(MODE_STORAGE_KEY) as ScanStatus | null;
    if (saved && SCAN_MODES.some((m) => m.status === saved))
      setModeStatus(saved);
  }, []);

  const onHandleModeChange = (status: ScanStatus) => {
    setModeStatus(status);
    localStorage.setItem(MODE_STORAGE_KEY, status);
    lastScanRef.current = null;
  };

  const onHandleFeedback = (entry: Omit<ScanFeedback, "id" | "at">) => {
    feedbackIdRef.current += 1;
    setFeedback((prev) =>
      [{ ...entry, id: feedbackIdRef.current, at: new Date() }, ...prev].slice(
        0,
        6,
      ),
    );
  };

  const onHandleScan = (codes: IDetectedBarcode[]) => {
    const token = codes[0]?.rawValue?.trim();
    if (!token || isBusyRef.current) return;

    // the camera keeps reading a code while it's in view; ignore repeats
    const now = Date.now();
    const last = lastScanRef.current;
    if (last && last.token === token && now - last.at < REPEAT_SCAN_WINDOW_MS)
      return;

    lastScanRef.current = { token, at: now };
    isBusyRef.current = true;

    // lock in the mode at scan time, so the result shows the mode that was actually sent
    const scanMode = modeRef.current;

    mutate(
      { token, status: scanMode.status },
      {
        onSuccess: (data) => {
          const updated = data.result === "updated";
          navigator.vibrate?.(updated ? 80 : [60, 40, 60]);
          onHandleFeedback({
            kind: data.result,
            name: data.student.name,
            message: updated
              ? scanMode.doneText
              : `Already marked ${scanMode.label.toLowerCase()} today`,
            mode: scanMode,
          });
        },
        onError: (err) => {
          navigator.vibrate?.([150, 60, 150]);
          onHandleFeedback({
            kind: "error",
            name: null,
            message: err.message,
            mode: scanMode,
          });
        },
        onSettled: () => {
          isBusyRef.current = false;
          lastScanRef.current = { token, at: Date.now() };
        },
      },
    );
  };

  return (
    <main className="mx-auto w-full max-w-md space-y-4 bg-[#f9faf8] px-3.75 py-3 md:py-6">
      <h1
        className={`${fredoka.className} text-[29px] font-semibold text-slate-800 md:text-[35px]`}
      >
        Student Scanner
      </h1>

      <div>
        <Link href="/admin-dashboard/tracking">
          <Button className="w-38 h-12 rounded-md cursor-pointer font-medium bg-slate-800 text-white hover:bg-slate-700">
            Student Tracking
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {SCAN_MODES.map((m) => {
          const Icon = m.icon;
          const active = m.status === mode.status;
          return (
            <Button
              key={m.status}
              type="button"
              onClick={() => onHandleModeChange(m.status)}
              aria-pressed={active}
              className={`flex h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 text-sm font-medium transition-colors ${
                active ? m.buttonActive : m.buttonIdle
              }`}
            >
              <Icon className="size-6" />
              {m.label}
            </Button>
          );
        })}
      </div>

      <p className="text-center text-sm text-gray-500">{mode.hint}</p>

      <div
        className={`overflow-hidden rounded-xl border-4 bg-black ${mode.frame}`}
      >
        {cameraError ? (
          <div className="flex aspect-square items-center justify-center bg-white p-6 text-center text-sm text-red-700">
            {cameraError}
          </div>
        ) : (
          <Scanner
            // a new mode gets a fresh scanner, so the same card can be scanned again
            key={mode.status}
            onScan={onHandleScan}
            onError={() =>
              setCameraError(
                "The camera couldn't start. Allow camera access for this site in your browser settings, then reload the page.",
              )
            }
            // the beep on every scan
            sound
            formats={["qr_code"]}
            constraints={{ facingMode: "environment" }}
            scanDelay={500}
            components={{ finder: true }}
            styles={{ container: { width: "100%", aspectRatio: "1 / 1" } }}
          />
        )}
      </div>

      {latest && (
        <div
          className={`rounded-lg border-l-4 p-4 text-center ${
            latest.kind === "error"
              ? "border-red-500 bg-red-50 text-red-800"
              : latest.kind === "already_set"
                ? "border-gray-400 bg-gray-50 text-slate-700"
                : latest.mode.result
          }`}
        >
          {latest.name && (
            <p
              className={`${fredoka.className} text-2xl font-semibold capitalize`}
            >
              {latest.name}
            </p>
          )}
          <p className="text-[15px] font-medium">
            {latest.message} · {formatTime(latest.at)}
          </p>
        </div>
      )}

      {feedback.length > 1 && (
        <div className="rounded-lg border border-gray-300 bg-white">
          <p className="border-b border-gray-200 px-3 py-2 text-[13px] font-bold text-[#777]">
            Recent scans
          </p>
          <ul>
            {feedback.slice(1).map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between border-b border-gray-100 px-3 py-2 text-sm last:border-b-0"
              >
                <span className="truncate capitalize">
                  {item.name ?? "Unknown card"}
                </span>
                <span
                  className={`shrink-0 ${item.kind === "error" ? "text-red-600" : "text-gray-500"}`}
                >
                  {item.kind === "error" ? "Failed" : item.mode.label} ·{" "}
                  {formatTime(item.at)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
