import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CharacterBase } from 'features/character/characterListSlice';
import { CharacterListItem } from 'features/character/characterListSlice';

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
      name: 'Justin Tyme',
      background: '',
      alignment: '',
      characteristicsSource: '',
      imageUrl: `${process.env.PUBLIC_URL}/img/races/default.png`,
      hair: 'Brown',
      skin: 'Fair',
      eyes: 'Blue',
      height: '182cm',
      weight: '85kg',
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
    equipmentData: {
      items: [],
    },
  },
};

const createCharacterFormSlice = createSlice({
  name: 'createCharacterForm',
  initialState: initialState,
  reducers: {
    setInitialFormData: state => initialState,
    loadInitialFormData(state, action: PayloadAction<CharacterListItem>) {
      const character = action.payload;
      const formState: CreateCharacterFormState = {
        data: {
          id: character.id,
          raceData: character.raceData,
          classData: character.classData,
          descriptionData: character.descriptionData,
          equipmentData: character.equipmentData,
        },
      };
      return formState;
    },
    updateFormData(state, action: PayloadAction<any>) {
      Object.entries<Partial<CharacterBase>>(action.payload).map(
        ([key, value]) =>
          ((state.data as any)[key] = {
            ...(state.data as any)[key],
            ...(value as any),
          }),
      );
    },
  },
});

export const {
  updateFormData,
  setInitialFormData,
  loadInitialFormData,
} = createCharacterFormSlice.actions;

export default createCharacterFormSlice.reducer;
