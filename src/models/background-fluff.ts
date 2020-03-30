// Generated by https://quicktype.io

export interface BackgroundFluff {
  backgroundFluff: BackgroundFluffElement[];
}

export interface BackgroundFluffElement {
  name: string;
  source: string;
  entries: Array<PurpleEntry | string>;
  images?: Image[];
}

export interface PurpleEntry {
  type: string;
  name?: string;
  entries: Array<FluffyEntry | string>;
}

export interface FluffyEntry {
  type: Type;
  name: string;
  entries: Array<TentacledEntry | string>;
}

export interface TentacledEntry {
  type: Type;
  name: string;
  entries: string[];
}

export enum Type {
  Entries = 'entries',
}

export interface Image {
  type: string;
  href: Href;
}

export interface Href {
  type: string;
  path: string;
}
