import React from 'react';
import { CharacterState, StatsTypes } from 'features/character/characterSlice';
import {
  calculateStats,
  getAbilityMod,
  getProficiencyBonus,
  isProficient,
} from 'utils/character';

const CHARACTER_ABILITIES = {
  athletics: 'str',
  acrobatics: 'dex',
  'sleight of hand': 'dex',
  stealth: 'dex',
  arcana: 'int',
  history: 'int',
  investigation: 'int',
  nature: 'int',
  religion: 'int',
  'animal handling': 'wis',
  insight: 'wis',
  medicine: 'wis',
  perception: 'wis',
  survival: 'wis',
  deception: 'cha',
  intimidation: 'cha',
  performance: 'cha',
  persuasion: 'cha',
};

export type SkillTypes = keyof typeof CHARACTER_ABILITIES;

interface Props {
  character: CharacterState;
}

const Skills = ({ character }: Props) => {
  return (
    <div className="custom-border">
      <div className="text-xl text-center leading-none mt-1 mb-2">Skills</div>
      {Object.entries(CHARACTER_ABILITIES).map(([key, value]) => {
        const score = calculateStats(character)[value as StatsTypes];
        const proficient = Boolean(isProficient(value));
        const abilityMod = getAbilityMod(score);
        const skillMod = proficient
          ? abilityMod + getProficiencyBonus(character.level)
          : abilityMod;
        return (
          <div className="flex flex-wrap relative p-1">
            <div className="custom-border custom-border-thin uppercase flex justify-between items-center w-full">
              <div
                className={`${
                  proficient
                    ? 'bg-primary-dark dark:bg-primary-light'
                    : 'bg-yellow-100 dark:bg-primary-dark'
                } border-2 border-primary-dark dark:border-primary-light left-0 absolute rounded-full w-3 h-3`}
              ></div>
              <div className="text-lg leading-none ml-3 flex-grow">{key}</div>
              <div className="text-md leading-none ml-1">({value})</div>
              <div className="mx-2 text-2xl leading-none text-center">
                {skillMod}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Skills;
