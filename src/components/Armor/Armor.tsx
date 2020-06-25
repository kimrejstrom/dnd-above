import React, { useMemo } from 'react';
import { Cell } from 'react-table';
import { ARMOR } from 'utils/data';
import { startCase } from 'lodash';
import Table from 'components/Table/Table';

const handleSpecialCell = (cell: Cell<object>) => {
  if (cell.value instanceof Array) {
    return <div>{cell.value.join(', ')}</div>;
  } else {
    return <div>{JSON.stringify(cell.value, null, 2)}</div>;
  }
};

export const Armor: React.FC = () => {
  const allArmor = ARMOR;
  const tableData = useMemo(() => Object.values(allArmor), [allArmor]);
  const tableColumns = useMemo(
    () =>
      Object.keys(tableData[0])
        .map(key => ({
          accessor: key,
          Header: startCase(key),
        }))
        .filter(column =>
          ['name', 'type', 'ac', 'stealth', 'strength', 'source'].includes(
            column.accessor,
          ),
        ),
    [tableData],
  );

  return (
    <div className="text-left mx-auto w-full">
      <Table
        cellRenderer={handleSpecialCell}
        tableData={{ columns: tableColumns, data: tableData }}
      />
    </div>
  );
};
