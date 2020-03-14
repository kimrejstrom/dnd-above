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

import { ClassTypes } from 'models/class';
import { Race } from 'models/races';

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
export const RACES = races.race as Race[];
