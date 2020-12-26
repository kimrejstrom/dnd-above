import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const selectedCharacterSlice = createSlice({
  name: 'character',
  initialState: '',
  reducers: {
    setSelectedCharacter(state, action: PayloadAction<string>) {
      return action.payload;
    },
  },
});

export const { setSelectedCharacter } = selectedCharacterSlice.actions;

export default selectedCharacterSlice.reducer;
