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
    <div className="flex text-center justify-center md:justify-between lg:justify-start flex-wrap lg:flex-nowrap m-auto md:m-0 w-80 lg:w-auto">
      {Object.entries(CHARACTER_STATS).map(([key, value]) => {
        const score = calculateStats(character)[key as StatsTypes];
        const mod = getAbilityMod(score);
        return (
          <div
            key={key}
            className="mb-6 mx-2 md:mx-0 md:mr-1 relative w-20 h-20 bg-light-100 dark:bg-dark-100 custom-border-sm flex flex-col items-center"
          >
            <div className="absolute top-0 -mt-2 uppercase text-xs">
              {value}
            </div>
            <div className="text-3xl leading-none mt-3">{mod}</div>
            <div className="leading-4 text-lg rounded bg-light-100 dark:bg-dark-100 custom-border-xs h-8 w-8">
              {score}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AbilityScores;
