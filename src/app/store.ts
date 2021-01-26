import {
  configureStore,
  Action,
  getDefaultMiddleware,
  Middleware,
} from '@reduxjs/toolkit';
import { ThunkAction } from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';
import localForage from 'localforage';

import rootReducer, { RootState } from './rootReducer';
import {
  backgroundSave,
  BACKGROUND_SAVE_ACTION,
  CHARACTERLIST_SLICE,
} from 'features/character/characterListSlice';

const persistConfig = {
  key: 'root',
  storage: localForage,
  whitelist: ['presets', 'settings', 'theme', 'tabs'],
};

// Middleware: Redux Persist Persisted Reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Custom middleware to auto save characterList in the background with 1.5 sec debounce
let saveTimer: any;
let debounceTime = 1500;

const saveDebounce = (storeAPI: any) => {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }

  saveTimer = setTimeout(() => {
    storeAPI.dispatch(backgroundSave());
  }, debounceTime);
};

const backgroundSaveMiddleware: Middleware = storeAPI => next => action => {
  // Trigger (debounced) the background save any time the characterList slice is updated
  if (
    action.type.includes(CHARACTERLIST_SLICE) &&
    !action.type.includes(BACKGROUND_SAVE_ACTION)
  ) {
    const result = next(action);
    saveDebounce(storeAPI);
    return result;
  }
  return next(action);
};

const customizedMiddleware = getDefaultMiddleware({
  serializableCheck: false,
  immutableCheck: false,
}).concat(backgroundSaveMiddleware);

const store = configureStore({
  reducer: persistedReducer,
  middleware: customizedMiddleware,
});

let persistor = persistStore(store);

// Hot reloading
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./rootReducer', () => {
    const newRootReducer = require('./rootReducer').default;
    store.replaceReducer(newRootReducer);
  });
}

export type AppDispatch = typeof store.dispatch;

export type AppThunk = ThunkAction<void, RootState, null, Action<string>>;

export { store, persistor };
