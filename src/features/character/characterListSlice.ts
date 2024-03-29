import {
  createAsyncThunk,
  createSlice,
  isAsyncThunkAction,
  PayloadAction,
} from '@reduxjs/toolkit';
import {
  CreateCharacterFormState,
  generateID,
} from 'features/createCharacterForm/createCharacterFormSlice';
import { SkillTypes } from 'features/character/Skills';
import { ArmorEnum, ClassElement } from 'models/class';
import {
  getIncludedProficiencies,
  mapArmorProficiencies,
} from 'utils/character';
import _ from 'lodash';
import { AbilityBase, Race } from 'models/race';
import { getCookie } from 'utils/cookie';
import { BackgroundElement } from 'models/background';
import { RootState } from 'app/rootReducer';
import { AppDispatch } from 'app/store';
import DnDAboveAPI from 'utils/api';
import { SourceDataFuseItem } from 'utils/search';
import { doMigrations } from 'utils/migrations';

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
  id: string;
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
    items: string[];
  };
}

export interface CharacterCustom {
  allSources: boolean;
  customData: {
    customAbilities: AbilityBase[];
    customSkillProficiencies: SkillTypes[];
    customArmorProficiencies: Array<ArmorEnum>;
    customWeaponProficiencies: string[];
    customToolProficiencies: string[];
    customSavingThrowProficiencies: StatsTypes[];
    customLanguages: string[];
  };
}

export enum DefenseType {
  Resistance = 'Resistance',
  Immunity = 'Immunity',
  Vulnerability = 'Vulnerability',
}

export interface CharacterGameData {
  gameData: {
    level: number;
    feats: string[];
    conditions: string[];
    defenses: { type: DefenseType; name: string }[];
    spells: string[];
    inspiration: boolean;
    attunements: string[];
    actions: any[];
    extras: any[];
    ac: number;
    currentHp: number;
    currentHd: number;
    spellSlots?: Record<
      number,
      {
        used: number;
      }
    >;
  };
}

export interface Note {
  id: string;
  title: string;
  entry: string;
  createdAt: number;
  updatedAt?: number;
}

export interface ExtrasItem extends SourceDataFuseItem {
  userNotes?: string;
  rating?: number;
}

export interface CharacterMiscData {
  miscData?: {
    notes: Note[];
    extras: ExtrasItem[];
  };
}

export type CharacterListItem = CharacterBase &
  CharacterCustom &
  CharacterGameData &
  CharacterMiscData;

export type CharacterList = {
  id: string;
  loading: 'idle' | 'pending' | 'error';
  list: Array<CharacterListItem>;
  error?: string;
  updatedAt: number;
};

const initialState: CharacterList = {
  id: 'NOT_SAVED_YET',
  loading: 'idle',
  list: [],
  updatedAt: Date.now(),
};

// Async Thunks
export const CHARACTERLIST_SLICE = 'characterList';
export const BACKGROUND_SAVE_ACTION = `${CHARACTERLIST_SLICE}/backgroundSave`;
export const BACKGROUND_CREATE_ACTION = `${CHARACTERLIST_SLICE}/backgroundCreate`;
export const GET_LIST_ACTION = `${CHARACTERLIST_SLICE}/getList`;

export const backgroundCreate: any = createAsyncThunk<
  any,
  undefined,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>(BACKGROUND_CREATE_ACTION, async (_, thunkAPI) => {
  const response = await DnDAboveAPI.create(thunkAPI.getState().characterList);
  if (response.status >= 400) {
    return thunkAPI.rejectWithValue(await response.json());
  }
  return await response.json();
});

export const backgroundSave: any = createAsyncThunk<
  any,
  undefined,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>(
  BACKGROUND_SAVE_ACTION,
  async (_, thunkAPI) => {
    const response = await DnDAboveAPI.update(
      thunkAPI.getState().characterList,
    );
    if (response.status >= 400) {
      return thunkAPI.rejectWithValue(await response.json());
    }
    return await response.json();
  },
  {
    condition: (_, { getState }) => {
      const { characterList } = getState();
      const fetchStatus = characterList.loading;
      if (fetchStatus === 'pending') {
        // Already fetching, don't need to re-fetch
        return false;
      }
    },
  },
);

export const getCharacterList = createAsyncThunk<
  any,
  undefined,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>(
  GET_LIST_ACTION,
  async (_, thunkAPI) => {
    const response = await DnDAboveAPI.readAll();

    if (response.status === 404) {
      thunkAPI.dispatch(backgroundCreate());
      return thunkAPI.rejectWithValue(await response.json());
    }
    if (response.status >= 400) {
      return thunkAPI.rejectWithValue(await response.json());
    }
    return await response.json();
  },
  {
    condition: (_, { getState }) => {
      const { characterList } = getState();
      const fetchStatus = characterList.loading;
      if (fetchStatus === 'pending') {
        // Already fetching, don't need to re-fetch
        return false;
      }
    },
  },
);

const isARequestAction = isAsyncThunkAction(
  getCharacterList,
  backgroundSave,
  backgroundCreate,
);

const characterListSlice = createSlice({
  name: CHARACTERLIST_SLICE,
  initialState,
  reducers: {
    addCharacter(
      state,
      action: PayloadAction<{
        formState: CreateCharacterFormState;
        sourceData: {
          raceElement: Race;
          classElement: ClassElement;
          backgroundElement: BackgroundElement;
        };
      }>,
    ) {
      const { formState, sourceData } = action.payload;
      const { id, ...character } = formState.data;
      const { raceElement, classElement, backgroundElement } = sourceData;
      const subClass = classElement!.subclasses.find(
        subclass => subclass.name === formState.data.classData.subClass,
      );
      const isSpellCaster =
        classElement.spellcastingAbility !== undefined ||
        subClass!.spellcastingAbility !== undefined;
      const allSources = getCookie('allSources') === 'true';
      const newCharacter: CharacterListItem = {
        id,
        allSources,
        raceData: {
          ...character.raceData,
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
          ...character.classData,
          standardClassArmorProficiencies: classElement?.startingProficiencies
            .armor
            ? mapArmorProficiencies(classElement?.startingProficiencies.armor)
            : [],
          standardClassWeaponProficiencies:
            classElement?.startingProficiencies.weapons! || [],
          standardClassToolProficiencies: getIncludedProficiencies(
            classElement?.startingProficiencies?.tools!,
          ),
        },
        descriptionData: {
          ...character.descriptionData,
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
          items: character.equipmentData.items,
        },
        customData: {
          customAbilities: [],
          customSkillProficiencies: [],
          customArmorProficiencies: [],
          customWeaponProficiencies: [],
          customToolProficiencies: [],
          customSavingThrowProficiencies: [],
          customLanguages: [],
        },
        gameData: {
          level: 1,
          feats: [],
          spells: [],
          conditions: [],
          defenses: [],
          attunements: [],
          actions: [],
          extras: [],
          inspiration: false,
          ac: 0,
          currentHp: 10,
          currentHd: 1,
          spellSlots: isSpellCaster
            ? {
                1: { used: 0 },
                2: { used: 0 },
                3: { used: 0 },
                4: { used: 0 },
                5: { used: 0 },
                6: { used: 0 },
                7: { used: 0 },
                8: { used: 0 },
                9: { used: 0 },
              }
            : undefined,
        },
        miscData: {
          notes: [],
          extras: [],
        },
      };
      state.list.push({ ...newCharacter });
    },
    updateCharacter(state, action: PayloadAction<CreateCharacterFormState>) {
      const character = state.list.find(
        char => char.id === action.payload.data.id,
      );
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
    replaceCharacter(
      state,
      action: PayloadAction<{
        id: string;
        character: CharacterListItem;
      }>,
    ) {
      const characterIndex = state.list.findIndex(
        chara => chara.id === action.payload.id,
      );
      if (characterIndex !== -1) {
        state.list[characterIndex] = action.payload.character;
      }
    },
    removeCharacter(state, action: PayloadAction<string>) {
      state.list = state.list.filter(item => item.id !== action.payload);
    },
    setInspiration(state, action: PayloadAction<{ id: string }>) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.gameData.inspiration = !character.gameData.inspiration;
      }
    },
    setAc(state, action: PayloadAction<{ id: string; ac: number }>) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        const amount = isNaN(Number(action.payload.ac))
          ? 0
          : Number(action.payload.ac);
        character.gameData.ac = amount;
      }
    },
    setHp(
      state,
      action: PayloadAction<{ id: string; hp: number; type: string }>,
    ) {
      const { id, hp, type } = action.payload;
      const character = state.list.find(chara => chara.id === id);
      if (character) {
        const amount = isNaN(Number(hp)) ? 0 : Number(hp);
        switch (type) {
          case 'heal':
            character.gameData.currentHp =
              character.gameData.currentHp + amount;
            break;

          case 'damage':
            character.gameData.currentHp =
              character.gameData.currentHp - amount;
            break;

          case 'set':
            character.gameData.currentHp = amount;
            break;

          default:
            break;
        }
      }
    },
    setCurrentHd(
      state,
      action: PayloadAction<{ id: string; currentHd: number }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.gameData.currentHd = Number(action.payload.currentHd);
      }
    },
    longRest(state, action: PayloadAction<{ id: string }>) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        const gainedHDs =
          character.gameData.currentHd +
            Math.ceil(Number(character.gameData.currentHd) / 2) || 1;
        character.gameData.currentHd = Math.min(
          gainedHDs,
          character.gameData.level,
        );
        const spellSlots = character.gameData.spellSlots;
        character.gameData.spellSlots = spellSlots
          ? Object.keys(spellSlots).reduce((acc: any, key) => {
              acc[key] = { ...(spellSlots as any)[key], used: 0 };
              return acc;
            }, {})
          : undefined;
      }
    },
    expendHitDie(state, action: PayloadAction<{ id: string; newHp: number }>) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.gameData.currentHd = character.gameData.currentHd - 1;
        character.gameData.currentHp = action.payload.newHp;
      }
    },
    addDefense(
      state,
      action: PayloadAction<{
        id: string;
        data: { type: DefenseType; name: string };
      }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.gameData.defenses.push(action.payload.data);
      }
    },
    removeDefense(
      state,
      action: PayloadAction<{
        id: string;
        data: { type: DefenseType; name: string };
      }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.gameData.defenses = character.gameData.defenses.filter(
          item =>
            !(
              action.payload.data.name === item.name &&
              action.payload.data.type === item.type
            ),
        );
      }
    },
    addCondition(
      state,
      action: PayloadAction<{
        id: string;
        data: string;
      }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.gameData.conditions.push(action.payload.data);
      }
    },
    removeCondition(
      state,
      action: PayloadAction<{
        id: string;
        data: string;
      }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.gameData.conditions = character.gameData.conditions.filter(
          item => item !== action.payload.data,
        );
      }
    },
    addFeat(
      state,
      action: PayloadAction<{
        id: string;
        data: string;
      }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.gameData.feats.push(action.payload.data);
      }
    },
    removeFeat(
      state,
      action: PayloadAction<{
        id: string;
        data: string;
      }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.gameData.feats = character.gameData.feats.filter(
          item => item !== action.payload.data,
        );
      }
    },
    expendSpellSlot(
      state,
      action: PayloadAction<{
        id: string;
        data: number;
      }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.gameData.spellSlots![action.payload.data].used =
          character.gameData.spellSlots![action.payload.data].used + 1;
      }
    },
    addSpellSlot(
      state,
      action: PayloadAction<{
        id: string;
        data: number;
      }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.gameData.spellSlots![action.payload.data].used =
          character.gameData.spellSlots![action.payload.data].used - 1;
      }
    },
    updateASI(
      state,
      action: PayloadAction<{
        id: string;
        data: AbilityBase;
      }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.customData.customAbilities = [
          {
            ...character.customData.customAbilities[0],
            ...action.payload.data,
          },
        ];
      }
    },
    addCustomProficiency(
      state,
      action: PayloadAction<{
        id: string;
        data: SkillTypes;
      }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.customData.customSkillProficiencies.push(action.payload.data);
      }
    },
    removeCustomProficiency(
      state,
      action: PayloadAction<{
        id: string;
        data: SkillTypes;
      }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.customData.customSkillProficiencies = character.customData.customSkillProficiencies.filter(
          item => item !== action.payload.data,
        );
      }
    },
    updateSpells(
      state,
      action: PayloadAction<{
        id: string;
        data: string[];
      }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.gameData.spells = action.payload.data;
      }
    },
    addItem(
      state,
      action: PayloadAction<{
        id: string;
        data: string;
      }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.equipmentData.items.push(action.payload.data);
      }
    },
    removeItem(
      state,
      action: PayloadAction<{
        id: string;
        data: string;
      }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.equipmentData.items = character.equipmentData.items.filter(
          item => item !== action.payload.data,
        );
      }
    },
    levelUp(state, action: PayloadAction<{ id: string }>) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        character.gameData.level = character.gameData.level + 1;
      }
    },
    addNote: {
      reducer: (state, action: PayloadAction<{ id: string; note: Note }>) => {
        const character = state.list.find(
          chara => chara.id === action.payload.id,
        );
        if (character) {
          if (character.miscData) {
            character.miscData.notes.push(action.payload.note);
          } else {
            character.miscData = {
              notes: [action.payload.note],
              extras: [],
            };
          }
        }
      },
      prepare: ({
        id,
        title,
        entry,
      }: {
        id: string;
        title: string;
        entry: string;
      }) => {
        const newNote: Note = {
          id: generateID(),
          title,
          entry,
          createdAt: Date.now(),
        };
        return { payload: { id, note: newNote } };
      },
    },
    updateNote(state, action: PayloadAction<{ id: string; note: Note }>) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character && character.miscData) {
        const noteIndex = character.miscData.notes.findIndex(
          note => note.id === action.payload.note.id,
        );
        if (noteIndex !== -1) {
          character.miscData.notes[noteIndex] = action.payload.note;
        }
      }
    },
    removeNote(
      state,
      action: PayloadAction<{
        id: string;
        noteId: string;
      }>,
    ) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character && character.miscData) {
        character.miscData.notes = character.miscData.notes.filter(
          note => note.id !== action.payload.noteId,
        );
      }
    },
    addExtra(state, action: PayloadAction<{ id: string; data: ExtrasItem }>) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character) {
        if (character.miscData) {
          const itemIndex = character.miscData.extras.findIndex(
            item => item.name === action.payload.data.name,
          );
          if (itemIndex !== -1) {
            character.miscData.extras[itemIndex] = action.payload.data;
          } else {
            character.miscData.extras.push(action.payload.data);
          }
        } else {
          character.miscData = {
            notes: [],
            extras: [action.payload.data],
          };
        }
      }
    },
    removeExtra(state, action: PayloadAction<{ id: string; name: string }>) {
      const character = state.list.find(
        chara => chara.id === action.payload.id,
      );
      if (character && character.miscData) {
        character.miscData.extras = character.miscData.extras.filter(
          extra => extra.name !== action.payload.name,
        );
      }
    },
  },
  extraReducers: builder => {
    // Reducers for additional action types here, and handle loading state as needed

    // backgroundCreate
    builder.addCase(backgroundCreate.pending, (state, { payload }) => {
      if (state.loading === 'idle') {
        state.loading = 'pending';
      }
    });
    builder.addCase(backgroundCreate.fulfilled, (state, { payload }) => {
      const { ref } = payload;
      if (state.loading === 'pending' || state.loading === 'error') {
        state.loading = 'idle';
        state.id = ref['@ref'].id;
      }
    });
    builder.addCase(backgroundCreate.rejected, (state, { payload }) => {
      if (state.loading === 'pending' || state.loading === 'error') {
        state.loading = 'error';
        state.error = payload ? payload?.message : 'Unknown error';
      }
    });

    // backgroundSave
    builder.addCase(backgroundSave.pending, (state, { payload }) => {
      if (state.loading === 'idle') {
        state.loading = 'pending';
      }
    });
    builder.addCase(backgroundSave.fulfilled, (state, { payload }) => {
      if (state.loading === 'pending' || state.loading === 'error') {
        state.loading = 'idle';
      }
    });
    builder.addCase(backgroundSave.rejected, (state, { payload }) => {
      if (state.loading === 'pending' || state.loading === 'error') {
        state.loading = 'error';
        state.error = payload ? payload?.message : 'Unknown error';
      }
    });

    // getCharacterList
    builder.addCase(getCharacterList.pending, (state, { payload }) => {
      if (state.loading === 'idle') {
        state.loading = 'pending';
      }
    });
    builder.addCase(getCharacterList.fulfilled, (state, { payload }) => {
      if (state.loading === 'pending' || state.loading === 'error') {
        state.loading = 'idle';
      }
      const { ref, data } = payload;
      if (state.id === ref['@ref'].id && state.updatedAt > data.updatedAt) {
        console.log('DB data outdated, using persisted data');
        console.log('Discarded DB data:', data.list);
      } else {
        state.id = ref['@ref'].id;
        if (data.list) {
          // do data migrations
          const migratedDataList = doMigrations(data.list);
          state.list = migratedDataList;
        } else {
          state.list = data.list;
        }
      }
    });
    builder.addCase(getCharacterList.rejected, (state, { payload }) => {
      if (state.loading === 'pending' || state.loading === 'error') {
        state.loading = 'error';
        state.error = (payload as any)
          ? (payload as any).message
          : 'Unknown error';
      }
    });
    builder.addMatcher(
      action =>
        action.type.startsWith('characterList') && !isARequestAction(action),
      (state, _) => {
        state.updatedAt = Date.now();
      },
    );
  },
});

export const {
  addCharacter,
  updateCharacter,
  removeCharacter,
  replaceCharacter,
  setAc,
  setHp,
  setInspiration,
  setCurrentHd,
  longRest,
  expendHitDie,
  addDefense,
  removeDefense,
  addCondition,
  removeCondition,
  expendSpellSlot,
  addSpellSlot,
  updateASI,
  addCustomProficiency,
  removeCustomProficiency,
  updateSpells,
  addItem,
  removeItem,
  levelUp,
  addFeat,
  removeFeat,
  addNote,
  updateNote,
  removeNote,
  addExtra,
  removeExtra,
} = characterListSlice.actions;

export default characterListSlice.reducer;
