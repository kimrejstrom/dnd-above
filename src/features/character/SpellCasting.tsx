import React from 'react';
import {
  CharacterState,
  CHARACTER_STATS,
  StatsTypes,
} from 'features/character/characterListSlice';
import { useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { ThemeMode } from 'features/theme/themeSlice';
import spellcastingDark from 'images/spellcasting-dark.png';
import spellcastingLight from 'images/spellcasting-light.png';
import {
  getSpell,
  getSpellSaveDC,
  getSpellAttack,
  getClass,
} from 'utils/character';
import { isDefined } from 'ts-is-present';
import { Spells } from 'components/Spells/Spells';
import _ from 'lodash';
import { SpellElement } from 'models/spells';
import PillFilter, { ContentBlock } from 'components/PillFilter/PillFilter';

interface Props {
  character: CharacterState;
}

const SpellLevel = ({
  level,
  spells,
}: {
  level: number;
  spells: SpellElement[];
}) => (
  <div className="my-2">
    <div className="flex w-full justify-between">
      <div className="text-lg">
        {level === 0 ? 'Cantrips' : `Level ${level}`}
      </div>
      <div>SLOTS</div>
    </div>
    <Spells spells={spells} />
  </div>
);

const SpellCasting = ({ character }: Props) => {
  const theme = useSelector((state: RootState) => state.theme);
  const spells = character.gameData.spells
    .map(spellName => getSpell(spellName))
    .filter(isDefined);
  const spellLevels = _.groupBy(spells, 'level');
  const classElement = getClass(character.classData.classElement);

  return (
    <>
      <div
        className="w-full my-2 relative bg-contain bg-center bg-no-repeat"
        style={{
          height: '5rem',
          backgroundImage: `url(${
            theme === ThemeMode.DARK ? spellcastingLight : spellcastingDark
          })`,
        }}
      ></div>
      <div>
        <div className="flex justify-around">
          <div>
            Ability:{' '}
            {CHARACTER_STATS[classElement?.spellcastingAbility as StatsTypes]}
          </div>
          <div>Spell Attack: +{getSpellAttack(character)}</div>
          <div>Spell Save DC: {getSpellSaveDC(character)}</div>
        </div>
        {spells.length ? (
          <PillFilter
            pills={Object.keys(spellLevels).map(key => `level ${key}`)}
          >
            {Object.entries(spellLevels).map(([key, value]) => (
              <ContentBlock name={`level ${key}`}>
                <SpellLevel
                  level={Number(key)}
                  spells={value as SpellElement[]}
                />
              </ContentBlock>
            ))}
          </PillFilter>
        ) : (
          <p>No active spells.</p>
        )}
      </div>
    </>
  );
};

export default SpellCasting;
