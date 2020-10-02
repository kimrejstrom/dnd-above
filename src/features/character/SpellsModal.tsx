import React, { useState } from 'react';
import { Spells } from 'components/Spells/Spells';
import { ALL_SPELLS } from 'utils/data';
import DetailedEntry from 'features/detailedEntry/DetailedEntry';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { getSelectedCharacter } from 'app/selectors';
import { updateSpells } from 'features/character/characterListSlice';
import _ from 'lodash';

interface Props {}

const SpellsModal = (props: Props) => {
  const dispatch = useDispatch();
  const character = useSelector(getSelectedCharacter);
  const { selectedEntry } = useSelector(
    (state: RootState) => state.detailedEntry,
  );
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

  const toggleSpells = (
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
  };

  return (
    <div>
      <div style={{ height: '20rem' }}>
        <div className="h-full my-2 custom-border custom-border-thin bg-yellow-100 dark:bg-tertiary-dark rounded-lg">
          <div className="h-full overflow-y-scroll">
            <Spells
              spells={ALL_SPELLS}
              selectedRows={selectedRows}
              onSelectedRowsChange={toggleSpells}
            />
          </div>
        </div>
      </div>
      <div className="mt-2 h-full" style={{ height: '12rem' }}>
        <div className="h-full my-2 custom-border custom-border-thin bg-yellow-100 dark:bg-tertiary-dark rounded-lg">
          <div className="h-full overflow-y-scroll px-2">
            <DetailedEntry data={selectedEntry} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpellsModal;
