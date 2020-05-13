import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { ThemeMode } from 'features/theme/themeSlice';
import alignmentDark from 'images/alignment-dark.png';
import alignmentLight from 'images/alignment-light.png';
import {
  CharacterState,
  setCurrentHd,
} from 'features/character/characterListSlice';
import { getRace, getHdTotal, getHitDice } from 'utils/character';
import { Parser } from 'utils/mainRenderer';
import { useForm } from 'react-hook-form';

interface Props {
  character: CharacterState;
}

const Alignment = ({ character }: Props) => {
  const theme = useSelector((state: RootState) => state.theme);
  const dispatch = useDispatch();
  type FormData = {
    currentHd: number;
  };
  const { register, handleSubmit, setValue } = useForm<FormData>();
  const onHDSubmit = (data: FormData) => {
    dispatch(setCurrentHd({ id: character.id!, currentHd: data.currentHd }));
  };
  useEffect(() => {
    setValue('currentHd', character.gameData.currentHd);
  });
  const getAlignmentPosition = (alignment: string) => {
    switch ((Parser.ALIGNMENTS as any)[alignment]) {
      case Parser.ALIGNMENTS.LG:
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
      className="mt-5 relative bg-contain bg-center bg-no-repeat"
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
      <div
        className="text-2xl absolute w-8 inset-0 text-center"
        style={{
          top: '0.55rem',
          left: '5.4rem',
        }}
      >
        {character.gameData.level}
      </div>
      <div
        className="text-2xl absolute w-8 inset-0 text-center"
        style={{
          top: '0.6rem',
          left: '9.6rem',
        }}
      >
        {getRace(character.raceData.race)!.speed}
      </div>
      <div
        className="text-2xl absolute w-8 inset-0 text-center"
        style={{
          top: '0.55rem',
          left: '14rem',
        }}
      >
        {getHitDice(character)}
      </div>
      <div
        className="z-0 custom-border absolute"
        style={{
          borderLeft: '0',
          top: '0.25rem',
          right: '-4.1rem',
          width: '5rem',
          height: '2.5rem',
        }}
      ></div>
      <div
        className="absolute flex flex-col"
        style={{ top: '0.55rem', right: '-3rem' }}
      >
        <div className="flex leading-none mt-1 z-20">
          <form
            onSubmit={handleSubmit(onHDSubmit)}
            className="text-2xl text-center mb-3"
          >
            <input
              name="currentHd"
              className="text-center text-2xl w-6 h-6 bg-white dark:bg-secondary-dark"
              onChange={handleSubmit(onHDSubmit)}
              ref={register}
            />
          </form>
          <div className="text-2xl">{`/ ${getHdTotal(character)}`}</div>
        </div>
        <div className="text-sm opacity-75">HD Total</div>
      </div>
    </div>
  );
};

export default Alignment;
