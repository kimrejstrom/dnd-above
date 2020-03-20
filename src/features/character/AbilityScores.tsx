import React from 'react';
import {
  CharacterState,
  CHARACTER_STATS,
  StatsTypes,
} from 'features/character/characterSlice';
import { calculateStats, getAbilityMod } from 'utils/character';

interface Props {
  character: CharacterState;
}

const AbilityScores = ({ character }: Props) => {
  return (
    <div className="flex text-center">
      {Object.entries(CHARACTER_STATS).map(([key, value]) => {
        const score = calculateStats(character)[key as StatsTypes];
        const mod = getAbilityMod(score);
        return (
          <div className="w-20 h-24 mr-2 custom-border flex flex-col items-center">
            <div className="uppercase text-sm">{value}</div>
            <div className="text-3xl leading-tight">{mod}</div>
            <div className="text-lg rounded bg-yellow-100 dark:bg-primary-dark custom-border custom-border-thin h-10 w-10">
              {score}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AbilityScores;
