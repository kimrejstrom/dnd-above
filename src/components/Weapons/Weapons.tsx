import React from 'react';
import { Cell } from 'react-table';
import { WEAPONS } from 'utils/data';
import { startCase } from 'lodash';
import Table from 'components/Table/Table';

const handleSpecialCell = (cell: Cell<object>) => {
  if (cell.value instanceof Array) {
    return <div>{cell.value.join(', ')}</div>;
  } else {
    return <div>{JSON.stringify(cell.value, null, 2)}</div>;
  }
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
        'dmgType',
        'property',
        'range',
        'source',
      ].includes(column.accessor),
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