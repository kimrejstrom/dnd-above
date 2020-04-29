import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { ThemeMode } from 'features/theme/themeSlice';
import {
  CharacterState,
  setAc,
  setHp,
} from 'features/character/characterListSlice';
import {
  getAbilityMod,
  calculateStats,
  getMaxHP,
  getClass,
} from 'utils/character';
import hpLight from 'images/hp-light.png';
import acLight from 'images/ac-light.png';
import hpDark from 'images/hp-dark.png';
import acDark from 'images/ac-dark.png';
import initiativeDark from 'images/initiative-dark.png';
import initiativeLight from 'images/initiative-light.png';
import { useForm } from 'react-hook-form';
import { DEFAULT_BUTTON_STYLE } from 'components/StyledButton/StyledButton';

interface Props {
  character: CharacterState;
}

const ACHP = ({ character }: Props) => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme);
  type FormData = {
    ac: number;
    hp: number;
  };

  const { register, handleSubmit, setValue, errors, getValues } = useForm<
    FormData
  >();

  useEffect(() => {
    setValue('ac', character.gameData.ac);
  });

  const onACSubmit = (data: FormData) => {
    dispatch(setAc({ id: character.id!, ac: data.ac }));
  };

  const onHPChange = (type: string) => {
    const { hp } = getValues();
    console.log(hp, type);
    dispatch(setHp({ id: character.id!, hp, type }));
  };

  const onHPSubmit = (data: FormData) => {
    // Do nothing
  };

  return (
    <>
      <div
        className="ml-2 mr-1 relative bg-contain bg-center bg-no-repeat"
        style={{
          height: '7.5rem',
          width: '7.5rem',
          backgroundImage: `url(${
            theme === ThemeMode.DARK ? initiativeLight : initiativeDark
          })`,
        }}
      >
        <p
          className="text-2xl absolute inset-0 text-center"
          style={{
            top: '2.5rem',
          }}
        >
          {getAbilityMod(calculateStats(character).dex)}
        </p>
      </div>
      <div
        className="relative bg-contain bg-center bg-no-repeat"
        style={{
          height: '7.5rem',
          width: '7.5rem',
          backgroundImage: `url(${
            theme === ThemeMode.DARK ? acLight : acDark
          })`,
        }}
      >
        <form
          onSubmit={handleSubmit(onACSubmit)}
          className="text-2xl absolute inset-0 text-center"
          style={{
            top: '2.8rem',
          }}
        >
          <input
            name="ac"
            className="text-center w-8 h-6 bg-white dark:bg-secondary-dark"
            onChange={handleSubmit(onACSubmit)}
            ref={register({ required: true })}
          />
          {errors.ac && <div>AC is required</div>}
        </form>

        <p
          className="text-md absolute inset-0 text-center"
          style={{
            top: '6.05rem',
          }}
        >
          {10 + getAbilityMod(calculateStats(character).dex)}
        </p>
      </div>
      <div
        className="relative bg-contain bg-center bg-no-repeat"
        style={{
          height: '7.5rem',
          width: '7.5rem',
          backgroundImage: `url(${
            theme === ThemeMode.DARK ? hpLight : hpDark
          })`,
        }}
      >
        <p
          className="text-2xl absolute inset-0 text-center"
          style={{
            top: '1.2rem',
            left: '0.1rem',
          }}
        >
          {character.gameData.currentHp}
        </p>
        <p
          className="text-md absolute inset-0 text-center"
          style={{
            top: '6.05rem',
          }}
        >
          {getMaxHP(
            getClass(character.classData.classElement)!.hd.faces,
            character.gameData.level,
            getAbilityMod(calculateStats(character).con),
          )}
        </p>
      </div>
      <div className="ml-2">
        <form
          onSubmit={handleSubmit(onHPSubmit)}
          className="text-xl text-center flex flex-col"
        >
          <button
            className={DEFAULT_BUTTON_STYLE}
            onClick={() => onHPChange('heal')}
            type="button"
          >
            Heal
          </button>
          <input
            name="hp"
            className="text-center my-1 h-8 w-20 bg-white dark:bg-secondary-dark custom-border custom-border-thin rounded dark:border-primary-light border-secondary-dark"
            ref={register}
          />
          <button
            className={DEFAULT_BUTTON_STYLE}
            onClick={() => onHPChange('damage')}
            type="button"
          >
            Damage
          </button>
        </form>
      </div>
    </>
  );
};

export default ACHP;
