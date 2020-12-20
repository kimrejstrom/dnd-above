import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from 'app/rootReducer';
import { AppDispatch } from 'app/store';
import { CharacterListItem } from 'features/character/characterListSlice';
import DnDAboveAPI from 'utils/api';

interface PublicCharacerState {
  loading: 'idle' | 'pending' | 'error';
  character?: CharacterListItem;
  error?: string;
}

const initialState: PublicCharacerState = {
  loading: 'idle',
};

export const getPublicById = createAsyncThunk<
  any,
  { listId: string; characterId: string },
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>(
  'publicCharacter/getPublicById',
  async ({ listId, characterId }, thunkAPI) => {
    const response = await DnDAboveAPI.publicReadById(listId, characterId);
    console.log(response);

    if (response.status >= 400) {
      return thunkAPI.rejectWithValue(await response.json());
    }
    return await response.json();
  },
  {
    condition: (_, { getState }) => {
      const { publicCharacter } = getState();
      const fetchStatus = publicCharacter.loading;
      if (fetchStatus === 'pending') {
        // Already fetching, don't need to re-fetch
        return false;
      }
    },
  },
);

const publicCharacterSlice = createSlice({
  name: 'publicCharacter',
  initialState: initialState,
  reducers: {
    addCharacter(state, action) {
      state.character = action.payload;
    },
    removeCharacter(state) {
      state.character = undefined;
    },
  },
  extraReducers: builder => {
    // getPublicById
    builder.addCase(getPublicById.pending, (state, { payload }) => {
      if (state.loading === 'idle') {
        state.loading = 'pending';
      }
    });
    builder.addCase(getPublicById.fulfilled, (state, { payload }) => {
      if (state.loading === 'pending' || state.loading === 'error') {
        state.loading = 'idle';
      }
      const { data } = payload;
      state.character = data.list.length > 0 ? data.list[0] : undefined;
    });
    builder.addCase(getPublicById.rejected, (state, { payload }) => {
      if (state.loading === 'pending' || state.loading === 'error') {
        state.loading = 'error';
        state.error = (payload as any).message;
      }
    });
  },
});

export const { addCharacter, removeCharacter } = publicCharacterSlice.actions;

export default publicCharacterSlice.reducer;
