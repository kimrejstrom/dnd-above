import React from 'react';
import {
  CharacterListItem,
  setInspiration,
} from 'features/character/characterListSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { ThemeMode } from 'features/theme/themeSlice';
import inspirationDark from 'images/inspiration-dark.png';
import inspirationLight from 'images/inspiration-light.png';

interface Props {
  character: CharacterListItem;
}

const Inspiration = ({ character }: Props) => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme);
  return (
    <div className="pb-2 lg:pb-0 flex justify-center w-full md:w-auto flex-wrap">
      <div
        className="cursor-pointer relative bg-contain bg-center bg-no-repeat"
        style={{
          width: '8.5rem',
          height: '2.5rem',
          backgroundImage: `url(${
            theme === ThemeMode.DARK ? inspirationLight : inspirationDark
          })`,
        }}
        onClick={() => dispatch(setInspiration({ id: character.id }))}
      >
        {character.gameData.inspiration && (
          <div
            className="absolute rounded-full w-3.5 h-3.5 bg-gray-900 dark:bg-yellow-300"
            style={{ right: '1rem', top: '0.8rem' }}
          ></div>
        )}
      </div>
    </div>
  );
};

export default Inspiration;
