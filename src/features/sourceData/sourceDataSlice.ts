import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from 'app/rootReducer';
import { AppDispatch } from 'app/store';
import { ActionElement } from 'models/actions';
import { BackgroundElement } from 'models/background';
import { BackgroundFluffElement } from 'models/background-fluff';
import { Monster } from 'models/bestiary';
import { MonsterFluff } from 'models/bestiary-fluff';
import { ClassTypes } from 'models/class';
import { Condition, Disease, Status } from 'models/conditions';
import { FeatElement } from 'models/feats';
import { LanguageElement } from 'models/language';
import { Optionalfeature } from 'models/optional-feature';
import { Race } from 'models/race';
import { RaceFluffElement } from 'models/race-fluff';
import { SpellElement } from 'models/spells';
import {
  CommonItem,
  loadBackgrounds,
  loadBestiary,
  loadClasses,
  loadItems,
  loadMisc,
  loadRaces,
  loadSpells,
} from 'utils/data';

export interface SourceData {
  spells: SpellElement[];
  allClasses: ClassTypes;
  races: Race[];
  racesFluff: RaceFluffElement[];
  backgrounds: BackgroundElement[];
  backgroundsFluff: BackgroundFluffElement[];
  allItems: CommonItem[];
  actions: ActionElement[];
  feats: FeatElement[];
  languages: LanguageElement[];
  optionalFeatures: Optionalfeature[];
  conditionsDiseases: (Condition | Disease | Status)[];
  bestiary: Monster[];
  bestiaryFluff: MonsterFluff[];
}

interface SourceDataState {
  hydrated: boolean;
  sourceData: SourceData;
  error?: string;
}

const initialState: SourceDataState = {
  hydrated: false,
  sourceData: {
    spells: [],
    allClasses: {} as ClassTypes,
    races: [],
    racesFluff: [],
    backgrounds: [],
    backgroundsFluff: [],
    allItems: [],
    actions: [],
    feats: [],
    languages: [],
    optionalFeatures: [],
    conditionsDiseases: [],
    bestiary: [],
    bestiaryFluff: [],
  },
};

export const loadSourceData = createAsyncThunk<
  SourceData,
  undefined,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('sourceData/loadSourceData', async (_, thunkAPI) => {
  try {
    // Load the sourceData
    const [
      spells,
      { allClasses },
      { races, racesFluff },
      { backgrounds, backgroundsFluff },
      { allItems },
      { actions, feats, languages, optionalFeatures, conditionsDiseases },
      { bestiary, bestiaryFluff },
    ] = await Promise.all([
      loadSpells(),
      loadClasses(),
      loadRaces(),
      loadBackgrounds(),
      loadItems(),
      loadMisc(),
      loadBestiary(),
    ]);

    return {
      spells,
      allClasses,
      races,
      racesFluff,
      backgrounds,
      backgroundsFluff,
      allItems,
      actions,
      feats,
      languages,
      optionalFeatures,
      conditionsDiseases,
      bestiary,
      bestiaryFluff,
    } as SourceData;
  } catch (error) {
    return thunkAPI.rejectWithValue('Error loading SourceData');
  }
});

const sourceDataSlice = createSlice({
  name: 'sourceData',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(loadSourceData.fulfilled, (state, { payload }) => {
      if (state.hydrated === false) {
        state.hydrated = true;
      }
      state.sourceData = payload;
    });
    builder.addCase(loadSourceData.rejected, (state, { payload }) => {
      state.hydrated = false;
      state.error = payload as string;
    });
  },
});

export default sourceDataSlice.reducer;
