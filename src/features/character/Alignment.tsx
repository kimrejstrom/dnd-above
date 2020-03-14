import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { ThemeMode } from 'features/theme/themeSlice';
import alignmentDark from 'images/alignment-dark.png';
import alignmentLight from 'images/alignment-light.png';
import { CharacterState } from 'features/character/characterSlice';

interface Props {
  character: CharacterState;
}

const Alignment = ({ character }: Props) => {
  const theme = useSelector((state: RootState) => state.theme);
  return (
    <div
      className="mx-4 relative bg-contain bg-center bg-no-repeat"
      style={{
        width: '24rem',
        height: '7rem',
        backgroundImage: `url(${
          theme === ThemeMode.DARK ? alignmentLight : alignmentDark
        })`,
      }}
    >
      <p
        className="text-3xl absolute inset-0 text-center"
        style={{
          top: '1.75rem',
          left: '-6rem',
        }}
      >
        {character.level}
      </p>
      <p
        className="text-3xl absolute inset-0 text-center"
        style={{
          top: '1.75rem',
          left: '6.25rem',
        }}
      >
        {character.race.speed}
      </p>
      <p
        className="text-3xl absolute inset-0 text-center"
        style={{
          top: '1.75rem',
          left: '19rem',
        }}
      >
        {`d${character.class.hd.faces}`}
      </p>
    </div>
  );
};

export default Alignment;
