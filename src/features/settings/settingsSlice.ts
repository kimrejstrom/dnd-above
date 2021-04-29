import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  animations: boolean;
  panelOpen: boolean;
}

const initialState: SettingsState = {
  animations: true,
  panelOpen: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState: initialState,
  reducers: {
    toggleAnimations(state, action: PayloadAction<boolean>) {
      state.animations = action.payload;
    },
    setPanelOpen(state) {
      state.panelOpen = true;
    },
    setPanelClose(state) {
      state.panelOpen = false;
    },
    togglePanel(state) {
      state.panelOpen = !state.panelOpen;
    },
  },
});

export const {
  toggleAnimations,
  setPanelOpen,
  setPanelClose,
  togglePanel,
} = settingsSlice.actions;

export default settingsSlice.reducer;
