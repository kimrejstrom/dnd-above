import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { removeCharacter } from 'features/character/characterListSlice';
import {
  setInitialFormData,
  loadInitialFormData,
  setGeneratedFormData,
} from 'features/createCharacterForm/createCharacterFormSlice';
import { getFilteredCharacterList } from 'app/selectors';

const CharacterListing = () => {
  const characterList = useSelector(getFilteredCharacterList);
  const dispatch = useDispatch();
  const history = useHistory();

  return (
    <>
      <div>
        <h1 className="text-center">Your Characters</h1>
      </div>
      <div className="w-full flex flex-wrap justify-center">
        {characterList.map(char => (
          <div key={char.id} className="relative">
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
              onClick={() => {
                dispatch(loadInitialFormData(char));
                history.push(`/create/step-1`);
              }}
              style={{ width: '11rem' }}
              className="m-1 bg-tertiary-light dark:bg-primary-dark text-center h-56 flex justify-between items-center flex-col custom-border custom-border-thin"
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
                <div>{char.classData.classElement}</div>
                <div>{char.classData.subClass}</div>
              </div>
            </button>
          </div>
        ))}
        <button
          onClick={() => {
            dispatch(setInitialFormData());
            history.push(`/create/step-1`);
          }}
          style={{ width: '11rem' }}
          className="m-1 px-2 bg-tertiary-light dark:bg-primary-dark text-center h-56 flex justify-center items-center flex-col custom-border custom-border-thin"
        >
          <span className="text-xl">Create</span>
          <span className="leading-none text-6xl">+</span>
          <span className="leading-none text-lg">New Character</span>
        </button>
        <button
          onClick={() => {
            dispatch(setGeneratedFormData());
            history.push(`/create/summary`);
          }}
          style={{ width: '11rem' }}
          className="m-1 px-2 bg-tertiary-light dark:bg-primary-dark text-center h-56 flex justify-center items-center flex-col custom-border custom-border-thin"
        >
          <span className="text-xl">Generate</span>
          <span className="leading-none text-6xl">?</span>
          <span className="leading-none text-lg">Randomized Character</span>
        </button>
      </div>
    </>
  );
};

export default CharacterListing;
