// Spells
import AI from 'data/spells/spells-ai.json';
import GGR from 'data/spells/spells-ggr.json';
import LLK from 'data/spells/spells-llk.json';
import PHB from 'data/spells/spells-phb.json';
import SCAG from 'data/spells/spells-scag.json';
import XGE from 'data/spells/spells-xge.json';
// Classes
import artificer from 'data/class/class-artificer.json';
import barbarian from 'data/class/class-barbarian.json';
import bard from 'data/class/class-bard.json';
import cleric from 'data/class/class-cleric.json';
import druid from 'data/class/class-druid.json';
import fighter from 'data/class/class-fighter.json';
import monk from 'data/class/class-monk.json';
import mystic from 'data/class/class-mystic.json';
import paladin from 'data/class/class-paladin.json';
import ranger from 'data/class/class-ranger.json';
import rogue from 'data/class/class-rogue.json';
import sorcerer from 'data/class/class-sorcerer.json';
import warlock from 'data/class/class-warlock.json';
import wizard from 'data/class/class-wizard.json';
// Races
import races from 'data/races.json';
import raceFluff from 'data/fluff-races.json';
// Backgrounds
import backgrounds from 'data/backgrounds.json';
import backgroundsFluff from 'data/fluff-backgrounds.json';
// Items
import baseItems from 'data/items-base.json';
import items from 'data/items.json';
// Actions
import actions from 'data/actions.json';
// Feats
import feats from 'data/feats.json';
// Models
import { ClassTypes, Class, ClassElement } from 'models/class';
import { Race } from 'models/race';
import { BackgroundElement } from 'models/background';
import { BaseItem } from 'models/base-item';
import { RaceFluffElement } from 'models/race-fluff';
import { Item } from 'models/item';
import { BackgroundFluffElement } from 'models/background-fluff';
import { Action } from 'models/actions';
// Utils
import { sortBy, uniqBy, flatten } from 'lodash';
import { isDefined } from 'ts-is-present';
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

const SPELLS = { AI, GGR, LLK, PHB, SCAG, XGE };
export const ALL_SPELLS: SpellElement[] = Object.values(SPELLS)
  .map(spell => spell.spell)
  .flat()
  .filter(entry => filterSources(entry));

export const CLASSES = {
  artificer,
  barbarian,
  bard,
  cleric,
  druid,
  fighter,
  monk,
  mystic,
  paladin,
  ranger,
  rogue,
  sorcerer,
  warlock,
  wizard,
} as ClassTypes;

export const PLAYABLE_CLASSES = flatten(
  Object.values(CLASSES).map((classEntry: Class) =>
    classEntry.class.filter(entry => filterSources(entry)),
  ),
) as ClassElement[];

export const RACES = sortBy(
  races.race.filter(race => filterSources(race)),
  ['name'],
) as Race[];

export const PLAYABLE_RACES = uniqBy(
  sortBy(
    mainRenderer.race
      .mergeSubraces(races.race)
      .filter((race: any) => filterSources(race, false)),
    ['name'],
  ),
  'name',
) as Race[];

export const PLAYABLE_RACES_FLUFF = raceFluff.raceFluff.filter(fluff =>
  filterSources(fluff, false),
) as RaceFluffElement[];

export const BACKGROUNDS = backgrounds.background
  .filter(bg => filterSources(bg))
  .filter(bg => !bg.name.includes('Variant ')) as BackgroundElement[];
export const BACKGROUNDS_FLUFF = backgroundsFluff.backgroundFluff.filter(bg =>
  filterSources(bg),
) as BackgroundFluffElement[];

export const CHARACTERISTICS = BACKGROUNDS.map(bg => ({
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
})).map(characteristic => ({
  ...characteristic,
  tables: flatten(characteristic.tables),
}));

export const OTHER_ITEMS = items.item.filter(i => filterSources(i)) as Item[];
export const BASE_ITEMS = baseItems.baseitem.filter(i =>
  filterSources(i),
) as BaseItem[];
export const ARMOR = BASE_ITEMS.filter((item: BaseItem) => item.armor);
export const WEAPONS = BASE_ITEMS.filter(
  (item: BaseItem) => item.weaponCategory,
);
export const BASE_ITEMS_OTHER = BASE_ITEMS.filter(
  item => !(item.armor || item.weaponCategory),
);
export const ALL_OTHER_ITEMS = sortBy(
  (OTHER_ITEMS as any).concat(BASE_ITEMS_OTHER) as (Item | BaseItem)[],
  'name',
);
export const ALL_ITEMS = (OTHER_ITEMS as any).concat(BASE_ITEMS) as (
  | Item
  | BaseItem
)[];

export const ACTIONS = actions as Action;
export const FEATS = feats.feat.filter(i => filterSources(i)) as FeatElement[];

const createPropertyMaps = (data: any) => {
  data.itemProperty.forEach((p: any) => mainRenderer.item._addProperty(p));
  data.itemType.forEach((t: any) => mainRenderer.item._addType(t));
  data.itemTypeAdditionalEntries.forEach((e: any) =>
    mainRenderer.item._addAdditionalEntries(e),
  );
};

createPropertyMaps(baseItems);
