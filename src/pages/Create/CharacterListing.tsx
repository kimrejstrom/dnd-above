import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  setInitialFormData,
  setGeneratedFormData,
} from 'features/createCharacterForm/createCharacterFormSlice';
import CharacterCards from 'components/CharacterCards/CharacterCards';

const CharacterListing = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  return (
    <>
      <div>
        <h1 className="text-center">Your Characters</h1>
      </div>
      <div className="w-full flex flex-wrap justify-center">
        <CharacterCards type={'CREATE'} />
        <button
          onClick={() => {
            dispatch(setInitialFormData());
            history.push(`/create/step-1`);
          }}
          className="w-44 md:w-48 mt-1 mr-1 px-2 bg-tertiary-light dark:bg-primary-dark text-center h-72 flex justify-center items-center flex-col custom-border custom-border-thin"
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
          className="w-44 md:w-48 mt-1 mr-1 px-2 bg-tertiary-light dark:bg-primary-dark text-center h-72 flex justify-center items-center flex-col custom-border custom-border-thin"
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
