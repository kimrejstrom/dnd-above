export interface ClassTypes {
  artificer: Class;
  barbarian: Class;
  bard: Class;
  cleric: Class;
  druid: Class;
  fighter: Class;
  monk: Class;
  mystic: Class;
  paladin: Class;
  ranger: Class;
  rogue: Class;
  sorcerer: Class;
  warlock: Class;
  wizard: Class;
}

export interface Class {
  class: ClassElement[];
}

export interface ClassElement {
  name: string;
  source: string;
  page: number;
  srd?: boolean;
  hd: HD;
  proficiency: SpellcastingAbility[];
  spellcastingAbility?: SpellcastingAbility;
  casterProgression?: string;
  startingProficiencies: StartingProficiencies;
  startingEquipment: StartingEquipment;
  multiclassing?: Multiclassing;
  classTableGroups?: ClassTableGroup[];
  classFeatures: Array<ClassFeature[]>;
  subclassTitle: string;
  subclasses: ClassSubclass[];
  fluff?: Fluff[];
  isReprinted?: boolean;
}

export interface ClassFeature {
  name: string;
  entries: Array<PurpleEntry | string>;
  source?: EntrySource;
  page?: number;
  gainSubclassFeature?: boolean;
  type?: ClassFeatureType;
}

export interface PurpleEntry {
  type?: ClassFeatureType;
  name?: string;
  entries?: Array<FluffyEntry | string>;
  items?: string[];
  caption?: string;
  colLabels?: string[];
  colStyles?: PurpleColStyle[];
  rows?: Array<string[]>;
  source?: EntrySource;
  page?: number;
  attributes?: SpellcastingAbility[];
}

export enum SpellcastingAbility {
  Cha = 'cha',
  Con = 'con',
  Dex = 'dex',
  Int = 'int',
  Str = 'str',
  Wis = 'wis',
}

export enum PurpleColStyle {
  Col10 = 'col-10',
  Col11 = 'col-11',
  Col1TextCenter = 'col-1 text-center',
  Col2 = 'col-2',
  Col2TextCenter = 'col-2 text-center',
  Col3 = 'col-3',
  Col3TextCenter = 'col-3 text-center',
  Col4 = 'col-4',
  Col4TextCenter = 'col-4 text-center',
  Col5 = 'col-5',
  Col6TextCenter = 'col-6 text-center',
  Col7 = 'col-7',
  Col8 = 'col-8',
  Col9 = 'col-9',
}

export interface FluffyEntry {
  type?: ClassFeatureType;
  name?: string;
  attributes?: SpellcastingAbility[];
  entries?: Array<TentacledEntry | string>;
  source?: EntrySource;
  subclass?: EntrySubclass;
  page?: number;
}

export interface TentacledEntry {
  type: ClassFeatureType;
  name?: string;
  entries?: string[];
  caption?: string;
  colLabels?: string[];
  colStyles?: PurpleColStyle[];
  rows?: Array<string[]>;
}

export enum EntrySource {
  UAClassFeatureVariants = 'UAClassFeatureVariants',
  UALightDarkUnderdark = 'UALightDarkUnderdark',
  UATheFaithful = 'UATheFaithful',
  UAWaterborneAdventures = 'UAWaterborneAdventures',
}

export interface EntrySubclass {
  name: string;
  source: string;
}

export enum ClassFeatureType {
  AbilityAttackMod = 'abilityAttackMod',
  AbilityDc = 'abilityDc',
  Entries = 'entries',
  Inset = 'inset',
  List = 'list',
  Patron = 'patron',
  InlineBlock = 'inlineBlock',
  Options = 'options',
  Table = 'table',
}

export interface ClassTableGroup {
  colLabels: string[];
  rows: Array<Array<PurpleRow | number | string>>;
  title?: Title;
}

export interface PurpleRow {
  type: FluffyType;
  toRoll?: HD[];
  value?: number;
}

export interface HD {
  number: number;
  faces: number;
}

export enum FluffyType {
  Bonus = 'bonus',
  BonusSpeed = 'bonusSpeed',
  Dice = 'dice',
}

export enum Title {
  SpellSlotsPerSpellLevel = 'Spell Slots per Spell Level',
}

export interface Fluff {
  entries: Array<StickyEntry | string>;
  page: number;
  source: FluffSource;
  type?: FluffType;
}

export interface StickyEntry {
  type: FluffType;
  name?: string;
  entries: Array<IndigoEntry | string>;
  by?: string;
}

export interface IndigoEntry {
  type: ClassFeatureType;
  name?: string;
  entries?: Array<IndecentEntry | string>;
  caption?: string;
  colLabels?: string[];
  colStyles?: PurpleColStyle[];
  rows?: Array<Array<FluffyRow | string>>;
}

export interface IndecentEntry {
  type: ClassFeatureType;
  caption?: string;
  colLabels?: string[];
  colStyles?: PurpleColStyle[];
  rows?: Array<Array<FluffyRow | string>>;
  name?: string;
  entries?: string[];
}

export interface FluffyRow {
  type: TentacledType;
  roll: Roll;
}

export interface Roll {
  exact: number;
}

export enum TentacledType {
  Cell = 'cell',
}

export enum FluffType {
  Entries = 'entries',
  Inset = 'inset',
  Quote = 'quote',
  Section = 'section',
}

export enum FluffSource {
  Erlw = 'ERLW',
  Phb = 'PHB',
  UAArtificerRevisited = 'UAArtificerRevisited',
  Xge = 'XGE',
}

export interface Multiclassing {
  requirements: Requirements;
  proficienciesGained?: StartingProficiencies;
}

export interface StartingProficiencies {
  armor?: Array<ArmorClass | ArmorEnum>;
  weapons?: string[];
  skills?: Skill[];
  tools?: string[];
}

export interface ArmorClass {
  proficiency: ArmorEnum;
  full: string;
}

export enum ArmorEnum {
  Heavy = 'heavy',
  Light = 'light',
  Medium = 'medium',
  Shields = 'shields',
}

export interface Skill {
  choose: Choose;
}

export interface Choose {
  from: string[];
  count: number;
}

export interface Requirements {
  int?: number;
  cha?: number;
  dex?: number;
  wis?: number;
  str?: number;
  or?: Or[];
}

export interface Or {
  str: number;
  dex: number;
}

export interface StartingEquipment {
  additionalFromBackground: boolean;
  default: string[];
  goldAlternative?: string;
}

export interface ClassSubclass {
  name: string;
  shortName: string;
  source: string;
  subclassFeatures: Array<SubclassFeature[]>;
  srd?: boolean;
  isReprinted?: boolean;
  page?: number;
  spellcastingAbility?: SpellcastingAbility;
  casterProgression?: string;
  subclassTableGroups?: SubclassTableGroup[];
}

export interface SubclassFeature {
  name?: string;
  entries: Array<HilariousEntry | string>;
}

export interface HilariousEntry {
  type: ClassFeatureType;
  name?: string;
  entries?: Array<AmbitiousEntry | string>;
  caption?: string;
  colLabels?: string[];
  colStyles?: FluffyColStyle[];
  rows?: Array<string[]>;
  source?: EntrySource;
  page?: number;
}

export enum FluffyColStyle {
  Col10 = 'col-10',
  Col11 = 'col-11',
  Col1TextCenter = 'col-1 text-center',
  Col2TextCenter = 'col-2 text-center',
  Col3TextCenter = 'col-3 text-center',
  Col6 = 'col-6',
  Col9 = 'col-9',
}

export interface AmbitiousEntry {
  type: ClassFeatureType;
  caption?: string;
  colLabels?: string[];
  colStyles?: PurpleColStyle[];
  rows?: Array<Array<number | string>>;
  items?: Array<ItemClass | string>;
  name?: string;
  entries?: Array<CunningEntry | string>;
  style?: string;
  data?: Data;
  footnotes?: string[];
  attributes?: SpellcastingAbility[];
}

export interface Data {
  tableInclude: boolean;
}

export interface CunningEntry {
  type: ClassFeatureType;
  name?: string;
  entries?: Array<MagentaEntry | string>;
  style?: string;
  items?: ItemClass[];
  attributes?: SpellcastingAbility[];
  source?: string;
  page?: number;
  caption?: string;
  colLabels?: string[];
  colStyles?: string[];
  rows?: Array<Array<number | string>>;
}

export interface MagentaEntry {
  type: ClassFeatureType;
  name?: string;
  attributes?: SpellcastingAbility[];
  entries?: string[];
  items?: string[];
}

export interface ItemClass {
  type: ItemType;
  name: string;
  entry: string;
}

export enum ItemType {
  Item = 'item',
}

export interface SubclassTableGroup {
  subclasses: EntrySubclass[];
  colLabels: string[];
  rows: Array<number[]>;
  title?: Title;
}
