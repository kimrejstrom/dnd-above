import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  CharacterBase,
  generateID,
} from 'features/character/characterListSlice';
import { CharacterListItem } from 'features/character/characterListSlice';

export interface CreateCharacterFormState {
  data: CharacterBase;
}

const initialState: CreateCharacterFormState = {
  data: {
    id: generateID(),
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
        str: 0,
        dex: 0,
        con: 0,
        int: 0,
        wis: 0,
        cha: 0,
        rollMethod: '',
      },
    },
    descriptionData: {
      name: '',
      background: '',
      alignment: '',
      characteristicsSource: '',
      imageUrl: `${process.env.PUBLIC_URL}/img/races/default.png`,
      hair: '',
      skin: '',
      eyes: '',
      height: '',
      weight: '',
      age: '',
      backstory: '',
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
    setGeneratedFormData(state, action: PayloadAction<CharacterBase>) {
      state.data = action.payload;
    },
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
  setGeneratedFormData,
  loadInitialFormData,
} = createCharacterFormSlice.actions;

export default createCharacterFormSlice.reducer;
