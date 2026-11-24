"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Fredoka } from "next/font/google";
import { updateScannerSchema } from "./scanner-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFetchScannerById, useUpdateScanner } from "@/hooks/use-scanner";
import type { Scanner } from "@/lib/prefreshing-components/fetch-scanners";
import { toast } from "sonner";
import * as z from "zod";
import TeacherFormLocationSelect from "../teachers/teacher-form-location-select";
import { Spinner } from "@/components/ui/spinner";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

type formSchema = z.infer<typeof updateScannerSchema>;

interface EditScannerModalProps {
  scannerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ── Outer shell: fetches data and shows spinner ────────────────────────────
export default function UpdateScannerModal(props: EditScannerModalProps) {
  // only fetch once the modal is opened, not for every card in the grid
  const { data: scannerData, isLoading } = useFetchScannerById(
    props.open ? props.scannerId : null,
  );

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent
        onKeyDown={(e) => e.stopPropagation()}
        className="data-[state=open]:zoom-in-0! h-full max-w-full px-3 data-[state=open]:duration-200 md:h-auto md:max-w-143.75 md:p-6"
      >
        <DialogHeader>
          <DialogTitle asChild>
            <h2 className={`${fredoka.className} text-[25px] font-semibold`}>
              Edit Scanner Detail
            </h2>
          </DialogTitle>
          <DialogDescription>
            Update the scanner&apos;s profile.
          </DialogDescription>
        </DialogHeader>

        {isLoading || !scannerData ? (
          <div className="flex justify-center py-10">
            <Spinner className="size-14" />
          </div>
        ) : (
          <UpdateScannerModalInner
            scannerId={props.scannerId}
            scannerData={scannerData}
            onClose={() => props.onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Inner form: only mounts when scannerData exists ─────────────────────────
function UpdateScannerModalInner({
  scannerId,
  scannerData,
  onClose,
}: {
  scannerId: string;
  scannerData: Scanner;
  onClose: () => void;
}) {
  const { mutate, error, isPending } = useUpdateScanner();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<formSchema>({
    resolver: zodResolver(updateScannerSchema),
    defaultValues: {
      first_name: scannerData.firstName,
      last_name: scannerData.lastName,
      email: scannerData.email,
      location: scannerData.location ?? "",
      user_id: scannerId,
    },
  });

  const onSubmit = async (values: formSchema) => {
    mutate(
      {
        scannerId,
        firstName: values.first_name,
        lastName: values.last_name,
        email: values.email,
        location: values.location,
      },
      {
        onSuccess: () => {
          onClose();
          toast.success("Scanner account successfully updated!", {
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
        },
      },
    );
  };

  return (
    <div className="space-y-2">
      <form
        className="space-y-2"
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !(e.target instanceof HTMLTextAreaElement)) {
            handleSubmit(onSubmit)();
          }
        }}
      >
        <ScrollArea className="mt-0 h-auto w-full rounded-md border p-3">
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field data-invalid={!!errors.first_name}>
                <FieldLabel className="text-[13px] font-bold text-[#777]">
                  First Name
                </FieldLabel>
                <Input
                  placeholder="Jessica"
                  className="h-10 rounded-md bg-white text-[13px]"
                  {...register("first_name")}
                />
                {errors.first_name && (
                  <FieldError>{errors.first_name.message}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!errors.last_name}>
                <FieldLabel className="text-[13px] font-bold text-[#777]">
                  Last Name
                </FieldLabel>
                <Input
                  placeholder="Morris"
                  className="h-10 rounded-md bg-white text-[13px]"
                  {...register("last_name")}
                />
                {errors.last_name && (
                  <FieldError>{errors.last_name.message}</FieldError>
                )}
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field data-invalid={!!errors.email}>
                <FieldLabel className="text-[13px] font-bold text-[#777]">
                  Email
                </FieldLabel>
                <Input
                  placeholder="example@gmail.com"
                  className="h-10 rounded-md bg-white text-[13px]"
                  type="email"
                  {...register("email")}
                />
                {errors.email && (
                  <FieldError>{errors.email.message}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!errors.location}>
                <FieldLabel className="text-[13px] font-bold text-[#777]">
                  Location
                </FieldLabel>
                <TeacherFormLocationSelect
                  value={watch("location")}
                  onChange={(val) =>
                    setValue("location", val, { shouldValidate: true })
                  }
                />
                {errors.location && (
                  <FieldError>{errors.location.message}</FieldError>
                )}
              </Field>
            </div>
          </div>
        </ScrollArea>

        {error && (
          <div className="rounded border-l-4 border-red-400 bg-red-50 p-4">
            <div className="ml-3">
              <p className="text-[14px] font-medium tracking-wide text-red-700">
                {error.message}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-11 cursor-pointer rounded-lg px-6"
          >
            Cancel
          </Button>
          <Button
            disabled={isPending}
            type="submit"
            className="h-11 cursor-pointer rounded-lg px-6"
          >
            {isPending ? (
              <Spinner className="size-6" />
            ) : (
              <span className="text-[13px]">Update</span>
            )}
          </Button>
        </DialogFooter>
      </form>
    </div>
  );
}
