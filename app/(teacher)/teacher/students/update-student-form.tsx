"use client";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { updateStudentSchema } from "./student-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useUpdateStudent, useFetchStudentById } from "@/hooks/use-students";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as z from "zod";

type formSchema = z.infer<typeof updateStudentSchema>;

interface UpdateStudentFormProps {
  studentId: string;
  onClose: () => void;
}

export default function UpdateStudentForm(props: UpdateStudentFormProps) {
  const { data: studentData, isLoading } = useFetchStudentById(props.studentId);

  if (isLoading || !studentData) {
    return (
      <div className="flex justify-center py-10">
        <Loader size={22} className="animate-spin" />
      </div>
    );
  }

  return (
    <UpdateStudentFormInner
      studentId={props.studentId}
      studentData={studentData}
      onClose={props.onClose}
    />
  );
}

// ── Inner: only mounts when studentData exists ─────────────────────────────
function UpdateStudentFormInner({
  studentId,
  studentData,
  onClose,
}: {
  studentId: string;
  studentData: any;
  onClose: () => void;
}) {
  const { mutate, error, isPending } = useUpdateStudent();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formSchema>({
    resolver: zodResolver(updateStudentSchema),
    defaultValues: {
      firstName: studentData.students.firstName,
      lastName: studentData.students.lastName,
      parentContact: studentData.students.parentContact,
      parentName: studentData.students.parentName,
      classId: studentData.students.classesId || "",
      conduct: studentData.students.conduct || "",
      daysAbsent: studentData.students.daysAbsent,
    },
  });

  const onHandleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " ") {
      e.stopPropagation();
    }
  };

  const onSubmit = async (values: formSchema) => {
    mutate(
      {
        studentId,
        firstName: values.firstName,
        lastName: values.lastName,
        parentName: values.parentName,
        parentContact: values.parentContact,
        conduct: values.conduct,
        daysAbsent: values.daysAbsent,
        classId: values.classId,
      },
      {
        onSuccess: () => {
          onClose();
          queryClient.invalidateQueries({ queryKey: ["students"] });
          toast.success("Student account successfully updated!", {
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
        onKeyDown={(e) => {
          if (e.key === "Enter" && !(e.target instanceof HTMLTextAreaElement)) {
            e.preventDefault();
            handleSubmit(onSubmit)();
          }
        }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <ScrollArea className="mt-0 h-85 w-full rounded-md border p-3 md:h-auto">
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field data-invalid={!!errors.firstName}>
                <FieldLabel className="text-[13px] font-bold text-[#777]">
                  First Name
                </FieldLabel>
                <Input
                  placeholder="Jessica"
                  className="h-10 rounded bg-white text-[13px]"
                  {...register("firstName")}
                  onKeyDown={onHandleInputKeyDown}
                />
                {errors.firstName && (
                  <FieldError>{errors.firstName.message}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!errors.lastName}>
                <FieldLabel className="text-[13px] font-bold text-[#777]">
                  Last Name
                </FieldLabel>
                <Input
                  placeholder="Jones"
                  className="h-10 rounded text-[13px]"
                  {...register("lastName")}
                  onKeyDown={onHandleInputKeyDown}
                />
                {errors.lastName && (
                  <FieldError>{errors.lastName.message}</FieldError>
                )}
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field data-invalid={!!errors.parentName}>
                <FieldLabel className="text-[13px] font-bold text-[#777]">
                  Parent Name
                </FieldLabel>
                <Input
                  placeholder="Jessica's Mom"
                  className="h-10 rounded bg-white text-[13px]"
                  {...register("parentName")}
                  onKeyDown={onHandleInputKeyDown}
                />
                {errors.parentName && (
                  <FieldError>{errors.parentName.message}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!errors.parentContact}>
                <FieldLabel className="text-[13px] font-bold text-[#777]">
                  Parent Contact
                </FieldLabel>
                <Input
                  placeholder="+2317783456"
                  className="h-10 rounded text-[13px]"
                  {...register("parentContact")}
                  onKeyDown={onHandleInputKeyDown}
                />
                {errors.parentContact && (
                  <FieldError>{errors.parentContact.message}</FieldError>
                )}
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field data-invalid={!!errors.daysAbsent}>
                <FieldLabel className="text-[13px] font-bold text-[#777]">
                  Days Absent
                </FieldLabel>
                <Input
                  type="number"
                  className="h-10 rounded bg-white text-[13px]"
                  {...register("daysAbsent", {
                    setValueAs: (v) => (isNaN(Number(v)) ? 0 : Number(v)),
                  })}
                  onKeyDown={onHandleInputKeyDown}
                />
                {errors.daysAbsent && (
                  <FieldError>{errors.daysAbsent.message}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!errors.conduct}>
                <FieldLabel className="text-[13px] font-bold text-[#777]">
                  Conduct
                </FieldLabel>
                <Input
                  placeholder="Conduct"
                  className="h-10 rounded bg-white text-[13px]"
                  {...register("conduct")}
                />
                {errors.conduct && (
                  <FieldError>{errors.conduct.message}</FieldError>
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
