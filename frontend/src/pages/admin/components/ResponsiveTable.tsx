import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { ScrollArea } from "radix-ui";

export interface ResponsiveTableColumn<Row> {
  id: string;
  label: string;
  render: (row: Row) => ReactNode;
  sortValue?: (row: Row) => string | number | boolean | null | undefined;
}

export interface ResponsiveTableProps<Row> {
  rows: readonly Row[];
  columns: readonly ResponsiveTableColumn<Row>[];
  getRowId: (row: Row) => string;
  emptyMessage: string;
  renderActions?: (row: Row) => ReactNode;
}

type SortDirection = "ascending" | "descending";

export function ResponsiveTable<Row>({ rows, columns, getRowId, emptyMessage, renderActions }: ResponsiveTableProps<Row>) {
  const firstSortableColumn = columns.find((column) => column.sortValue);
  const [sortColumn, setSortColumn] = useState(firstSortableColumn?.id ?? "");
  const [sortDirection, setSortDirection] = useState<SortDirection>("ascending");

  const sortedRows = useMemo(() => {
    const column = columns.find((item) => item.id === sortColumn && item.sortValue);
    if (!column?.sortValue) return [...rows];
    return [...rows].sort((left, right) => {
      const leftValue = column.sortValue?.(left);
      const rightValue = column.sortValue?.(right);
      const comparison = typeof leftValue === "number" && typeof rightValue === "number"
        ? leftValue - rightValue
        : String(leftValue ?? "").localeCompare(String(rightValue ?? ""), undefined, { numeric: true, sensitivity: "base" });
      return sortDirection === "ascending" ? comparison : -comparison;
    });
  }, [columns, rows, sortColumn, sortDirection]);

  function changeSort(columnId: string) {
    if (sortColumn === columnId) {
      setSortDirection((direction) => direction === "ascending" ? "descending" : "ascending");
      return;
    }
    setSortColumn(columnId);
    setSortDirection("ascending");
  }

  if (!rows.length || !columns.length) {
    return <div className="admin-empty-table" role="status"><p>{emptyMessage}</p></div>;
  }

  return (
    <ScrollArea.Root className="admin-table-scroll">
      <ScrollArea.Viewport className="admin-table-viewport">
        <table className="admin-data-table">
          <thead>
            <tr>
              {columns.map((column) => {
                const sortable = Boolean(column.sortValue);
                const active = sortColumn === column.id;
                const SortIcon = !active ? ArrowUpDown : sortDirection === "ascending" ? ArrowUp : ArrowDown;
                return (
                  <th key={column.id} aria-sort={sortable ? active ? sortDirection : "none" : undefined}>
                    {sortable ? <button type="button" onClick={() => changeSort(column.id)}>{column.label}<SortIcon size={14} /></button> : column.label}
                  </th>
                );
              })}
              {renderActions ? <th className="admin-actions-column"><span className="admin-visually-hidden">Actions</span></th> : null}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr key={getRowId(row)}>
                {columns.map((column) => <td key={column.id}>{column.render(row)}</td>)}
                {renderActions ? <td className="admin-actions-column">{renderActions(row)}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar className="admin-table-scrollbar" orientation="horizontal">
        <ScrollArea.Thumb className="admin-table-scroll-thumb" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}
