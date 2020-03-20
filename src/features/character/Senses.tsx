import React from 'react';
import { CharacterState, StatsTypes } from 'features/character/characterSlice';
import {
  calculateStats,
  getAbilityMod,
  getProficiencyBonus,
  getDarkvision,
} from 'utils/character';
import { SpellcastingAbility } from 'models/class';

const PASSIVE_SENSES = {
  'passive perception': 'wis',
  'passive intelligence': 'int',
  'passive insight': 'wis',
};

interface Props {
  character: CharacterState;
}

const Senses = ({ character }: Props) => {
  return (
    <div className="custom-border w-full px-2">
      <div className="text-xl text-center leading-none mt-1 mb-2">Senses</div>
      <div className="flex flex-wrap">
        {Object.entries(PASSIVE_SENSES).map(([key, value]) => {
          const score = calculateStats(character)[value as StatsTypes];
          const proficient = character.class.proficiency.includes(
            value as SpellcastingAbility,
          );
          const abilityMod = getAbilityMod(score);
          const passiveMod =
            (proficient
              ? abilityMod + getProficiencyBonus(character.level)
              : abilityMod) + 10;
          return (
            <div className="flex w-full">
              <div className="custom-border custom-border-thin uppercase flex justify-between items-center w-full">
                <div className="text-lg leading-none ml-3 flex-grow">{key}</div>
                <div className="text-md leading-none ml-1">({value})</div>
                <div className="mx-2 text-2xl leading-none text-center">
                  {passiveMod}
                </div>
              </div>
            </div>
          );
        })}
        <div className="flex w-full justify-center my-2">
          <div>
            {getDarkvision(character) &&
              `Darkvision: ${getDarkvision(character)} ft`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Senses;
