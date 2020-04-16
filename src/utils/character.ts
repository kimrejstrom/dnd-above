import {
  CharacterState,
  StatsTypes,
} from 'features/character/characterListSlice';
import _, { mapValues } from 'lodash';
import { ClassElement } from 'models/class';
import { PLAYABLE_CLASSES, PLAYABLE_RACES, BACKGROUNDS } from 'utils/data';
import { SkillTypes } from 'features/character/Skills';

export const getRaceAbilityMod = (
  character: CharacterState,
  ability: StatsTypes,
) => {
  const raceElement = getRace(character.raceData.race);
  return raceElement?.ability ? raceElement.ability[0][ability] || 0 : 0;
};

export const getAbilityBonus = (
  character: CharacterState,
  ability: StatsTypes,
) => {
  const raceElement = getRace(character.raceData.race);
  const standardRaceAbility = raceElement?.ability
    ? raceElement.ability[0][ability] || 0
    : 0;
  const chosenRaceAbility = character.raceData.chosenRaceAbilities.length
    ? character.raceData.chosenRaceAbilities[0][ability] || 0
    : 0;
  return standardRaceAbility + chosenRaceAbility;
};

export const calculateStats = (
  character: CharacterState,
): Record<StatsTypes, number> => {
  const baseStats = _.omit(character.classData.abilityScores, 'rollMetod');

  return mapValues(
    baseStats,
    (value, key) =>
      Number(value) + getAbilityBonus(character, key as StatsTypes),
  );
};

export const getMaxHP = (hitDie: number, level: number, con: number) => {
  const hitDieAverage = Math.ceil((1 + hitDie) / 2);
  let maxHp = 0;
  for (let index = 0; index < level; index++) {
    if (level === 1) {
      maxHp += hitDie + con;
    } else {
      maxHp += hitDieAverage + con;
    }
  }
  return maxHp;
};

export const getClass = (className: string) =>
  PLAYABLE_CLASSES.find(mainClass => mainClass.name === className);

export const getSubClass = (className: string, subClassName: string) => {
  const baseClass = getClass(className);
  return baseClass
    ? baseClass.subclasses.find(subclass => subclass.name === subClassName)
    : undefined;
};

export const getRace = (raceName: string) =>
  PLAYABLE_RACES.find(race => race.name === raceName);

export const getBackground = (backgroundName: string) =>
  BACKGROUNDS.find(bg => bg.name === backgroundName);

export const getAbilityMod = (abilityScore: number) =>
  Math.floor((abilityScore - 10) / 2);

export const getProficiencyBonus = (level: number) => {
  if (!level) return 2;
  return Math.ceil(level / 4) + 1;
};

export const isProficient = (skill: SkillTypes, character: CharacterState) => {
  const skillProficiencies = character.raceData.chosenRaceSkillProficiencies.concat(
    [
      ...character.raceData.standardRaceSkillProficiencies,
      ...character.classData.chosenClassSkillProficiencies,
      ...character.descriptionData.chosenBackgroundSkillProficiencies,
      ...character.descriptionData.standardBackgroundSkillProficiencies,
    ],
  );
  return skillProficiencies.includes(skill);
};

export const getClassQuickBuild = (classElement: ClassElement) =>
  _.flatten(
    classElement.fluff?.map(entry =>
      entry.entries.filter(
        en =>
          typeof en !== 'string' &&
          (en.name === `Creating a ${classElement.name}` ||
            en.name === `Creating an ${classElement.name}`),
      ),
    ),
  );

export const getIncludedProficiencies = (proficiencies: Array<any>) => {
  if (proficiencies) {
    return _.flatten(
      proficiencies.map(entry => {
        return Object.entries(entry)
          .map(([key, value]) => (Boolean(value) === true ? key : undefined))
          .map(x => x) as string[];
      }),
    );
  } else {
    return [];
  }
};