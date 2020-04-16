import React from 'react';
import {
  CharacterState,
  StatsTypes,
} from 'features/character/characterListSlice';
import {
  calculateStats,
  getAbilityMod,
  getProficiencyBonus,
  isProficient,
} from 'utils/character';
import { SkillTypes } from 'features/character/Skills';

const PASSIVE_SENSES = {
  'passive perception': { ability: 'wis', skill: 'perception' },
  'passive intelligence': { ability: 'int', skill: 'investigation' },
  'passive insight': { ability: 'int', skill: 'insight' },
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
          const score = calculateStats(character)[value.ability as StatsTypes];
          const proficient = isProficient(value.skill as SkillTypes, character);
          console.log(score);
          const abilityMod = getAbilityMod(score);
          const passiveMod =
            (proficient
              ? abilityMod + getProficiencyBonus(character.customData.level)
              : abilityMod) + 10;
          console.log(
            passiveMod,
            abilityMod,
            getProficiencyBonus(character.customData.level),
          );
          return (
            <div className="flex w-full">
              <div className="custom-border custom-border-thin uppercase flex justify-between items-center w-full">
                <div className="text-lg leading-none ml-3 flex-grow">{key}</div>
                <div className="text-md leading-none ml-1">
                  ({value.ability})
                </div>
                <div className="mx-2 text-2xl leading-none text-center">
                  {passiveMod}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Senses;
