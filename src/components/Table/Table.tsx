import React from 'react';
import {
  useTable,
  useExpanded,
  TableOptions,
  Cell,
  useSortBy,
  useRowSelect,
  useMountedLayoutEffect,
} from 'react-table';

interface Props {
  tableData: TableOptions<object>;
  cellRenderer: (cell: Cell<object>) => JSX.Element;
  selectedRows?: Record<string, boolean>;
  onSelectedRowsChange?: (
    selectedRows: Record<string, boolean>,
    selectedData: any[],
  ) => void;
}

const isValidCellValue = (value: Cell<object>) =>
  typeof value === 'number' || typeof value === 'string';

const isSelectionCell = (value: Cell<object>) =>
  value?.column?.id === 'selection';

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }: any, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef: any = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <>
        <input type="checkbox" ref={resolvedRef} {...rest} />
      </>
    );
  },
);

const Table = ({
  cellRenderer,
  tableData,
  selectedRows,
  onSelectedRowsChange,
}: Props) => {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    selectedFlatRows,
    state: { selectedRowIds },
  } = useTable(
    selectedRows
      ? {
          ...tableData,
          initialState: {
            ...tableData.initialState,
            selectedRowIds: selectedRows,
          },
        }
      : { ...tableData },
    useSortBy,
    useExpanded, // Use the useExpanded plugin hook
    useRowSelect,
    hooks => {
      selectedRows
        ? hooks.visibleColumns.push(columns => [
            // Let's make a column for selection
            {
              id: 'selection',
              // The header can use the table's getToggleAllRowsSelectedProps method
              // to render a checkbox
              Header: ({ getToggleAllRowsSelectedProps }) => (
                <div>
                  <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
                </div>
              ),
              // The cell can use the individual row's getToggleRowSelectedProps method
              // to the render a checkbox
              Cell: ({ row }) => (
                <div>
                  <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
                </div>
              ),
            },
            ...columns,
          ])
        : hooks.visibleColumns.push();
    },
  );

  // Keep parent/store state in sync with local state
  // No need to update on mount since we are passing initial state
  useMountedLayoutEffect(() => {
    const selectedData = selectedFlatRows.map(d => d.original);
    onSelectedRowsChange && onSelectedRowsChange(selectedRowIds, selectedData);
  }, [onSelectedRowsChange, selectedRowIds]);

  // Render the UI for your table
  return (
    <table {...getTableProps()} className="table-auto w-full">
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr
              className="cursor-pointer odd:bg-gray-100 dark-odd:bg-secondary-dark text-sm"
              {...row.getRowProps()}
              onClick={(row.original as any).detailedEntryTrigger}
            >
              {row.cells.map(cell => (
                <td
                  className="truncate"
                  style={{ maxWidth: '15rem' }}
                  {...cell.getCellProps()}
                >
                  {isValidCellValue(cell.value) || isSelectionCell(cell)
                    ? cell.render('Cell')
                    : cellRenderer(cell)}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default Table;
