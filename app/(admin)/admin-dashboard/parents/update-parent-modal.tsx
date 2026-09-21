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
import { updateParentSchema } from "./parent-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { Spinner } from "@/components/ui/spinner";
import { useFetchParentById, useUpdateParent } from "@/hooks/use-parent";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

type formSchema = z.infer<typeof updateParentSchema>;

interface EditParentModalProps {
  parentId: string;
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ── Outer shell: fetches data and shows spinner/error ──────────────────────
export default function UpdateParentModal(props: EditParentModalProps) {
  const { data: parentData, isLoading } = useFetchParentById(props.parentId);

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent
        onKeyDown={(e) => e.stopPropagation()}
        className="data-[state=open]:zoom-in-0! h-full max-w-full px-3 data-[state=open]:duration-300 md:h-auto md:max-w-143.75 md:p-6"
      >
        <DialogHeader>
          <DialogTitle asChild>
            <h2 className={`${fredoka.className} text-[25px] font-semibold`}>
              Edit Parent Detail
            </h2>
          </DialogTitle>
          <DialogDescription>
            Update the parent&apos;s profile.
          </DialogDescription>
        </DialogHeader>

        {isLoading || !parentData ? (
          <div className="flex justify-center py-10">
            <Spinner className="size-14" />
          </div>
        ) : (
          <UpdateParentModalInner
            parentId={props.parentId}
            userId={props.userId}
            parentData={parentData}

            onClose={() => props.onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Inner form: only mounts when parentData exists ─────────────────────────
function UpdateParentModalInner({
  parentId,

  parentData,
  onClose,
}: {
  parentId: string;
  userId: string;
  parentData: any;
  onClose: () => void;
}) {
  const { mutate, error, isPending } = useUpdateParent();

  const {
    register,
    handleSubmit,

    formState: { errors },
  } = useForm<formSchema>({
    resolver: zodResolver(updateParentSchema),
    defaultValues: {
      first_name: parentData.firstName,
      last_name: parentData.lastName,
      email: parentData.email,
      contact: parentData.contact ?? "",
      // user_id: parentId,
    },
  });

  const onSubmit = async (values: formSchema) => {
    mutate(
      {
        parentId,
        firstName: values.first_name,
        lastName: values.last_name,
        email: values.email,
        contact: values.contact,
      },

      {
        onSuccess: () => {
          onClose();
          toast.success("Parent account successfully updated!", {
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

              <Field data-invalid={!!errors.contact}>
                <FieldLabel className="text-[13px] font-bold text-[#777]">
                  Contact
                </FieldLabel>
                <Input
                  placeholder="+231 88 000 0000"
                  className="h-10 rounded-md bg-white text-[13px]"
                  type="tel"
                  {...register("contact")}
                />
                {errors.contact && (
                  <FieldError>{errors.contact.message}</FieldError>
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
