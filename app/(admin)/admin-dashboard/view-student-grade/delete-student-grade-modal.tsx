import { Button } from "@/components/ui/button";
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

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Crimson_Text } from "next/font/google";
import * as motion from "motion/react-client";
import { MdMarkEmailRead } from "react-icons/md";
import { useForm } from "react-hook-form";
import { deleteStudentGradeSchema } from "./delete-student-grade-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFetchPeriods } from "@/hooks/use-periods";
import { useQueryClient } from "@tanstack/react-query";
import { useModalStore } from "@/store/modalStore";
import { useStudentIdStore } from "@/store/studentIdStore";
import { useDeleteStudentGrade } from "@/hooks/use-student-grades";
import { toast } from "sonner";
import * as z from "zod";
import { Loader } from "lucide-react";
import { useFetchSubjectsByClass } from "@/hooks/use-subjects";
import { useFetchStudentById } from "@/hooks/use-students";

const crimson_text = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

type formSchema = z.infer<typeof deleteStudentGradeSchema>;

export default function DeleteStudentGradeModal() {
  const queryClient = useQueryClient();
  const { setOpen, isOpen } = useModalStore();
  const { studentId } = useStudentIdStore();

  const {
    data: periodData,
    isLoading: periodLoader,
    error: periodError,
  } = useFetchPeriods();

  const {
    data: studentData,
    isLoading: studentLoader,
    error: studentError,
  } = useFetchStudentById(studentId);

  const {
    mutate: deleteGrade,
    isPending: deleteGradeLoader,
    error: deleteGradeError,
  } = useDeleteStudentGrade();

  const studentClassId = studentData.class_id;

  const {
    data: subjectData,
    isLoading: subjectLoader,
    error: subjectError,
  } = useFetchSubjectsByClass(studentClassId);

  const form = useForm<formSchema>({
    resolver: zodResolver(deleteStudentGradeSchema),
    defaultValues: {
      period_id: "",
      subject_id: "",
      student_id: studentId ?? "",
    },
  });

  const onSubmit = async (values: formSchema) => {
    deleteGrade(values, {
      onSuccess: () => {
        form.reset();
        setOpen(false);
        // Invalidate the student's personal grades
        queryClient.invalidateQueries({
          queryKey: ["student-grades", values.student_id],
        });
        // Invalidate the class grades for that period
        queryClient.invalidateQueries({
          queryKey: [
            "students-grades-by-period",
            values.period_id,
            studentClassId,
          ],
        });
        toast.success("Student Grade deleted successfully!", {
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

  if (periodLoader || subjectLoader || studentLoader) {
    return <div></div>;
  }
  if (periodError)
    return <div>Error fetching students: {periodError.message}</div>;

  if (subjectError)
    return <div>Error fetching students: {subjectError.message}</div>;

  if (studentError)
    return <div>Error fetching students: {studentError.message}</div>;

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          className="h-11 cursor-pointer rounded transition-none"
          asChild
        >
          <motion.button whileTap={{ scale: 0.85 }}>
            <MdMarkEmailRead className="transition-transform duration-200 group-hover:translate-x-0.5" />
            Remove Grade
          </motion.button>
        </Button>
      </DialogTrigger>
      <DialogContent className="data-[state=open]:zoom-in-0! data-[state=open]:duration-200 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            <div className={`${crimson_text.className}`}>
              Remove Student Grade
            </div>
          </DialogTitle>
          <DialogDescription>
            Enter the detail about the student. Click save to confirm.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="mt-0 w-full rounded-md border p-3 shadow-sm">
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="period_id"
                  render={({ field }) => (
                    <FormItem className="text-left">
                      <FormLabel className="text-[12px] font-bold text-[#777]">
                        Choose Period
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            className="bord w-full rounded"
                            style={{ height: "42px", width: "100%" }}
                          >
                            <SelectValue placeholder="Select Period" />
                          </SelectTrigger>
                          <SelectContent className="data-[state=open]:slide-in-from-bottom-8 data-[state=open]:zoom-in-100 duration-400">
                            <SelectGroup>
                              {periodData?.map((period: any) => (
                                <SelectItem key={period.id} value={period.id}>
                                  Period: {period.period}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject_id"
                  render={({ field }) => (
                    <FormItem className="text-left">
                      <FormLabel className="text-[12px] font-bold text-[#777]">
                        Choose Subject
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            className="w-full rounded border"
                            style={{ height: "42px", width: "100%" }}
                          >
                            <SelectValue placeholder="Select Subject" />
                          </SelectTrigger>
                          <SelectContent className="data-[state=open]:slide-in-from-bottom-8 data-[state=open]:zoom-in-100 duration-400">
                            <SelectGroup>
                              {subjectData?.map((data) => (
                                <SelectItem
                                  key={data.id}
                                  value={String(data.id)}
                                >
                                  {data.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {deleteGradeError && (
              <div className="rounded border-l-4 border-red-400 bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-[14px] font-medium tracking-wide text-red-700">
                      {deleteGradeError.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="mt-7">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer rounded"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                disabled={deleteGradeLoader}
                type="submit"
                className="cursor-pointer rounded"
                variant="destructive"
              >
                {deleteGradeLoader ? (
                  <Loader size={22} className="animate-spin" />
                ) : (
                  <span className="text-[13px]">Delete Record</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
