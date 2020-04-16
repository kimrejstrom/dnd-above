// Generated by https://quicktype.io

export interface Items {
  _meta: Meta;
  item: Item[];
  itemGroup: ItemGroup[];
}

export interface Meta {
  internalCopies: InternalCopy[];
}

export enum InternalCopy {
  Entries = 'entries',
  Item = 'item',
}

export interface Item {
  name: string;
  rarity?: Rarity;
  type?: string;
  value?: number;
  weight?: number;
  source: string;
  page?: number;
  srd?: boolean | string;
  entries?: Array<FluffyEntry | string>;
  weaponCategory?: WeaponCategory;
  baseItem?: string;
  dmg1?: Dmg1;
  dmg2?: Dmg2;
  dmgType?: DmgType;
  property?: Property[];
  crew?: number;
  vehAc?: number;
  vehHp?: number;
  capPassenger?: number;
  capCargo?: number;
  vehSpeed?: number;
  additionalSources?: Source[];
  additionalEntries?: Array<AdditionalEntryClass | string>;
  wondrous?: boolean;
  tier?: Tier;
  lootTables?: LootTable[];
  scfType?: string;
  reqAttune?: boolean | string;
  ability?: Ability;
  charges?: number;
  recharge?: Recharge;
  attachedSpells?: string[];
  ac?: number;
  strength?: null | string;
  stealth?: boolean;
  curse?: boolean;
  poison?: boolean;
  range?: string;
  bonus?: string;
  weightMult?: number;
  valueMult?: number;
  sentient?: boolean;
  age?: string;
  carryingCapacity?: number;
  speed?: number;
  otherSources?: Source[];
  focus?: string[] | boolean;
  vehDmgThresh?: number;
  staff?: boolean;
  resist?: string;
  weightNote?: string;
  _copy?: Copy;
  weapon?: boolean;
  sword?: boolean;
}

export interface Copy {
  name: string;
  source: string;
  _mod?: Mod;
}

export interface Mod {
  entries: Entries;
}

export interface Entries {
  mode: string;
  items: string;
}

export interface Ability {
  static?: Static;
  con?: number;
  wis?: number;
  choose?: Choose[];
  from?: string[];
  count?: number;
  amount?: number;
  str?: number;
  dex?: number;
  int?: number;
  cha?: number;
}

export interface Choose {
  from: string[];
  count: number;
  amount?: number;
}

export interface Static {
  con?: number;
  str?: number;
  int?: number;
}

export interface AdditionalEntryClass {
  type: EntryType;
  name?: string;
  entries?: string[];
  caption?: string;
  colLabels?: string[];
  colStyles?: ColStyle[];
  rows?: Array<string[]>;
  items?: Array<PurpleItem | string>;
  style?: string;
}

export enum ColStyle {
  Col10 = 'col-10',
  Col2TextCenter = 'col-2 text-center',
  Col3 = 'col-3',
  Col6 = 'col-6',
  Col9 = 'col-9',
}

export interface PurpleItem {
  type: InternalCopy;
  name: string;
  entry?: string;
  entries?: Array<PurpleEntry | string>;
}

export interface PurpleEntry {
  type: EntryType;
  caption: string;
  colLabels: string[];
  colStyles: ColStyle[];
  rows: Array<string[]>;
}

export enum EntryType {
  Entries = 'entries',
  Inset = 'inset',
  List = 'list',
  Table = 'table',
}

export interface Source {
  source: SourceEnum;
  page: number;
}

export enum SourceEnum {
  Bgdia = 'BGDIA',
  Imr = 'IMR',
  Uawge = 'UAWGE',
  Xge = 'XGE',
}

export enum Dmg1 {
  The1D12 = '1d12',
  The1D4 = '1d4',
  The1D41 = '1d4+1',
  The1D6 = '1d6',
  The1D8 = '1d8',
  The2D6 = '2d6',
  The3D12 = '3d12',
}

export enum Dmg2 {
  The1D10 = '1d10',
  The1D8 = '1d8',
}

export enum DmgType {
  B = 'B',
  O = 'O',
  P = 'P',
  R = 'R',
  S = 'S',
}

export interface FluffyEntry {
  type: EntryType;
  colLabels?: string[];
  colStyles?: string[];
  rows?: Array<Array<RowClass | number | string>>;
  caption?: string;
  style?: string;
  items?: Array<FluffyItem | string>;
  name?: string;
  entries?: Array<AdditionalEntryClass | string>;
}

export interface FluffyItem {
  type: InternalCopy;
  name: string;
  entry?: string;
  entries?: string[];
}

export interface RowClass {
  type: RowType;
  roll: Roll;
}

export interface Roll {
  exact: number;
  entry: string;
}

export enum RowType {
  Cell = 'cell',
}

export enum LootTable {
  MagicItemTableA = 'Magic Item Table A',
  MagicItemTableB = 'Magic Item Table B',
  MagicItemTableC = 'Magic Item Table C',
  MagicItemTableD = 'Magic Item Table D',
  MagicItemTableE = 'Magic Item Table E',
  MagicItemTableF = 'Magic Item Table F',
  MagicItemTableG = 'Magic Item Table G',
  MagicItemTableH = 'Magic Item Table H',
  MagicItemTableI = 'Magic Item Table I',
}

export enum Property {
  A = 'A',
  F = 'F',
  H = 'H',
  L = 'L',
  R = 'R',
  T = 'T',
  The2H = '2H',
  V = 'V',
}

export enum Rarity {
  Artifact = 'Artifact',
  Common = 'Common',
  Legendary = 'Legendary',
  None = 'None',
  Rare = 'Rare',
  Uncommon = 'Uncommon',
  Unknown = 'Unknown',
  UnknownMagic = 'Unknown (Magic)',
  Varies = 'Varies',
  VeryRare = 'Very Rare',
}

export enum Recharge {
  Dawn = 'dawn',
  Dusk = 'dusk',
  Midnight = 'midnight',
}

export enum Tier {
  Major = 'Major',
  Minor = 'Minor',
}

export enum WeaponCategory {
  Martial = 'Martial',
  Simple = 'Simple',
}

export interface ItemGroup {
  name: string;
  type?: string;
  scfType?: string;
  rarity: Rarity;
  source: string;
  page: number;
  items: string[];
  focus?: string[];
  weight?: number;
  tier?: Tier;
  lootTables?: LootTable[];
  wondrous?: boolean;
  attachedSpells?: string[];
  ac?: number;
  stealth?: boolean;
  reqAttune?: boolean | string;
  weaponCategory?: WeaponCategory;
  baseItem?: string;
  dmg1?: string;
  dmg2?: string;
  dmgType?: DmgType;
  property?: Property[];
  entries?: string[];
  charges?: number;
  strength?: string;
  curse?: boolean;
  srd?: boolean;
  otherSources?: Source[];
}