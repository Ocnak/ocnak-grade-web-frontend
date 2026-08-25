"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";

import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import type { PaginationState } from "@tanstack/react-table";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import LoadingCircleSpinner from "@/components/animation/LoadingCircleSpinner";
import { usePathname } from "next/navigation";
import { useStudentSelectionStore } from "@/store/studentSelectionStore";
import { useFilterStore } from "@/store/filterStore";
import { Checkbox } from "@/components/ui/motion-checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Crimson_Text } from "next/font/google";
import StudentCardDropdownMenu from "../student-card-dropdown-menu";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";

import { usePagination } from "@/hooks/use-pagination";
import { Button } from "@/components/ui/button";
import { useFetchStudents } from "@/hooks/use-students";
import { useFetchClasses } from "@/hooks/use-classes";
import { useStudentIdStore } from "@/store/studentIdStore";
import { useSession } from "@/hooks/use-session";
import { useFetchUserData } from "@/hooks/use-users-info";

const crimson_text = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export type StudentData = {
  id: string;
  first_name: string;
  last_name: string;
  class_id: string;
  parent_name: string;
  parent_contact: string;
  location: string;
};

export const columns: ColumnDef<StudentData>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="cursor-pointer"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "first_name",
    header: "Full Name",
    cell: ({ row }) => {
      const { first_name, last_name, location } = row.original;
      const underlineColor =
        location === "Town Hall" ? "text-red-700" : "text-cyan-700";

      return (
        <div
          onClick={(e) => {
            e.stopPropagation();
            row.toggleSelected(!row.getIsSelected());
          }}
          className="inline font-normal"
        >
          <p
            onClick={(e) => {
              e.stopPropagation();
              row.toggleSelected(!row.getIsSelected());
            }}
            className="cursor-pointer inline-block capitalize"
          >
            <span className="relative inline-block">
              {first_name} {last_name}
              <svg
                viewBox="0 0 200 30"
                className={`pointer-events-none absolute -bottom-2 left-0 h-[0.4em] w-full ${underlineColor}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
                preserveAspectRatio="none"
              >
                <path d="M 2 8 Q 25 -5, 50 8 T 100 8 T 150 8 T 198 8" />
              </svg>
            </span>
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "class_id",
    header: "Class Name",
    cell: ({ row }) => (
      <div className="capitalize font-normal">{row.getValue("class_id")}</div>
    ),
  },

  {
    accessorKey: "parent_name",
    header: "Parent Name",
    cell: ({ row }) => (
      <div className="capitalize font-normal">
        {row.getValue("parent_name")}
      </div>
    ),
  },
  {
    accessorKey: "parent_contact",
    header: "Parent Contact",

    cell: ({ row }) => (
      <div className="font-normal">{row.getValue("parent_contact")}</div>
    ),
  },

  {
    accessorKey: "action",
    header: "Actions",
    cell: ({ row }) => (
      <div onClick={(e) => e.stopPropagation()}>
        <StudentCardDropdownMenu studentId={row.original.id} />
      </div>
    ),
  },
];

export default function StudentDataTable({
  classId: propClassId,
}: {
  classId?: string;
}) {
  const { data: session, isLoading: sessionLoader } = useSession();
  const { data: userData, isLoading: userDataLoader } = useFetchUserData();
  const teacherLocation = userData?.user?.location ?? null;

  const params = useParams();
  const { setStudentId } = useStudentIdStore();

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { setSelectedIds, selectedIds } = useStudentSelectionStore();

  const userRole = session?.user.userRole ?? undefined;

  // 1. Get the current Class ID (Prefer prop, fallback to URL params)
  const currentClassId = propClassId || (params.classId as string);
  const { name } = useFilterStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [pagination, setPagination] = useState<PaginationState>(() => {
    const pageParam = searchParams.get("page");
    const pageSizeParam = searchParams.get("pageSize");
    return {
      pageIndex: pageParam ? Number(pageParam) : 0,
      pageSize: pageSizeParam ? Number(pageSizeParam) : 5,
    };
  });

  // Fetch data
  const {
    isLoading: studentDataLoader,
    data: studentData,
    error,
  } = useFetchStudents();

  const {
    data,
    isLoading: classesLoader,
    error: classesError,
  } = useFetchClasses();

  const classes = data?.classes;

  // 1. Hydrate from URL
  useEffect(() => {
    const pageParam = searchParams.get("page");
    const pageSizeParam = searchParams.get("pageSize");
    const columnsParam = searchParams.get("columns");

    if (pageParam) {
      setPagination((prev) => ({ ...prev, pageIndex: Number(pageParam) }));
    }
    if (pageSizeParam) {
      setPagination((prev) => ({ ...prev, pageSize: Number(pageSizeParam) }));
    }
    if (columnsParam) {
      try {
        setColumnVisibility(JSON.parse(columnsParam));
      } catch {}
    }
  }, []);

  // Remove the select mark from the table of updating the data
  useEffect(() => {
    if (selectedIds.length === 0) {
      setRowSelection({});
    }
  }, [selectedIds]);

  // Update URL when pagination changes
  useEffect(() => {
    const currentPage = searchParams.get("page");
    const currentPageSize = searchParams.get("pageSize");

    const newPage = String(pagination.pageIndex);
    const newPageSize = String(pagination.pageSize);

    // Only update if values are different
    if (currentPage !== newPage || currentPageSize !== newPageSize) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage);
      params.set("pageSize", newPageSize);

      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    pathname,
    router,
    searchParams,
  ]);

  const classMap = useMemo(
    () => new Map((classes ?? []).map((cls: any) => [cls.id, cls.name])),
    [classes],
  );

  const filteredAndFormattedData: StudentData[] = useMemo(() => {
    if (!studentData) return [];

    return studentData
      .filter((item: any) => {
        const student = item.students;

        const matchesClass = student.classesId === currentClassId;

        const fullName =
          `${student.firstName} ${student.lastName}`.toLowerCase();
        const matchesName = name ? fullName.includes(name.toLowerCase()) : true;
        const matchesTeacherLocation =
          userRole === "teacher" && teacherLocation
            ? student.location === teacherLocation
            : true;

        return matchesClass && matchesName && matchesTeacherLocation;
      })
      .map((item: any) => ({
        id: item.students.id,
        first_name: item.students.firstName,
        last_name: item.students.lastName,
        class_id: classMap.get(item.students.classesId) ?? "Unknown Class",
        parent_name: item.students.parentName,
        parent_contact: item.students.parentContact,
        location: item.students.location,
      }))
      .sort((a: any, b: any) => {
        const firstCompare = a.first_name.localeCompare(b.first_name);
        if (firstCompare !== 0) return firstCompare;
        return a.last_name.localeCompare(b.last_name);
      });
  }, [studentData, name, currentClassId, classMap, teacherLocation]);

  const table = useReactTable({
    data: filteredAndFormattedData,
    columns,
    autoResetPageIndex: false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;

      setRowSelection(newSelection);

      // Get the actual student IDs from the selected rows
      const selected = Object.entries(newSelection)
        .filter(([_, isSelected]) => isSelected)
        .map(([rowId]) => {
          const row = table.getRowModel().rows.find((r) => r.id === rowId);
          return row?.original?.id;
        })
        .filter(Boolean) as string[];

      setSelectedIds(selected);
    },
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  // Call usePagination hook BEFORE any conditional returns
  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: table.getState().pagination.pageIndex + 1,
    totalPages: table.getPageCount(),
    paginationItemsToDisplay: 5,
  });

  const scrollToStudentId = searchParams.get("scrollTo");

  useEffect(() => {
    if (!scrollToStudentId) return;
    if (studentDataLoader || classesLoader) return;

    // Wait a tick so the table's rows are actually painted before we search for one
    const timeout = setTimeout(() => {
      const el = document.querySelector(
        `[data-student-id="${scrollToStudentId}"]`,
      );

      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("bg-slate-300");
        setTimeout(() => el.classList.remove("bg-slate-300"), 2000);
      }

      // Clean the param out of the URL so it doesn't re-trigger on back/forward
      const params = new URLSearchParams(searchParams.toString());
      params.delete("scrollTo");
      router.replace(`${pathname}?${params.toString()}`);
    }, 100);

    return () => clearTimeout(timeout);
  }, [scrollToStudentId, studentDataLoader, classesLoader]);

  const getGradeLink = (studentId: string) => {
    const roleLinks: Record<string, { view: string }> = {
      admin: {
        view: `/admin-dashboard/view-student-grade?studentId=${studentId}`,
      },
      teacher: { view: `/teacher/view-student-grade?studentId=${studentId}` },
    };
    return roleLinks[userRole ?? ""]?.view ?? "";
  };

  // NOW we can have conditional returns
  if (
    studentDataLoader ||
    classesLoader ||
    (userRole === "teacher" && userDataLoader)
  ) {
    return (
      <div className="mt-32.5 flex w-full items-center justify-center">
        <LoadingCircleSpinner />
      </div>
    );
  }

  if (error) return <div>Error fetching students: {error.message}</div>;
  if (classesError)
    return <p>Failed to load the classes: {classesError.message}</p>;

  return (
    <div className="mt-3.75 w-full rounded-t-[12px] bg-white">
      <div className="rounded-t-[12px] border border-gray-300 shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className={`h-16.25 ${crimson_text.className} text-[13px]`}
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-bold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  data-student-id={row.original.id}
                  onClick={() => {
                    const viewLink = getGradeLink(row.original.id);
                    setStudentId(row.original.id);

                    const page = table.getState().pagination.pageIndex;
                    const pageSize = table.getState().pagination.pageSize;

                    const url = new URL(viewLink, window.location.origin);
                    url.searchParams.set("classId", currentClassId);
                    url.searchParams.set("page", String(page));
                    url.searchParams.set("pageSize", String(pageSize));

                    router.push(`${url.pathname}${url.search}`);
                  }}
                  className="h-19.25 cursor-pointer touch-manipulation text-[16px] font-medium text-slate-800 transition-all duration-150 hover:bg-slate-100 active:scale-[1.0] active:bg-slate-200"
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      key={cell.id}
                      className={
                        index === 0
                          ? "transition-all duration-75 data-[state=selected]:border-l-4 data-[state=selected]:border-slate-800"
                          : ""
                      }
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-3 p-4 max-sm:flex-col">
        <p
          className="text-muted-foreground flex-1 text-sm whitespace-nowrap"
          aria-live="polite"
        >
          Page{" "}
          <span className="text-foreground">
            {table.getState().pagination.pageIndex + 1}
          </span>{" "}
          of <span className="text-foreground">{table.getPageCount()}</span>
        </p>

        <div className="grow">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to previous page"
                >
                  <ChevronLeftIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>

              {showLeftEllipsis && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {pages.map((page) => {
                const isActive =
                  page === table.getState().pagination.pageIndex + 1;

                return (
                  <PaginationItem key={page}>
                    <Button
                      size="icon"
                      variant={`${isActive ? "outline" : "ghost"}`}
                      onClick={() => table.setPageIndex(page - 1)}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {page}
                    </Button>
                  </PaginationItem>
                );
              })}

              {showRightEllipsis && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to next page"
                >
                  <ChevronRightIcon size={16} aria-hidden="true" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

        <div className="flex flex-1 justify-end">
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger
              id="results-per-page"
              className="w-fit cursor-pointer rounded whitespace-nowrap"
              aria-label="Results per page"
            >
              <SelectValue placeholder="Select number of results" />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 40].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
