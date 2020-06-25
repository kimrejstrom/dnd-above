import React from 'react';
import {
  useTable,
  useExpanded,
  UseTableOptions,
  Cell,
  useSortBy,
} from 'react-table';

interface Props {
  tableData: UseTableOptions<object>;
  cellRenderer: (cell: Cell<object>) => JSX.Element;
}

const isValidCellValue = (value: Cell<object>) =>
  typeof value === 'number' || typeof value === 'string';

const Table = ({ cellRenderer, tableData }: Props) => {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      ...tableData,
    },
    useSortBy,
    useExpanded, // Use the useExpanded plugin hook
  );

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
                  {isValidCellValue(cell.value)
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
