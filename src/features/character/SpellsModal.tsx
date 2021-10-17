import React, { useCallback, useState } from 'react';
import { Spells } from 'components/Spells/Spells';
import DetailedEntry from 'features/detailedEntry/DetailedEntry';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { updateSpells } from 'features/character/characterListSlice';
import _ from 'lodash';
import { getSelectedCharacter } from 'app/selectors';
import { SpellElement } from 'models/spells';

const SpellsModal: React.FC = () => {
  const dispatch = useDispatch();
  const { selectedEntry } = useSelector(
    (state: RootState) => state.detailedEntry,
  );
  const character = useSelector(getSelectedCharacter);

  // Get all spells
  const { spells } = useSelector(
    (state: RootState) => state.sourceData,
  ).sourceData;

  // Get relevant spells for this character
  const filteredSpells = spells.filter(spell => {
    if (spell && spell.classes) {
      const mainClass =
        spell.classes.fromClassList &&
        spell.classes.fromClassList.some(
          entry => entry.name === character!.classData.classElement,
        );
      const variantClass =
        spell.classes.fromClassListVariant &&
        spell.classes.fromClassListVariant!.some(
          entry => entry.name === character!.classData.classElement,
        );
      const subClass =
        spell.classes.fromSubclass &&
        spell.classes.fromSubclass!.some(
          entry =>
            entry.class.name === character!.classData.classElement ||
            entry.subclass.name === character!.classData.subClass,
        );
      return mainClass || variantClass || subClass;
    }
    if (spell && spell.backgrounds) {
      const backgrounds =
        spell.backgrounds &&
        spell.backgrounds.some(
          entry => entry.name === character!.descriptionData.background,
        );
      return backgrounds;
    } else {
      return false;
    }
  });

  // Set filtered as default
  const [spellList, setSpellList] = useState(filteredSpells);
  const [show, setShow] = useState(true);

  const selectedSpells = character!.gameData.spells;
  const toggleSpells = useCallback(
    (
      updatedSelectedRows: Record<string, boolean>,
      updatedSelectedData: any[],
    ) => {
      const spellNames: string[] = updatedSelectedData.map(
        (sp: SpellElement) => sp.name.split(' ✱')[0],
      );

      const presentSpells = selectedSpells.filter(
        spName => spellList.findIndex(sp => sp.name === spName) < 0,
      );
      const unionSpells = _.sortBy(spellNames.concat(presentSpells));

      if (!_.isEqual(_.sortBy(selectedSpells), _.sortBy(unionSpells))) {
        dispatch(updateSpells({ id: character!.id, data: unionSpells }));
      }
    },
    [character, dispatch, selectedSpells, spellList],
  );

  return (
    <div className="flex flex-col">
      <div className="flex justify-between">
        <div>Currently Known Spells</div>
        <button
          onClick={() => {
            setSpellList(show ? spells : filteredSpells);
            setShow(!show);
          }}
        >{`${show ? 'Show All' : 'Show Class'}`}</button>
      </div>

      <div
        style={{ height: '20rem' }}
        className="mt-2 overflow-y-scroll custom-border custom-border-thin bg-light-100 dark:bg-dark-300 rounded-lg"
      >
        <Spells
          spells={_.sortBy(spellList, 'name')}
          onSelectedRowsChange={toggleSpells}
          selectedSpells={selectedSpells}
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
