// Items
import baseItems from 'data/items-base.json';
import items from 'data/items.json';
// Actions
import actions from 'data/actions.json';
// Feats
import feats from 'data/feats.json';
// Languages
import languages from 'data/languages.json';
// Models
import { ClassTypes, Class, ClassElement } from 'models/class';
import { Race } from 'models/race';
import { BackgroundElement } from 'models/background';
import { BaseItem } from 'models/base-item';
import { RaceFluffElement } from 'models/race-fluff';
import { Item } from 'models/item';
import { BackgroundFluffElement } from 'models/background-fluff';
import { Action } from 'models/actions';
import { LanguageElement } from 'models/language';
// Utils
import { sortBy, uniqBy, flatten } from 'lodash';
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

  const playableClasses = flatten(
    Object.values(allClasses).map((classEntry: Class) =>
      classEntry.class.filter(entry => filterSources(entry)),
    ),
  ) as ClassElement[];

  return { allClasses, playableClasses };
};

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
export const LANGUAGES = languages.language.filter(i =>
  filterSources(i),
) as LanguageElement[];

const createPropertyMaps = (data: any) => {
  data.itemProperty.forEach((p: any) => mainRenderer.item._addProperty(p));
  data.itemType.forEach((t: any) => mainRenderer.item._addType(t));
  data.itemTypeAdditionalEntries.forEach((e: any) =>
    mainRenderer.item._addAdditionalEntries(e),
  );
};

createPropertyMaps(baseItems);

/*
Async Data loading:
- Create loadX() async functions to dynamically import the JSON files (data.ts)

- Create sourceDataSlice of state
  - Initialize with a `loading / rehydrate` flag
  - Create createAsyncThunk action (Promise.all) to load the data
    - Updates the store with the loaded data
    - Updates the `loading` state to indicate it is ready
- Dispatch the loadingData on App useEffect
- Use the `loading` state to render a <Loading> component instead of the <App>
*/
