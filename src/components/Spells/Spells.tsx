import React, { useMemo } from 'react';
import { startCase } from 'lodash/fp';
import Table from 'components/Table/Table';
import { Cell } from 'react-table';
import DangerousHtml from 'components/DangerousHtml/DangerousHtml';
import { SpellElement } from 'models/spells';
import { useDispatch } from 'react-redux';
import { setDetailedEntry } from 'features/detailedEntry/detailedEntrySlice';
import { isDefined } from 'ts-is-present';
import { RenderSpell } from 'utils/render';

interface Props {
  spells: SpellElement[];
  columns?: string[];
  selectedRows?: Record<string, boolean>;
  onSelectedRowsChange?: any;
}

const handleSpecialCell = (cell: Cell<object>) => {
  const cellType = cell.column.id;
  const mainClass = cell.value?.fromClassList ? cell.value?.fromClassList : [];

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
          {mainClass
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

const parseSpell = (spell: SpellElement) => {
  const spellName = spell.duration[0].concentration
    ? `${spell.name} ✱`
    : spell.name;

  const upCastLevel = spell.entriesHigherLevel
    ? `${spell.level} ￪`
    : spell.level;

  return { ...spell, name: spellName, level: upCastLevel };
};

export const Spells = ({
  spells,
  columns,
  selectedRows,
  onSelectedRowsChange,
}: Props) => {
  const dispatch = useDispatch();

  const tableData = useMemo(
    () =>
      spells.map(sp => ({
        ...parseSpell(sp),
        detailedEntryTrigger: () => {
          dispatch(
            setDetailedEntry(
              <DangerousHtml extraClassName="tight" data={RenderSpell(sp)} />,
            ),
          );
        },
      })),
    [spells, dispatch],
  );
  const tableColumns = useMemo(() => {
    const itemColumns = columns || [
      'name',
      'level',
      'time',
      'range',
      'classes',
      'source',
    ];
    return tableData.length
      ? itemColumns.map(key => ({
          accessor: key,
          Header: startCase(key),
        }))
      : [];
  }, [columns, tableData]);

  const MemoTable = useMemo(
    () => (
      <Table
        cellRenderer={handleSpecialCell}
        selectedRows={selectedRows}
        onSelectedRowsChange={onSelectedRowsChange}
        tableData={{
          columns: tableColumns,
          data: tableData,
          autoResetSortBy: false,
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
    ),
    [tableColumns, tableData, selectedRows, onSelectedRowsChange],
  );

  return (
    <div className="dnd-body text-sm text-left mx-auto w-full">{MemoTable}</div>
  );
};
