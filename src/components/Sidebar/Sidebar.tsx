import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { CharacterList } from 'features/character/characterListSlice';
import { setSelectedCharacter } from 'features/character/selectedCharacterSlice';
import { setInitialFormData } from 'features/createCharacterForm/createCharacterFormSlice';
import { useHistory } from 'react-router-dom';
import { getCookie } from 'utils/cookie';

const Sidebar = () => {
  const allSources = getCookie('allSources') === 'true';
  const characterList: CharacterList = useSelector(
    (state: RootState) => state.characterList,
  ).filter(character => {
    if (!allSources) {
      return !character.allSources;
    }
    return true;
  });
  const selectedCharacterId = useSelector(
    (state: RootState) => state.selectedCharacter,
  );
  const dispatch = useDispatch();
  const history = useHistory();
  return (
    <div className="bg-tertiary-dark flex-none w-24 p-6 hidden md:block font-sans">
      {characterList.map(character => (
        <button
          onClick={() => {
            dispatch(setSelectedCharacter(character.id));
            history.push(`/`);
          }}
          className="mb-4"
        >
          <div
            className={`${
              selectedCharacterId !== character.id
                ? 'opacity-50'
                : 'border-2 border-yellow-500'
            } bg-white flex items-center justify-center text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden`}
          >
            <img
              className="h-12 w-12 object-cover object-top"
              src={character.descriptionData.imageUrl}
              alt="character"
            />
          </div>
          <div className="text-center text-white opacity-50 text-sm">
            {character.descriptionData.name.substr(0, 3)}
          </div>
        </button>
      ))}

      <button
        onClick={() => {
          dispatch(setInitialFormData());
          history.push(`/create/step-1`);
        }}
      >
        <div className="bg-white opacity-25 h-12 w-12 flex items-center justify-center text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
          <svg
            className="fill-current h-10 w-10 block"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M16 10c0 .553-.048 1-.601 1H11v4.399c0 .552-.447.601-1 .601-.553 0-1-.049-1-.601V11H4.601C4.049 11 4 10.553 4 10c0-.553.049-1 .601-1H9V4.601C9 4.048 9.447 4 10 4c.553 0 1 .048 1 .601V9h4.399c.553 0 .601.447.601 1z" />
          </svg>
        </div>
      </button>
    </div>
  );
};

export default Sidebar;
