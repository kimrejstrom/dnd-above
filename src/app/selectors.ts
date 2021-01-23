import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'app/rootReducer';
import { getCookie } from 'utils/cookie';

const getCharacterList = (state: RootState) => state.characterList;
const getSelectedCharacterId = (state: RootState) => state.selectedCharacter;
const getSourceDataSlice = (state: RootState) => state.sourceData;

export const getSelectedCharacter = createSelector(
  [getCharacterList, getSelectedCharacterId],
  (characterList, selectedCharacterId) => {
    return characterList.list.find(char => char.id === selectedCharacterId);
  },
);

export const getFilteredCharacterList = createSelector(
  [getCharacterList],
  characterList => {
    const allSources = getCookie('allSources') === 'true';
    const filteredCharacterList = characterList.list.filter(character => {
      if (!allSources) {
        return !character.allSources;
      }
      return true;
    });
    return filteredCharacterList;
  },
);

export const getSourceData = createSelector(
  [getSourceDataSlice],
  sourceData => {
    if (sourceData.hydrated) {
      return sourceData.sourceData;
    }
  },
);
