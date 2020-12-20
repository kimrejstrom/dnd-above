import React from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import StyledButton from 'components/StyledButton/StyledButton';
import { getFilteredCharacterList } from 'app/selectors';
import CharacterCards from 'components/CharacterCards/CharacterCards';

const CharacterList = () => {
  const characterList = useSelector(getFilteredCharacterList);
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
            <CharacterCards type={'LOAD'} />
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
