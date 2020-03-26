import React from 'react';
import {
  ClassElement,
  ClassSubclass,
  ClassTableGroup,
  SubclassTableGroup,
} from 'models/class';
import Entry from 'components/Entry/Entry';

interface Props {
  cls: ClassElement;
  subcls: ClassSubclass;
}

const renderTableGroupsHeaderTitle = (
  tableGroups: (ClassTableGroup | SubclassTableGroup)[],
) =>
  tableGroups.map(tableGroup =>
    tableGroup.title ? (
      <th colSpan={tableGroup.colLabels.length}>{tableGroup.title}</th>
    ) : (
      <th colSpan={tableGroup.colLabels.length}></th>
    ),
  );

const renderTableGroupsHeader = (
  tableGroups: (ClassTableGroup | SubclassTableGroup)[],
) =>
  tableGroups.map(tableGroup =>
    tableGroup.colLabels.map(lbl => (
      <th>
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
    const pb = Math.ceil((ixLvl + 1) / 4) + 1;
    const lvlFeaturesFilt = lvlFeatures.filter(
      it => it.name && it.type !== 'inset',
    );
    return (
      <tr className="odd:bg-gray-100 dark-odd:bg-secondary-dark text-sm">
        <td>{Parser.getOrdinalForm(ixLvl + 1)}</td>
        <td>+{pb}</td>
        <td>
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
    <table className="w-full dnd-body">
      <tbody>
        <tr>
          <th className="border" colSpan={15}></th>
        </tr>
        <tr>
          <th colSpan={15}>{cls.name}</th>
        </tr>
        <tr>
          <th colSpan={3} />
          {cls.classTableGroups &&
            renderTableGroupsHeaderTitle(cls.classTableGroups)}
          {subcls.subclassTableGroups &&
            renderTableGroupsHeaderTitle(subcls.subclassTableGroups)}
        </tr>
        <tr>
          <th>Level</th>
          <th>Proficiency Bonus</th>
          <th>Features</th>
          {cls.classTableGroups &&
            renderTableGroupsHeader(cls.classTableGroups)}
          {subcls.subclassTableGroups &&
            renderTableGroupsHeader(subcls.subclassTableGroups)}
        </tr>
        {renderTableRows(cls, subcls)}
        <tr>
          <th className="border" colSpan={15}></th>
        </tr>
      </tbody>
    </table>
  );
};

export default ClassTable;
