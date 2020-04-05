import { CharacterState, StatsTypes } from 'features/character/characterSlice';
import { mapValues, random } from 'lodash';
import { ClassElement } from 'models/class';
import _ from 'lodash';

export const getRaceAbilityMod = (
  character: CharacterState,
  ability: StatsTypes,
) => {
  const race = character.race.ability
    ? character.race.ability[0][ability] || 0
    : 0;
  const subRace = character.subRace.ability
    ? character.subRace.ability[0][ability] || 0
    : 0;
  return race + subRace;
};

export const calculateStats = (
  character: CharacterState,
): Record<StatsTypes, number> => {
  const baseStats = character.stats;

  return mapValues(
    baseStats,
    (value, key) => value + getRaceAbilityMod(character, key as StatsTypes),
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

export const getSubClass = (character: CharacterState) =>
  character.class.subclasses.find(
    subclass => subclass.shortName === character.subClass,
  );

export const getDarkvision = (character: CharacterState) => {
  return character.race.darkvision
    ? character.race.darkvision
    : character.subRace.darkvision
    ? character.subRace.darkvision
    : undefined;
};

export const getAbilityMod = (abilityScore: number) =>
  Math.floor((abilityScore - 10) / 2);

export const getProficiencyBonus = (level: number) => {
  if (!level) return 2;
  return Math.ceil(level / 4) + 1;
};

export const isProficient = (stat: string) => random(0, 1);

export const getClassQuickBuild = (classElement: ClassElement) =>
  _.flatten(
    classElement.fluff?.map(entry =>
      entry.entries.filter(
        en =>
          typeof en !== 'string' &&
          en.name === `Creating a ${classElement.name}`,
      ),
    ),
  );
