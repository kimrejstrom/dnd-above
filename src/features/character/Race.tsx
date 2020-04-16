import React from 'react';
import { CharacterState } from 'features/character/characterListSlice';

interface Props {
  character: CharacterState;
}

const Race = ({ character }: Props) => {
  return (
    <div className="flex" style={{ width: '50rem' }}>
      <div className="w-4/12 mb-6 pb-2 mx-2 border-b-2 border-primary-dark dark:border-primary-light text-xl">
        <div>{character.raceData.race}</div>
        <div className="-mb-10 text-primary-dark dark:text-primary-light">
          Race
        </div>
      </div>
      <div className="w-5/12 mb-6 pb-2 mx-2 border-b-2 border-primary-dark dark:border-primary-light text-xl">
        <div>{`${character.classData.classElement} – ${character.classData.subClass}`}</div>
        <div className="-mb-10 text-primary-dark dark:text-primary-light">
          Class
        </div>
      </div>
      <div className="w-3/12 mb-6 pb-2 mx-2 border-b-2 border-primary-dark dark:border-primary-light text-xl">
        <div>1000 / 4500</div>
        <div className="-mb-10 text-primary-dark dark:text-primary-light">
          XP
        </div>
      </div>
    </div>
  );
};

export default Race;