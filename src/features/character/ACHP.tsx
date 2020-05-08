import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { ThemeMode } from 'features/theme/themeSlice';
import {
  CharacterState,
  setAc,
  setHp,
} from 'features/character/characterListSlice';
import { getAbilityMod, calculateStats, getMaxHP } from 'utils/character';
import hpLight from 'images/hp-light.png';
import acLight from 'images/ac-light.png';
import hpDark from 'images/hp-dark.png';
import acDark from 'images/ac-dark.png';
import initiativeDark from 'images/initiative-dark.png';
import initiativeLight from 'images/initiative-light.png';
import deathSavesDark from 'images/deathsaves-dark.png';
import deathSavesLight from 'images/deathsaves-light.png';
import tempHPDark from 'images/temphp-dark.png';
import tempHPLight from 'images/temphp-light.png';
import skullIconDark from 'images/skullicon-dark.png';
import skullIconLight from 'images/skullicon-light.png';
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
    dispatch(setHp({ id: character.id!, hp, type }));
  };

  const onHPSubmit = (data: FormData) => {
    // Do nothing
  };

  return (
    <div className="flex flex-col mt-4 md:mt-0">
      <div className="flex justify-center md:justify-start flex-wrap md:flex-no-wrap">
        <div
          className="ml-1 relative bg-contain bg-center bg-no-repeat"
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
          className="mr-1 relative bg-contain bg-center bg-no-repeat"
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
          className="relative -ml-2 bg-contain bg-center bg-no-repeat"
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
            {getMaxHP(character)}
          </p>
        </div>
        <div className="mt-4 md:mt-0 ml-1">
          <form
            onSubmit={handleSubmit(onHPSubmit)}
            className="text-xl text-center flex md:flex-col"
          >
            <button
              className={`${DEFAULT_BUTTON_STYLE} h-10 w-24 custom-border-medium`}
              onClick={() => onHPChange('heal')}
              type="button"
            >
              Heal
            </button>
            <input
              name="hp"
              className="text-center my-1 h-10 w-24 bg-white dark:bg-secondary-dark custom-border custom-border-medium rounded dark:border-primary-light border-secondary-dark"
              ref={register}
            />
            <button
              className={`${DEFAULT_BUTTON_STYLE} h-10 w-24 custom-border-medium`}
              onClick={() => onHPChange('damage')}
              type="button"
            >
              Damage
            </button>
          </form>
        </div>
      </div>
      <div className="flex items-center justify-center md:justify-start">
        <div
          className="ml-1 relative bg-contain bg-center bg-no-repeat"
          style={{
            height: '3rem',
            width: '13rem',
            backgroundImage: `url(${
              theme === ThemeMode.DARK ? deathSavesLight : deathSavesDark
            })`,
          }}
        ></div>
        <div
          className="ml-1 relative bg-contain bg-center bg-no-repeat"
          style={{
            height: '2.5rem',
            width: '10rem',
            backgroundImage: `url(${
              theme === ThemeMode.DARK ? tempHPLight : tempHPDark
            })`,
          }}
        ></div>
        <div
          className="invisible hidden md:block md:visible w-8 h-8 ml-4 relative bg-contain bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${
              theme === ThemeMode.DARK ? skullIconLight : skullIconDark
            })`,
          }}
        ></div>
      </div>
    </div>
  );
};

export default ACHP;
