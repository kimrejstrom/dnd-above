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

export interface FuseIndex {
  name: string;
  src: string;
  type: string;
  baseName?: string;
}

export function initializeSearch() {
  // Setup search
  let fuseIndex: Array<FuseIndex> = [];

  // Index Spells
  getSpells()?.forEach(spell => {
    fuseIndex.push({
      name: spell.name,
      src: spell.source,
      type: 'spellElement',
    });
  });

  // Index Classes
  getPlayableClasses()?.forEach(classElem => {
    fuseIndex.push({
      name: classElem.name,
      src: classElem.source,
      type: 'classElement',
    });
    classElem.subclasses.forEach(subclass => {
      fuseIndex.push({
        name: subclass.name,
        baseName: classElem.name,
        src: subclass.source,
        type: 'subclassElement',
      });
      uniqBy(
        getSubClassFeatures(classElem.name, subclass.name),
        'name',
      ).forEach(feature => {
        fuseIndex.push({
          name: feature.name,
          baseName: feature.className,
          src: feature.source,
          type: 'subclassFeature',
        });
      });
    });
    uniqBy(getClassFeatures(classElem.name), 'name').forEach(feature => {
      fuseIndex.push({
        name: feature.name,
        baseName: feature.className,
        src: feature.source,
        type: 'classFeature',
      });
    });
  });

  // Index Races
  getRaces()?.forEach(race => {
    fuseIndex.push({
      name: race.name,
      src: race.source,
      type: 'raceElement',
    });
    if (race.subraces) {
      race.subraces.forEach(subrace => {
        if (subrace.name) {
          fuseIndex.push({
            name: subrace.name,
            baseName: race.name,
            src: race.source,
            type: 'subraceElement',
          });
        }
      });
    }
  });

  getRacesFluff()?.forEach(raceFluff => {
    fuseIndex.push({
      name: raceFluff.name,
      src: raceFluff.source,
      type: 'raceFluffElement',
    });
  });

  // Index Backgrounds
  getBackgrounds()?.forEach(background => {
    fuseIndex.push({
      name: background.name,
      src: background.source,
      type: 'backgroundElement',
    });
  });

  getBackgroundsFluff()?.forEach(backgroundFluff => {
    fuseIndex.push({
      name: backgroundFluff.name,
      src: backgroundFluff.source,
      type: 'backgroundFluffElement',
    });
  });

  // Index Items
  getAllItems()?.forEach(item => {
    fuseIndex.push({
      name: item.name,
      src: item.source,
      type: 'itemElement',
    });
  });

  // Index Actions
  getActions()?.forEach(action => {
    fuseIndex.push({
      name: action.name,
      src: action.source,
      type: 'actionElement',
    });
  });

  // Index Feats
  getFeats()?.forEach(feat => {
    fuseIndex.push({
      name: feat.name,
      src: feat.source,
      type: 'featElement',
    });
  });

  // Index Languages
  getLanguages()?.forEach(lang => {
    fuseIndex.push({
      name: lang.name,
      src: lang.source,
      type: 'languageElement',
    });
  });

  console.log('initSearch: ', fuseIndex.length);
  return fuseIndex;
}
