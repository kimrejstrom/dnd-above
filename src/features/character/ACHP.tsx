import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { ThemeMode } from 'features/theme/themeSlice';
import {
  CharacterListItem,
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
import StyledButton from 'components/StyledButton/StyledButton';

interface Props {
  character: CharacterListItem;
  readonly: boolean;
}

const ACHP = ({ character, readonly }: Props) => {
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
    if (!readonly) {
      dispatch(setAc({ id: character.id!, ac: data.ac }));
    }
  };

  const onHPChange = (type: string) => {
    if (!readonly) {
      const { hp } = getValues();
      dispatch(setHp({ id: character.id!, hp, type }));
    }
  };

  const onHPSubmit = (data: FormData) => {
    // Do nothing
  };

  return (
    <div className="flex flex-col mt-4 md:mt-0 w-full md:w-auto">
      <div className="flex flex-col lg:flex-row justify-center md:justify-start flex-wrap lg:flex-nowrap">
        <div className="flex justify-center md:justify-start">
          <div
            className="lg:ml-1 relative bg-contain bg-center bg-no-repeat"
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
            className="lg:mr-1 relative bg-contain bg-center bg-no-repeat"
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
                className="text-center w-8 h-6 bg-light-100 dark:bg-dark-200"
                onChange={handleSubmit(onACSubmit)}
                disabled={readonly}
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
              {Math.min(character.gameData.currentHp, getMaxHP(character))}
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
        </div>
        <div className="w-full md:w-auto lg:w-auto mt-4 lg:mt-0 lg:ml-3">
          <form
            onSubmit={handleSubmit(onHPSubmit)}
            className="text-xl text-center flex justify-center lg:flex-col"
          >
            <StyledButton
              disabled={readonly}
              extraClassName={`w-24 lg:w-20`}
              onClick={() => onHPChange('heal')}
              type="button"
            >
              Heal
            </StyledButton>
            <input
              disabled={readonly}
              name="hp"
              className="text-center mx-2 lg:mx-0 lg:my-1 h-10 w-28 lg:w-20 bg-light-300 dark:bg-dark-200 custom-border-xs custom-border-thin"
              ref={register}
            />
            <StyledButton
              disabled={readonly}
              extraClassName={`w-24 lg:w-20`}
              onClick={() => onHPChange('damage')}
              type="button"
            >
              DMG
            </StyledButton>
          </form>
        </div>
      </div>
      <div className="flex items-center justify-center md:justify-start">
        <div
          className="ml-1 relative bg-contain bg-center bg-no-repeat w-52 h-12"
          style={{
            backgroundImage: `url(${
              theme === ThemeMode.DARK ? deathSavesLight : deathSavesDark
            })`,
          }}
        ></div>
        <div
          className="ml-3 lg:ml-5 relative bg-contain bg-center bg-no-repeat w-32 h-10"
          style={{
            backgroundImage: `url(${
              theme === ThemeMode.DARK ? tempHPLight : tempHPDark
            })`,
          }}
        >
          <p
            className="text-md absolute inset-0 text-center"
            style={{
              top: '0.9rem',
              left: '0.4rem',
            }}
          >
            {character.gameData.currentHp > getMaxHP(character)
              ? character.gameData.currentHp - getMaxHP(character)
              : 0}
          </p>
        </div>
        <div
          className="invisible hidden lg:block lg:visible w-20 h-8 ml-3 relative bg-contain bg-center bg-no-repeat"
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
