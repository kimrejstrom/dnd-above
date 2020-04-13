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
  equipment: (Item | BaseItem)[];
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

const initialState: CharacterState = {
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

const characterSlice = createSlice({
  name: 'character',
  initialState: initialState,
  reducers: {
    levelUp(state) {
      state.customData.level = state.customData.level + 1;
    },
    levelDown(state) {
      state.customData.level = state.customData.level - 1;
    },
    setLevel(state, action: PayloadAction<number>) {
      state.customData.level = action.payload;
    },
    createCharacter(state, action: PayloadAction<CreateCharacterFormState>) {
      const raceElement = getRace(action.payload.data.raceData.race);
      const classElement = getClass(action.payload.data.classData.classElement);
      const backgroundElement = getBackground(
        action.payload.data.descriptionData.background,
      );
      state.raceData = {
        ...action.payload.data.raceData,
        standardRaceAbilities: raceElement?.ability
          ? [_.omit(raceElement?.ability[0], 'choose')]
          : [],
        standardRaceSkillProficiencies: getIncludedProficiencies(
          raceElement?.skillProficiencies!,
        ) as SkillTypes[],
        standardRaceLanguages: getIncludedProficiencies(
          raceElement?.languageProficiencies!,
        ),
      };
      state.classData = {
        ...action.payload.data.classData,
        standardClassArmorProficiencies:
          classElement?.startingProficiencies.armor! || [],
        standardClassWeaponProficiencies:
          classElement?.startingProficiencies.weapons! || [],
        standardClassToolProficiencies: getIncludedProficiencies(
          classElement?.startingProficiencies?.tools!,
        ),
      };
      state.descriptionData = {
        ...action.payload.data.descriptionData,
        standardBackgroundSkillProficiencies: getIncludedProficiencies(
          backgroundElement?.skillProficiencies!,
        ) as SkillTypes[],
        standardBackgroundToolProficiencies: getIncludedProficiencies(
          backgroundElement?.toolProficiencies!,
        ),
        standardBackgroundLanguages: getIncludedProficiencies(
          backgroundElement?.languageProficiencies!,
        ),
      };
      state.equipment = action.payload.data.equipment;
    },
  },
});

export const {
  levelUp,
  levelDown,
  setLevel,
  createCharacter,
} = characterSlice.actions;

export default characterSlice.reducer;
