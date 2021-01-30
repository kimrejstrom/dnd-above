import React from 'react';
import {
  CharacterListItem,
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
  perception: { ability: 'wis', skill: 'perception' },
  investigation: { ability: 'int', skill: 'investigation' },
  insight: { ability: 'int', skill: 'insight' },
};

interface Props {
  character: CharacterListItem;
}

const Senses = ({ character }: Props) => {
  return (
    <div className="box-border py-0.5">
      <div className="custom-border custom-bg w-full px-2">
        <div className="text-xl text-center leading-none my-1">
          Passive Senses
        </div>
        <div className="flex flex-wrap">
          {Object.entries(PASSIVE_SENSES).map(([key, value]) => {
            const score = calculateStats(character)[
              value.ability as StatsTypes
            ];
            const proficient = isProficient(
              value.skill as SkillTypes,
              character,
            );
            const abilityMod = getAbilityMod(score);
            const passiveMod =
              (proficient
                ? abilityMod + getProficiencyBonus(character.gameData.level)
                : abilityMod) + 10;
            return (
              <div key={key} className="flex w-full p-1">
                <div className="custom-border-xs uppercase flex justify-between items-center w-full h-8 bg-light-200 dark:bg-dark-300">
                  <div className="text-lg ml-3 flex-grow">{key}</div>
                  <div className="text-md ml-1">({value.ability})</div>
                  <div className="mx-2 text-2xl text-center">{passiveMod}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Senses;
