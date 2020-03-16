import React from 'react';
import { useTable, useExpanded } from 'react-table';
import { WEAPONS } from 'utils/data';
import { startCase } from 'lodash';

const isValidCellValue = (value: any) =>
  typeof value === 'number' || typeof value === 'string';

const handleSpecialCell = (cell: any) => {
  if (cell.value instanceof Array) {
    return cell.value.join(', ');
  } else {
    return JSON.stringify(cell.value, null, 2);
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
    <table {...getTableProps()} className="table-auto w-full">
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
            <tr
              className="odd:bg-gray-100 dark-odd:bg-secondary-dark text-sm"
              {...row.getRowProps()}
            >
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

export const Weapons: React.FC = () => {
  const allWeapons = WEAPONS;
  const tableData = Object.values(allWeapons).filter(weapon => !weapon.age);
  const tableColumns = Object.keys(tableData[0])
    .map(key => ({
      accessor: key,
      Header: startCase(key),
    }))
    .filter(column =>
      [
        'name',
        'type',
        'weaponCategory',
        'age',
        'dmg1',
        'dngType',
        'property',
        'range',
        'source',
      ].includes(column.accessor),
    );

  return (
    <div className="text-left mx-auto w-full">
      <Table columns={tableColumns} data={tableData} />
    </div>
  );
};
