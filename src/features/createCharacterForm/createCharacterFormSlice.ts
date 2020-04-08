import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StatsTypes } from 'features/character/characterSlice';
import { SkillTypes } from 'features/character/Skills';
import { Item, BaseItem } from 'models/base-item';

export interface CreateCharacterFormState {
  data: {
    race: string;
    chosenRaceAbilities: StatsTypes[];
    chosenRaceProficiencies: SkillTypes[];
    chosenRaceLanguages: string[];
    classElement: string;
    subClass: string;
    chosenClassProficiencies: SkillTypes[];
    abilityScores: Record<StatsTypes, number> & { rollMethod: string };
    description: {
      name: string;
      background: string;
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
    equipment: (Item | BaseItem)[];
  };
}

const initialState: CreateCharacterFormState = {
  data: {
    race: '',
    chosenRaceAbilities: [],
    chosenRaceProficiencies: [],
    chosenRaceLanguages: [],
    classElement: '',
    subClass: '',
    chosenClassProficiencies: [],
    abilityScores: {
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10,
      rollMethod: 'none',
    },
    description: {
      name: 'Generic Man',
      background: 'Noble',
      alignment: 'LG',
      characteristicsSource: 'Noble',
      imageUrl: `${process.env.PUBLIC_URL}/img/races/default.png`,
      hair: 'Brown',
      skin: 'Fair',
      eyes: 'Blue',
      height: '175cm',
      weight: '70kg',
      age: '40',
      backstory: 'None, yet.',
      chosenBackgroundSkillProficiencies: [],
      chosenBackgroundLanguageProficiencies: [],
      characteristicsPersonalityTrait: '',
      characteristicsIdeal: '',
      characteristicsBond: '',
      characteristicsFlaw: '',
    },
    equipment: [],
  },
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
