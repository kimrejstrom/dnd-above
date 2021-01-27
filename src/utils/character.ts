import {
  CharacterBase,
  CharacterListItem,
  StatsTypes,
} from 'features/character/characterListSlice';
import _, { mapValues } from 'lodash';
import {
  ArmorClass,
  ArmorEnum,
  ClassElement,
  ClassTableGroup,
  Title,
} from 'models/class';
import { filterSources } from 'utils/data';
import { SkillTypes } from 'features/character/Skills';
import { isDefined } from 'ts-is-present';
import { AbilityBase, Race } from 'models/race';
import { BackgroundElement } from 'models/background';
import { diceRoller } from 'utils/dice';
import { Parser } from 'utils/mainRenderer';
import { generate_name } from 'utils/name';
import { generateID } from 'features/createCharacterForm/createCharacterFormSlice';
import {
  getRace,
  getClass,
  getSubClass,
  getRaces,
  getPlayableClasses,
  getBackgrounds,
  getWeapons,
  getOtherItems,
  getArmor,
} from 'utils/sourceDataUtils';

export const getAbilityScoreByType = (
  ability: StatsTypes,
  abilities?: AbilityBase[],
) => (abilities?.length && abilities[0][ability]) || 0;

export const getRaceAbilityBonus = (
  character: CharacterListItem,
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
  character: CharacterListItem,
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
  character: CharacterListItem,
): Record<StatsTypes, number> => {
  const baseStats = _.omit(character.classData.abilityScores, 'rollMethod');

  return mapValues(
    baseStats,
    (value, key) =>
      Number(value) + getAbilityBonus(character, key as StatsTypes),
  );
};

export const getMaxHP = (character: CharacterListItem) => {
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

export const getAbilityMod = (abilityScore: number) =>
  Math.floor((abilityScore - 10) / 2);

export const getProficiencyBonus = (level: number) => {
  if (!level) return 2;
  return Math.ceil(level / 4) + 1;
};

export const isSpellCaster = (character: CharacterListItem) => {
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

export const getHitDice = (character: CharacterListItem) =>
  `d${getClass(character.classData.classElement)!.hd.faces}`;

export const getHdTotal = (character: CharacterListItem) =>
  character.gameData.level;

export const getSpellModifier = (character: CharacterListItem) => {
  const classElement = getClass(character.classData.classElement);
  const subClassElement = getSubClass(
    character.classData.classElement,
    character.classData.subClass,
  );
  return (classElement?.spellcastingAbility ||
    subClassElement?.spellcastingAbility) as StatsTypes;
};

export const getSpellSaveDC = (character: CharacterListItem) => {
  const score = calculateStats(character)[getSpellModifier(character)];
  const mod = getAbilityMod(score);
  return 8 + mod + getProficiencyBonus(character.gameData.level);
};

export const getSpellAttack = (character: CharacterListItem) => {
  const score = calculateStats(character)[getSpellModifier(character)];
  const mod = getAbilityMod(score);
  return mod + getProficiencyBonus(character.gameData.level);
};

export const isProficient = (
  skill: SkillTypes,
  character: CharacterListItem,
) => {
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
  character: CharacterListItem,
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

export const getArmorProficiencies = (character: CharacterListItem): string[] =>
  character.classData.standardClassArmorProficiencies.concat(
    character.customData.customArmorProficiencies,
  );

export const getWeaponProficiencies = (
  character: CharacterListItem,
): string[] =>
  character.classData.standardClassWeaponProficiencies.concat(
    character.customData.customWeaponProficiencies,
  );

export const getToolProficiencies = (character: CharacterListItem): string[] =>
  character.classData.standardClassToolProficiencies.concat(
    character.descriptionData.standardBackgroundToolProficiencies,
    character.descriptionData.chosenBackgroundToolProficiencies,
    character.customData.customToolProficiencies,
  );

export const getLanguageProficiencies = (
  character: CharacterListItem,
): string[] =>
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

export const mapArmorProficiencies = (
  armorProfs: Array<ArmorClass | ArmorEnum>,
): string[] =>
  armorProfs.map(armor => {
    if (typeof armor === 'string') {
      return armor;
    } else {
      return armor.proficiency;
    }
  });

export const getSpellSlotsPerLevel = (character: CharacterListItem) => {
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

export const parseSpeed = (speed: Race['speed']) => {
  if (speed) {
    if (typeof speed === 'string' || typeof speed === 'number') {
      return speed;
    } else {
      return speed.walk;
    }
  }
};

export const randomize = () => {
  const id = generateID();
  const race = _.sample(getRaces()!) as Race;
  const classElement = _.sample(getPlayableClasses()) as ClassElement;
  const background = _.sample(getBackgrounds()!) as BackgroundElement;
  const name = generate_name('base');
  const abilityScores = diceRoller
    .roll('{4d6kh3...6}')
    .renderedExpression.split('}')
    .filter(e => e)[0]
    .replace(/[{}]/g, '')
    .split(';')
    .map(roll => roll.split('=')[1].trim());
  const randomCharacter: CharacterBase = {
    id,
    raceData: {
      race: race.name,
      chosenRaceAbilities:
        race.ability && race.ability[0].choose
          ? _.sampleSize(
              race.ability[0].choose?.from,
              race.ability[0].choose?.count,
            ).reduce((acc: any, curr: string) => ({ ...acc, [curr]: 1 }), {})
          : [],
      standardRaceAbilities: [],
      chosenRaceSkillProficiencies: race.skillProficiencies
        ? _.sampleSize(
            race.skillProficiencies[0].choose?.from.filter(
              entry => typeof entry === 'string',
            ) as SkillTypes[],
            race.skillProficiencies[0].choose?.count,
          )
        : [],
      standardRaceSkillProficiencies: [],
      chosenRaceLanguages: race.languageProficiencies
        ? _.sampleSize(
            Parser.LANGUAGES_STANDARD.concat(Parser.LANGUAGES_EXOTIC),
            race.languageProficiencies[0].anyStandard || 0,
          )
        : [],
      standardRaceLanguages: [],
    },
    classData: {
      classElement: classElement.name,
      subClass: _.sample(
        classElement.subclasses.filter(subclass => filterSources(subclass)),
      )?.name!,
      chosenClassSkillProficiencies: classElement.startingProficiencies.skills
        ? (_.sampleSize(
            classElement.startingProficiencies.skills[0].choose?.from,
            classElement.startingProficiencies.skills[0].choose?.count,
          ) as SkillTypes[])
        : [],
      standardClassArmorProficiencies: [],
      standardClassWeaponProficiencies: [],
      standardClassToolProficiencies: [],
      abilityScores: {
        str: Number(abilityScores[0]),
        dex: Number(abilityScores[1]),
        con: Number(abilityScores[2]),
        int: Number(abilityScores[3]),
        wis: Number(abilityScores[4]),
        cha: Number(abilityScores[5]),
        rollMethod: 'rolled',
      },
    },
    descriptionData: {
      name: name,
      background: background.name,
      alignment: _.sample(Object.keys(Parser.ALIGNMENTS))!,
      characteristicsSource: background.name,
      imageUrl: `${
        process.env.PUBLIC_URL
      }/img/races/${race.name.toLowerCase()}.png`,
      hair: _.sample([
        'Brown',
        'Blonde',
        'Dark',
        'Grey',
        'Green',
        'Red',
        'Blue',
        'Auburn',
        'Purple',
      ])!,
      skin: _.sample([
        'Pale',
        'Fair',
        'Light',
        'Light Tan',
        'Tan',
        'Dark Tan',
        'Brown',
        'Dark Brown',
        'Bronze',
        'Orange',
        'Red',
        'Aqua',
        'Green',
      ])!,
      eyes: _.sample([
        'Amber',
        'Blue',
        'Brown',
        'Gray',
        'Green',
        'Hazel',
        'Red and violet',
      ])!,
      height: `${_.random(110, 210)} cm`,
      weight: `${_.random(30, 130)} kg`,
      age: `${_.random(12, 120)} years`,
      backstory: 'I just sprung in to existence, out of thin air!',
      chosenBackgroundSkillProficiencies: background.skillProficiencies
        ? _.sampleSize(
            background.skillProficiencies[0].choose?.from.filter(
              entry => typeof entry === 'string',
            ) as SkillTypes[],
            background.skillProficiencies[0].choose?.count,
          )
        : [],
      standardBackgroundSkillProficiencies: [],
      chosenBackgroundToolProficiencies: background.toolProficiencies
        ? _.sampleSize(
            background.toolProficiencies[0].choose?.from.filter(
              entry => typeof entry === 'string',
            ) as string[],
            background.toolProficiencies[0].choose?.count,
          )
        : [],
      standardBackgroundToolProficiencies: [],
      chosenBackgroundLanguages: background.languageProficiencies
        ? _.sampleSize(
            Parser.LANGUAGES_STANDARD.concat(Parser.LANGUAGES_EXOTIC),
            background.languageProficiencies[0].anyStandard || 0,
          )
        : [],
      standardBackgroundLanguages: [],
      characteristicsPersonalityTrait: '',
      characteristicsIdeal: '',
      characteristicsBond: '',
      characteristicsFlaw: '',
    },
    equipmentData: {
      items: _.sampleSize(getWeapons() as any, 2)
        .map(item => item.name)
        .concat(_.sampleSize(getOtherItems() as any, 2).map(item => item.name))
        .concat(_.sampleSize(getArmor(), 1).map(item => item.name)),
    },
  };
  return randomCharacter;
};
