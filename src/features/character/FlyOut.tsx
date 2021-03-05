import { RootState } from 'app/rootReducer';
import StyledButton from 'components/StyledButton/StyledButton';
import ActionButtons from 'features/character/ActionButtons';
import { CharacterListItem } from 'features/character/characterListSlice';

import { loadInitialFormData } from 'features/createCharacterForm/createCharacterFormSlice';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { getRelativeTime } from 'utils/time';

interface Props {
  character: CharacterListItem;
  readonly: boolean;
}

const FlyOut = ({ character, readonly }: Props) => {
  const { updatedAt } = useSelector((state: RootState) => state.characterList);
  const dispatch = useDispatch();
  const history = useHistory();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex w-full justify-center">
      <div
        className={`${
          isOpen ? 'h-auto' : 'h-3'
        } z-40 w-full max-w-xs xs:max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl fixed md:absolute top-14 mt-0.5 bg-highdark-200 rounded-b-lg shadow-xl`}
      >
        <div className="h-full">
          {/* Content */}
          {isOpen && (
            <div className="py-2 px-4 md:px-6  w-full">
              <ActionButtons character={character} readonly={readonly} />
              <div className="custom-border custom-border-light custom-border-sm custom-border-b"></div>
              <div className="w-full flex justify-center">
                <div className="mt-3 custom-border custom-border-light custom-border-sm bg-light-400 dark:bg-dark-300">
                  <div className="flex justify-center items-center flex-col">
                    <div className="text-2xl">Manage Character</div>
                    <div className="text-md opacity-75 -mt-2">
                      Last updated: {getRelativeTime(updatedAt)}
                    </div>
                    <div className="mt-4">
                      <StyledButton
                        disabled={readonly}
                        extraClassName="mr-2"
                        onClick={() => {
                          dispatch(loadInitialFormData(character));
                          history.push(`/create/step-1`);
                        }}
                      >
                        Character Builder
                      </StyledButton>
                      <StyledButton
                        disabled={readonly}
                        onClick={() => {
                          history.push(`/edit`);
                        }}
                      >
                        Character Builder
                      </StyledButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Accordion */}
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="cursor-pointer flex justify-center flex-grow"
          >
            {isOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="fill-current text-yellow-50 -mt-0.5 p-0.5"
                height="16"
                width="16"
              >
                <path
                  fillRule="evenodd"
                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="fill-current text-yellow-50 -mt-0.5 p-0.5"
                height="16"
                width="16"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlyOut;
