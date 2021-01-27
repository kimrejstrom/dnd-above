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
        .find(subclass => subclass.name === subClassName)
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
          ? parseClassFeatureString(feat) === feature.name
          : parseClassFeatureString(feat.classFeature) === feature.name,
      ),
    );
  return relevantClassFeatures;
};

export const getSubClassFeatures = (
  className: string,
  subClassName: string,
) => {
  const baseClass = getClass(className);
  const subclass = baseClass?.subclasses.find(
    subclass => subclass.name === subClassName,
  );
  const subclassFeatures = (getSourceData(store.getState())?.allClasses as any)[
    className.toLowerCase()
  ].subclassFeature as SubclassFeature[];
  const relevantSubClassFeatures = subclassFeatures
    .filter(feature => filterSources(feature))
    .filter(feature =>
      subclass?.subclassFeatures!.some(
        feat =>
          parseSubClassFeatureString(feat).toLowerCase() ===
          feature.subclassShortName.toLowerCase(),
      ),
    );
  return relevantSubClassFeatures;
};

const parseClassFeatureString = (featureString: string) =>
  featureString.split('|')[0];

const parseSubClassFeatureString = (featureString: string) =>
  featureString.split('|')[3];

// RACE UTILS
export const getRaces = () => getSourceData(store.getState())?.races;

export const getRacesFluff = () => getSourceData(store.getState())?.racesFluff;

export const getRace = (raceName: string) =>
  getRaces()!.find(race => race.name === raceName);

// BACKGROUND UTILS
export const getBackgrounds = () =>
  getSourceData(store.getState())?.backgrounds;

export const getBackgroundsFluff = () =>
  getSourceData(store.getState())?.backgroundsFluff;

export const getBackground = (backgroundName: string) =>
  getBackgrounds()!.find(bg => bg.name === backgroundName);

export const getBackgroundCharacteristics = () =>
  getSourceData(store.getState())
    ?.backgrounds.map(bg => ({
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
  getAllItems()!.find(entry => entry.name === itemName);

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
  getSpells()!.find(sp => sp.name === spellName);

export const getSpellFromList = (
  allSpells: SpellElement[],
  spellName: string,
) => allSpells.find(sp => sp.name === spellName);

// MISC UTILS
export const getActions = () => getSourceData(store.getState())?.actions;

export const getLanguages = () => getSourceData(store.getState())?.languages;

export const getFeats = () => getSourceData(store.getState())?.feats;

export const getLanguage = (languageName: string) =>
  getLanguages()!.find(
    lang => lang.name.toLowerCase() === languageName.toLowerCase(),
  );

export const getFeat = (featName: string) =>
  getFeats()!.find(feat => feat.name === featName);
