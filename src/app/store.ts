import { configureStore, Action } from '@reduxjs/toolkit';
import { ThunkAction } from 'redux-thunk';
import { persistStore } from 'redux-persist';
import { RootState } from 'app/rootReducer';
import { customizedMiddleware, persistedReducer } from 'app/middleware';

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
