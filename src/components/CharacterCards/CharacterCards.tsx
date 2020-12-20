import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { removeCharacter } from 'features/character/characterListSlice';
import { getFilteredCharacterList } from 'app/selectors';
import { loadInitialFormData } from 'features/createCharacterForm/createCharacterFormSlice';
import { setSelectedCharacter } from 'features/character/selectedCharacterSlice';

interface Props {
  type: 'CREATE' | 'LOAD';
}

const CharacterCards: React.FC<Props> = ({ type }) => {
  const characterList = useSelector(getFilteredCharacterList);
  const dispatch = useDispatch();
  const history = useHistory();
  return (
    <>
      {characterList.map(char => (
        <div
          className="m-1 bg-tertiary-light dark:bg-primary-dark custom-border custom-border-thin dark-hover:bg-secondary-dark hover:bg-yellow-100"
          key={char.id}
          style={{ width: '11rem' }}
        >
          <div className="flex justify-between w-full px-1 -mt-1">
            <button
              className="w-10 h-10 flex justify-center items-center"
              onClick={() => dispatch(removeCharacter(char.id))}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                className="fill-current dark:text-gray-300 opacity-50"
              >
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path
                  fillRule="evenodd"
                  d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <button
              className="w-10 h-10 flex justify-center items-center"
              onClick={() => dispatch(removeCharacter(char.id))}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                className="fill-current dark:text-gray-300 opacity-50"
              >
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
            </button>

            <button
              className="w-10 h-10 flex justify-center items-center"
              onClick={() => dispatch(removeCharacter(char.id))}
            >
              <svg
                className="fill-current dark:text-gray-300 opacity-50"
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
              >
                <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path>
              </svg>
            </button>
          </div>

          <button
            key={char.id}
            onClick={() => {
              switch (type) {
                case 'CREATE':
                  dispatch(loadInitialFormData(char));
                  history.push(`/create/step-1`);
                  break;
                case 'LOAD':
                  dispatch(setSelectedCharacter(char.id));
                  break;
                default:
                  break;
              }
            }}
            className="text-center h-56 flex justify-between items-center flex-col"
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
      ))}
    </>
  );
};
export default CharacterCards;
