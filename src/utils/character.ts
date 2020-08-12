import {
  CharacterState,
  StatsTypes,
} from 'features/character/characterListSlice';
import _, { mapValues } from 'lodash';
import { ClassElement, ClassTableGroup, Title } from 'models/class';
import {
  PLAYABLE_CLASSES,
  PLAYABLE_RACES,
  BACKGROUNDS,
  ALL_ITEMS,
  ALL_SPELLS,
  FEATS,
} from 'utils/data';
import { SkillTypes } from 'features/character/Skills';
import { isDefined } from 'ts-is-present';
import { BaseItem } from 'models/base-item';
import { Item } from 'models/item';
import { AbilityBase } from 'models/race';

export const getAbilityScoreByType = (
  ability: StatsTypes,
  abilities?: AbilityBase[],
) => (abilities?.length && abilities[0][ability]) || 0;

export const getRaceAbilityBonus = (
  character: CharacterState,
  ability: StatsTypes,
) => {
  const raceElement = getRace(character.raceData.race);
  const standardRaceAbility = getAbilityScoreByType(
    ability,
    raceElement?.ability,
  );
  const chosenRaceAbility = getAbilityScoreByType(
    ability,
    character.raceData.chosenRaceAbilities,
  );
  return standardRaceAbility + chosenRaceAbility;
};

export const getAbilityBonus = (
  character: CharacterState,
  ability: StatsTypes,
) => {
  const raceAbility = getRaceAbilityBonus(character, ability);
  const customAbility = getAbilityScoreByType(
    ability,
    character.customData?.customAbilities,
  );
  return raceAbility + customAbility;
};

export const calculateStats = (
  character: CharacterState,
): Record<StatsTypes, number> => {
  const baseStats = _.omit(character.classData.abilityScores, 'rollMethod');

  return mapValues(
    baseStats,
    (value, key) =>
      Number(value) + getAbilityBonus(character, key as StatsTypes),
  );
};

export const getMaxHP = (character: CharacterState) => {
  const hitDie = getClass(character.classData.classElement)?.hd.faces || 10;
  const level = character.gameData.level;
  const con = getAbilityMod(calculateStats(character).con);
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

export const getAllClassFeatures = (
  className: string,
  subClassName: string,
) => {
  const baseClass = getClass(className);
  const subclass = baseClass?.subclasses.find(
    subclass => subclass.name === subClassName,
  );
  return [
    ..._.flatten(baseClass?.classFeatures!),
    ..._.flatten(subclass?.subclassFeatures!),
  ];
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

export const getFeat = (featName: string) =>
  FEATS.find(feat => feat.name === featName);

export const getItem = (itemName: string): Item | BaseItem | undefined =>
  ALL_ITEMS.find(entry => entry.name === itemName);

export const getSpell = (spellName: string) =>
  ALL_SPELLS.find(sp => sp.name === spellName);

export const isSpellCaster = (character: CharacterState) => {
  const classElement = getClass(character.classData.classElement);
  const subClassElement = getSubClass(
    character.classData.classElement,
    character.classData.subClass,
  );
  const isSpellCaster =
    classElement?.spellcastingAbility !== undefined ||
    subClassElement?.spellcastingAbility !== undefined;
  return isSpellCaster;
};

export const getHitDice = (character: CharacterState) =>
  `d${getClass(character.classData.classElement)!.hd.faces}`;

export const getHdTotal = (character: CharacterState) =>
  character.gameData.level;

export const getSpellModifier = (character: CharacterState) => {
  const classElement = getClass(character.classData.classElement);
  const subClassElement = getSubClass(
    character.classData.classElement,
    character.classData.subClass,
  );
  return (classElement?.spellcastingAbility ||
    subClassElement?.spellcastingAbility) as StatsTypes;
};

export const getSpellSaveDC = (character: CharacterState) => {
  const score = calculateStats(character)[getSpellModifier(character)];
  const mod = getAbilityMod(score);
  return 8 + mod + getProficiencyBonus(character.gameData.level);
};

export const getSpellAttack = (character: CharacterState) => {
  const score = calculateStats(character)[getSpellModifier(character)];
  const mod = getAbilityMod(score);
  return mod + getProficiencyBonus(character.gameData.level);
};

export const isProficient = (skill: SkillTypes, character: CharacterState) => {
  const skillProficiencies = character.raceData.chosenRaceSkillProficiencies.concat(
    [
      ...character.raceData.standardRaceSkillProficiencies,
      ...character.classData.chosenClassSkillProficiencies,
      ...character.descriptionData.chosenBackgroundSkillProficiencies,
      ...character.descriptionData.standardBackgroundSkillProficiencies,
      ...character.customData.customSkillProficiencies,
    ],
  );
  return skillProficiencies.includes(skill);
};

export const isCustomProficiency = (
  skill: SkillTypes,
  character: CharacterState,
) => character.customData.customSkillProficiencies.includes(skill);

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

export const getArmorProficiencies = (character: CharacterState): string[] =>
  character.classData.standardClassArmorProficiencies.concat(
    character.customData.customArmorProficiencies,
  );

export const getWeaponProficiencies = (character: CharacterState): string[] =>
  character.classData.standardClassWeaponProficiencies.concat(
    character.customData.customWeaponProficiencies,
  );

export const getToolProficiencies = (character: CharacterState): string[] =>
  character.classData.standardClassToolProficiencies.concat(
    character.descriptionData.standardBackgroundToolProficiencies,
    character.descriptionData.chosenBackgroundToolProficiencies,
    character.customData.customToolProficiencies,
  );

export const getLanguageProficiencies = (character: CharacterState): string[] =>
  character.raceData.standardRaceLanguages.concat(
    character.raceData.chosenRaceLanguages,
    character.descriptionData.standardBackgroundLanguages,
    character.descriptionData.chosenBackgroundLanguages,
    character.customData.customLanguages,
  );

export const getIncludedProficiencies = (proficiencies: Array<any>): string[] =>
  proficiencies
    ? _.flatten(
        proficiencies.map(entry =>
          Object.entries(entry).map(([key, value]) =>
            typeof value === 'boolean' ? key : undefined,
          ),
        ),
      ).filter(isDefined)
    : [];

export const getSpellSlotsPerLevel = (character: CharacterState) => {
  const classElement = getClass(character.classData.classElement);
  const subClassElement = getSubClass(
    character.classData.classElement,
    character.classData.subClass,
  );

  const spellSlots = extractSpellSlots(
    classElement?.classTableGroups!,
    character.gameData.level,
  );
  const subClassSpellSlots = extractSpellSlots(
    subClassElement?.subclassTableGroups!,
    character.gameData.level,
  );
  return spellSlots
    ? spellSlots
    : subClassSpellSlots
    ? subClassSpellSlots
    : undefined;
};

export const extractSpellSlots = (
  classTableGroups: ClassTableGroup[],
  level: number,
): any => {
  const spellSlots = classTableGroups
    ?.filter(
      tableGroup =>
        tableGroup.title && tableGroup.title === Title.SpellSlotsPerSpellLevel,
    )
    .map(tableGroup => tableGroup.rows[level - 1]);
  const convertedSlots =
    spellSlots && spellSlots.length
      ? spellSlots[0].reduce(
          (acc, curr, i: number) => ({ ...acc, [i + 1]: curr }),
          {},
        )
      : undefined;
  return convertedSlots;
};
