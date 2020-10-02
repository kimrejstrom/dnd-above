import React, { useMemo } from 'react';
import { startCase } from 'lodash/fp';
import Table from 'components/Table/Table';
import { Cell } from 'react-table';
import { mainRenderer } from 'utils/mainRenderer';
import DangerousHtml from 'components/DangerousHtml/DangerousHtml';
import { SpellElement } from 'models/spells';
import { useDispatch } from 'react-redux';
import { setDetailedEntry } from 'features/detailedEntry/detailedEntrySlice';
import { isDefined } from 'ts-is-present';

interface Props {
  spells: SpellElement[];
  columns?: string[];
  selectedRows?: Record<string, boolean>;
  onSelectedRowsChange?: any;
}

const handleSpecialCell = (cell: Cell<object>) => {
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

    case 'classes':
      return (
        <div>
          {cell.value &&
            cell.value.fromClassList
              .concat(cell.value.fromClassListVariant)
              .filter(
                (elem: any) => isDefined(elem) && !elem.source.includes('UA'),
              )
              .map((elem: any) => elem.name)
              .join(', ')}
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

export const Spells = ({
  spells,
  columns,
  selectedRows,
  onSelectedRowsChange,
}: Props) => {
  const dispatch = useDispatch();
  const itemColumns = columns || [
    'name',
    'level',
    'time',
    'school',
    'range',
    'source',
    'classes',
  ];

  const tableData = useMemo(
    () =>
      spells.map(sp => ({
        ...sp,
        detailedEntryTrigger: () =>
          dispatch(
            setDetailedEntry(
              <DangerousHtml
                data={mainRenderer.spell.getCompactRenderedString(sp)}
              />,
            ),
          ),
      })),
    [spells, dispatch],
  );
  const tableColumns = useMemo(
    () =>
      tableData.length
        ? Object.keys(tableData[0])
            .map(key => ({
              accessor: key,
              Header: startCase(key),
            }))
            .filter(column => itemColumns.includes(column.accessor))
        : [],
    [itemColumns, tableData],
  );

  return (
    <div className="text-left mx-auto w-full">
      <Table
        cellRenderer={handleSpecialCell}
        selectedRows={selectedRows}
        onSelectedRowsChange={onSelectedRowsChange}
        tableData={{
          columns: tableColumns,
          data: tableData,
          initialState: {
            sortBy: [
              {
                id: 'name',
                desc: false,
              },
            ],
          },
        }}
      />
    </div>
  );
};
