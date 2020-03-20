import React from 'react';
import { CharacterState } from 'features/character/characterSlice';
import { useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { ThemeMode } from 'features/theme/themeSlice';
import { getProficiencyBonus } from 'utils/character';
import inspirationDark from 'images/inspiration-dark.png';
import inspirationLight from 'images/inspiration-light.png';
import proficiencyDark from 'images/proficiency-dark.png';
import proficiencyLight from 'images/proficiency-light.png';

interface Props {
  character: CharacterState;
}

const Inspiration = ({ character }: Props) => {
  const theme = useSelector((state: RootState) => state.theme);
  return (
    <div className="flex flex-col mb-2">
      <div
        className="relative bg-contain bg-center bg-no-repeat"
        style={{
          width: '9em',
          height: '2.5rem',
          backgroundImage: `url(${
            theme === ThemeMode.DARK ? inspirationLight : inspirationDark
          })`,
        }}
      >
        <div
          className="absolute rounded-full w-4 h-4 bg-primary-dark dark:bg-primary-light"
          style={{ right: '1rem', top: '0.75rem' }}
        ></div>
      </div>
      <div
        className="relative bg-contain bg-center bg-no-repeat"
        style={{
          width: '9em',
          height: '2.75rem',
          backgroundImage: `url(${
            theme === ThemeMode.DARK ? proficiencyLight : proficiencyDark
          })`,
        }}
      >
        <p
          className="text-2xl text-center absolute"
          style={{ right: '1rem', top: '0.4rem' }}
        >
          {getProficiencyBonus(character.level)}
        </p>
      </div>
    </div>
  );
};

export default Inspiration;
