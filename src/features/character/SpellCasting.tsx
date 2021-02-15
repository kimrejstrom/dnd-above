import React, { ChangeEvent } from 'react';
import {
  CharacterListItem,
  CHARACTER_STATS,
  expendSpellSlot,
  addSpellSlot,
} from 'features/character/characterListSlice';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { ThemeMode } from 'features/theme/themeSlice';
import spellcastingDark from 'images/spellcasting-dark.png';
import spellcastingLight from 'images/spellcasting-light.png';
import {
  getSpellSaveDC,
  getSpellAttack,
  getSpellSlotsPerLevel,
  getSpellModifier,
  getSpellsKnown,
  getCantripsKnown,
  getWarlockSpellSlots,
} from 'utils/character';
import { isDefined } from 'ts-is-present';
import { Spells } from 'components/Spells/Spells';
import _ from 'lodash';
import { SpellElement } from 'models/spells';
import PillFilter, { ContentBlock } from 'components/PillFilter/PillFilter';
import { useForm } from 'react-hook-form';
import { getSpellFromList } from 'utils/sourceDataUtils';
import { Parser } from 'utils/mainRenderer';

interface Props {
  character: CharacterListItem;
  readonly: boolean;
}

const SpellSlotCheckBoxes = ({
  level,
  slots,
  character,
  readonly,
}: {
  level: number;
  slots: number;
  character: CharacterListItem;
  readonly: boolean;
}) => {
  const { register } = useForm();
  const dispatch = useDispatch();
  const usedSpellSlots = character.gameData.spellSlots?.[level].used || 0;
  const handleChange = (e: ChangeEvent<HTMLInputElement>, level: number) => {
    dispatch(
      e.currentTarget.checked
        ? expendSpellSlot({
            id: character.id!,
            data: level,
          })
        : addSpellSlot({
            id: character.id!,
            data: level,
          }),
    );
  };
  return (
    <div className="mx-2 flex flex-end">
      {Array.from({ length: slots }, (_, i: number) => (
        <input
          key={`${level}-${i}`}
          disabled={readonly}
          className="form-checkbox mr-1"
          type="checkbox"
          name={`${level}-${slots}`}
          defaultChecked={usedSpellSlots > i}
          ref={register}
          onChange={e => handleChange(e, level)}
        />
      ))}
    </div>
  );
};

const SpellLevel = ({
  level,
  spells,
  character,
  readonly,
}: {
  level: number;
  spells: SpellElement[];
  character: CharacterListItem;
  readonly: boolean;
}) => {
  const spellSlotsForLevel = getSpellSlotsPerLevel(character)[level] || 0;
  return spellSlotsForLevel > 0 || level === 0 || spellSlotsForLevel === -1 ? (
    <div>
      <div className="flex w-full justify-between">
        <div className="text-lg">{Parser.spLevelToFull(level)}</div>
        <div className="flex items-center">
          Slots:{' '}
          {level === 0 ? (
            '∞'
          ) : spellSlotsForLevel === -1 ? (
            'N/A'
          ) : (
            <SpellSlotCheckBoxes
              character={character}
              level={level}
              slots={spellSlotsForLevel}
              readonly={readonly}
            />
          )}
        </div>
      </div>
      <Spells
        spells={spells}
        columns={['name', 'level', 'time', 'range', 'source']}
      />
    </div>
  ) : (
    <div>You can't cast these spells yet.</div>
  );
};

const SpellCasting = ({ character, readonly }: Props) => {
  const theme = useSelector((state: RootState) => state.theme);
  const { spells } = useSelector(
    (state: RootState) => state.sourceData,
  ).sourceData;

  const activeSpells = character.gameData.spells
    .map(spell => getSpellFromList(spells, spell.name))
    .filter(isDefined);
  const spellLevels = _.groupBy(activeSpells, 'level');

  return (
    <>
      <div
        className="w-full mt-2 relative bg-contain bg-center bg-no-repeat"
        style={{
          height: '5rem',
          backgroundImage: `url(${
            theme === ThemeMode.DARK ? spellcastingLight : spellcastingDark
          })`,
        }}
      ></div>
      <div className="mb-2 flex flex-col custom-bg custom-border-sm custom-border-thin bg-light-200 dark:bg-dark-200">
        <div className="flex flex-wrap justify-between">
          <div className="mr-0.5">
            Ability:{' '}
            <div className="text-lg inline text-highlight-100 dark:text-yellow-500">
              {CHARACTER_STATS[getSpellModifier(character)]}
            </div>
          </div>
          <div className="mr-0.5">
            Spell Attack:{' '}
            <div className="text-lg inline text-highlight-100 dark:text-yellow-500">
              +{getSpellAttack(character)}
            </div>
          </div>
          <div>
            Spell Save DC:{' '}
            <div className="text-lg inline text-highlight-100 dark:text-yellow-500">
              {getSpellSaveDC(character)}
            </div>
          </div>
        </div>
        <div className="flex justify-between whitespace-nowrap">
          <div className="mr-0.5">
            Cantrips Known:{' '}
            <div className="text-lg inline text-highlight-100 dark:text-yellow-500">
              {getCantripsKnown(character)}
            </div>
          </div>
          <div className="mr-0.5">
            Spells Known:{' '}
            <div className="text-lg inline text-highlight-100 dark:text-yellow-500">
              {getSpellsKnown(character)}
            </div>
          </div>
          {character.classData.classElement === 'Warlock' && (
            <div className="flex">
              <div>
                Spell Slots:{' '}
                <div className="text-lg inline text-highlight-100 dark:text-yellow-500">
                  {getWarlockSpellSlots(character)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div>
        {activeSpells.length ? (
          <PillFilter
            pills={Object.keys(spellLevels).map(key => `level ${key}`)}
          >
            {Object.entries(spellLevels).map(([key, value]) => (
              <ContentBlock key={key} name={`level ${key}`}>
                <SpellLevel
                  character={character}
                  level={Number(key)}
                  spells={value as SpellElement[]}
                  readonly={readonly}
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
