import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Race } from 'models/race';
import { ClassElement, ClassSubclass } from 'models/class';
import { BackgroundElement } from 'models/background';
import { StatsTypes } from 'features/character/characterSlice';
import { SkillTypes } from 'features/character/Skills';
import { Item, BaseItem } from 'models/base-item';

export interface CreateCharacterFormState {
  data: {
    race?: Race;
    chosenRaceAbilities?: StatsTypes[];
    chosenRaceProficiencies?: SkillTypes[];
    chosenRaceLanguages?: string[];
    classElement?: ClassElement;
    subClass?: ClassSubclass;
    chosenClassProficiencies?: SkillTypes[];
    abilityScores?: Record<StatsTypes, number> & { rollMethod: string };
    description?: {
      name: string;
      background: BackgroundElement;
      alignment: string;
      characteristicsSource: string;
      imageUrl: string;
      hair: string;
      skin: string;
      eyes: string;
      height: string;
      weight: string;
      age: string;
      backstory: string;
      chosenBackgroundSkillProficiencies: SkillTypes[];
      chosenBackgroundLanguageProficiencies: string[];
      characteristicsPersonalityTrait: string;
      characteristicsIdeal: string;
      characteristicsBond: string;
      characteristicsFlaw: string;
    };
    equipment?: (Item | BaseItem)[];
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
