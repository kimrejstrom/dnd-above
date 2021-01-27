import { uniqBy } from 'lodash';
import {
  getActions,
  getAllItems,
  getBackgrounds,
  getBackgroundsFluff,
  getClassFeatures,
  getFeats,
  getLanguages,
  getPlayableClasses,
  getRaces,
  getRacesFluff,
  getSpells,
  getSubClassFeatures,
} from 'utils/character';
import { filterSources } from 'utils/data';

export enum ResultType {
  Spell,
  Class,
  ClassFeature,
  Subclass,
  SubclassFeature,
  Race,
  RaceFluff,
  Subrace,
  Background,
  BackgroundFluff,
  Item,
  Action,
  Feat,
  Language,
}

export interface SourceDataFuseList {
  name: string;
  src: string;
  page: number;
  baseName?: string;
  type: ResultType;
}

export function initializeSearch() {
  // Setup search
  let fuseIndex: Array<SourceDataFuseList> = [];

  // Index Spells
  getSpells()?.forEach(spell => {
    fuseIndex.push({
      name: spell.name,
      src: spell.source,
      page: spell.page ?? 0,
      type: ResultType.Spell,
    });
  });

  // Index Classes
  getPlayableClasses()?.forEach(classElem => {
    fuseIndex.push({
      name: classElem.name,
      src: classElem.source,
      page: classElem.page ?? 0,
      type: ResultType.Class,
    });
    classElem.subclasses
      .filter(subclass => filterSources(subclass))
      .forEach(subclass => {
        fuseIndex.push({
          name: subclass.name,
          baseName: classElem.name,
          src: subclass.source,
          page: subclass.page ?? 0,
          type: ResultType.Subclass,
        });
        uniqBy(
          getSubClassFeatures(classElem.name, subclass.name),
          'name',
        ).forEach(feature => {
          fuseIndex.push({
            name: feature.name,
            baseName: feature.className,
            src: feature.source,
            page: feature.page ?? 0,
            type: ResultType.SubclassFeature,
          });
        });
      });
    uniqBy(getClassFeatures(classElem.name), 'name').forEach(feature => {
      fuseIndex.push({
        name: feature.name,
        baseName: feature.className,
        src: feature.source,
        page: feature.page ?? 0,
        type: ResultType.ClassFeature,
      });
    });
  });

  // Index Races
  getRaces()?.forEach(race => {
    fuseIndex.push({
      name: race.name,
      src: race.source,
      page: race.page ?? 0,
      type: ResultType.Race,
    });
    if (race.subraces) {
      race.subraces.forEach(subrace => {
        if (subrace.name) {
          fuseIndex.push({
            name: subrace.name,
            baseName: race.name,
            src: race.source,
            page: race.page ?? 0,
            type: ResultType.Subrace,
          });
        }
      });
    }
  });

  getRacesFluff()?.forEach(raceFluff => {
    fuseIndex.push({
      name: raceFluff.name,
      src: raceFluff.source,
      page: 0,
      type: ResultType.RaceFluff,
    });
  });

  // Index Backgrounds
  getBackgrounds()?.forEach(background => {
    fuseIndex.push({
      name: background.name,
      src: background.source,
      page: background.page ?? 0,
      type: ResultType.Background,
    });
  });

  getBackgroundsFluff()?.forEach(backgroundFluff => {
    fuseIndex.push({
      name: backgroundFluff.name,
      src: backgroundFluff.source,
      page: 0,
      type: ResultType.BackgroundFluff,
    });
  });

  // Index Items
  getAllItems()?.forEach(item => {
    fuseIndex.push({
      name: item.name,
      src: item.source,
      page: item.page ?? 0,
      type: ResultType.Item,
    });
  });

  // Index Actions
  getActions()?.forEach(action => {
    fuseIndex.push({
      name: action.name,
      src: action.source,
      page: action.page ?? 0,
      type: ResultType.Action,
    });
  });

  // Index Feats
  getFeats()?.forEach(feat => {
    fuseIndex.push({
      name: feat.name,
      src: feat.source,
      page: feat.page ?? 0,
      type: ResultType.Feat,
    });
  });

  // Index Languages
  getLanguages()?.forEach(lang => {
    fuseIndex.push({
      name: lang.name,
      src: lang.source,
      page: lang.page ?? 0,
      type: ResultType.Language,
    });
  });

  return fuseIndex;
}
