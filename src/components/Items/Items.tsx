import React from 'react';
import { BASE_ITEMS } from 'utils/data';
import { Cell } from 'react-table';
import { startCase } from 'lodash';
import Table from 'components/Table/Table';

interface Props {}

const handleSpecialCell = (cell: Cell<object>) => {
  if (cell.value instanceof Array) {
    return <div>{cell.value.join(', ')}</div>;
  } else {
    return <div>{JSON.stringify(cell.value, null, 2)}</div>;
  }
};

const Items = (props: Props) => {
  const allItems = BASE_ITEMS;
  const tableData = Object.values(allItems);
  const tableColumns = Object.keys(tableData[0])
    .map(key => ({
      accessor: key,
      Header: startCase(key),
    }))
    .filter(column =>
      ['name', 'type', 'age', 'rarity', 'property', 'source'].includes(
        column.accessor,
      ),
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

export default Items;
