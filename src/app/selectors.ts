import { createSelector } from '@reduxjs/toolkit';
import { DEAFULT_CHARACTER } from 'features/character/characterListSlice';
import { RootState } from 'app/rootReducer';

const getCharacterList = (state: RootState) => state.characterList;
const getSelectedCharacterId = (state: RootState) => state.selectedCharacter;

export const getSelectedCharacter = createSelector(
  [getCharacterList, getSelectedCharacterId],
  (characterList, selectedCharacterId) => {
    return (
      characterList.list.find(char => char.id === selectedCharacterId) ||
      DEAFULT_CHARACTER
    );
  },
);
