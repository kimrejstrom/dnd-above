import React, { useMemo } from 'react';
import { Cell } from 'react-table';
import { startCase } from 'lodash';
import Table from 'components/Table/Table';
import { getWeapons } from 'utils/character';

const handleSpecialCell = (cell: Cell<object>) => {
  if (cell.value instanceof Array) {
    return <div>{cell.value.join(', ')}</div>;
  } else {
    return <div>{JSON.stringify(cell.value, null, 2)}</div>;
  }
};

export const Weapons: React.FC = () => {
  const allWeapons = getWeapons();
  const tableData = useMemo(
    () => Object.values(allWeapons!).filter(weapon => !weapon.age),
    [allWeapons],
  );
  const tableColumns = useMemo(
    () =>
      tableData.length
        ? Object.keys(tableData[0])
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
                'dmgType',
                'property',
                'range',
                'source',
              ].includes(column.accessor),
            )
        : [],
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
