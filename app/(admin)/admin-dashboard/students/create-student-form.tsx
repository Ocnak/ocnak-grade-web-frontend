import { DialogFooter } from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { createStudentSchema } from "./student-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import * as z from "zod";
import { useCreateStudent } from "@/hooks/use-students";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useModalStore } from "@/store/modalStore";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CreateStudentForm() {
  const params = useParams();
  const { mutate, error, isPending } = useCreateStudent();
  const { setOpen } = useModalStore();

  const targetClassId = useMemo(() => {
    // Always return the classId from the URL params, regardless of role
    return (params.classId as string) || "";
  }, [params.classId]);

  type formSchema = z.infer<typeof createStudentSchema>;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<formSchema>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      parentName: "",
      parentContact: "",
      classId: targetClassId,
      conduct: "",
      daysAbsent: 0,
    },
  });

  useEffect(() => {
    if (targetClassId) {
      setValue("classId", targetClassId);
    }
  }, [targetClassId, setValue]);

  const onSubmit = async (values: formSchema) => {
    mutate(values, {
      onSuccess: () => {
        // Pass the current targetClassId so the next entry starts with the correct class
        reset({
          firstName: "",
          lastName: "",
          parentName: "",
          parentContact: "",
          classId: targetClassId,
          conduct: "",
          daysAbsent: 0,
        });

        toast.success("Student account successfully created!", {
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
        <ScrollArea className="mt-0 h-85 w-full rounded-md border p-3 md:h-auto">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-2.5">
            <Field data-invalid={!!errors.firstName}>
              <FieldLabel className="text-[13px] font-bold text-[#777]">
                First Name
              </FieldLabel>
              <Input
                placeholder="Jessica"
                className="h-10 rounded-md bg-white text-[13px]"
                {...register("firstName")}
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
                placeholder="Morris"
                className="h-10 rounded-md bg-white text-[13px]"
                {...register("lastName")}
              />
              {errors.lastName && (
                <FieldError>{errors.lastName.message}</FieldError>
              )}
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-2.5">
            <Field data-invalid={!!errors.parentName}>
              <FieldLabel className="text-[13px] font-bold text-[#777]">
                Parent Name
              </FieldLabel>
              <Input
                placeholder="Jessica's Mom"
                className="h-10 rounded-md bg-white text-[13px]"
                {...register("parentName")}
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
                placeholder="07783456"
                className="h-10 rounded-md bg-white text-[13px]"
                {...register("parentContact")}
              />
              {errors.parentContact && (
                <FieldError>{errors.parentContact.message}</FieldError>
              )}
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-2.5">
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
        </ScrollArea>

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
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
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
              <span className="text-[13px]">Add Student</span>
            )}
          </Button>
        </DialogFooter>
      </form>
    </div>
  );
}
