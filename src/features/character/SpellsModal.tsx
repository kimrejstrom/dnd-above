import React, { useCallback, useState } from 'react';
import { Spells } from 'components/Spells/Spells';
import DetailedEntry from 'features/detailedEntry/DetailedEntry';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/rootReducer';
import {
  CharacterListItem,
  updateSpells,
} from 'features/character/characterListSlice';
import _ from 'lodash';

interface Props {
  character: CharacterListItem;
}

const SpellsModal: React.FC<Props> = ({ character }) => {
  const dispatch = useDispatch();
  const { selectedEntry } = useSelector(
    (state: RootState) => state.detailedEntry,
  );
  const { spells } = useSelector(
    (state: RootState) => state.sourceData,
  ).sourceData;

  const initialSpells = character.gameData.spells.reduce(
    (acc: Record<string, boolean>, curr: { row: number; name: string }) => ({
      ...acc,
      [curr.row.toString()]: true,
    }),
    {},
  );

  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>(
    initialSpells,
  );

  const toggleSpells = useCallback(
    (
      updatedSelectedRows: Record<string, boolean>,
      updatedSelectedData: any[],
    ) => {
      const spells = Object.keys(updatedSelectedRows).map((row, i) => ({
        row: Number(row),
        name: updatedSelectedData[i].name,
      }));
      if (!_.isEqual(updatedSelectedRows, selectedRows)) {
        dispatch(updateSpells({ id: character.id, data: spells }));
        setSelectedRows(updatedSelectedRows);
      }
    },
    [character.id, selectedRows, dispatch],
  );

  // const toggleSpells = (
  //   updatedSelectedRows: Record<string, boolean>,
  //   updatedSelectedData: any[],
  // ) => {
  //   const spells = Object.keys(updatedSelectedRows).map((row, i) => ({
  //     row: Number(row),
  //     name: updatedSelectedData[i].name,
  //   }));
  //   if (!_.isEqual(updatedSelectedRows, selectedRows)) {
  //     dispatch(updateSpells({ id: character.id, data: spells }));
  //     setSelectedRows(updatedSelectedRows);
  //   }
  // };

  const filteredSpells = spells.filter(spell => {
    if (spell && spell.classes) {
      const mainClass =
        spell.classes.fromClassList &&
        spell.classes.fromClassList.some(
          entry => entry.name === character.classData.classElement,
        );
      const variantClass =
        spell.classes.fromClassListVariant &&
        spell.classes.fromClassListVariant!.some(
          entry => entry.name === character.classData.classElement,
        );
      return mainClass || variantClass;
    } else {
      return false;
    }
  });

  return (
    <div className="flex flex-col">
      <div>Currently Known Spells</div>
      <div
        style={{ height: '20rem' }}
        className="mt-2 overflow-y-scroll custom-border custom-border-thin bg-light-100 dark:bg-dark-300 rounded-lg"
      >
        <Spells
          spells={filteredSpells}
          selectedRows={selectedRows}
          onSelectedRowsChange={toggleSpells}
        />
      </div>
      <div
        style={{ maxHeight: '25rem' }}
        className="mt-3 overflow-y-scroll custom-border custom-border-thin bg-light-100 dark:bg-dark-300 rounded-lg"
      >
        <div className="detailed-entry px-2">
          <DetailedEntry data={selectedEntry} />
        </div>
      </div>
    </div>
  );
};

export default SpellsModal;
