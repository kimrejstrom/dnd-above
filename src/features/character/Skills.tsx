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
import SettingsCog from 'components/SettingsCog/SettingsCog';
import { toggleModal } from 'components/Modal/modalSlice';
import { useDispatch } from 'react-redux';
import SkillsProficienciesModal from 'features/character/SkillsProficienciesModal';

export const CHARACTER_ABILITIES = {
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
  const dispatch = useDispatch();
  return (
    <div className="custom-border relative">
      <div className="text-xl text-center leading-none my-1">Skills</div>
      <SettingsCog
        action={() =>
          dispatch(
            toggleModal({
              visible: true,
              title: 'Skills and Proficiencies',
              content: <SkillsProficienciesModal />,
            }),
          )
        }
      />
      {Object.entries(CHARACTER_ABILITIES).map(([key, value]) => {
        const score = calculateStats(character)[value as StatsTypes];
        const proficient = isProficient(key as SkillTypes, character);
        const abilityMod = getAbilityMod(score);
        const skillMod = proficient
          ? abilityMod + getProficiencyBonus(character.gameData.level)
          : abilityMod;
        return (
          <div key={key} className="flex flex-wrap relative p-1">
            <div className="custom-border custom-border-thin uppercase flex justify-between items-center w-full h-8">
              <div
                className={`${
                  proficient
                    ? 'bg-primary-dark dark:bg-primary-light'
                    : 'bg-yellow-100 dark:bg-primary-dark'
                } border-2 border-primary-dark dark:border-primary-light left-0 absolute rounded-full w-3 h-3`}
              ></div>
              <div className="tracking-tighter text-lg ml-2 flex-grow">
                {key}
              </div>
              <div className="text-md ml-1">{value}</div>
              <div className="mx-2 text-2xl text-center">{skillMod}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Skills;
