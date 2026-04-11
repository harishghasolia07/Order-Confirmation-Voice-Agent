"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { OrderConfirmation } from "@prisma/client";
import { ArrowUpDown, Search, PhoneCall, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { CallSummaryDialog } from "@/components/CallSummaryDialog";

// ── Re-call button ─────────────────────────────────────────────────────────────
function RecallButton({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const [loading, setLoading] = useState(false);
  const isDisabled = status === "CALLING" || status === "CONFIRMED";

  async function handleRecall() {
    setLoading(true);
    try {
      const res = await fetch("/api/trigger-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Failed to trigger call");
      }
      toast.success("Call triggered", { description: `Re-calling for order ${orderId}` });
    } catch (err) {
      toast.error("Call failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isDisabled || loading}
      onClick={handleRecall}
      title={isDisabled ? "Cannot re-call: order is already calling or confirmed" : "Re-trigger call"}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <PhoneCall className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}

const columns: ColumnDef<OrderConfirmation>[] = [
  {
    accessorKey: "orderId",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 font-semibold"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Order ID
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <Link
        href={`/order/${row.getValue("orderId")}`}
        className="font-mono text-sm font-medium underline-offset-4 hover:underline"
      >
        {row.getValue("orderId")}
      </Link>
    ),
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">{row.getValue("phoneNumber")}</span>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 font-semibold"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Amount
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">
        ₹{Number(row.getValue("amount")).toLocaleString("en-IN")}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Order Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    filterFn: (row, _id, filterValue) => {
      if (!filterValue || filterValue === "ALL") return true;
      return row.getValue("status") === filterValue;
    },
  },
  {
    accessorKey: "deliverySlot",
    header: "Delivery Slot",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.getValue("deliverySlot") ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "callSummary",
    header: "Call Summary",
    cell: ({ row }) => (
      <CallSummaryDialog
        orderId={row.getValue("orderId")}
        summary={row.getValue("callSummary")}
      />
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 font-semibold"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Created At
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <span className="text-sm text-muted-foreground tabular-nums">
          {date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <RecallButton
        orderId={row.getValue("orderId")}
        status={row.getValue("status")}
      />
    ),
  },
];

interface OrderTableProps {
  orders: OrderConfirmation[];
}

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: "All Statuses", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Calling", value: "CALLING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Rescheduled", value: "RESCHEDULED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Failed", value: "FAILED" },
];

const PAGE_SIZE = 10;

export function OrderTable({ orders }: OrderTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: PAGE_SIZE });

  const table = useReactTable({
    data: orders,
    columns,
    state: { sorting, columnFilters, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: (updater) =>
      setPagination((prev) => (typeof updater === "function" ? updater(prev) : updater)),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const statusFilter =
    (columnFilters.find((f) => f.id === "status")?.value as string) ?? "ALL";

  // Reset to first page when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [columnFilters]);

  const filteredCount = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Order ID..."
            value={
              (table.getColumn("orderId")?.getFilterValue() as string) ?? ""
            }
            onChange={(e) =>
              table.getColumn("orderId")?.setFilterValue(e.target.value)
            }
            className="pl-8 bg-black/20 border-white/10 focus-visible:ring-primary text-foreground"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setColumnFilters((prev) => [
              ...prev.filter((f) => f.id !== "status"),
              ...(value !== "ALL" ? [{ id: "status", value }] : []),
            ])
          }
        >
          <SelectTrigger className="w-44 bg-black/20 border-white/10 text-foreground">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl glass-panel overflow-hidden border-none text-foreground mt-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-white/5 hover:bg-white/5 border-b border-white/10">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-muted-foreground font-semibold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-white/5 border-white/5 transition-colors group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="group-hover:text-primary-foreground/90 transition-colors">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {orders.length === 0
                    ? "No orders yet. Create one above to trigger a confirmation call."
                    : "No orders match the current filters."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredCount === 0
            ? "No orders"
            : (() => {
                const { pageIndex, pageSize } = table.getState().pagination;
                const start = pageIndex * pageSize + 1;
                const end = Math.min((pageIndex + 1) * pageSize, filteredCount);
                return `Showing ${start}–${end} of ${filteredCount} orders`;
              })()}
        </p>
        {pageCount > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
