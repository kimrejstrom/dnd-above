import { getSourceData } from 'app/selectors';
import { store } from 'app/store';
import _, { flatten } from 'lodash';
import { BaseItem } from 'models/base-item';
import { Item } from 'models/item';
import {
  ClassElement,
  Class,
  ClassClassFeature,
  SubclassFeature,
} from 'models/class';
import { SpellElement } from 'models/spells';
import { isDefined } from 'ts-is-present';
import { filterSources } from 'utils/data';

const compareStrings = (str1: string, str2: string) =>
  isDefined(str1) &&
  isDefined(str2) &&
  str1.toLowerCase() === str2.toLowerCase();

// CLASS UTILS
export const getPlayableClasses = (): ClassElement[] => {
  const allClasses = getSourceData(store.getState())?.allClasses;
  return flatten(
    Object.values(allClasses!).map((classEntry: Class) =>
      classEntry.class.filter(entry => filterSources(entry)),
    ),
  ) as ClassElement[];
};

export const getClass = (className: string) =>
  getPlayableClasses().find(mainClass => mainClass.name === className);

export const getSubClass = (className: string, subClassName: string) => {
  const baseClass = getClass(className);
  return baseClass
    ? baseClass.subclasses
        .filter(subclass => filterSources(subclass))
        .find(subclass => compareStrings(subclass.name, subClassName))
    : undefined;
};

export const getAllClassFeatures = (
  className: string,
  subClassName: string,
) => {
  const relevantClassFeatures = getClassFeatures(className);
  const relevantSubClassFeatures = getSubClassFeatures(className, subClassName);
  return [
    ..._.flatten(relevantClassFeatures),
    ..._.flatten(relevantSubClassFeatures),
  ];
};

export const getAllClassAndSubClassFeatures = (className: string) => {
  const relevantClassFeatures = (getSourceData(store.getState())
    ?.allClasses as any)[className.toLowerCase()].classFeature;
  const relevantSubClassFeatures = (getSourceData(store.getState())
    ?.allClasses as any)[className.toLowerCase()].subclassFeature;
  return [
    ..._.flatten(relevantClassFeatures),
    ..._.flatten(relevantSubClassFeatures),
  ] as (ClassClassFeature | SubclassFeature)[];
};

export const getClassFeatures = (className: string) => {
  const baseClass = getClass(className);
  const classFeatures = (getSourceData(store.getState())?.allClasses as any)[
    className.toLowerCase()
  ].classFeature as ClassClassFeature[];
  const relevantClassFeatures = classFeatures
    .filter(feature => filterSources(feature))
    .filter(feature =>
      baseClass?.classFeatures.some(feat =>
        typeof feat === 'string'
          ? compareStrings(parseClassFeatureString(feat), feature.name)
          : compareStrings(
              parseClassFeatureString(feat.classFeature),
              feature.name,
            ),
      ),
    );
  return relevantClassFeatures;
};

export const getClassFeature = (className: string, featureName: string) =>
  getClassFeatures(className)?.find(feature =>
    compareStrings(feature.name, featureName),
  );

export const getSubClassFeatures = (
  className: string,
  subClassName: string,
) => {
  const baseClass = getClass(className);
  const subclass = baseClass?.subclasses.find(subclass =>
    compareStrings(subclass.name, subClassName),
  );
  const subclassFeatures = (getSourceData(store.getState())?.allClasses as any)[
    className.toLowerCase()
  ].subclassFeature as SubclassFeature[];
  const relevantSubClassFeatures = subclassFeatures
    .filter(feature => filterSources(feature))
    .filter(feature =>
      subclass?.subclassFeatures!.some(feat =>
        compareStrings(
          parseSubClassFeatureString(feat),
          feature.subclassShortName,
        ),
      ),
    );
  return relevantSubClassFeatures;
};

export const getSubClassFeature = (className: string, featureName: string) =>
  getAllClassAndSubClassFeatures(className)?.find(feature =>
    compareStrings(feature.name, featureName),
  );

const parseClassFeatureString = (featureString: string) =>
  featureString.split('|')[0];

const parseSubClassFeatureString = (featureString: string) =>
  featureString.split('|')[3];

// RACE UTILS
export const getRaces = () => getSourceData(store.getState())?.races;

export const getRacesFluff = () => getSourceData(store.getState())?.racesFluff;

export const getRace = (raceName: string) =>
  getRaces()!.find(race => compareStrings(race.name, raceName));

export const getSubRace = (raceName: string, subRaceName: string) =>
  getRace(raceName)?.subraces?.find(subrace =>
    compareStrings(subrace.name!, subRaceName),
  );

// BACKGROUND UTILS
export const getBackgrounds = () =>
  getSourceData(store.getState())?.backgrounds;

export const getBackgroundsFluff = () =>
  getSourceData(store.getState())?.backgroundsFluff;

export const getBackground = (backgroundName: string) =>
  getBackgrounds()!.find(bg => compareStrings(bg.name, backgroundName));

export const getBackgroundFluff = (backgroundName: string) =>
  getBackgroundsFluff()!.find(bg => compareStrings(bg.name, backgroundName));

export const getBackgroundCharacteristics = () =>
  getBackgrounds()!
    .map(bg => ({
      name: bg.name,
      tables: bg.entries
        ? bg.entries
            .map(entry => {
              if (entry.name && entry.name === 'Suggested Characteristics') {
                return entry.entries?.map(item => {
                  return item;
                });
              } else {
                return undefined;
              }
            })
            .filter(isDefined)
        : [],
    }))
    .map(characteristic => ({
      ...characteristic,
      tables: flatten(characteristic.tables),
    }));

// ITEM UTILS
export const getAllItems = () => getSourceData(store.getState())?.allItems;

export const getItem = (itemName: string): Item | BaseItem | undefined =>
  getAllItems()!.find(entry => compareStrings(entry.name, itemName));

// Armor
export const getArmor = () =>
  getSourceData(store.getState())?.allItems.filter(item =>
    ['HA', 'MA', 'LA'].includes(item.type!),
  );

// Weapons
export const getWeapons = () =>
  getSourceData(store.getState())?.allItems.filter(item => item.weaponCategory);

// Rest
export const getOtherItems = () =>
  getSourceData(store.getState())?.allItems.filter(
    item => !item.weaponCategory || !['HA', 'MA', 'LA'].includes(item.type!),
  );

// SPELL UTILS
export const getSpells = () => getSourceData(store.getState())?.spells;

export const getSpell = (spellName: string) =>
  getSpells()!.find(sp => compareStrings(sp.name, spellName));

export const getSpellFromList = (
  allSpells: SpellElement[],
  spellName: string,
) => allSpells.find(sp => compareStrings(sp.name, spellName));

// MISC UTILS
export const getActions = () => getSourceData(store.getState())?.actions;

export const getLanguages = () => getSourceData(store.getState())?.languages;

export const getFeats = () => getSourceData(store.getState())?.feats;

export const getOptionalFeatures = () =>
  getSourceData(store.getState())?.optionalFeatures;

export const getConditions = () =>
  getSourceData(store.getState())?.conditionsDiseases;

export const getAction = (actionName: string) =>
  getActions()!.find(action => compareStrings(action.name, actionName));

export const getLanguage = (languageName: string) =>
  getLanguages()!.find(lang => compareStrings(lang.name, languageName));

export const getFeat = (featName: string) =>
  getFeats()!.find(feat => compareStrings(feat.name, featName));

export const getOptionalFeature = (featName: string) =>
  getOptionalFeatures()!.find(feat => compareStrings(feat.name, featName));

export const getCondition = (conditionName: string) =>
  getConditions()!.find(condition =>
    compareStrings(condition.name, conditionName),
  );

// BESTIARY UTILS
export const getMonsters = () => getSourceData(store.getState())?.bestiary;
export const getMonstersFluff = () =>
  getSourceData(store.getState())?.bestiaryFluff;

export const getMonster = (monsterName: string) =>
  getMonsters()!.find(monster => compareStrings(monster.name, monsterName));

export const getMonsterFluff = (monsterName: string) =>
  getMonstersFluff()!.find(monster =>
    compareStrings(monster.name, monsterName),
  );
