import { useMemo, useState, type MouseEvent, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { ScrollArea } from "radix-ui";

export interface ResponsiveTableColumn<Row> {
  id: string;
  label: ReactNode;
  render: (row: Row) => ReactNode;
  sortable?: boolean;
  sortValue?: (row: Row) => string | number | boolean | null | undefined;
}

export type TableSortDirection = "ascending" | "descending";

export interface ResponsiveTableProps<Row> {
  rows: readonly Row[];
  columns: readonly ResponsiveTableColumn<Row>[];
  getRowId: (row: Row) => string;
  emptyMessage: string;
  renderActions?: (row: Row) => ReactNode;
  selectedRowIds?: ReadonlySet<string>;
  onSelectedRowIdsChange?: (selectedIds: Set<string>) => void;
  isRowSelectable?: (row: Row) => boolean;
  selectRowOnClick?: boolean;
  sortColumn?: string;
  sortDirection?: TableSortDirection;
  onSortChange?: (columnId: string, direction: TableSortDirection) => void;
  defaultSortColumn?: string;
  defaultSortDirection?: TableSortDirection;
}

export function ResponsiveTable<Row>({
  rows,
  columns,
  getRowId,
  emptyMessage,
  renderActions,
  selectedRowIds,
  onSelectedRowIdsChange,
  isRowSelectable = () => true,
  selectRowOnClick = false,
  sortColumn: controlledSortColumn,
  sortDirection: controlledSortDirection,
  onSortChange,
  defaultSortColumn,
  defaultSortDirection = "ascending",
}: ResponsiveTableProps<Row>) {
  const firstSortableColumn = columns.find((column) => column.sortable || column.sortValue);
  const [internalSortColumn, setInternalSortColumn] = useState(defaultSortColumn ?? firstSortableColumn?.id ?? "");
  const [internalSortDirection, setInternalSortDirection] = useState<TableSortDirection>(defaultSortDirection);
  const sortColumn = controlledSortColumn ?? internalSortColumn;
  const sortDirection = controlledSortDirection ?? internalSortDirection;
  const selectionEnabled = selectedRowIds !== undefined && onSelectedRowIdsChange !== undefined;

  const sortedRows = useMemo(() => {
    if (onSortChange) return [...rows];
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
  }, [columns, onSortChange, rows, sortColumn, sortDirection]);

  const selectableRowIds = sortedRows.filter(isRowSelectable).map(getRowId);
  const allRowsSelected = selectableRowIds.length > 0 && selectableRowIds.every((id) => selectedRowIds?.has(id));
  const someRowsSelected = !allRowsSelected && selectableRowIds.some((id) => selectedRowIds?.has(id));

  function changeSort(columnId: string) {
    const nextDirection = sortColumn === columnId && sortDirection === "ascending" ? "descending" : "ascending";
    setInternalSortColumn(columnId);
    setInternalSortDirection(nextDirection);
    onSortChange?.(columnId, nextDirection);
  }

  function toggleAllRows(checked: boolean) {
    if (!selectedRowIds || !onSelectedRowIdsChange) return;
    const nextSelectedIds = new Set(selectedRowIds);
    selectableRowIds.forEach((id) => checked ? nextSelectedIds.add(id) : nextSelectedIds.delete(id));
    onSelectedRowIdsChange(nextSelectedIds);
  }

  function toggleRow(rowId: string, checked: boolean) {
    if (!selectedRowIds || !onSelectedRowIdsChange) return;
    const nextSelectedIds = new Set(selectedRowIds);
    checked ? nextSelectedIds.add(rowId) : nextSelectedIds.delete(rowId);
    onSelectedRowIdsChange(nextSelectedIds);
  }

  function handleRowClick(event: MouseEvent<HTMLTableRowElement>, rowId: string, selectable: boolean) {
    if (!selectRowOnClick || !selectionEnabled || !selectable) return;
    const target = event.target as HTMLElement;
    if (target.closest("button,input,select,textarea,a,[role='button'],[role='combobox'],[role='menuitem']")) return;
    toggleRow(rowId, !(selectedRowIds?.has(rowId) ?? false));
  }

  if (!columns.length) {
    return <div className="admin-empty-table" role="status"><p>{emptyMessage}</p></div>;
  }

  return (
    <ScrollArea.Root className="admin-table-scroll">
      <ScrollArea.Viewport className="admin-table-viewport">
        <table className="admin-data-table">
          <thead>
            <tr>
              {selectionEnabled ? (
                <th className="admin-selection-column">
                  <input
                    type="checkbox"
                    checked={allRowsSelected}
                    ref={(element) => { if (element) element.indeterminate = someRowsSelected; }}
                    onChange={(event) => toggleAllRows(event.target.checked)}
                    aria-label="Select all rows on this page"
                  />
                </th>
              ) : null}
              {columns.map((column) => {
                const sortable = Boolean(column.sortable || column.sortValue);
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
            {sortedRows.length ? sortedRows.map((row) => {
              const rowId = getRowId(row);
              const selectable = isRowSelectable(row);
              return (
              <tr
                key={rowId}
                data-selected={selectedRowIds?.has(rowId) || undefined}
                data-row-selectable={selectionEnabled && selectable && selectRowOnClick || undefined}
                onClick={(event) => handleRowClick(event, rowId, selectable)}
              >
                {selectionEnabled ? (
                  <td className="admin-selection-column">
                    <input
                      type="checkbox"
                      checked={selectedRowIds?.has(rowId) ?? false}
                      disabled={!selectable}
                      onChange={(event) => toggleRow(rowId, event.target.checked)}
                      aria-label={`Select row ${rowId}`}
                    />
                  </td>
                ) : null}
                {columns.map((column) => <td key={column.id}>{column.render(row)}</td>)}
                {renderActions ? <td className="admin-actions-column">{renderActions(row)}</td> : null}
              </tr>
              );
            }) : <tr><td colSpan={columns.length + (selectionEnabled ? 1 : 0) + (renderActions ? 1 : 0)}><div className="admin-empty-table" role="status"><p>{emptyMessage}</p></div></td></tr>}
          </tbody>
        </table>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar className="admin-table-scrollbar" orientation="horizontal">
        <ScrollArea.Thumb className="admin-table-scroll-thumb" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}
