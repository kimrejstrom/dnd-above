import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { useHistory } from 'react-router-dom';
import { CharacterList } from 'features/character/characterListSlice';
import {
  setInitialFormData,
  loadInitialFormData,
  setGeneratedFormData,
} from 'features/createCharacterForm/createCharacterFormSlice';
import { getCookie } from 'utils/cookie';

const CharacterListing = ({ url }: { url: string }) => {
  const allSources = getCookie('allSources') === 'true';
  const characterList: CharacterList = useSelector(
    (state: RootState) => state.characterList,
  ).filter(character => {
    if (!allSources) {
      return !character.allSources;
    }
    return true;
  });
  const dispatch = useDispatch();
  const history = useHistory();

  return (
    <>
      <div className="w-full flex flex-wrap">
        {characterList.map(char => (
          <button
            key={char.id}
            onClick={() => {
              dispatch(loadInitialFormData(char));
              history.push(`${url}/step-1`);
            }}
            className="mx-1 bg-tertiary-light dark:bg-primary-dark text-center w-40 h-56 flex justify-between items-center flex-col custom-border custom-border-thin"
          >
            <img
              className="rounded w-full h-24 object-cover object-top"
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
        ))}
        <button
          onClick={() => {
            dispatch(setInitialFormData());
            history.push(`${url}/step-1`);
          }}
          className="mx-1 bg-tertiary-light dark:bg-primary-dark text-center w-40 h-56 flex justify-center items-center flex-col custom-border custom-border-thin"
        >
          <span className="text-lg">Create</span>
          <div className="h-12 w-full flex justify-center text-3xl font-semibold rounded-lg mb-1 overflow-hidden">
            <svg
              className="fill-current h-10 w-10 block"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M16 10c0 .553-.048 1-.601 1H11v4.399c0 .552-.447.601-1 .601-.553 0-1-.049-1-.601V11H4.601C4.049 11 4 10.553 4 10c0-.553.049-1 .601-1H9V4.601C9 4.048 9.447 4 10 4c.553 0 1 .048 1 .601V9h4.399c.553 0 .601.447.601 1z" />
            </svg>
          </div>
          <span className="leading-none text-lg">New Character</span>
        </button>
        <button
          onClick={() => {
            dispatch(setGeneratedFormData());
            history.push(`${url}/summary`);
          }}
          className="mx-1 bg-tertiary-light dark:bg-primary-dark text-center w-40 h-56 flex justify-center items-center flex-col custom-border custom-border-thin"
        >
          <span className="text-lg">Generate</span>
          <div className="h-12 w-full flex justify-center text-3xl font-semibold rounded-lg mb-1 overflow-hidden">
            <svg
              className="fill-current h-10 w-10 block"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M16 10c0 .553-.048 1-.601 1H11v4.399c0 .552-.447.601-1 .601-.553 0-1-.049-1-.601V11H4.601C4.049 11 4 10.553 4 10c0-.553.049-1 .601-1H9V4.601C9 4.048 9.447 4 10 4c.553 0 1 .048 1 .601V9h4.399c.553 0 .601.447.601 1z" />
            </svg>
          </div>
          <span className="leading-none text-lg">Randomized Character</span>
        </button>
      </div>
    </>
  );
};

export default CharacterListing;
