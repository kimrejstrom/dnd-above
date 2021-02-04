// Models
import { ClassTypes } from 'models/class';
import { Race } from 'models/race';
import { BackgroundElement } from 'models/background';
import { BaseItem } from 'models/base-item';
import { RaceFluffElement } from 'models/race-fluff';
import { Item } from 'models/item';
import { BackgroundFluffElement } from 'models/background-fluff';
import { ActionElement } from 'models/actions';
import { LanguageElement } from 'models/language';
// Utils
import { sortBy, uniqBy } from 'lodash';
import { mainRenderer, Parser, SourceUtil } from 'utils/mainRenderer';
import { SpellElement } from 'models/spells';
import { getCookie } from 'utils/cookie';
import { FeatElement } from 'models/feats';
import { Optionalfeature } from 'models/optional-feature';
import { Condition, Disease, Status } from 'models/conditions';

export const filterSources = (item: any, includeDMG: boolean = true) => {
  const sourceIncludesUA = (source: string) => {
    return source.includes('UA');
  };

  const allSources = getCookie('allSources') === 'true';
  if (!includeDMG && item.source === 'DMG') {
    return 0;
  }

  if (!allSources && item.srd !== true) {
    return 0;
  }

  if (
    sourceIncludesUA(item.source) ||
    (item.classSource && sourceIncludesUA(item.classSource))
  ) {
    return 0;
  }
  return SourceUtil.isCoreOrSupplement(item.source) &&
    !SourceUtil.isNonstandardSource(item.source)
    ? 1
    : 0;
};

const createPropertyMaps = (data: any) => {
  Object.entries(Parser.ITEM_TYPE_JSON_TO_ABV).forEach(([abv, name]) =>
    mainRenderer.item._addType({ abbreviation: abv, name }),
  );
  data.itemProperty.forEach((p: any) => mainRenderer.item._addProperty(p));
  data.itemType.forEach((t: any) => mainRenderer.item._addType(t));
  data.itemTypeAdditionalEntries.forEach((e: any) =>
    mainRenderer.item._addAdditionalEntries(e),
  );
};

// CLASSES
export const loadClasses = async () => {
  const [
    artificer,
    barbarian,
    bard,
    cleric,
    druid,
    fighter,
    monk,
  ] = await Promise.all([
    import(/* webpackPrefetch: true */ 'data/class/class-artificer.json').then(
      data => data.default,
    ),
    import(/* webpackPrefetch: true */ 'data/class/class-barbarian.json').then(
      data => data.default,
    ),
    import(/* webpackPrefetch: true */ 'data/class/class-bard.json').then(
      data => data.default,
    ),
    import(/* webpackPrefetch: true */ 'data/class/class-cleric.json').then(
      data => data.default,
    ),
    import(/* webpackPrefetch: true */ 'data/class/class-druid.json').then(
      data => data.default,
    ),
    import(/* webpackPrefetch: true */ 'data/class/class-fighter.json').then(
      data => data.default,
    ),
    import(/* webpackPrefetch: true */ 'data/class/class-monk.json').then(
      data => data.default,
    ),
  ]);

  const [
    paladin,
    ranger,
    rogue,
    sorcerer,
    warlock,
    wizard,
  ] = await Promise.all([
    import(/* webpackPrefetch: true */ 'data/class/class-paladin.json').then(
      data => data.default,
    ),
    import(/* webpackPrefetch: true */ 'data/class/class-ranger.json').then(
      data => data.default,
    ),
    import(/* webpackPrefetch: true */ 'data/class/class-rogue.json').then(
      data => data.default,
    ),
    import(/* webpackPrefetch: true */ 'data/class/class-sorcerer.json').then(
      data => data.default,
    ),
    import(/* webpackPrefetch: true */ 'data/class/class-warlock.json').then(
      data => data.default,
    ),
    import(/* webpackPrefetch: true */ 'data/class/class-wizard.json').then(
      data => data.default,
    ),
  ]);

  const allClasses = {
    artificer,
    barbarian,
    bard,
    cleric,
    druid,
    fighter,
    monk,
    paladin,
    ranger,
    rogue,
    sorcerer,
    warlock,
    wizard,
  } as ClassTypes;

  return { allClasses };
};

// SPELLS
export const loadSpells = async () => {
  const [AI, GGR, LLK, PHB, TCE, XGE] = await Promise.all([
    import(/* webpackPrefetch: true */ 'data/spells/spells-ai.json').then(
      data => data.default,
    ),
    import(/* webpackPrefetch: true */ 'data/spells/spells-ggr.json').then(
      data => data.default,
    ),
    import(/* webpackPrefetch: true */ 'data/spells/spells-llk.json').then(
      data => data.default,
    ),
    import(/* webpackPrefetch: true */ 'data/spells/spells-phb.json').then(
      data => data.default,
    ),
    import(/* webpackPrefetch: true */ 'data/spells/spells-tce.json').then(
      data => data.default,
    ),
    import(/* webpackPrefetch: true */ 'data/spells/spells-xge.json').then(
      data => data.default,
    ),
  ]);
  const spells = {
    AI,
    GGR,
    LLK,
    PHB,
    TCE,
    XGE,
  };
  return Object.values(spells)
    .map(spell => spell.spell)
    .flat()
    .filter(entry => filterSources(entry)) as SpellElement[];
};

// RACES
export const loadRaces = async () => {
  const [racesData, fluffData] = await Promise.all([
    import(/* webpackPrefetch: true */ 'data/races.json').then(
      data => data.default,
    ),
    import(/* webpackPrefetch: true */ 'data/fluff-races.json').then(
      data => data.default,
    ),
  ]);
  const races = uniqBy(
    sortBy(
      mainRenderer.race
        .mergeSubraces(racesData.race)
        .filter((race: any) => filterSources(race, false)),
      ['name'],
    ),
    'name',
  ) as Race[];

  const racesFluff = fluffData.raceFluff.filter(fluff =>
    filterSources(fluff, false),
  ) as RaceFluffElement[];

  return { races, racesFluff };
};

// BACKGROUNDS
export const loadBackgrounds = async () => {
  const [backgroundsData, fluffData] = await Promise.all([
    import(/* webpackPrefetch: true */ 'data/backgrounds.json').then(
      data => data.default,
    ),
    import(/* webpackPrefetch: true */ 'data/fluff-backgrounds.json').then(
      data => data.default,
    ),
  ]);
  const backgrounds = backgroundsData.background
    .filter(bg => filterSources(bg))
    .filter(bg => !bg.name.includes('Variant ')) as BackgroundElement[];

  const backgroundsFluff = fluffData.backgroundFluff.filter(bg =>
    filterSources(bg),
  ) as BackgroundFluffElement[];

  return { backgrounds, backgroundsFluff };
};

// ITEMS
export interface AdditionalItemProps {
  _attunement: string;
  _attunementCategory: string;
  _category: string;
  _isEnhanced: boolean;
  _typeHtml: string;
  _typeListText: string[];
}
export type CommonItem = AdditionalItemProps & (Item | BaseItem);
export const loadItems = async () => {
  const [baseItemsData, itemsData] = await Promise.all([
    import(/* webpackPrefetch: true */ 'data/items-base.json').then(
      data => data.default,
    ),
    import(/* webpackPrefetch: true */ 'data/items.json').then(
      data => data.default,
    ),
  ]);
  createPropertyMaps(baseItemsData);
  const items = itemsData.item.filter(i => filterSources(i)) as Item[];
  const baseItems = baseItemsData.baseitem.filter(i =>
    filterSources(i),
  ) as BaseItem[];

  // Every item
  const allItems: CommonItem[] = (items as any)
    .concat(baseItems)
    .map((item: any) => mainRenderer.item.enhanceItem(item));

  return { allItems };
};

// MISC
export const loadMisc = async () => {
  const [
    actionsData,
    featsData,
    languagesData,
    optionalFeaturesData,
    conditionsdiseasesData,
  ] = await Promise.all([
    import(/* webpackPrefetch: true */ 'data/actions.json').then(
      data => data.default,
    ),
    import(/* webpackPrefetch: true */ 'data/feats.json').then(
      data => data.default,
    ),
    import(/* webpackPrefetch: true */ 'data/languages.json').then(
      data => data.default,
    ),
    import(/* webpackPrefetch: true */ 'data/optionalfeatures.json').then(
      data => data.default,
    ),
    import(/* webpackPrefetch: true */ 'data/conditionsdiseases.json').then(
      data => data.default,
    ),
  ]);

  const actions = actionsData.action as ActionElement[];
  const feats = featsData.feat.filter(i => filterSources(i)) as FeatElement[];
  const languages = languagesData.language.filter(i =>
    filterSources(i),
  ) as LanguageElement[];
  const optionalFeatures = optionalFeaturesData.optionalfeature.filter(i =>
    filterSources(i),
  ) as Optionalfeature[];
  const conditionsDiseases = [
    ...conditionsdiseasesData.condition.filter(i => filterSources(i)),
    ...conditionsdiseasesData.disease.filter(i => filterSources(i)),
    ...conditionsdiseasesData.status.filter(i => filterSources(i)),
  ] as (Condition | Disease | Status)[];

  return { actions, feats, languages, optionalFeatures, conditionsDiseases };
};
