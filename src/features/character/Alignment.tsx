import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { ThemeMode } from 'features/theme/themeSlice';
import alignmentDark from 'images/alignment-dark.png';
import alignmentLight from 'images/alignment-light.png';
import { CharacterState } from 'features/character/characterSlice';
import { getRace, getClass } from 'utils/character';

interface Props {
  character: CharacterState;
}

const Alignment = ({ character }: Props) => {
  const theme = useSelector((state: RootState) => state.theme);
  return (
    <div
      className="mx-4 my-2 relative bg-contain bg-center bg-no-repeat"
      style={{
        width: '17rem',
        height: '4rem',
        backgroundImage: `url(${
          theme === ThemeMode.DARK ? alignmentLight : alignmentDark
        })`,
      }}
    >
      <p
        className="text-2xl absolute inset-0 text-center"
        style={{
          top: '0.55rem',
          left: '-4.1rem',
        }}
      >
        {character.customData.level}
      </p>
      <p
        className="text-2xl absolute inset-0 text-center"
        style={{
          top: '0.6rem',
          left: '4.25rem',
        }}
      >
        {getRace(character.raceData.race)!.speed}
      </p>
      <p
        className="text-2xl absolute inset-0 text-center"
        style={{
          top: '0.55rem',
          left: '13rem',
        }}
      >
        {`d${getClass(character.classData.classElement)!.hd.faces}`}
      </p>
    </div>
  );
};

export default Alignment;
