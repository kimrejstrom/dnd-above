import { createSlice } from '@reduxjs/toolkit';

interface DetailedEntryState {
  selectedEntry?: JSX.Element;
}

const initialState: DetailedEntryState = {
  selectedEntry: undefined,
};

const detailedEntrySlice = createSlice({
  name: 'detailedEntry',
  initialState: initialState,
  reducers: {
    setDetailedEntry(state, action) {
      state.selectedEntry = action.payload;
    },
  },
});

export const { setDetailedEntry } = detailedEntrySlice.actions;

export default detailedEntrySlice.reducer;
