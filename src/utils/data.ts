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
import { mainRenderer, SourceUtil } from 'utils/mainRenderer';
import { SpellElement } from 'models/spells';
import { getCookie } from 'utils/cookie';
import { FeatElement } from 'models/feats';

export const filterSources = (item: any, includeDMG: boolean = true) => {
  const allSources = getCookie('allSources') === 'true';
  if (!includeDMG && item.source === 'DMG') {
    return 0;
  }

  if (!allSources && item.srd !== true) {
    return 0;
  }

  return SourceUtil.isCoreOrSupplement(item.source) &&
    !SourceUtil.isNonstandardSource(item.source)
    ? 1
    : 0;
};

const createPropertyMaps = (data: any) => {
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
    import('data/class/class-artificer.json').then(data => data.default),
    import('data/class/class-barbarian.json').then(data => data.default),
    import('data/class/class-bard.json').then(data => data.default),
    import('data/class/class-cleric.json').then(data => data.default),
    import('data/class/class-druid.json').then(data => data.default),
    import('data/class/class-fighter.json').then(data => data.default),
    import('data/class/class-monk.json').then(data => data.default),
  ]);

  const [
    paladin,
    ranger,
    rogue,
    sorcerer,
    warlock,
    wizard,
  ] = await Promise.all([
    import('data/class/class-paladin.json').then(data => data.default),
    import('data/class/class-ranger.json').then(data => data.default),
    import('data/class/class-rogue.json').then(data => data.default),
    import('data/class/class-sorcerer.json').then(data => data.default),
    import('data/class/class-warlock.json').then(data => data.default),
    import('data/class/class-wizard.json').then(data => data.default),
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
    import('data/spells/spells-ai.json').then(data => data.default),
    import('data/spells/spells-ggr.json').then(data => data.default),
    import('data/spells/spells-llk.json').then(data => data.default),
    import('data/spells/spells-phb.json').then(data => data.default),
    import('data/spells/spells-tce.json').then(data => data.default),
    import('data/spells/spells-xge.json').then(data => data.default),
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
    import('data/races.json').then(data => data.default),
    import('data/fluff-races.json').then(data => data.default),
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
    import('data/backgrounds.json').then(data => data.default),
    import('data/fluff-backgrounds.json').then(data => data.default),
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
export type CommonItem = Item | BaseItem;
export const loadItems = async () => {
  const [baseItemsData, itemsData] = await Promise.all([
    import('data/items-base.json').then(data => data.default),
    import('data/items.json').then(data => data.default),
  ]);
  createPropertyMaps(baseItemsData);
  const items = itemsData.item.filter(i => filterSources(i)) as Item[];
  const baseItems = baseItemsData.baseitem.filter(i =>
    filterSources(i),
  ) as BaseItem[];

  // Every item
  const allItems: CommonItem[] = (items as any).concat(baseItems);

  return { allItems };
};

// MISC
export const loadMisc = async () => {
  const [actionsData, featsData, languagesData] = await Promise.all([
    import('data/actions.json').then(data => data.default),
    import('data/feats.json').then(data => data.default),
    import('data/languages.json').then(data => data.default),
  ]);

  const actions = actionsData.action as ActionElement[];
  const feats = featsData.feat.filter(i => filterSources(i)) as FeatElement[];
  const languages = languagesData.language.filter(i =>
    filterSources(i),
  ) as LanguageElement[];

  return { actions, feats, languages };
};
