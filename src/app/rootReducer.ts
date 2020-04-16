import { combineReducers } from 'redux';
import rollsReducer from 'features/rollInput/rollInputSlice';
import modalReducer from 'components/Modal/modalSlice';
import presetsReducer from 'features/presets/presetsSlice';
import settingsReducer from 'features/settings/settingsSlice';
import themeReducer from 'features/theme/themeSlice';
// import characterReducer from 'features/character/characterListSlice';
import characterListReducer from 'features/character/characterListSlice';
import selectedCharacterReducer from 'features/character/selectedCharacterSlice';
import tabsReducer from 'features/tabs/tabsSlice';
import createCharacterFormReducer from 'features/createCharacterForm/createCharacterFormSlice';

const rootReducer = combineReducers({
  theme: themeReducer,
  rolls: rollsReducer,
  modalVisibility: modalReducer,
  presets: presetsReducer,
  settings: settingsReducer,
  // character: characterReducer,
  characterList: characterListReducer,
  selectedCharacter: selectedCharacterReducer,
  tabs: tabsReducer,
  createCharacterForm: createCharacterFormReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
