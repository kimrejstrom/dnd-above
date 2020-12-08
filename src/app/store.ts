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
import { backgroundSave } from 'features/character/characterListSlice';

const persistConfig = {
  key: 'root',
  storage: localForage,
  whitelist: [
    'presets',
    'settings',
    'theme',
    'tabs',
    'selectedCharacter',
    'characterList',
  ],
};

// Middleware: Redux Persist Persisted Reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Custom middleware to auto save characterList in the background
const backgroundSaveMiddleware: Middleware = storeAPI => next => action => {
  // Do something in here, when each action is dispatched
  if (
    action.type.includes('characterList') &&
    !action.type.includes('characterList/backgroundSave')
  ) {
    console.log(action);
    const result = next(action);
    console.log('Dispatching backgroundSave');
    storeAPI.dispatch(backgroundSave());
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
