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
  const allClasses = {
    artificer: (await import('data/class/class-artificer.json')).default,
    barbarian: (await import('data/class/class-barbarian.json')).default,
    bard: (await import('data/class/class-bard.json')).default,
    cleric: (await import('data/class/class-cleric.json')).default,
    druid: (await import('data/class/class-druid.json')).default,
    fighter: (await import('data/class/class-fighter.json')).default,
    monk: (await import('data/class/class-monk.json')).default,
    mystic: (await import('data/class/class-mystic.json')).default,
    paladin: (await import('data/class/class-paladin.json')).default,
    ranger: (await import('data/class/class-ranger.json')).default,
    rogue: (await import('data/class/class-rogue.json')).default,
    sorcerer: (await import('data/class/class-sorcerer.json')).default,
    warlock: (await import('data/class/class-warlock.json')).default,
    wizard: (await import('data/class/class-wizard.json')).default,
  } as ClassTypes;

  return { allClasses };
};

// SPELLS
export const loadSpells = async () => {
  const spells = {
    AI: (await import('data/spells/spells-ai.json')).default,
    GGR: (await import('data/spells/spells-ggr.json')).default,
    LLK: (await import('data/spells/spells-llk.json')).default,
    PHB: (await import('data/spells/spells-phb.json')).default,
    TCE: (await import('data/spells/spells-tce.json')).default,
    XGE: (await import('data/spells/spells-xge.json')).default,
  };
  return Object.values(spells)
    .map(spell => spell.spell)
    .flat()
    .filter(entry => filterSources(entry)) as SpellElement[];
};

// RACES
export const loadRaces = async () => {
  const data = {
    races: (await import('data/races.json')).default,
    fluff: (await import('data/fluff-races.json')).default,
  };
  const races = uniqBy(
    sortBy(
      mainRenderer.race
        .mergeSubraces(data.races.race)
        .filter((race: any) => filterSources(race, false)),
      ['name'],
    ),
    'name',
  ) as Race[];

  const racesFluff = data.fluff.raceFluff.filter(fluff =>
    filterSources(fluff, false),
  ) as RaceFluffElement[];

  return { races, racesFluff };
};

// BACKGROUNDS
export const loadBackgrounds = async () => {
  const data = {
    backgrounds: (await import('data/backgrounds.json')).default,
    fluff: (await import('data/fluff-backgrounds.json')).default,
  };
  const backgrounds = data.backgrounds.background
    .filter(bg => filterSources(bg))
    .filter(bg => !bg.name.includes('Variant ')) as BackgroundElement[];

  const backgroundsFluff = data.fluff.backgroundFluff.filter(bg =>
    filterSources(bg),
  ) as BackgroundFluffElement[];

  return { backgrounds, backgroundsFluff };
};

// ITEMS
export type CommonItem = Item | BaseItem;
export const loadItems = async () => {
  const data = {
    baseItems: (await import('data/items-base.json')).default,
    items: (await import('data/items.json')).default,
  };
  createPropertyMaps(data.baseItems);
  const items = data.items.item.filter(i => filterSources(i)) as Item[];
  const baseItems = data.baseItems.baseitem.filter(i =>
    filterSources(i),
  ) as BaseItem[];

  // Every item
  const allItems: CommonItem[] = (items as any).concat(baseItems);

  return { allItems };
};

// MISC
export const loadMisc = async () => {
  const data = {
    actions: (await import('data/actions.json')).default,
    feats: (await import('data/feats.json')).default,
    languages: (await import('data/languages.json')).default,
  };
  const actions = data.actions.action as ActionElement[];
  const feats = data.feats.feat.filter(i => filterSources(i)) as FeatElement[];
  const languages = data.languages.language.filter(i =>
    filterSources(i),
  ) as LanguageElement[];

  return { actions, feats, languages };
};
