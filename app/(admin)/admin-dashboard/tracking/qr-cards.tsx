"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Fredoka } from "next/font/google";
import { QRCodeSVG } from "qrcode.react";
import { useReactToPrint } from "react-to-print";
import { FaPrint } from "react-icons/fa6";
import { useFilterStore } from "@/store/filterStore";
import { useQrCards, type QrCard } from "@/hooks/use-student-tracking";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import ReissueQrCardModal from "./reissue-qr-card-modal";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const CARDS_PER_PAGE = 2;

type QrCardsPageProps = {
  schoolName?: string;
};

const getFullName = (card: QrCard) =>
  `${card.firstName} ${card.lastName}`.trim();

function chunkIntoPages<T>(items: T[], perPage: number) {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += perPage) {
    pages.push(items.slice(i, i + perPage));
  }
  return pages;
}

// the large version that goes on paper
function PrintableQrCard({
  card,
  schoolName,
}: {
  card: QrCard;
  schoolName: string;
}) {
  return (
    <div className="flex w-[90mm] flex-col items-center rounded-xl border-2 border-gray-300 bg-white p-6 text-center text-black">
      <p className="text-sm font-medium tracking-wide text-gray-500">
        {schoolName}
      </p>

      <QRCodeSVG
        value={card.qrToken}
        size={220}
        level="M"
        marginSize={4}
        className="my-3"
      />

      <p className={`${fredoka.className} text-2xl font-semibold capitalize`}>
        {getFullName(card)}
      </p>
      <p className="text-base text-gray-600">
        {card.class?.name ?? "No class"}
      </p>
    </div>
  );
}

export function QrCardsPage({ schoolName = "OCNAK" }: QrCardsPageProps) {
  // the store calls it "className", but it holds the class id
  const { location, name: search, className: classId } = useFilterStore();
  const [reissueCard, setReissueCard] = useState<QrCard | null>(null);
  // the cards waiting to be printed: one card, or the whole filtered list
  const [printQueue, setPrintQueue] = useState<QrCard[] | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // load every card once; changing filters doesn't send a new request
  const { data: cards = [], isLoading, error } = useQrCards({});

  // location, class, and name are all filtered here, like the teachers page
  const visibleCards = useMemo(() => {
    const term = search.trim().toLowerCase();
    return cards.filter((card) => {
      const matchesLocation = location ? card.location === location : true;
      const matchesClass = classId ? card.class?.id === classId : true;
      const matchesName = term
        ? getFullName(card).toLowerCase().includes(term)
        : true;
      return matchesLocation && matchesClass && matchesName;
    });
  }, [cards, location, classId, search]);

  const printPages = useMemo(
    () => chunkIntoPages(printQueue ?? [], CARDS_PER_PAGE),
    [printQueue],
  );

  const onHandlePrint = useReactToPrint({
    contentRef,
    documentTitle:
      printQueue?.length === 1
        ? `${getFullName(printQueue[0])} QR Card`
        : "Student QR Cards",
    pageStyle:
      "@page { size: A4; margin: 12mm; } @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }",
    onAfterPrint: () => setPrintQueue(null),
  });

  // print once the queued cards have rendered into the print area
  useEffect(() => {
    if (printQueue?.length) onHandlePrint();
    // only run when the queue changes, not every time onHandlePrint is recreated
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printQueue]);

  const onHandlePrintAll = () => setPrintQueue(visibleCards);
  const onHandlePrintOne = (card: QrCard) => setPrintQueue([card]);

  // the modal hands back the card with its new code, so the old code is never printed
  const onHandleReissued = (updatedCard: QrCard) => {
    setReissueCard(null);
    setPrintQueue([updatedCard]);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-19" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {visibleCards.length}{" "}
          {visibleCards.length === 1 ? "student" : "students"}
        </p>
        <Button
          onClick={onHandlePrintAll}
          disabled={visibleCards.length === 0}
          className="h-12 w-38 cursor-pointer gap-2 rounded-sm bg-black text-white disabled:opacity-50"
        >
          <FaPrint />
          Print {visibleCards.length}{" "}
          {visibleCards.length === 1 ? "card" : "cards"}
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      {!error && visibleCards.length === 0 ? (
        <p className="text-sm text-gray-500">
          No students match these filters.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {visibleCards.map((card) => (
            <div
              key={card.studentId}
              className="flex flex-col items-center rounded-lg border border-gray-300 bg-white p-3 text-center text-black shadow"
            >
              <p className="text-[10px] text-gray-500">{schoolName}</p>

              {/* the white card around the code adds to its margin, so 2 is enough */}
              <QRCodeSVG
                value={card.qrToken}
                size={112}
                level="M"
                marginSize={2}
              />

              <p
                className={`mt-1 w-full truncate text-sm font-medium capitalize ${fredoka.className}`}
              >
                {getFullName(card)}
              </p>
              <p className="text-xs text-gray-600">
                {card.class?.name ?? "No class"}
              </p>

              <div className="mt-2 flex gap-1.5">
                <Button
                  variant="outline"
                  onClick={() => onHandlePrintOne(card)}
                  className="h-7 cursor-pointer rounded-sm border px-3 text-xs"
                >
                  Print
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setReissueCard(card)}
                  className="h-7 cursor-pointer rounded-sm border px-3 text-xs"
                >
                  Reissue
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* print area: hidden on screen; react-to-print copies only the inner div */}
      <div className="hidden">
        <div ref={contentRef}>
          {printPages.map((page, index) => (
            <div
              key={index}
              className="flex h-[265mm] flex-col items-center justify-evenly break-after-page last:break-after-auto"
            >
              {page.map((card) => (
                <PrintableQrCard
                  key={card.studentId}
                  card={card}
                  schoolName={schoolName}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <ReissueQrCardModal
        card={reissueCard}
        onClose={() => setReissueCard(null)}
        onReissued={onHandleReissued}
      />
    </div>
  );
}
