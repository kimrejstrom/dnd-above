import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from 'app/rootReducer';
import { AppDispatch } from 'app/store';
import { ClassElement, ClassTypes } from 'models/class';
import { SpellElement } from 'models/spells';
import { loadClasses, loadSpells } from 'utils/data';

interface SourceData {
  spells: SpellElement[];
  playableClasses: ClassElement[];
  allClasses: ClassTypes;
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
    const spells = await loadSpells();
    const { playableClasses, allClasses } = await loadClasses();
    return { spells, playableClasses, allClasses } as SourceData;
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
