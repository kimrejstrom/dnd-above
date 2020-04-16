import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_ID } from 'features/character/characterListSlice';

const selectedCharacterSlice = createSlice({
  name: 'character',
  initialState: DEFAULT_ID,
  reducers: {
    setSelectedCharacter(state, action: PayloadAction<string>) {
      return action.payload;
    },
  },
});

export const { setSelectedCharacter } = selectedCharacterSlice.actions;

export default selectedCharacterSlice.reducer;
