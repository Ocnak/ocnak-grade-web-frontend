"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Fredoka } from "next/font/google";
import { Spinner } from "@/components/ui/spinner";
import { useFilterStore } from "@/store/filterStore";
import { useFetchScanners } from "@/hooks/use-scanner";
import InputSearch from "../teachers/input-search";
import TeacherSelectLocation from "../teachers/teacher-select-location";
import ScannerCard from "./scanner-card";
import CreateScannerModal from "./create-scanner-modal";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function ScannersMain() {
  const { isLoading, data: scannerData, error } = useFetchScanners();
  const { name, location } = useFilterStore();

  // filter and sort on screen, so changing a filter is instant
  const sortedScanners = useMemo(() => {
    const term = name.trim().toLowerCase();

    return (scannerData ?? [])
      .filter((scanner) => {
        const fullName =
          `${scanner.firstName} ${scanner.lastName}`.toLowerCase();
        const matchesName = term ? fullName.includes(term) : true;
        const matchesLocation = location ? scanner.location === location : true;

        return matchesName && matchesLocation;
      })
      .sort(
        (a, b) =>
          a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase()) ||
          a.lastName.toLowerCase().localeCompare(b.lastName.toLowerCase()),
      );
  }, [scannerData, name, location]);

  const hasScanners = Array.isArray(scannerData) && scannerData.length > 0;

  return (
    <>
      <div className="mt-10.25 grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="w-full lg:max-w-108">
          <InputSearch placeholder="Find scanner..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TeacherSelectLocation />
          <CreateScannerModal />
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner className="size-19" />
        </div>
      ) : error ? (
        <p className="mt-7.5 text-sm text-red-600">Failed to load scanners.</p>
      ) : !hasScanners ? (
        <div
          className={`mt-10 flex w-full flex-col items-center justify-center gap-2 text-slate-800 ${fredoka.className}`}
        >
          <Image
            src="/images/undraw_no-data_ig65.svg"
            alt="empty rooster image"
            width={300}
            height={300}
            className="size-48"
            preload
            quality={75}
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          <h1 className="text-center text-[22px] font-semibold md:text-[26px]">
            Don&apos;t have any scanner data, add some now
          </h1>
        </div>
      ) : sortedScanners.length === 0 ? (
        <p className="mt-7.5 text-sm text-gray-500">
          No scanners match these filters.
        </p>
      ) : (
        <div className="mt-7.5 grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-3 lg:grid-cols-4">
          {sortedScanners.map((scanner) => (
            <ScannerCard
              key={scanner.id}
              scannerId={scanner.id}
              firstName={scanner.firstName}
              lastName={scanner.lastName}
              email={scanner.email}
              location={scanner.location}
            />
          ))}
        </div>
      )}
    </>
  );
}
