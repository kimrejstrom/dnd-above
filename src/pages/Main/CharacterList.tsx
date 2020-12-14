import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { RootState } from 'app/rootReducer';
import { removeCharacter } from 'features/character/characterListSlice';
import { setSelectedCharacter } from 'features/character/selectedCharacterSlice';
import StyledButton from 'components/StyledButton/StyledButton';
import { getCookie } from 'utils/cookie';

const CharacterList = () => {
  const allSources = getCookie('allSources') === 'true';
  const characterList = useSelector(
    (state: RootState) => state.characterList,
  ).list.filter(character => {
    if (!allSources) {
      return !character.allSources;
    }
    return true;
  });
  const dispatch = useDispatch();
  const history = useHistory();
  return (
    <div className="w-full flex justify-center">
      <div className="w-full flex flex-col" style={{ maxWidth: '62rem' }}>
        <div className="w-full custom-border-small custom-border-thin custom-border-b">
          <div className="flex justify-between items-center">
            <h1>Your Characters</h1>
            <StyledButton onClick={() => history.push('/create')}>
              Create Character
            </StyledButton>
          </div>
        </div>
        <div className="mt-3 w-full flex flex-wrap">
          {characterList.length > 0 ? (
            characterList.map(char => (
              <div key={char.id} className="m-1 relative">
                <button
                  className="absolute right-0 pr-3 pt-2 z-50"
                  onClick={() => dispatch(removeCharacter(char.id))}
                >
                  <svg
                    className="fill-current dark:text-white opacity-50"
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                  >
                    <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path>
                  </svg>
                </button>
                <button
                  key={char.id}
                  onClick={() => dispatch(setSelectedCharacter(char.id))}
                  style={{ width: '11rem' }}
                  className="bg-tertiary-light dark:bg-primary-dark text-center h-56 flex justify-between items-center flex-col custom-border custom-border-thin"
                >
                  <img
                    className="rounded w-full h-24 object-cover object-top"
                    onError={(ev: any) => {
                      ev.target.src = `${process.env.PUBLIC_URL}/img/races/default.png`;
                    }}
                    src={char.descriptionData.imageUrl}
                    alt="character"
                  />

                  <div className="leading-none text-xl">
                    {char.descriptionData.name}
                  </div>
                  <div className="leading-tight dnd-body text-sm mb-2">
                    <div>
                      <strong>{char.raceData.race}</strong>
                    </div>
                    <div>{`${char.classData.classElement}/${char.classData.subClass}`}</div>
                    <div>Level {char.gameData.level}</div>
                  </div>
                </button>
              </div>
            ))
          ) : (
            <div
              className="p-2 rounded-md w-full dark:text-yellow-100 dark:bg-yellow-800 bg-secondary-light leading-none flex items-center"
              role="alert"
            >
              <span className="flex rounded-full text-yellow-100 bg-primary-dark px-2 py-1 text-xs font-bold mr-3">
                !
              </span>
              <div>You don't have any characters yet.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterList;
