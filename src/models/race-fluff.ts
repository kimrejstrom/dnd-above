// Generated by https://quicktype.io

export interface RaceFluff {
  raceFluff: RaceFluffElement[];
  meta: Meta;
}

export interface Meta {
  uncommon: Uncommon;
  monstrous: Monstrous;
}

export interface Monstrous {
  name: string;
  type: string;
  entries: Array<PurpleEntry | string>;
}

export interface PurpleEntry {
  type: EntryType;
  name: string;
  entries: Array<FluffyEntry | string>;
}

export interface FluffyEntry {
  type: EntryType;
  colLabels: string[];
  colStyles: ColStyle[];
  rows: Array<string[]>;
}

export enum ColStyle {
  Col10 = 'col-10',
  Col2TextCenter = 'col-2 text-center',
}

export enum EntryType {
  Entries = 'entries',
  Image = 'image',
  Inset = 'inset',
  List = 'list',
  Quote = 'quote',
  Table = 'table',
}

export interface Uncommon {
  name: string;
  type: EntryType;
  entries: Array<TentacledEntry | string>;
}

export interface TentacledEntry {
  type: EntryType;
  name: string;
  entries: string[];
}

export interface RaceFluffElement {
  name: string;
  source: string;
  entries?: Array<StickyEntry | string>;
  images?: Image[];
  _excludeBaseImages?: boolean;
  uncommon?: boolean;
  monstrous?: boolean;
  type?: string;
  _excludeBaseEntries?: boolean;
}

export interface StickyEntry {
  type: EntryType;
  name?: string;
  entries?: Array<IndigoEntry | string>;
  by?: string;
  style?: Style;
  items?: Item[];
  caption?: string;
  colLabels?: string[];
  colStyles?: ColStyle[];
  rows?: Array<string[]>;
}

export interface IndigoEntry {
  type: EntryType;
  name?: string;
  entries?: Array<IndecentEntry | string>;
  style?: Style;
  items?: Item[];
  colLabels?: string[];
  colStyles?: ColStyle[];
  rows?: Array<string[]>;
  caption?: string;
  href?: Href;
  title?: string;
}

export interface IndecentEntry {
  type: EntryType;
  style?: Style;
  items?: Item[];
  name?: string;
  entries?: string[];
}

export interface Item {
  type: ItemType;
  name: string;
  entry: string;
}

export enum ItemType {
  Item = 'item',
}

export enum Style {
  ListHangNotitle = 'list-hang-notitle',
}

export interface Href {
  type: HrefType;
  path: string;
}

export enum HrefType {
  Internal = 'internal',
}

export interface Image {
  type: EntryType;
  href: Href;
  title?: string;
}
