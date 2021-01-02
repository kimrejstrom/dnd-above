import React from 'react';
import {
  CharacterListItem,
  CHARACTER_STATS,
  StatsTypes,
} from 'features/character/characterListSlice';
import { calculateStats, getAbilityMod } from 'utils/character';

interface Props {
  character: CharacterListItem;
  customBorder?: boolean;
}

const AbilityScores = ({ character }: Props) => {
  return (
    <div className="flex text-center justify-center md:justify-start flex-wrap md:flex-nowrap m-auto w-80 md:w-auto">
      {Object.entries(CHARACTER_STATS).map(([key, value]) => {
        const score = calculateStats(character)[key as StatsTypes];
        const mod = getAbilityMod(score);
        return (
          <div
            key={key}
            className="mb-6 mx-2 sm:mx-0 sm:mr-1 relative w-20 h-20 bg-yellow-100 dark:bg-primary-dark custom-border flex flex-col items-center"
          >
            <div className="absolute top-0 -mt-2 uppercase text-xs">
              {value}
            </div>
            <div className="text-3xl leading-none mt-3">{mod}</div>
            <div className="leading-5 text-lg rounded bg-yellow-100 dark:bg-primary-dark custom-border custom-border-thin h-10 w-10">
              {score}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AbilityScores;
