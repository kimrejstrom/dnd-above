import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CreateCharacterFormState } from 'features/createCharacterForm/createCharacterFormSlice';
import { SkillTypes } from 'features/character/Skills';
import { Item, BaseItem } from 'models/base-item';
import { ArmorEnum } from 'models/class';
import {
  getRace,
  getClass,
  getBackground,
  getIncludedProficiencies,
} from 'utils/character';
import _ from 'lodash';
import { AbilityBase } from 'models/race';

export const CHARACTER_STATS = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};

export type StatsTypes = keyof typeof CHARACTER_STATS;

export interface CharacterBase {
  id?: string;
  raceData: {
    race: string;
    chosenRaceAbilities: AbilityBase[];
    standardRaceAbilities: AbilityBase[];
    chosenRaceSkillProficiencies: SkillTypes[];
    standardRaceSkillProficiencies: SkillTypes[];
    chosenRaceLanguages: string[];
    standardRaceLanguages: string[];
  };
  classData: {
    classElement: string;
    subClass: string;
    chosenClassSkillProficiencies: SkillTypes[];
    standardClassArmorProficiencies: string[];
    standardClassWeaponProficiencies: string[];
    standardClassToolProficiencies: string[];
    abilityScores: Record<StatsTypes, number> & { rollMethod: string };
  };
  descriptionData: {
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
    standardBackgroundSkillProficiencies: SkillTypes[];
    chosenBackgroundToolProficiencies: string[];
    standardBackgroundToolProficiencies: string[];
    chosenBackgroundLanguages: string[];
    standardBackgroundLanguages: string[];
    characteristicsPersonalityTrait: string;
    characteristicsIdeal: string;
    characteristicsBond: string;
    characteristicsFlaw: string;
  };
  equipmentData: {
    items: (Item | BaseItem)[];
  };
}

export interface CharacterCustom {
  customData: {
    level: number;
    feats: string[];
    customAbilities: StatsTypes[];
    customSkillProficiencies: SkillTypes[];
    customArmorProficiencies: Array<ArmorEnum>;
    customWeaponProficiencies: string[];
    customToolProficiencies: string[];
    customLanguages: string[];
  };
}

export type CharacterState = CharacterBase & CharacterCustom;
export interface CharacterListItem extends CharacterState {
  id: string;
}
export type CharacterList = Array<CharacterListItem>;
export const DEFAULT_ID = 'id-DEFAULT';
export const DEAFULT_CHARACTER = {
  id: DEFAULT_ID,
  raceData: {
    race: 'Halfling (Ghostwise)',
    chosenRaceAbilities: [],
    standardRaceAbilities: [],
    chosenRaceSkillProficiencies: [],
    standardRaceSkillProficiencies: [],
    chosenRaceLanguages: [],
    standardRaceLanguages: [],
  },
  classData: {
    classElement: 'Druid',
    subClass: 'Circle of the Shepherd',
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
    name: 'Justin Thyme',
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
  equipmentData: {
    items: [],
  },
  customData: {
    level: 1,
    feats: [],
    customAbilities: [],
    customSkillProficiencies: [],
    customArmorProficiencies: [],
    customWeaponProficiencies: [],
    customToolProficiencies: [],
    customLanguages: [],
  },
};

const initialState: CharacterList = [DEAFULT_CHARACTER];

const generateID = () =>
  `id-${Math.random()
    .toString(16)
    .slice(2)}`;

const characterListSlice = createSlice({
  name: 'characterList',
  initialState,
  reducers: {
    addCharacter: {
      reducer(
        state,
        action: PayloadAction<CreateCharacterFormState & { id: string }>,
      ) {
        const { id, ...character } = action.payload;
        const raceElement = getRace(character.data.raceData.race);
        const classElement = getClass(character.data.classData.classElement);
        const backgroundElement = getBackground(
          character.data.descriptionData.background,
        );
        const newCharacter: CharacterListItem = {
          id,
          raceData: {
            ...character.data.raceData,
            standardRaceAbilities: raceElement?.ability
              ? [_.omit(raceElement?.ability[0], 'choose')]
              : [],
            standardRaceSkillProficiencies: getIncludedProficiencies(
              raceElement?.skillProficiencies!,
            ) as SkillTypes[],
            standardRaceLanguages: getIncludedProficiencies(
              raceElement?.languageProficiencies!,
            ),
          },
          classData: {
            ...character.data.classData,
            standardClassArmorProficiencies:
              classElement?.startingProficiencies.armor! || [],
            standardClassWeaponProficiencies:
              classElement?.startingProficiencies.weapons! || [],
            standardClassToolProficiencies: getIncludedProficiencies(
              classElement?.startingProficiencies?.tools!,
            ),
          },
          descriptionData: {
            ...character.data.descriptionData,
            standardBackgroundSkillProficiencies: getIncludedProficiencies(
              backgroundElement?.skillProficiencies!,
            ) as SkillTypes[],
            standardBackgroundToolProficiencies: getIncludedProficiencies(
              backgroundElement?.toolProficiencies!,
            ),
            standardBackgroundLanguages: getIncludedProficiencies(
              backgroundElement?.languageProficiencies!,
            ),
          },
          equipmentData: {
            items: character.data.equipmentData.items,
          },
          customData: {
            level: 1,
            feats: [],
            customAbilities: [],
            customSkillProficiencies: [],
            customArmorProficiencies: [],
            customWeaponProficiencies: [],
            customToolProficiencies: [],
            customLanguages: [],
          },
        };
        state.push({ id, ...newCharacter });
      },
      prepare(payload: CreateCharacterFormState) {
        return { payload: { id: generateID(), ...payload } };
      },
    },
    updateCharacter(state, action: PayloadAction<CreateCharacterFormState>) {
      const character = state.find(char => char.id === action.payload.data.id);
      if (character) {
        character.raceData = {
          ...character.raceData,
          ...action.payload.data.raceData,
        };
        character.classData = {
          ...character.classData,
          ...action.payload.data.classData,
        };
        character.descriptionData = {
          ...character.descriptionData,
          ...action.payload.data.descriptionData,
        };
        character.equipmentData = {
          ...character.equipmentData,
          ...action.payload.data.equipmentData,
        };
      }
    },
    removeCharacter(state, action: PayloadAction<string>) {
      state.filter(item => item.id !== action.payload);
    },
  },
  //   extraReducers: builder => {
  //     builder.addCase(createCharacter, (state, action) => {
  //       addCharacter(action.payload);
  //     });
  //   },
});

export const {
  addCharacter,
  updateCharacter,
  removeCharacter,
} = characterListSlice.actions;

export default characterListSlice.reducer;
