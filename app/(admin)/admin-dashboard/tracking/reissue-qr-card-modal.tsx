"use client";

import { Fredoka } from "next/font/google";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useReissueQrCard, type QrCard } from "@/hooks/use-student-tracking";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

type ReissueQrCardModalProps = {
  card: QrCard | null;
  onClose: () => void;
  onReissued: (updatedCard: QrCard) => void;
};

export default function ReissueQrCardModal({
  card,
  onClose,
  onReissued,
}: ReissueQrCardModalProps) {
  const { mutate, error, isPending, reset } = useReissueQrCard();
  const name = card ? `${card.firstName} ${card.lastName}`.trim() : "";

  const onHandleOpenChange = (open: boolean) => {
    // keep the modal open while the request is running
    if (open || isPending) return;
    reset();
    onClose();
  };

  const onHandleReissue = () => {
    if (!card) return;

    mutate(card.studentId, {
      onSuccess: (data) => {
        toast.success(`New QR card created for ${name}`, {
          position: "top-right",
          style: {
            "--normal-bg":
              "color-mix(in oklab, light-dark(var(--color-green-600), var(--color-green-400)) 10%, var(--background))",
            "--normal-text":
              "light-dark(var(--color-green-600), var(--color-green-400))",
            "--normal-border":
              "light-dark(var(--color-green-600), var(--color-green-400))",
          } as React.CSSProperties,
        });
        reset();
        // hand back the new code, so printing doesn't wait for the list to reload
        onReissued({ ...card, qrToken: data.qrToken });
      },
    });
  };

  return (
    <Dialog open={!!card} onOpenChange={onHandleOpenChange}>
      <DialogContent className="data-[state=open]:zoom-in-0! h-auto rounded-lg border-none bg-white px-3 data-[state=open]:duration-200 md:max-w-120 md:rounded-[15px] md:p-6">
        <DialogHeader>
          <DialogTitle>
            <span className={`${fredoka.className} text-[25px] font-semibold`}>
              Reissue QR Card
            </span>
          </DialogTitle>
          <DialogDescription>
            Create a new QR card for this student.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-[6px] border border-gray-300 p-3 shadow">
            <p className="text-[13px] font-bold text-[#777]">Student</p>
            <p
              className={`${fredoka.className} text-[17px] font-medium capitalize text-slate-800`}
            >
              {name}
            </p>
            <p className="text-[13px] text-gray-600">
              {card?.class?.name ?? "No class"}
            </p>
          </div>

          <div className="rounded border-l-4 border-amber-400 bg-amber-50 p-4">
            <p className="ml-3 text-[14px] font-medium tracking-wide text-amber-800">
              Their current card will stop working right away. Anyone still
              carrying it won&apos;t be able to scan in.
            </p>
          </div>

          {error && (
            <div className="rounded border-l-4 border-red-400 bg-red-50 p-4">
              <p className="ml-3 text-[14px] font-medium tracking-wide text-red-700">
                {error.message}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onHandleOpenChange(false)}
            disabled={isPending}
            className="h-11 cursor-pointer rounded-lg px-6"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={onHandleReissue}
            disabled={isPending}
            className="h-11 cursor-pointer rounded-lg px-6"
          >
            {isPending ? (
              <Spinner className="size-7" />
            ) : (
              <span className="text-[13px]">Reissue Card</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
