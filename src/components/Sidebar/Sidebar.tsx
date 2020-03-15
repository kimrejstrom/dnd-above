import React from 'react';
import { CharacterState } from 'features/character/characterSlice';
import shield from 'images/shield.svg';

interface Props {
  character: CharacterState;
}

const Sidebar = ({ character }: Props) => {
  return (
    <div className="bg-tertiary-dark flex-none w-24 p-6 hidden md:block font-sans">
      <div className="cursor-pointer mb-4">
        <div className="bg-white h-12 w-12 flex items-center justify-center text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
          <img className="p-2" src={shield} alt="" />
        </div>
        <div className="text-center text-white opacity-50 text-sm">
          {character.name.substr(0, 3)}
        </div>
      </div>
      <div className="cursor-pointer">
        <div className="bg-white opacity-25 h-12 w-12 flex items-center justify-center text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
          <svg
            className="fill-current h-10 w-10 block"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M16 10c0 .553-.048 1-.601 1H11v4.399c0 .552-.447.601-1 .601-.553 0-1-.049-1-.601V11H4.601C4.049 11 4 10.553 4 10c0-.553.049-1 .601-1H9V4.601C9 4.048 9.447 4 10 4c.553 0 1 .048 1 .601V9h4.399c.553 0 .601.447.601 1z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
