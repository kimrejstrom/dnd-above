import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CharacterBase } from 'features/character/characterSlice';

export interface CreateCharacterFormState {
  data: CharacterBase;
}

const initialState: CreateCharacterFormState = {
  data: {
    raceData: {
      race: '',
      chosenRaceAbilities: [],
      standardRaceAbilities: [],
      chosenRaceSkillProficiencies: [],
      standardRaceSkillProficiencies: [],
      chosenRaceLanguages: [],
      standardRaceLanguages: [],
    },
    classData: {
      classElement: '',
      subClass: '',
      chosenClassSkillProficiencies: [],
      standardClassArmorProficiencies: [],
      standardClassWeaponProficiencies: [],
      standardClassToolProficiencies: [],
      abilityScores: {
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10,
        rollMethod: '',
      },
    },
    descriptionData: {
      name: 'Generic Man',
      background: '',
      alignment: '',
      characteristicsSource: '',
      imageUrl: `${process.env.PUBLIC_URL}/img/races/default.png`,
      hair: 'Brown',
      skin: 'Fair',
      eyes: 'Blue',
      height: '175cm',
      weight: '70kg',
      age: '40',
      backstory: 'None, yet.',
      chosenBackgroundSkillProficiencies: [],
      standardBackgroundSkillProficiencies: [],
      chosenBackgroundToolProficiencies: [],
      standardBackgroundToolProficiencies: [],
      chosenBackgroundLanguages: [],
      standardBackgroundLanguages: [],
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
      Object.entries(action.payload).map(
        ([key, value]) =>
          ((state.data as any)[key] = {
            ...(state.data as any)[key],
            ...(value as any),
          }),
      );
    },
  },
});

export const { updateFormData } = createCharacterFormSlice.actions;

export default createCharacterFormSlice.reducer;
