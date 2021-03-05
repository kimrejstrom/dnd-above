import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { ThemeMode } from 'features/theme/themeSlice';
import alignmentDark from 'images/alignment-dark2.png';
import alignmentLight from 'images/alignment-light2.png';
import {
  CharacterListItem,
  setCurrentHd,
} from 'features/character/characterListSlice';
import {
  getHdTotal,
  getHitDice,
  getProficiencyBonus,
  parseSpeed,
} from 'utils/character';
import { Parser } from 'utils/mainRenderer';
import { useForm } from 'react-hook-form';
import { getRace } from 'utils/sourceDataUtils';

interface Props {
  character: CharacterListItem;
  readonly: boolean;
}

const Alignment = ({ character, readonly }: Props) => {
  const theme = useSelector((state: RootState) => state.theme);
  const dispatch = useDispatch();
  type FormData = {
    currentHd: number;
  };
  const { register, handleSubmit, setValue } = useForm<FormData>();
  const onHDSubmit = (data: FormData) => {
    if (!readonly) {
      dispatch(setCurrentHd({ id: character.id!, currentHd: data.currentHd }));
    }
  };
  useEffect(() => {
    setValue('currentHd', character.gameData.currentHd);
  });
  const getAlignmentPosition = (alignment: string) => {
    switch ((Parser.ALIGNMENTS as any)[alignment]) {
      case Parser.ALIGNMENTS.LG:
        return { top: '0.45rem', left: '0.7rem' };
      case Parser.ALIGNMENTS.NG:
        return { top: '0.45rem', left: '1.7rem' };
      case Parser.ALIGNMENTS.CG:
        return { top: '0.45rem', left: '2.65rem' };
      case Parser.ALIGNMENTS.LN:
        return { top: '1.4rem', left: '0.7rem' };
      case Parser.ALIGNMENTS.N:
        return { top: '1.4rem', left: '1.7rem' };
      case Parser.ALIGNMENTS.CN:
        return { top: '1.4rem', left: '2.65rem' };
      case Parser.ALIGNMENTS.LE:
        return { top: '2.3rem', left: '0.7rem' };
      case Parser.ALIGNMENTS.NE:
        return { top: '2.3rem', left: '1.7rem' };
      case Parser.ALIGNMENTS.CE:
        return { top: '2.3rem', left: '2.65rem' };
      default:
        break;
    }
  };
  return (
    <div className="flex justify-start w-full md:w-96">
      <div
        className="relative bg-contain bg-center bg-no-repeat"
        style={{
          width: '21rem',
          height: '4rem',
          backgroundImage: `url(${
            theme === ThemeMode.DARK ? alignmentLight : alignmentDark
          })`,
        }}
      >
        <div
          className="absolute rounded-full w-2 h-2 bg-dark-100 dark:bg-light-100"
          style={getAlignmentPosition(character.descriptionData.alignment)}
        ></div>
        <div
          className="text-2xl absolute w-8 inset-0 text-center"
          style={{
            top: '16.5%',
            left: '25%',
          }}
        >
          {character.gameData.level}
        </div>
        <div
          className="text-2xl absolute w-8 inset-0 text-center"
          style={{
            top: '16.5%',
            left: '45%',
          }}
        >
          {getProficiencyBonus(character.gameData.level)}
        </div>
        <div
          className="text-2xl absolute w-8 inset-0 text-center"
          style={{
            top: '16.5%',
            left: '64.5%',
          }}
        >
          {parseSpeed(getRace(character.raceData.race)!.speed)}
        </div>
        <div
          className="text-2xl absolute w-8 inset-0 text-center"
          style={{
            top: '16.5%',
            left: '85.5%',
          }}
        >
          {getHitDice(character)}
        </div>
        <div
          className="hidden md:block z-0 custom-border-xs absolute"
          style={{
            borderLeft: '0',
            top: '0.35rem',
            right: '-4.1rem',
            width: '5rem',
            height: '2.45rem',
          }}
        ></div>
        <div
          className="hidden absolute md:flex flex-col"
          style={{ top: '0.75rem', right: '-3.2rem' }}
        >
          <div className="flex leading-none -mt-0.5 z-20">
            <form
              onSubmit={handleSubmit(onHDSubmit)}
              className="text-2xl text-center mb-2"
            >
              <input
                disabled={readonly}
                name="currentHd"
                className="text-center text-2xl w-6 h-6 bg-light-100 dark:bg-dark-100"
                onChange={handleSubmit(onHDSubmit)}
                ref={register}
              />
            </form>
            <div className="text-2xl">{`/ ${getHdTotal(character)}`}</div>
          </div>
          <div className="text-sm opacity-75">HD Total</div>
        </div>
      </div>
    </div>
  );
};

export default Alignment;
