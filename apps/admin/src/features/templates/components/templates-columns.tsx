import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { DataTableColumnHeader } from "@/components/data-table";
import { LongText } from "@/components/long-text";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/shared/lib/utils";
import type { Template } from "../data/schema";
import { DataTableRowActions } from "./data-table-row-actions";

export const templatesColumns: ColumnDef<Template>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Chọn tất cả"
        className="translate-y-[2px]"
      />
    ),
    meta: {
      className: cn("max-md:sticky start-0 z-10 rounded-tl-[inherit]"),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Chọn hàng"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => <div className="w-16 ps-3">{row.getValue("id")}</div>,
    meta: {
      className: cn(
        "drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]",
        "ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none"
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: "thumbnailUrl",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ảnh" />,
    cell: ({ row }) => {
      const thumbnailUrl = row.getValue("thumbnailUrl") as string | null;
      const name = row.original.name;
      return (
        <div className="flex items-center">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={name} className="h-12 w-12 rounded object-cover" />
          ) : (
            <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded text-xs">
              N/A
            </div>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tên mẫu" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <LongText className="max-w-xs font-medium">{row.getValue("name")}</LongText>
      </div>
    ),
    meta: { className: "w-48" },
  },
  {
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Mô tả" />,
    cell: ({ row }) => {
      const description = row.getValue("description") as string | null;
      return (
        <div className="max-w-md">
          {description ? (
            <LongText className="text-muted-foreground text-sm">{description}</LongText>
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày tạo" />,
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string;
      const date = new Date(createdAt);
      return <div className="text-sm text-nowrap">{format(date, "dd/MM/yyyy HH:mm", { locale: vi })}</div>;
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cập nhật" />,
    cell: ({ row }) => {
      const updatedAt = row.getValue("updatedAt") as string;
      const date = new Date(updatedAt);
      return <div className="text-sm text-nowrap">{format(date, "dd/MM/yyyy HH:mm", { locale: vi })}</div>;
    },
  },
  {
    id: "actions",
    cell: DataTableRowActions,
  },
];
