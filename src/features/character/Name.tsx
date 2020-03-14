import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { ThemeMode } from 'features/theme/themeSlice';
import { CharacterState } from 'features/character/characterSlice';
import nameDark from 'images/name-dark.png';
import nameLight from 'images/name-light.png';

interface Props {
  character: CharacterState;
}

const Name = ({ character }: Props) => {
  const theme = useSelector((state: RootState) => state.theme);
  return (
    <div
      className="bg-contain bg-left bg-no-repeat mb-2"
      style={{
        width: '30rem',
        height: '7rem',
        backgroundImage: `url(${
          theme === ThemeMode.DARK ? nameLight : nameDark
        })`,
      }}
    >
      <svg viewBox="-65 31 500 100">
        <path
          d="M0,98 C0,98 85,83.5 177,83.5 C269,83.5 354,98 353.902495,98 L0,98 Z"
          id="curve"
          fill="transparent"
        ></path>
        <text width="500" className="fill-current text-3xl">
          <textPath textAnchor="middle" startOffset="25%" href="#curve">
            {character.name}
          </textPath>
        </text>
      </svg>
    </div>
  );
};

export default Name;
