import React from 'react';
import {
  CharacterState,
  CHARACTER_STATS,
  StatsTypes,
} from 'features/character/characterListSlice';
import { calculateStats, getAbilityMod } from 'utils/character';

interface Props {
  character: CharacterState;
  customBorder?: boolean;
}

const AbilityScores = ({ character }: Props) => {
  return (
    <div className="flex text-center">
      {Object.entries(CHARACTER_STATS).map(([key, value]) => {
        const score = calculateStats(character)[key as StatsTypes];
        const mod = getAbilityMod(score);
        return (
          <>
            {/* <div className="relative mr-1">
              <div className="absolute w-16 -mt-5 top-0 text-center uppercase text-sm">
                {value}
              </div>
              <div className="w-16 h-16 bg-yellow-100 dark:bg-primary-dark custom-border flex flex-col items-center rounded-full">
                <div className="text-3xl leading-none">{mod}</div>
                <div className="text-lg rounded bg-yellow-100 dark:bg-primary-dark custom-border custom-border-thin h-10 w-10">
                  {score}
                </div>
              </div>
            </div> */}

            <div className="relative w-20 h-20 bg-yellow-100 dark:bg-primary-dark custom-border flex flex-col items-center">
              <div className="absolute top-0 -mt-2 uppercase text-sm">
                {value}
              </div>
              <div className="text-3xl leading-none mt-3">{mod}</div>
              <div className="text-lg rounded bg-yellow-100 dark:bg-primary-dark custom-border custom-border-thin h-10 w-10">
                {score}
              </div>
            </div>
          </>
        );
      })}
    </div>
  );
};

export default AbilityScores;
