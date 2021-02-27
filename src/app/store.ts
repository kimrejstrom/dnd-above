import {
  configureStore,
  Action,
  getDefaultMiddleware,
  Middleware,
  AnyAction,
} from '@reduxjs/toolkit';
import { ThunkAction } from 'redux-thunk';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import localForage from 'localforage';

import rootReducer, { RootState } from 'app/rootReducer';
import {
  backgroundSave,
  BACKGROUND_SAVE_ACTION,
  CHARACTERLIST_SLICE,
} from 'features/character/characterListSlice';

const CharacterListTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState: any, key) => {
    // drop loading and error related states
    return {
      list: inboundState.list,
      id: inboundState.id,
      updatedAt: inboundState.updatedAt,
    };
  },

  // transform state being rehydrated
  (outboundState: any, key) => outboundState,

  // define which reducers this transform gets called for.
  { whitelist: ['characterList'] },
);

const persistConfig = {
  key: 'root',
  storage: localForage,
  whitelist: ['presets', 'settings', 'theme', 'tabs', 'characterList'],
  stateReconciler: autoMergeLevel2,
  transforms: [CharacterListTransform],
};

// Middleware: Redux Persist Persisted Reducer
const persistedReducer = persistReducer<RootState, AnyAction>(
  persistConfig,
  rootReducer,
);

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
  devTools: {
    actionSanitizer: (action: any) =>
      action.type === 'detailedEntry/setDetailedEntry' && action.payload
        ? { ...action, payload: '<<REACT_COMPONENT>>' }
        : action,
    stateSanitizer: (state: any) => ({
      ...state,
      sourceData: '<<SO_MANY_OBJECTS>>',
      detailedEntry: '<<REACT_COMPONENT>>',
    }),
  },
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
