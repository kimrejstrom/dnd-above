import React from 'react';
import { SPELLS } from 'utils/data';
import { startCase } from 'lodash/fp';
import Table from 'components/Table/Table';
import { Cell } from 'react-table';
import mainRenderer from 'utils/mainRenderer';
import DangerousHtml from 'components/DangerousHtml/DangerousHtml';
import { SpellElement } from 'models/spells';

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

    default:
      return (
        <pre>
          <code>{JSON.stringify(cell.value, null, 2)}</code>
        </pre>
      );
  }
};

export const Spells: React.FC = () => {
  const allSpells = SPELLS;
  const tableData: SpellElement[] = Object.values(allSpells)
    .map(spell => spell.spell)
    .flat();
  const tableColumns = Object.keys(tableData[0])
    .map(key => ({
      accessor: key,
      Header: startCase(key),
    }))
    .filter(column =>
      ['name', 'level', 'time', 'school', 'range', 'source'].includes(
        column.accessor,
      ),
    );

  return (
    <div className="text-left mx-auto">
      <Table
        cellRenderer={handleSpecialCell}
        tableData={{ columns: tableColumns, data: tableData }}
      />
      {tableData.map((sp, index) => (
        <DangerousHtml
          key={index}
          data={mainRenderer.spell.getCompactRenderedString(sp)}
        />
      ))}
    </div>
  );
};
