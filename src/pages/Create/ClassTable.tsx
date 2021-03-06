import React from 'react';
import {
  ClassClassFeature,
  ClassElement,
  ClassSubclass,
  ClassTableGroup,
  SubclassFeature,
  SubclassTableGroup,
} from 'models/class';
import Entry from 'components/Entry/Entry';
import { Parser } from 'utils/mainRenderer';
import { getAllClassFeatures } from 'utils/sourceDataUtils';
import { isDefined } from 'ts-is-present';
import DetailedEntryTrigger from 'features/detailedEntry/DetailedEntryTrigger';
import { generateID } from 'features/createCharacterForm/createCharacterFormSlice';

interface Props {
  cls: ClassElement;
  subcls: ClassSubclass;
}

const renderTableGroupsHeaderTitle = (
  tableGroups: (ClassTableGroup | SubclassTableGroup)[],
) =>
  tableGroups.map((tableGroup, i) =>
    tableGroup.title ? (
      <th
        key={tableGroup.title}
        className="text-sm"
        colSpan={tableGroup.colLabels.length}
      >
        {tableGroup.title}
      </th>
    ) : (
      <th
        key={`empty-${i}`}
        className="text-sm"
        colSpan={tableGroup.colLabels.length}
      ></th>
    ),
  );

const renderTableGroupsHeader = (
  tableGroups: (ClassTableGroup | SubclassTableGroup)[],
) =>
  tableGroups.map(tableGroup =>
    tableGroup.colLabels.map(lbl => (
      <th key={lbl} className="text-sm">
        <div>
          <Entry entry={lbl} prose={false} />
        </div>
      </th>
    )),
  );

const renderTableRows = (cls: ClassElement, subcls: ClassSubclass) => {
  const renderTableGroupRow = (tableGroup: ClassTableGroup, ixLvl: number) => {
    const row = tableGroup.rows[ixLvl] || [];
    const cells = row.map((cell, i) => (
      <td key={i}>
        {cell === 0 ? '\u2014' : <Entry entry={cell} prose={false} />}
      </td>
    ));
    return cells;
  };

  const allClassFeatures: Array<(
    | ClassClassFeature
    | SubclassFeature
  )[]> = Array(20).fill([]);
  getAllClassFeatures(cls.name, subcls.name).forEach(feature => {
    allClassFeatures[feature.level - 1].push(feature);
  });

  return allClassFeatures.map((lvlFeatures, ixLvl) => {
    const lvlFeaturesFiltered = lvlFeatures
      .map(feature => (feature.level === ixLvl + 1 ? feature : undefined))
      .filter(isDefined);
    return (
      <tr
        key={`${ixLvl}-${generateID()}`}
        className="odd:bg-gray-100 dark:odd:bg-dark-200 text-sm text-center"
      >
        <td>{Parser.getOrdinalForm(ixLvl + 1)}</td>
        <td className="text-left">
          {lvlFeaturesFiltered.length
            ? lvlFeaturesFiltered.map((feature, i) => {
                const lastIndex = lvlFeaturesFiltered.length - 1;
                return (
                  <DetailedEntryTrigger
                    key={i}
                    extraClassName={'inline'}
                    data={feature}
                  >
                    {i === lastIndex ? `${feature.name}` : `${feature.name}, `}
                  </DetailedEntryTrigger>
                );
              })
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
          <tr key={'level'} className="leading-tight">
            <th className="text-sm" colSpan={3} />
            {cls?.classTableGroups &&
              renderTableGroupsHeaderTitle(cls.classTableGroups)}
            {subcls?.subclassTableGroups &&
              renderTableGroupsHeaderTitle(subcls.subclassTableGroups)}
          </tr>
          <tr key={'features'} className="leading-none">
            <th className="text-sm">Level</th>
            <th className="text-sm text-left">Features</th>
            {cls?.classTableGroups &&
              renderTableGroupsHeader(cls.classTableGroups)}
            {subcls?.subclassTableGroups &&
              renderTableGroupsHeader(subcls.subclassTableGroups)}
          </tr>
          {renderTableRows(cls, subcls)}
        </tbody>
      </table>
    </div>
  );
};

export default ClassTable;
