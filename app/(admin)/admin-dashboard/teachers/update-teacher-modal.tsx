"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Crimson_Text } from "next/font/google";
import { updateTeacherSchema } from "./teacher-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Loader } from "lucide-react";
import { FaEdit } from "react-icons/fa";
import { useFetchTeacherById } from "@/hooks/use-teacher";
import { useUpdateTeacher } from "@/hooks/use-teacher";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as z from "zod";
import MutipleClassSelectOption from "../classes/mutiple-class-select-option";

const crimson_text = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

type formSchema = z.infer<typeof updateTeacherSchema>;

interface EditTeacherModalProps {
  teacherId: string;
  userId: string;
}

// ── Outer shell: fetches data and shows spinner/error ──────────────────────
export default function UpdateTeacherModal(props: EditTeacherModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: teacherData, isLoading } = useFetchTeacherById(props.teacherId);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="flex w-full cursor-pointer items-center gap-2 text-slate-600">
          <FaEdit className="size-6 text-slate-600" />
          <span className="flex-1 text-[15px] tracking-tight">Edit</span>
        </div>
      </DialogTrigger>
      <DialogContent
        onKeyDown={(e) => {
          if (e.key === " " && e.target instanceof HTMLInputElement) {
            e.stopPropagation();
          }
        }}
        className="data-[state=open]:zoom-in-0! h-full max-w-full px-3 data-[state=open]:duration-300 md:h-auto md:max-w-143.75 md:p-6"
      >
        <DialogHeader>
          <DialogTitle asChild>
            <h2
              className={`${crimson_text.className} text-[25px] font-semibold`}
            >
              Edit Teacher Detail
            </h2>
          </DialogTitle>
          <DialogDescription>
            Update the teacher&apos;s profile.
          </DialogDescription>
        </DialogHeader>

        {isLoading || !teacherData ? (
          <div className="flex justify-center py-10">
            <Loader size={22} className="animate-spin" />
          </div>
        ) : (
          <UpdateTeacherModalInner
            teacherId={props.teacherId}
            userId={props.userId}
            teacherData={teacherData}
            onClose={() => setIsOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Inner form: only mounts when teacherData exists ─────────────────────────
function UpdateTeacherModalInner({
  teacherId,
  userId,
  teacherData,
  onClose,
}: {
  teacherId: string;
  userId: string;
  teacherData: any;
  onClose: () => void;
}) {
  const { mutate, error, isPending } = useUpdateTeacher();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<formSchema>({
    resolver: zodResolver(updateTeacherSchema),
    defaultValues: {
      first_name: teacherData.firstName,
      last_name: teacherData.lastName,
      email: teacherData.email,
      class_ids: teacherData.classes?.map((c: any) => c.id) ?? [],
      user_id: teacherId,
    },
  });

  const classIds = watch("class_ids");

  const onSubmit = async (values: formSchema) => {
    mutate(
      {
        teacherId: userId,
        firstName: values.first_name,
        lastName: values.last_name,
        email: values.email,
        classIds: values.class_ids,
      },

      {
        onSuccess: () => {
          onClose();
          toast.success("Teacher account successfully updated!", {
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
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.class_ids}>
              <FieldLabel className="text-[13px] font-bold text-[#777]">
                Choose Classes
              </FieldLabel>
              <MutipleClassSelectOption
                value={classIds}
                onChange={(val) =>
                  setValue("class_ids", val, { shouldValidate: true })
                }
              />
              {errors.class_ids && (
                <FieldError>{errors.class_ids.message}</FieldError>
              )}
            </Field>
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
              <Loader size={22} className="animate-spin" />
            ) : (
              <span className="text-[13px]">Update</span>
            )}
          </Button>
        </DialogFooter>
      </form>
    </div>
  );
}
