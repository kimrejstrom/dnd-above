import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MainTabsState {
  selectedIndex: number;
}

const initialState: MainTabsState = {
  selectedIndex: 0,
};

const mainTabsSlice = createSlice({
  name: 'character',
  initialState: initialState,
  reducers: {
    setSelectIndex(state, action: PayloadAction<number>) {
      state.selectedIndex = action.payload;
    },
  },
});

export const { setSelectIndex } = mainTabsSlice.actions;

export default mainTabsSlice.reducer;
