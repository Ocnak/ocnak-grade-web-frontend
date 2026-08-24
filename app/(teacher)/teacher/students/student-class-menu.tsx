"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTeacherClasses } from "@/hooks/use-classes";
import { useFetchUserData } from "@/hooks/use-users-info";
import { Spinner } from "@/components/ui/spinner";
import { useClassStore } from "@/store/classStore";
import { useEffect } from "react";

export default function StudentClassMenu() {
  const pathname = usePathname();
  const params = useParams();
  const setSelectedClass = useClassStore((s) => s.setSelectedClass);

  const classId = params.classId as string;

  const { data: userData, isLoading: userDataLoader } = useFetchUserData();
  const teacherId = userData?.user?.id ?? null;

  const { data: classes, isLoading: classesLoader } =
    useTeacherClasses(teacherId);

  const sortedClasses = classes
    ? [...classes].sort((a, b) => {
        const getGradeNum = (name: string) => {
          const match = name.match(/\d+/);
          return match ? parseInt(match[0]) : 0;
        };
        return getGradeNum(a.name) - getGradeNum(b.name);
      })
    : [];

  // Derive current class name from existing data
  const currentClassName = classes?.find(
    (cls: { id: string; name: string }) => cls.id === classId,
  )?.name;

  // Sync store on mount/refresh
  useEffect(() => {
    if (classId && currentClassName) {
      setSelectedClass({ classId, className: currentClassName });
    } else {
      setSelectedClass(null);
    }
  }, [classId, currentClassName]);

  const isLoading = userDataLoader || classesLoader;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-12 w-54 cursor-pointer rounded">
          {isLoading ? <Spinner /> : currentClassName || "Select Class"}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="data-[state=closed]:slide-out-to-left-0 data-[state=open]:slide-in-from-left-0 data-[state=closed]:slide-out-to-bottom-20 data-[state=open]:slide-in-from-bottom-20 data-[state=closed]:zoom-out-100 h-auto w-54 duration-300">
        <DropdownMenuLabel className="text-[12px] text-gray-400">
          Classes
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {sortedClasses.map((cls: { id: string; name: string }) => (
            <DropdownMenuItem key={cls.id} asChild>
              <Link
                href={`/teacher/students/${cls.id}`}
                className={`h-9 w-full cursor-pointer rounded ${
                  pathname.includes(cls.id) ? "bg-accent font-bold" : ""
                }`}
                onClick={() =>
                  setSelectedClass({ classId: cls.id, className: cls.name })
                }
              >
                {cls.name}
              </Link>
            </DropdownMenuItem>
          ))}

          {sortedClasses.length === 0 && !isLoading && (
            <DropdownMenuItem disabled>No classes found</DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
