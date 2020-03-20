import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { ThemeMode } from 'features/theme/themeSlice';
import { CharacterState } from 'features/character/characterSlice';
import { getAbilityMod, calculateStats, getMaxHP } from 'utils/character';
import hpLight from 'images/hp-light.png';
import acLight from 'images/ac-light.png';
import hpDark from 'images/hp-dark.png';
import acDark from 'images/ac-dark.png';
import initiativeDark from 'images/initiative-dark.png';
import initiativeLight from 'images/initiative-light.png';

interface Props {
  character: CharacterState;
}

const ACHP = ({ character }: Props) => {
  const theme = useSelector((state: RootState) => state.theme);
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
        <p
          className="text-2xl absolute inset-0 text-center"
          style={{
            top: '2.8rem',
            left: '0.1rem',
          }}
        >
          17
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
          {getMaxHP(
            character.class.hd.faces,
            character.level,
            getAbilityMod(calculateStats(character).con),
          )}
        </p>
      </div>
    </>
  );
};

export default ACHP;
