// Generated by https://quicktype.io

export interface Feat {
  feat: FeatElement[];
}

export interface FeatElement {
  name: string;
  prerequisite?: Prerequisite[];
  source: SourceEnum;
  page: number;
  entries: Array<PurpleEntry | string>;
  ability?: FeatAbility[];
  srd?: boolean;
  additionalSources?: Source[];
  otherSources?: Source[];
}

export interface FeatAbility {
  choose?: Choose;
  con?: number;
  dex?: number;
  cha?: number;
  int?: number;
  wis?: number;
  str?: number;
}

export interface Choose {
  from: From[];
  amount: number;
  textreference?: boolean;
}

export enum From {
  Cha = 'cha',
  Con = 'con',
  Dex = 'dex',
  Int = 'int',
  Str = 'str',
  Wis = 'wis',
}

export interface Source {
  source: string;
  page: number;
}

export interface PurpleEntry {
  type: Type;
  items?: Array<EntryElement | string>;
  name?: Name;
  entries?: Array<FluffyEntry | string>;
  caption?: string;
  colLabels?: string[];
  colStyles?: string[];
  rows?: Array<string[]>;
}

export interface FluffyEntry {
  type: Type;
  entries: EntryElement[];
}

export interface EntryElement {
  type: Type;
  name: string;
  entries: string[];
}

export enum Type {
  Entries = 'entries',
  List = 'list',
  Section = 'section',
  Table = 'table',
}

export enum Name {
  ClockworkToy = 'Clockwork Toy',
  FireStarter = 'Fire Starter',
  GreaterDragonmark = 'Greater Dragonmark',
  LeastDragonmark = 'Least Dragonmark',
  LesserDragonmark = 'Lesser Dragonmark',
  MusicBox = 'Music Box',
}

export interface Prerequisite {
  race?: Race[];
  ability?: PrerequisiteAbility[];
  spellcasting?: boolean;
  proficiency?: Proficiency[];
  other?: string;
}

export interface PrerequisiteAbility {
  dex?: number;
  str?: number;
  cha?: number;
  int?: number;
  wis?: number;
}

export interface Proficiency {
  armor: string;
}

export interface Race {
  name: string;
  subrace?: string;
  displayEntry?: string;
}

export enum SourceEnum {
  Erlw = 'ERLW',
  Mtf = 'MTF',
  Phb = 'PHB',
  Psk = 'PSK',
  Psx = 'PSX',
  UAEberron = 'UAEberron',
  UAFeats = 'UAFeats',
  UAFeatsForRaces = 'UAFeatsForRaces',
  UAFeatsForSkills = 'UAFeatsForSkills',
  UAFighterRogueWizard = 'UAFighterRogueWizard',
  Xge = 'XGE',
}