import _ from 'lodash';
import React from 'react';
import {
  useTable,
  TableOptions,
  Cell,
  useSortBy,
  useRowSelect,
  useMountedLayoutEffect,
  useFilters,
} from 'react-table';
import { isDefined } from 'ts-is-present';
import { CommonItem } from 'utils/data';

interface Props {
  tableData: TableOptions<object>;
  cellRenderer: (cell: Cell<object>) => JSX.Element;
  selectedRows?: Record<string, boolean>;
  onSelectedRowsChange?: (
    selectedRows: Record<string, boolean>,
    selectedData: any[],
  ) => void;
  rowButtons?: { header: string; buttonTitle: string };
  onRowButtonClick?: (itemName: string) => void;
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
      <input
        className="form-checkbox -mt-1"
        type="checkbox"
        ref={resolvedRef}
        {...rest}
      />
    );
  },
);

// This is a custom filter UI for selecting
// a unique option from a list
export function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}: {
  column: {
    filterValue: any;
    setFilter: any;
    preFilteredRows: any;
    id: string;
  };
}) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = React.useMemo(() => {
    const optionValues: string = preFilteredRows.map(
      (row: any) => row.values[id],
    );
    return _.uniq(optionValues);
  }, [id, preFilteredRows]);

  // Render a select box
  return (
    <select
      className={`form-input text-xs px-1 py-0.5`}
      value={filterValue}
      onChange={e => {
        setFilter(e.target.value || undefined);
      }}
    >
      <option value="">All</option>
      {options.map((option, i) => (
        <option key={i} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

const Table = ({
  cellRenderer,
  tableData,
  selectedRows,
  onSelectedRowsChange,
  rowButtons,
  onRowButtonClick,
}: Props) => {
  // Use the state and functions returned from useTable to build your UI
  console.log('init', tableData);
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
    useFilters,
    useSortBy,
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
        : rowButtons
        ? hooks.visibleColumns.push(columns => [
            // Let's make a column for buttons
            {
              id: 'selection',
              // The header can use the table's getToggleAllRowsSelectedProps method
              // to render a checkbox
              Header: () => (
                <div>
                  <span>{rowButtons?.header}</span>
                </div>
              ),
              // The cell can use the individual row's getToggleRowSelectedProps method
              // to the render a checkbox
              Cell: ({ row }) => {
                return (
                  <button
                    className="uppercase text-sm font-bold px-2 py-1 dark:hover:bg-dark-100 bg-light-200 hover:bg-yellow-100 dark:bg-dark-200 dark:text-light-100 rounded-sm"
                    onClick={() => {
                      isDefined(onRowButtonClick) &&
                        onRowButtonClick((row.original as CommonItem)['name']!);
                    }}
                  >
                    {rowButtons?.buttonTitle}
                  </button>
                );
              },
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
              <th
                {...column.getHeaderProps(
                  column.canFilter && column.filter
                    ? {}
                    : column.getSortByToggleProps(),
                )}
              >
                {column.render('Header')}
                {/* Render the columns filter UI */}
                <div>
                  {column.canFilter && column.filter
                    ? column.render('Filter')
                    : null}
                </div>
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
              className="cursor-pointer odd:bg-gray-100 dark:odd:bg-dark-200 text-sm"
              {...row.getRowProps()}
              onClick={(row.original as any).detailedEntryTrigger}
            >
              {row.cells.map(cell => (
                <td
                  className="truncate"
                  style={{ maxWidth: '13rem' }}
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
