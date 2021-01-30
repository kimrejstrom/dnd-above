import React, { useMemo } from 'react';
import { Cell } from 'react-table';
import { startCase } from 'lodash';
import Table, { SelectColumnFilter } from 'components/Table/Table';
import { BaseItem } from 'models/base-item';
import { Item } from 'models/item';
import { useDispatch } from 'react-redux';
import { setDetailedEntry } from 'features/detailedEntry/detailedEntrySlice';
import DangerousHtml from 'components/DangerousHtml/DangerousHtml';
import { RenderItem } from 'utils/render';
import { Parser } from 'utils/mainRenderer';
import { CommonItem } from 'utils/data';

interface Props {
  items: (Item | BaseItem)[];
  columns?: string[];
  filteringEnabled?: boolean;
  rowButtons?: { header: string; buttonTitle: string };
  onRowButtonClick?: any;
}

const handleSpecialCell = (cell: Cell<object>) => {
  if (cell.value instanceof Array) {
    return <div>{cell.value.join(', ')}</div>;
  } else {
    return <div>{JSON.stringify(cell.value, null, 2)}</div>;
  }
};

const parseItem = (item: CommonItem) => {
  const itemValue = Parser.itemValueToFull(item, true);
  const itemType = item._typeListText.join(', ');
  return {
    ...item,
    value: itemValue !== '' ? itemValue : '–',
    type: itemType,
  };
};

const Items = ({
  items,
  columns,
  rowButtons,
  onRowButtonClick,
  filteringEnabled = false,
}: Props) => {
  const dispatch = useDispatch();
  const tableData = useMemo(
    () =>
      items.map(item => ({
        ...parseItem(item as CommonItem),
        detailedEntryTrigger: () =>
          dispatch(
            setDetailedEntry(
              <DangerousHtml
                extraClassName="w-full tight"
                data={RenderItem(item)}
              />,
            ),
          ),
      })),
    [items, dispatch],
  );
  const tableColumns = useMemo(() => {
    const itemColumns = columns || ['name', 'type', 'value', 'source'];
    const isFilterable = (key: string) =>
      filteringEnabled && ['type', 'source', 'rarity'].includes(key);
    return tableData.length
      ? itemColumns.map(key => ({
          accessor: key,
          Header: startCase(key),
          Filter: isFilterable(key) ? SelectColumnFilter : undefined,
          filter: isFilterable(key) ? 'includes' : undefined,
        }))
      : [];
  }, [columns, tableData, filteringEnabled]);

  const MemoTable = useMemo(
    () => (
      <Table
        cellRenderer={handleSpecialCell}
        tableData={{
          columns: tableColumns,
          data: tableData,
        }}
        rowButtons={rowButtons}
        onRowButtonClick={onRowButtonClick}
      />
    ),
    [tableColumns, tableData, rowButtons, onRowButtonClick],
  );

  return (
    <div className="text-left mx-auto w-full dnd-body text-sm">{MemoTable}</div>
  );
};

export default Items;
