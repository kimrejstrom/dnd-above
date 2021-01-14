import React from 'react';
import { CharacterListItem } from 'features/character/characterListSlice';
import { useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { ThemeMode } from 'features/theme/themeSlice';
import { getProficiencyBonus } from 'utils/character';
import inspirationDark from 'images/inspiration-dark.png';
import inspirationLight from 'images/inspiration-light.png';
import proficiencyDark from 'images/proficiency-dark.png';
import proficiencyLight from 'images/proficiency-light.png';

interface Props {
  character: CharacterListItem;
}

const Inspiration = ({ character }: Props) => {
  const theme = useSelector((state: RootState) => state.theme);
  return (
    <div className="pb-2 lg:pb-0 flex justify-center w-full md:w-auto flex-wrap">
      <div
        className="relative bg-contain bg-center bg-no-repeat mr-2"
        style={{
          width: '8.5rem',
          height: '2.5rem',
          backgroundImage: `url(${
            theme === ThemeMode.DARK ? inspirationLight : inspirationDark
          })`,
        }}
      >
        <div
          className="absolute rounded-full w-3.5 h-3.5 bg-gray-900 dark:bg-yellow-300"
          style={{ right: '1rem', top: '0.8rem' }}
        ></div>
      </div>
      <div
        className="relative bg-contain bg-center bg-no-repeat"
        style={{
          width: '8.5rem',
          height: '2.5rem',
          backgroundImage: `url(${
            theme === ThemeMode.DARK ? proficiencyLight : proficiencyDark
          })`,
        }}
      >
        <p
          className="text-2xl text-center absolute"
          style={{ right: '1rem', top: '0.4rem' }}
        >
          {getProficiencyBonus(character.gameData.level)}
        </p>
      </div>
    </div>
  );
};

export default Inspiration;
