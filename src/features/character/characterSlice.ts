import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CLASSES, BACKGROUNDS } from 'utils/data';
import { RACES } from 'utils/data';
import { ClassElement } from 'models/class';
import { Race, Subrace } from 'models/race';
import { BackgroundElement } from 'models/background';
import { CreateCharacterFormState } from 'features/createCharacterForm/createCharacterFormSlice';

export const CHARACTER_STATS = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};

export type StatsTypes = keyof typeof CHARACTER_STATS;

export interface CharacterState {
  name: string;
  class: ClassElement;
  subClass: string;
  level: number;
  race: Race;
  subRace: Subrace;
  background: BackgroundElement;
  stats: Record<StatsTypes, number>;
}

const initialState: CharacterState = {
  name: 'Moe Glee The Minionmancer',
  class: CLASSES.druid.class[0],
  subClass: 'Shepherd',
  level: 5,
  race: RACES.find(race => race.name === 'Halfling')!,
  subRace: RACES.find(race => race.name === 'Halfling')!.subraces?.find(
    subrace => subrace.name === 'Ghostwise',
  )!,
  background: BACKGROUNDS.find(
    background => background.name === 'Far Traveler',
  )!,
  stats: {
    str: 8,
    dex: 15,
    con: 17,
    int: 11,
    wis: 17,
    cha: 11,
  },
};

const characterSlice = createSlice({
  name: 'character',
  initialState: initialState,
  reducers: {
    levelUp(state) {
      state.level = state.level + 1;
    },
    levelDown(state) {
      state.level = state.level - 1;
    },
    setLevel(state, action: PayloadAction<number>) {
      state.level = action.payload;
    },
    createCharacter(state, action: PayloadAction<CreateCharacterFormState>) {
      state.name = action.payload.data.description?.name;
    },
  },
});

export const { levelUp, levelDown, setLevel } = characterSlice.actions;

export default characterSlice.reducer;
