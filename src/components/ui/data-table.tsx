"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ---------------------------------------------------------------------------
// DataTable - A sortable, paginated table wrapper built on top of the
// shadcn/ui Table primitive. Designed for server-side pagination and sorting
// that matches the PMO API pagination contract (page, limit, total,
// totalPages).
// ---------------------------------------------------------------------------

export interface DataTableColumn<T> {
  /** Unique key used for sorting. If omitted, column is not sortable */
  key?: string;
  /** Column header label */
  header: string;
  /** Render function for the cell content */
  cell: (row: T) => React.ReactNode;
  /** Additional className for the header cell */
  headerClassName?: string;
  /** Additional className for the body cell */
  cellClassName?: string;
}

export interface DataTablePagination {
  /** Current 1-indexed page number */
  page: number;
  /** Items per page */
  limit: number;
  /** Total item count across all pages */
  total: number;
  /** Total number of pages */
  totalPages: number;
}

export interface DataTableProps<T> {
  /** Column definitions */
  columns: DataTableColumn<T>[];
  /** Row data array */
  data: T[];
  /** Pagination state (from API response) */
  pagination?: DataTablePagination;
  /** Currently active sort column key */
  sortBy?: string;
  /** Current sort direction */
  sortOrder?: "asc" | "desc";
  /** Called when user clicks a sortable column header */
  onSort?: (key: string) => void;
  /** Called when user navigates to a different page */
  onPageChange?: (page: number) => void;
  /** Unique key extractor for rows (defaults to index) */
  getRowKey?: (row: T, index: number) => string | number;
  /** Additional className for the table wrapper */
  className?: string;
}

function SortIcon({
  columnKey,
  sortBy,
  sortOrder,
}: {
  columnKey: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  if (sortBy !== columnKey) {
    return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground/50" />;
  }
  return sortOrder === "asc" ? (
    <ArrowUp className="ml-1 h-3.5 w-3.5" />
  ) : (
    <ArrowDown className="ml-1 h-3.5 w-3.5" />
  );
}

function DataTable<T>({
  columns,
  data,
  pagination,
  sortBy,
  sortOrder,
  onSort,
  onPageChange,
  getRowKey,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, idx) => (
                <TableHead
                  key={col.key ?? idx}
                  className={cn(
                    col.key && onSort && "cursor-pointer select-none",
                    col.headerClassName,
                  )}
                  onClick={
                    col.key && onSort ? () => onSort(col.key!) : undefined
                  }
                >
                  <div className="flex items-center">
                    {col.header}
                    {col.key && onSort && (
                      <SortIcon
                        columnKey={col.key}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                      />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, idx) => (
                <TableRow key={getRowKey ? getRowKey(row, idx) : idx}>
                  {columns.map((col, colIdx) => (
                    <TableCell
                      key={col.key ?? colIdx}
                      className={col.cellClassName}
                    >
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            {Math.min(
              (pagination.page - 1) * pagination.limit + 1,
              pagination.total,
            )}
            -
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange?.(1)}
              aria-label="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange?.(pagination.page + 1)}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange?.(pagination.totalPages)}
              aria-label="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { DataTable };
