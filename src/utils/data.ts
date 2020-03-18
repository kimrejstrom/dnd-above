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
// Backgrounds
import backgrounds from 'data/backgrounds.json';
// Items
import items from 'data/items-base.json';

import { ClassTypes, Class } from 'models/class';
import { Race } from 'models/race';
import { BackgroundElement } from 'models/background';
import { BaseItem } from 'models/item';
import { SourceUtil } from 'vendor/5e-tools/renderer';
import { sortBy, uniqBy } from 'lodash';
import mainRenderer from 'utils/mainRenderer';

export const filterSources = (item: any) => {
  return SourceUtil.isCoreOrSupplement(item.source) &&
    !SourceUtil.isNonstandardSource(item.source) &&
    item.source !== 'DMG'
    ? 1
    : 0;
};

export const SPELLS = { AI, GGR, LLK, PHB, SCAG, XGE };
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

export const PLAYABLE_CLASSES = Object.values(CLASSES)
  .map((classEntry: Class) => classEntry.class[0])
  .filter(entry => filterSources(entry));

export const RACES = sortBy(
  races.race.filter(race => filterSources(race)),
  ['name'],
) as Race[];

export const PLAYABLE_RACES = uniqBy(
  sortBy(
    mainRenderer.race
      .mergeSubraces(races.race)
      .filter(race => filterSources(race)),
    ['name'],
  ),
  'name',
) as Race[];

export const BACKGROUNDS = backgrounds.background as BackgroundElement[];
export const ITEMS = items.baseitem as BaseItem[];
export const ARMOR = ITEMS.filter((item: BaseItem) => item.armor);
export const WEAPONS = ITEMS.filter((item: BaseItem) => item.weaponCategory);
