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
  getSpell,
  getSpellSaveDC,
  getSpellAttack,
  getSpellSlotsPerLevel,
  getSpellModifier,
} from 'utils/character';
import { isDefined } from 'ts-is-present';
import { Spells } from 'components/Spells/Spells';
import _ from 'lodash';
import { SpellElement } from 'models/spells';
import PillFilter, { ContentBlock } from 'components/PillFilter/PillFilter';
import { useForm } from 'react-hook-form';

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
  return spellSlotsForLevel > 0 || level === 0 ? (
    <div className="my-2">
      <div className="flex w-full justify-between">
        <div className="text-lg">
          {level === 0 ? 'Cantrips' : `Level ${level}`}
        </div>
        <div className="flex items-center">
          Slots:{' '}
          {level === 0 ? (
            '∞'
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
        columns={['name', 'source', 'level', 'school', 'time', 'range']}
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
    .map(spell => getSpell(spells, spell.name))
    .filter(isDefined);
  const spellLevels = _.groupBy(activeSpells, 'level');

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
          <div>Ability: {CHARACTER_STATS[getSpellModifier(character)]}</div>
          <div>Spell Attack: +{getSpellAttack(character)}</div>
          <div>Spell Save DC: {getSpellSaveDC(character)}</div>
        </div>
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
