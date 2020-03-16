import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum TAB_PANELS {
  CHARACTER = 'CHARACTER',
  RIGHTPANEL = 'RIGHTPANEL',
}

export interface TabPanelConfig {
  selectedIndex: number;
}

export interface TabsState {
  tabPanels: {
    [key in TAB_PANELS]: TabPanelConfig;
  };
}

const initialState: TabsState = {
  tabPanels: {
    CHARACTER: { selectedIndex: 0 },
    RIGHTPANEL: { selectedIndex: 0 },
  },
};

const tabsSlice = createSlice({
  name: 'tabs',
  initialState: initialState,
  reducers: {
    setSelectedIndex(
      state,
      action: PayloadAction<{ [key in TAB_PANELS]?: TabPanelConfig }>,
    ) {
      state.tabPanels = {
        ...state.tabPanels,
        ...action.payload,
      };
    },
  },
});

export const { setSelectedIndex } = tabsSlice.actions;

export default tabsSlice.reducer;
