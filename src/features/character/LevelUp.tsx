import React from 'react';
import dudeDark from 'images/dude-dark.png';
import dudeLight from 'images/dude-light.png';
import { ThemeMode } from 'features/theme/themeSlice';
import { RootState } from 'app/rootReducer';
import {
  CharacterListItem,
  levelUp,
} from 'features/character/characterListSlice';
import { useDispatch, useSelector } from 'react-redux';

interface Props {
  character: CharacterListItem;
  readonly: boolean;
}

const LevelUp = ({ character, readonly }: Props) => {
  const theme = useSelector((state: RootState) => state.theme);
  const dispatch = useDispatch();
  const handleLevelUp = () => {
    dispatch(levelUp({ id: character.id }));
  };

  return (
    <button
      disabled={readonly}
      onClick={handleLevelUp}
      className="bg-light-200 hover:bg-yellow-100 dark:bg-dark-300 dark:text-light-100 dark:hover:bg-dark-100 cursor-pointer flex justify-center lg:ml-1 custom-border custom-border-medium h-20 w-full lg:w-20"
    >
      <div
        className="flex flex-col justify-center items-center rounded-lg"
        style={{
          height: '4.6rem',
          width: '4.6rem',
          marginTop: '-0.55rem',
        }}
      >
        <img
          className="h-10 ml-2 -mt-1"
          src={theme === ThemeMode.DARK ? dudeLight : dudeDark}
          alt="logo"
        />
        <div className="-mb-3 text-sm">Level Up</div>
      </div>
    </button>
  );
};

export default LevelUp;
