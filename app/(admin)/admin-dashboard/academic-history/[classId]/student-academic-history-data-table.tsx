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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { Button } from "@/components/ui/button";
import { useFetchArchivedStudents } from "@/hooks/use-archived-students";
import { useFetchClasses } from "@/hooks/use-classes";
import ViewStudentAcademicHistoryViewModal from "./view-student-academic-history-modal";

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
  academic_year: string;
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
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="cursor-pointer"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "first_name",
    header: "Full Name",
    cell: ({ row }) => {
      const { first_name, last_name } = row.original;
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
            className="cursor-pointer  inline-block capitalize"
          >
            {first_name} {last_name}
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
    accessorKey: "academic_year",
    header: "Academic Year",
    cell: ({ row }) => (
      <div className="font-normal">{row.getValue("academic_year")}</div>
    ),
  },

  {
    accessorKey: "view_grade",
    header: "View Grade",
    cell: ({ row }) => (
      <div onClick={(e) => e.stopPropagation()}>
        <ViewStudentAcademicHistoryViewModal studentId={row.original.id} />
      </div>
    ),
  },
];

export default function StudentAcademicHistoryDataTable({
  classId: propClassId,
}: {
  classId?: string;
}) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // 1. Get the current Class ID (Prefer prop, fallback to URL params)
  const currentClassId = propClassId || (params.classId as string);

  const { name, studentYears } = useFilterStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const { setSelectedIds, selectedIds } = useStudentSelectionStore();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  // Fetch data
  const {
    isLoading: studentDataLoader,
    data: studentData,
    error: StudentDataError,
  } = useFetchArchivedStudents();

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
    () =>
      new Map<string, string>(
        (classes ?? []).map((cls: any) => [
          cls.id,
          String(cls.name ?? "Unknown Class"),
        ]),
      ),
    [classes],
  );

  // formatted student data with class names instead of IDs
  const filteredAndFormattedData: StudentData[] = useMemo(() => {
    if (!studentData) return [];

    return studentData
      .filter((student) => {
        const matchesClass = student.classId === currentClassId;
        const fullName =
          `${student.firstName} ${student.lastName}`.toLowerCase();
        const matchesName = name ? fullName.includes(name.toLowerCase()) : true;
        const matchesAcademicYear = studentYears
          ? student.academicYear === studentYears
          : true;

        return matchesClass && matchesName && matchesAcademicYear;
      })
      .map((student) => ({
        id: student.id,
        first_name: student.firstName,
        last_name: student.lastName,
        class_id: student.classId
          ? (classMap.get(student.classId) ?? "Unknown Class")
          : "Unknown Class",
        academic_year: student.academicYear ?? "",
      }))
      .sort((a, b) => a.first_name.localeCompare(b.first_name));
  }, [studentData, name, currentClassId, classMap, studentYears]);

  const table = useReactTable({
    data: filteredAndFormattedData,
    columns,
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

  if (studentDataLoader || classesLoader) {
    return (
      <div className="mt-32.5 flex w-full items-center justify-center">
        <LoadingCircleSpinner />
      </div>
    );
  }

  if (StudentDataError)
    return <div>Error fetching students: {StudentDataError.message}</div>;

  if (classesError)
    return <div>Error fetching classes: {classesError.message}</div>;

  return (
    <div className="mt-3.75  w-full rounded-t-[12px] bg-white">
      <div className="rounded-t-[12px] border border-gray-300 shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className={`h-16.25 ${crimson_text.className} text-[13px] font-bold`}
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
                  className="h-19.25 text-[16px] font-medium text-slate-800"
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
              {[5, 10, 15].map((pageSize) => (
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
