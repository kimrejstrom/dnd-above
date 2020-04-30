import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { ThemeMode } from 'features/theme/themeSlice';
import alignmentDark from 'images/alignment-dark.png';
import alignmentLight from 'images/alignment-light.png';
import { CharacterState } from 'features/character/characterListSlice';
import { getRace, getClass } from 'utils/character';
import { Parser } from 'utils/mainRenderer';

interface Props {
  character: CharacterState;
}

const Alignment = ({ character }: Props) => {
  const theme = useSelector((state: RootState) => state.theme);
  const getAlignmentPosition = (alignment: string) => {
    switch ((Parser.ALIGNMENTS as any)[alignment]) {
      case Parser.ALIGNMENTS.LG:
        console.log('HIT');
        return { top: '0.45rem', left: '0.85rem' };
      case Parser.ALIGNMENTS.NG:
        return { top: '0.45rem', left: '1.8rem' };
      case Parser.ALIGNMENTS.CG:
        return { top: '0.45rem', left: '2.8rem' };
      case Parser.ALIGNMENTS.LN:
        return { top: '1.4rem', left: '0.85rem' };
      case Parser.ALIGNMENTS.N:
        return { top: '1.4rem', left: '1.8rem' };
      case Parser.ALIGNMENTS.CN:
        return { top: '1.4rem', left: '2.8rem' };
      case Parser.ALIGNMENTS.LE:
        return { top: '2.3rem', left: '0.85rem' };
      case Parser.ALIGNMENTS.NE:
        return { top: '2.3rem', left: '1.8rem' };
      case Parser.ALIGNMENTS.CE:
        return { top: '2.3rem', left: '2.8rem' };
      default:
        break;
    }
  };
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
      <div
        className="absolute rounded-full w-2 h-2 bg-primary-dark dark:bg-primary-light"
        style={getAlignmentPosition(character.descriptionData.alignment)}
      ></div>
      <p
        className="text-2xl absolute inset-0 text-center"
        style={{
          top: '0.55rem',
          left: '-4.1rem',
        }}
      >
        {character.gameData.level}
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
