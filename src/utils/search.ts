import { uniqBy } from 'lodash';
import {
  getAction,
  getActions,
  getAllItems,
  getBackground,
  getBackgroundFluff,
  getBackgrounds,
  getBackgroundsFluff,
  getClass,
  getClassFeature,
  getClassFeatures,
  getFeat,
  getFeats,
  getItem,
  getLanguage,
  getLanguages,
  getOptionalFeature,
  getOptionalFeatures,
  getPlayableClasses,
  getRace,
  getRaces,
  getRacesFluff,
  getSpell,
  getSpells,
  getSubClass,
  getSubClassFeature,
  getSubClassFeatures,
  getSubRace,
} from 'utils/sourceDataUtils';
import { filterSources } from 'utils/data';
import {
  RenderClass,
  RenderItem,
  RenderLanguage,
  RenderRace,
  RenderSpell,
  RenderSubClass,
} from 'utils/render';

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
  OptionalFeature,
  Unknown,
}

export interface SourceDataFuseItem {
  name: string;
  src: string;
  page: number;
  baseName?: string;
  type: ResultType;
}

export function initializeSearch() {
  // Setup search
  let fuseIndex: Array<SourceDataFuseItem> = [];

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
  uniqBy(getLanguages(), 'name')?.forEach(lang => {
    fuseIndex.push({
      name: lang.name,
      src: lang.source,
      page: lang.page ?? 0,
      type: ResultType.Language,
    });
  });

  // Index Optional Features
  getOptionalFeatures()?.forEach(feat => {
    fuseIndex.push({
      name: feat.name,
      src: feat.source,
      page: feat.page ?? 0,
      type: ResultType.OptionalFeature,
    });
  });

  return fuseIndex;
}

export function findSearchResultSourceData(
  searchResult: SourceDataFuseItem,
): { data: any; renderer?: any; jsx?: JSX.Element } {
  switch (searchResult.type) {
    case ResultType.Spell: {
      const spell = getSpell(searchResult.name);
      if (!spell) break;
      return { data: spell, renderer: RenderSpell(spell) };
    }

    case ResultType.Class: {
      const classElem = getClass(searchResult.name);
      if (!classElem) break;
      return { data: classElem, jsx: RenderClass(classElem!) };
    }

    case ResultType.ClassFeature: {
      const feature = getClassFeature(
        searchResult.baseName!,
        searchResult.name,
      );
      if (!feature) break;
      return { data: feature };
    }

    case ResultType.Subclass: {
      const classElem = getClass(searchResult.baseName!);
      const subclass = getSubClass(searchResult.baseName!, searchResult.name);
      if (!classElem || !subclass) break;
      return { data: subclass, jsx: RenderSubClass(classElem!, subclass!) };
    }

    case ResultType.SubclassFeature: {
      const feature = getSubClassFeature(
        searchResult.baseName!,
        searchResult.name,
      );
      if (!feature) break;
      return { data: feature };
    }

    case ResultType.Race: {
      const race = getRace(searchResult.name);
      if (!race) break;
      return {
        data: race,
        renderer: RenderRace(race!),
      };
    }

    case ResultType.RaceFluff: {
      const fluffs = getRacesFluff();
      if (!fluffs) break;
      return {
        data: fluffs!.find(fluff => fluff.name === searchResult.name),
      };
    }

    case ResultType.Subrace: {
      const subrace = getSubRace(searchResult.baseName!, searchResult.name);
      if (!subrace) break;
      return { data: subrace };
    }

    case ResultType.Background: {
      const bg = getBackground(searchResult.name);
      if (!bg) break;
      return { data: bg };
    }

    case ResultType.BackgroundFluff: {
      const bg = getBackgroundFluff(searchResult.name);
      if (!bg) break;
      return { data: bg };
    }

    case ResultType.Item: {
      const item = getItem(searchResult.name);
      if (!item) break;
      return { data: item, renderer: RenderItem(item) };
    }

    case ResultType.Action: {
      const action = getAction(searchResult.name);
      if (!action) break;
      return { data: action };
    }

    case ResultType.Feat: {
      const feat = getFeat(searchResult.name);
      if (!feat) break;
      return { data: feat };
    }

    case ResultType.Language: {
      const lang = getLanguage(searchResult.name);
      if (!lang) break;
      return { data: lang, renderer: RenderLanguage(lang!) };
    }

    case ResultType.OptionalFeature: {
      const optionalFeature = getOptionalFeature(searchResult.name);
      if (!optionalFeature) break;
      return { data: optionalFeature };
    }

    default:
      return { data: `No source data found for ${searchResult.name}` };
  }
  return { data: `No source data found for ${searchResult.name}` };
}
