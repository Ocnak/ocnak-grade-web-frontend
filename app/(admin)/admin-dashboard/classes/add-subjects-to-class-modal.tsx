"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { FaPlus } from "react-icons/fa";
import { Fredoka } from "next/font/google";
import { addSubjectsSchema } from "./add-subjects-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAddSubjectToClasses } from "@/hooks/use-classes";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { RippleButton } from "@/components/ui/ripple-button";
import MutipleClassSelectOption from "./mutiple-class-select-option";
import { Spinner } from "@/components/ui/spinner";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

type formSchema = z.infer<typeof addSubjectsSchema>;

export default function AddSubjectsToClassModal() {
  const { mutate, error, isPending } = useAddSubjectToClasses();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<formSchema>({
    resolver: zodResolver(addSubjectsSchema),
    defaultValues: {
      subjectName: "",
      classIds: [],
    },
  });

  const classIds = watch("classIds");

  const onSubmit = async (values: formSchema) => {
    mutate(values, {
      onSuccess: () => {
        reset();
        // setOpen(false);
        queryClient.invalidateQueries({ queryKey: ["class_subjects"] });
        toast.success("Subjects have been added successfully!", {
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
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <RippleButton className="h-12 cursor-pointer rounded-md">
          <FaPlus
            style={{
              width: "13px",
              height: "13px",
            }}
          />{" "}
          Add Subjects
        </RippleButton>
      </DialogTrigger>

      <DialogContent className="data-[state=open]:zoom-in-0! max-w-full px-3! data-[state=open]:duration-300 md:h-auto md:max-w-123.75 md:p-6">
        <DialogHeader>
          <DialogTitle>
            <span className={`${fredoka.className} text-[25px] font-semibold`}>
              Create & Add Subject To Class
            </span>
          </DialogTitle>
          <DialogDescription>
            Provide the required information below to a new class.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-0 w-full rounded-md md:h-auto">
            <div className="space-y-3 px-1.5 py-3">
              {/* subjectName Field */}
              <Field data-invalid={!!errors.subjectName}>
                <FieldLabel className="text-[13px] font-bold text-[#777]">
                  Enter Subject
                </FieldLabel>
                <Input
                  placeholder="Mathematics"
                  className="h-12 rounded-md bg-white"
                  {...register("subjectName")}
                />
                {errors.subjectName && (
                  <FieldError>{errors.subjectName.message}</FieldError>
                )}
              </Field>

              {/* classIds Field */}
              <Field data-invalid={!!errors.classIds}>
                <FieldLabel className="text-[13px] font-bold text-[#777]">
                  Choose Classes
                </FieldLabel>
                <MutipleClassSelectOption
                  value={classIds}
                  onChange={(val) =>
                    setValue("classIds", val, { shouldValidate: true })
                  }
                />
                {errors.classIds && (
                  <FieldError>{errors.classIds.message}</FieldError>
                )}
              </Field>
            </div>
          </div>

          {error && (
            <div className="rounded border-l-4 border-red-400 bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-[14px] font-medium tracking-wide text-red-700">
                    {error.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <RippleButton
                type="button"
                variant="outline"
                className="h-11 cursor-pointer rounded-lg px-6"
              >
                Cancel
              </RippleButton>
            </DialogClose>
            <RippleButton
              disabled={isPending}
              type="submit"
              className="h-11 cursor-pointer rounded-lg px-6"
            >
              {isPending ? (
                <Spinner className="size-7" />
              ) : (
                <span className="text-[13px]">Add Subject</span>
              )}
            </RippleButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
