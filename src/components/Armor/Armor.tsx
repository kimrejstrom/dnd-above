import React, { useMemo } from 'react';
import { Cell } from 'react-table';
import { startCase } from 'lodash';
import Table from 'components/Table/Table';
import { getArmor } from 'utils/sourceDataUtils';

const handleSpecialCell = (cell: Cell<object>) => {
  if (cell.value instanceof Array) {
    return <div>{cell.value.join(', ')}</div>;
  } else {
    return <div>{JSON.stringify(cell.value, null, 2)}</div>;
  }
};

export const Armor: React.FC = () => {
  const allArmor = getArmor();
  const tableData = useMemo(() => Object.values(allArmor!), [allArmor]);
  const tableColumns = useMemo(
    () =>
      tableData.length
        ? Object.keys(tableData[0])
            .map(key => ({
              accessor: key,
              Header: startCase(key),
            }))
            .filter(column =>
              ['name', 'type', 'ac', 'stealth', 'strength', 'source'].includes(
                column.accessor,
              ),
            )
        : [],
    [tableData],
  );

  const MemoTable = useMemo(
    () => (
      <Table
        cellRenderer={handleSpecialCell}
        tableData={{ columns: tableColumns, data: tableData }}
      />
    ),
    [tableColumns, tableData],
  );

  return <div className="text-left mx-auto w-full">{MemoTable}</div>;
};
