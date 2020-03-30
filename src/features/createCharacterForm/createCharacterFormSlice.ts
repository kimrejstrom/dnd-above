import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Race } from 'models/race';
import { ClassElement, ClassSubclass } from 'models/class';
import { BackgroundElement } from 'models/background';

export interface CreateCharacterFormState {
  data: {
    race?: Race;
    classElement?: ClassElement;
    subClass?: ClassSubclass;
    firstName?: string;
    lastName?: string;
    name?: string;
    background?: BackgroundElement;
    abilities?: string[];
    abilityScores?: any;
  };
}

const initialState: CreateCharacterFormState = {
  data: {},
};

const createCharacterFormSlice = createSlice({
  name: 'createCharacterForm',
  initialState: initialState,
  reducers: {
    updateFormData(state, action: PayloadAction<any>) {
      state.data = {
        ...state.data,
        ...action.payload,
      };
    },
  },
});

export const { updateFormData } = createCharacterFormSlice.actions;

export default createCharacterFormSlice.reducer;
