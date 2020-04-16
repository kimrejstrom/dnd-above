import React from 'react';
import {
  CharacterState,
  CHARACTER_STATS,
  StatsTypes,
} from 'features/character/characterListSlice';
import {
  calculateStats,
  getAbilityMod,
  getProficiencyBonus,
  getClass,
} from 'utils/character';
import { SpellcastingAbility } from 'models/class';

interface Props {
  character: CharacterState;
}

const SavingThrows = ({ character }: Props) => {
  const classElement = getClass(character.classData.classElement);
  return (
    <div className="custom-border w-full px-2">
      <div className="text-xl text-center leading-none mt-1 mb-2">
        Saving Throws
      </div>
      <div className="flex flex-wrap">
        {Object.keys(CHARACTER_STATS).map(key => {
          const score = calculateStats(character)[key as StatsTypes];
          const proficient = classElement?.proficiency.includes(
            key as SpellcastingAbility,
          );
          const abilityMod = getAbilityMod(score);
          const savingThrowMod = proficient
            ? abilityMod + getProficiencyBonus(character.customData.level)
            : abilityMod;
          return (
            <div
              className="flex flex-wrap relative p-1"
              style={{ flex: '0 50%' }}
            >
              <div className="custom-border custom-border-thin uppercase flex justify-between items-center w-full">
                <div
                  className={`${
                    proficient
                      ? 'bg-primary-dark dark:bg-primary-light'
                      : 'bg-yellow-100 dark:bg-primary-dark'
                  } border-2 border-primary-dark dark:border-primary-light left-0 absolute rounded-full w-3 h-3`}
                ></div>
                <div className="text-lg leading-none ml-3">{key}</div>
                <div className="mx-2 text-2xl leading-none text-center">
                  {savingThrowMod}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SavingThrows;
