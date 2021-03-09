import React from 'react';
import dudeDark from 'images/dude-dark.png';
import dudeLight from 'images/dude-light.png';
import { ThemeMode } from 'features/theme/themeSlice';
import { RootState } from 'app/rootReducer';
import {
  CharacterListItem,
  levelUp,
} from 'features/character/characterListSlice';
import { useDispatch, useSelector } from 'react-redux';
import {
  getClass,
  getSubClass,
  getAllClassFeatures,
} from 'utils/sourceDataUtils';
import { toggleModal } from 'components/Modal/modalSlice';
import Entry from 'components/Entry/Entry';
import AbilitiesSkillsModal from 'features/character/AbilitiesSkillsModal';
import { getSelectedCharacter } from 'app/selectors';
import FeatsModal from 'features/character/FeatsModal';
import { getSpellSlotsPerLevel } from 'utils/character';
import _ from 'lodash';
import SpellsModal from 'features/character/SpellsModal';
import { Parser } from 'utils/mainRenderer';
import TextBox from 'components/TextBox/TextBox';

interface Props {
  character: CharacterListItem;
  readonly: boolean;
}

const LevelUpModal = () => {
  const character = useSelector(getSelectedCharacter);
  const classElement = getClass(character!.classData.classElement);
  const subClassElement = getSubClass(
    character!.classData.classElement,
    character!.classData.subClass,
  );
  const relevantFeatures = getAllClassFeatures(
    classElement!.name,
    subClassElement!.name,
  ).filter(feature => feature.level === character!.gameData.level);

  const hasASI = relevantFeatures.some(
    feature => feature.name === 'Ability Score Improvement',
  );

  const currentSpellSlots = getSpellSlotsPerLevel(
    character!,
    character!.gameData.level,
  );
  const previousSpellSlots = getSpellSlotsPerLevel(
    character!,
    character!.gameData.level - 1,
  );
  const hasSpellUpgrades = !_.isEqual(previousSpellSlots, currentSpellSlots);

  return (
    <div>
      <div>
        {relevantFeatures.map((feature, i) => (
          <Entry key={i} entry={feature} />
        ))}
      </div>
      {hasASI && (
        <div>
          <div className="text-lg">Ability Score Improvement</div>
          <AbilitiesSkillsModal character={character!} />
          <div className="text-lg">OR Feat</div>
          <FeatsModal character={character!} />
        </div>
      )}
      {hasSpellUpgrades && (
        <div>
          <div className="text-lg mb-2">Spell Slots Increase</div>
          <TextBox extraClassName="mb-4">
            <div className="dnd-header mb-2 text-lg">
              Spell Slots Per Level:
            </div>
            <div className="flex justify-between flex-wrap">
              {Object.entries(currentSpellSlots).map(([level, slots]) => (
                <div key={level} className="flex items-center mr-3">
                  <div className="font-bold">
                    {Parser.spLevelToFull(level)}:
                  </div>
                  <div className="ml-1 text-lg text-highlight-100 dark:text-highdark-100">
                    {slots as any}
                  </div>
                </div>
              ))}
            </div>
          </TextBox>

          <SpellsModal character={character!} />
        </div>
      )}
    </div>
  );
};

const LevelUp = ({ character, readonly }: Props) => {
  const theme = useSelector((state: RootState) => state.theme);
  const dispatch = useDispatch();
  const handleLevelUp = () => {
    dispatch(levelUp({ id: character.id }));
    dispatch(
      toggleModal({
        visible: true,
        title: `Leveled up to Level ${character.gameData.level + 1}`,
        content: <LevelUpModal />,
      }),
    );
  };

  return (
    <button
      disabled={readonly}
      onClick={handleLevelUp}
      className="bg-light-200 hover:bg-yellow-100 dark:bg-dark-300 dark:text-light-100 dark:hover:bg-dark-100 cursor-pointer flex justify-center lg:ml-1 custom-border-sm h-20 w-full lg:w-20"
    >
      <div
        className="flex flex-col justify-center items-center rounded-lg"
        style={{
          height: '4.6rem',
          width: '4.6rem',
          marginTop: '-0.75rem',
        }}
      >
        <img
          className="h-10 ml-2 -mt-1"
          src={theme === ThemeMode.DARK ? dudeLight : dudeDark}
          alt="logo"
        />
        <div className="-mb-3 text-sm">Level Up</div>
      </div>
    </button>
  );
};

export default LevelUp;
