import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from 'app/rootReducer';
import { AppDispatch } from 'app/store';
import { BackgroundElement } from 'models/background';
import { BackgroundFluffElement } from 'models/background-fluff';
import { ClassElement, ClassTypes } from 'models/class';
import { Race } from 'models/race';
import { RaceFluffElement } from 'models/race-fluff';
import { SpellElement } from 'models/spells';
import {
  loadBackgrounds,
  loadClasses,
  loadRaces,
  loadSpells,
} from 'utils/data';

interface SourceData {
  spells: SpellElement[];
  playableClasses: ClassElement[];
  allClasses: ClassTypes;
  races: Race[];
  racesFluff: RaceFluffElement[];
  backgrounds: BackgroundElement[];
  backgroundsFluff: BackgroundFluffElement[];
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
    playableClasses: [],
    allClasses: {} as ClassTypes,
    races: [],
    racesFluff: [],
    backgrounds: [],
    backgroundsFluff: [],
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
    const spells = await loadSpells();
    const { playableClasses, allClasses } = await loadClasses();
    const { races, racesFluff } = await loadRaces();
    const { backgrounds, backgroundsFluff } = await loadBackgrounds();
    return {
      spells,
      playableClasses,
      allClasses,
      races,
      racesFluff,
      backgrounds,
      backgroundsFluff,
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
        state.sourceData = payload;
      }
    });
    builder.addCase(loadSourceData.rejected, (state, { payload }) => {
      state.hydrated = false;
      state.error = payload as string;
    });
  },
});

export default sourceDataSlice.reducer;
