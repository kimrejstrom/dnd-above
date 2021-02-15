// Generated by https://quicktype.io

export interface Bestiary {
  monster: Monster[];
}

export interface Monster {
  name: string;
  source: string;
  page: number;
  otherSources?: string[];
  size: Size;
  type: TypeClass | TypeTypeEnum;
  alignment: Array<AlignmentClass | string>;
  ac: Array<ACClass | number>;
  hp: HP;
  speed: Speed;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  skill?: { [key: string]: string };
  passive: number;
  languages?: string[];
  cr: CRClass | string;
  trait?: Action[];
  action?: Action[];
  environment?: Environment[];
  hasToken: boolean;
  soundClip?: SoundClip;
  languageTags?: string[];
  damageTags?: DamageTag[];
  miscTags?: string[];
  srd?: boolean;
  save?: Save;
  senses?: string[];
  legendary?: Legendary[];
  legendaryGroup?: LegendaryGroup;
  traitTags?: string[];
  senseTags?: SenseTag[];
  actionTags?: ActionTag[];
  conditionInflict?: ConditionI[];
  conditionInflictLegendary?: ConditionI[];
  immune?: Array<ImmuneClass | ImmuneEnum>;
  spellcasting?: Spellcasting[];
  spellcastingTags?: SpellcastingTag[];
  group?: string;
  dragonCastingColor?: string;
  resist?: Array<ResistClass | PurpleResist>;
  conditionImmune?: ConditionI[];
  conditionInflictSpell?: ConditionI[];
  variant?: Variant[];
  altArt?: AltArt[];
  vulnerable?: Array<VulnerableClass | PurpleResist>;
  reaction?: Legendary[];
  familiar?: boolean;
  legendaryHeader?: string[];
  alias?: string[];
}

export interface ACClass {
  ac: number;
  from?: string[];
  condition?: string;
  braces?: boolean;
}

export interface Action {
  name: string;
  entries: Array<PurpleEntry | string>;
}

export interface PurpleEntry {
  type: EntryType;
  style: string;
  items: ItemClass[];
}

export interface ItemClass {
  type: string;
  name: string;
  entry: string;
}

export enum EntryType {
  Entries = 'entries',
  List = 'list',
  Spellcasting = 'spellcasting',
  Table = 'table',
}

export enum ActionTag {
  FrightfulPresence = 'Frightful Presence',
  Multiattack = 'Multiattack',
  Parry = 'Parry',
  Swallow = 'Swallow',
  Teleport = 'Teleport',
  Tentacles = 'Tentacles',
}

export interface AlignmentClass {
  alignment: string;
  chance: number;
}

export interface AltArt {
  name: string;
  source: string;
  page?: number;
}

export enum ConditionI {
  Blinded = 'blinded',
  Charmed = 'charmed',
  Deafened = 'deafened',
  Exhaustion = 'exhaustion',
  Frightened = 'frightened',
  Grappled = 'grappled',
  Incapacitated = 'incapacitated',
  Invisible = 'invisible',
  Paralyzed = 'paralyzed',
  Petrified = 'petrified',
  Poisoned = 'poisoned',
  Prone = 'prone',
  Restrained = 'restrained',
  Stunned = 'stunned',
  Unconscious = 'unconscious',
}

export interface CRClass {
  cr: string;
  lair?: string;
  coven?: string;
}

export enum DamageTag {
  A = 'A',
  B = 'B',
  C = 'C',
  F = 'F',
  I = 'I',
  L = 'L',
  N = 'N',
  O = 'O',
  P = 'P',
  R = 'R',
  S = 'S',
  T = 'T',
  Y = 'Y',
}

export enum Environment {
  Arctic = 'arctic',
  Coastal = 'coastal',
  Desert = 'desert',
  Forest = 'forest',
  Grassland = 'grassland',
  Hill = 'hill',
  Mountain = 'mountain',
  Swamp = 'swamp',
  Underdark = 'underdark',
  Underwater = 'underwater',
  Urban = 'urban',
}

export interface HP {
  average: number;
  formula: string;
}

export interface ImmuneClass {
  immune: PurpleResist[];
  note: string;
  cond: boolean;
}

export enum PurpleResist {
  Acid = 'acid',
  Bludgeoning = 'bludgeoning',
  Cold = 'cold',
  Fire = 'fire',
  Lightning = 'lightning',
  Necrotic = 'necrotic',
  Piercing = 'piercing',
  Poison = 'poison',
  Psychic = 'psychic',
  Radiant = 'radiant',
  Slashing = 'slashing',
  Thunder = 'thunder',
}

export enum ImmuneEnum {
  Acid = 'acid',
  Cold = 'cold',
  Fire = 'fire',
  Force = 'force',
  Lightning = 'lightning',
  Necrotic = 'necrotic',
  Poison = 'poison',
  Psychic = 'psychic',
  Slashing = 'slashing',
  Thunder = 'thunder',
}

export interface Legendary {
  name: string;
  entries: string[];
}

export interface LegendaryGroup {
  name: string;
  source: string;
}

export interface OtherSource {
  source: OtherSourceSource;
}

export enum OtherSourceSource {
  Bgdia = 'BGDIA',
  CoS = 'CoS',
  DIP = 'DIP',
  Dc = 'DC',
  Egw = 'EGW',
  Erlw = 'ERLW',
  GoS = 'GoS',
  HotDQ = 'HotDQ',
  IDRotF = 'IDRotF',
  Imr = 'IMR',
  LMoP = 'LMoP',
  Lr = 'LR',
  Mot = 'MOT',
  PotA = 'PotA',
  Rmbre = 'RMBRE',
  RoT = 'RoT',
  Sdw = 'SDW',
  Skt = 'SKT',
  Slw = 'SLW',
  TFTYP = 'TftYP',
  Tce = 'TCE',
  ToA = 'ToA',
  Wdh = 'WDH',
  Wdmm = 'WDMM',
}

export interface ResistClass {
  resist?: PurpleResist[];
  note?: string;
  cond?: boolean;
  special?: string;
  preNote?: string;
}

export interface Save {
  con?: string;
  int?: string;
  wis?: string;
  dex?: string;
  cha?: string;
  str?: string;
}

export enum SenseTag {
  B = 'B',
  D = 'D',
  SD = 'SD',
  T = 'T',
  U = 'U',
}

export enum Size {
  G = 'G',
  H = 'H',
  L = 'L',
  M = 'M',
  S = 'S',
  T = 'T',
}

export interface SoundClip {
  type: SoundClipType;
  path: string;
}

export enum SoundClipType {
  Internal = 'internal',
}

export interface Speed {
  walk?: FlyClass | number;
  fly?: FlyClass | number;
  swim?: number;
  climb?: number;
  burrow?: number;
  canHover?: boolean;
}

export interface FlyClass {
  number: number;
  condition: string;
}

export interface Spellcasting {
  name: string;
  headerEntries: string[];
  spells?: { [key: string]: Spell };
  ability?: Ability;
  will?: string[];
  hidden?: string[];
  footerEntries?: string[];
  daily?: SpellcastingDaily;
}

export enum Ability {
  Cha = 'cha',
  Int = 'int',
  Wis = 'wis',
}

export interface SpellcastingDaily {
  '1e'?: string[];
  '2e'?: string[];
  '1'?: string[];
  '3e'?: string[];
  '3'?: string[];
}

export interface Spell {
  spells: string[];
  slots?: number;
}

export enum SpellcastingTag {
  CD = 'CD',
  Cc = 'CC',
  Cp = 'CP',
  Cw = 'CW',
  F = 'F',
  I = 'I',
  P = 'P',
  S = 'S',
}

export interface TypeClass {
  type: TypeTypeEnum;
  tags?: string[];
  swarmSize?: DamageTag;
}

export enum TypeTypeEnum {
  Aberration = 'aberration',
  Beast = 'beast',
  Celestial = 'celestial',
  Construct = 'construct',
  Dragon = 'dragon',
  Elemental = 'elemental',
  Fey = 'fey',
  Fiend = 'fiend',
  Giant = 'giant',
  Humanoid = 'humanoid',
  Monstrosity = 'monstrosity',
  Ooze = 'ooze',
  Plant = 'plant',
  Undead = 'undead',
}

export interface Variant {
  type: VariantType;
  name: string;
  entries: Array<FluffyEntry | string>;
  variantSource?: VariantSource;
  token?: AltArt;
}

export interface FluffyEntry {
  name?: string;
  type: EntryType;
  entries?: Array<TentacledEntry | string>;
  style?: string;
  items?: Array<ItemClass | string>;
  headerEntries?: string[];
  will?: string[];
  daily?: EntryDaily;
  ability?: Ability;
  colLabels?: string[];
  colstrings?: string[];
  rows?: Array<string[]>;
}

export interface EntryDaily {
  '1': string[];
  '2e': string[];
}

export interface TentacledEntry {
  type: string;
  name: string;
  entries: string[];
}

export enum VariantType {
  Inset = 'inset',
  Variant = 'variant',
}

export interface VariantSource {
  source: string;
  page: number;
}

export interface VulnerableClass {
  vulnerable: PurpleResist[];
  note: string;
  cond: boolean;
}