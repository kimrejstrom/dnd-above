import React from 'react';
import { CharacterState } from 'features/character/characterListSlice';
import {
  getArmorProficiencies,
  getWeaponProficiencies,
  getToolProficiencies,
  getLanguageProficiencies,
} from 'utils/character';

interface Props {
  character: CharacterState;
}

const Proficiencies = ({ character }: Props) => {
  return (
    <div className="custom-border w-full px-2">
      <div className="text-xl text-center leading-none mt-1 mb-2">
        Proficiencies &amp; Languages
      </div>
      <div>
        <div className="flex flex-col my-2">
          <div className="text-xl">Armor</div>
          <div className="dnd-body">
            {getArmorProficiencies(character).join(', ')}
          </div>
          <div className="mt-1 w-full border-b-2 border-primary-dark dark:border-primary-light"></div>
          <div className="text-xl">Weapons</div>
          <div className="dnd-body">
            {getWeaponProficiencies(character).join(', ')}
          </div>
          <div className="mt-1 w-full border-b-2 border-primary-dark dark:border-primary-light"></div>
          <div className="text-xl">Tools</div>
          <div className="dnd-body">
            {getToolProficiencies(character).join(', ')}
          </div>
          <div className="mt-1 w-full border-b-2 border-primary-dark dark:border-primary-light"></div>
          <div className="text-xl">Languages</div>
          <div className="dnd-body">
            {getLanguageProficiencies(character).join(', ')}
          </div>
          <div className="mt-1 w-full border-b-2 border-primary-dark dark:border-primary-light"></div>
        </div>
      </div>
    </div>
  );
};

export default Proficiencies;
