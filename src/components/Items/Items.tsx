import React, { useMemo } from 'react';
import { Cell } from 'react-table';
import { startCase } from 'lodash';
import Table from 'components/Table/Table';
import { BaseItem } from 'models/base-item';
import { Item } from 'models/item';
import { useDispatch } from 'react-redux';
import { setDetailedEntry } from 'features/detailedEntry/detailedEntrySlice';
import DangerousHtml from 'components/DangerousHtml/DangerousHtml';
import { mainRenderer } from 'utils/mainRenderer';

interface Props {
  items: (Item | BaseItem)[];
  columns?: string[];
}

const handleSpecialCell = (cell: Cell<object>) => {
  if (cell.value instanceof Array) {
    return <div>{cell.value.join(', ')}</div>;
  } else {
    return <div>{JSON.stringify(cell.value, null, 2)}</div>;
  }
};

const Items = ({ items, columns }: Props) => {
  const dispatch = useDispatch();
  const tableData = useMemo(
    () =>
      items.map(item => ({
        ...item,
        detailedEntryTrigger: () =>
          dispatch(
            setDetailedEntry(
              <DangerousHtml
                extraClassName="w-full"
                data={mainRenderer.item.getCompactRenderedString(item)}
              />,
            ),
          ),
      })),
    [items, dispatch],
  );
  const tableColumns = useMemo(() => {
    const itemColumns = columns || [
      'name',
      'type',
      'weight',
      'quantity',
      'value',
      'source',
    ];
    return tableData.length
      ? Object.keys(tableData[0])
          .map(key => ({
            accessor: key,
            Header: startCase(key),
          }))
          .filter(column => itemColumns.includes(column.accessor))
      : [];
  }, [columns, tableData]);

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
