import React from 'react';
import { useTable, useExpanded } from 'react-table';
import { SPELLS } from 'utils/data';
import { startCase } from 'lodash/fp';

const isValidCellValue = (value: any) =>
  typeof value === 'number' || typeof value === 'string';

const handleSpecialCell = (cell: any) => {
  const cellType = cell.column.id;

  switch (cellType) {
    case 'time':
      return (
        <div>
          {cell.value[0].number} {cell.value[0].unit}
        </div>
      );

    case 'range':
      return (
        <div>
          {cell.value.distance?.amount}{' '}
          {`${cell.value.distance?.type} (${cell.value.type})`}
        </div>
      );

    default:
      return (
        <pre>
          <code>{JSON.stringify(cell.value, null, 2)}</code>
        </pre>
      );
  }
};

const Table = ({ columns, data }: { columns: any; data: any }) => {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
    },
    useExpanded, // Use the useExpanded plugin hook
  );

  // Render the UI for your table
  return (
    <table {...getTableProps()} className="table-auto">
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr className="text-sm" {...row.getRowProps()}>
              {row.cells.map(cell => {
                return isValidCellValue(cell.value) ? (
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                ) : (
                  <td {...cell.getCellProps()}>{handleSpecialCell(cell)}</td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export const Spells: React.FC = () => {
  const allSpells = SPELLS;
  const tableData = Object.values(allSpells)
    .map(spell => spell['spell'])
    .flat();
  const tableColumns = Object.keys(tableData[0])
    .map(key => ({
      accessor: key,
      Header: startCase(key),
    }))
    .filter(column =>
      ['name', 'level', 'time', 'school', 'range', 'source'].includes(
        column.accessor,
      ),
    );

  return (
    <div className="text-left mx-auto">
      <Table columns={tableColumns} data={tableData} />
    </div>
  );
};
