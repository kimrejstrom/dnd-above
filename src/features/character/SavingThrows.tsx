import React from 'react';
import {
  CharacterListItem,
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
  character: CharacterListItem;
}

const SavingThrows = ({ character }: Props) => {
  const classElement = getClass(character.classData.classElement);
  return (
    <div className="custom-border w-full px-2">
      <div className="text-xl text-center leading-none my-1">Saving Throws</div>
      <div className="flex flex-wrap">
        {Object.keys(CHARACTER_STATS).map(key => {
          const score = calculateStats(character)[key as StatsTypes];
          const proficient = classElement?.proficiency.includes(
            key as SpellcastingAbility,
          );
          const abilityMod = getAbilityMod(score);
          const savingThrowMod = proficient
            ? abilityMod + getProficiencyBonus(character.gameData.level)
            : abilityMod;
          return (
            <div
              key={key}
              className="flex flex-wrap relative p-1"
              style={{ flex: '0 50%' }}
            >
              <div className="custom-border custom-border-thin uppercase flex justify-between items-center w-full h-8">
                <div
                  className={`${
                    proficient
                      ? 'bg-dark-100 dark:bg-yellow-100'
                      : 'bg-light-100 dark:bg-dark-100'
                  } border-2 border-dark-100 dark:border-light-100 left-0 absolute rounded-full w-3 h-3`}
                ></div>
                <div className="text-lg ml-2">{key}</div>
                <div className="ml-2 mr-1 text-2xl text-center">
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
