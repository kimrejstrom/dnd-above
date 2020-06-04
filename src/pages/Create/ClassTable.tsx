import React from 'react';
import {
  ClassElement,
  ClassSubclass,
  ClassTableGroup,
  SubclassTableGroup,
} from 'models/class';
import Entry from 'components/Entry/Entry';
import { Parser } from 'utils/mainRenderer';

interface Props {
  cls: ClassElement;
  subcls: ClassSubclass;
}

const renderTableGroupsHeaderTitle = (
  tableGroups: (ClassTableGroup | SubclassTableGroup)[],
) =>
  tableGroups.map(tableGroup =>
    tableGroup.title ? (
      <th className="text-sm" colSpan={tableGroup.colLabels.length}>
        {tableGroup.title}
      </th>
    ) : (
      <th className="text-sm" colSpan={tableGroup.colLabels.length}></th>
    ),
  );

const renderTableGroupsHeader = (
  tableGroups: (ClassTableGroup | SubclassTableGroup)[],
) =>
  tableGroups.map(tableGroup =>
    tableGroup.colLabels.map(lbl => (
      <th className="text-sm">
        <div>
          <Entry entry={lbl} />
        </div>
      </th>
    )),
  );

const renderTableRows = (cls: ClassElement, subcls: ClassSubclass) => {
  const renderTableGroupRow = (tableGroup: ClassTableGroup, ixLvl: number) => {
    const row = tableGroup.rows[ixLvl] || [];
    const cells = row.map(cell => (
      <td>{cell === 0 ? '\u2014' : <Entry entry={cell} />}</td>
    ));
    return cells;
  };

  return cls.classFeatures.map((lvlFeatures, ixLvl) => {
    const lvlFeaturesFilt = lvlFeatures.filter(
      it => it.name && it.type !== 'inset',
    );
    return (
      <tr className="odd:bg-gray-100 dark-odd:bg-secondary-dark text-sm text-center">
        <td>{Parser.getOrdinalForm(ixLvl + 1)}</td>
        <td className="text-left">
          {lvlFeaturesFilt.length
            ? lvlFeaturesFilt.map(it => it.name).join(', ')
            : `\u2014`}
        </td>
        {cls.classTableGroups &&
          cls.classTableGroups.map(tableGroup =>
            renderTableGroupRow(tableGroup, ixLvl),
          )}
        {subcls.subclassTableGroups &&
          subcls.subclassTableGroups.map(tableGroup =>
            renderTableGroupRow(tableGroup, ixLvl),
          )}
      </tr>
    );
  });
};

const ClassTable = ({ cls, subcls }: Props) => {
  return (
    <div className="my-1">
      <table className="w-full dnd-body">
        <tbody>
          <tr className="leading-tight">
            <th className="text-sm" colSpan={3} />
            {cls.classTableGroups &&
              renderTableGroupsHeaderTitle(cls.classTableGroups)}
            {subcls.subclassTableGroups &&
              renderTableGroupsHeaderTitle(subcls.subclassTableGroups)}
          </tr>
          <tr className="leading-none">
            <th className="text-sm">Level</th>
            <th className="text-sm text-left">Features</th>
            {cls.classTableGroups &&
              renderTableGroupsHeader(cls.classTableGroups)}
            {subcls.subclassTableGroups &&
              renderTableGroupsHeader(subcls.subclassTableGroups)}
          </tr>
          {renderTableRows(cls, subcls)}
        </tbody>
      </table>
    </div>
  );
};

export default ClassTable;
