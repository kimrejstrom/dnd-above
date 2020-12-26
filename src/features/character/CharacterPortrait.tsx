import { CharacterListItem } from 'features/character/characterListSlice';
import React from 'react';

interface Props {
  character: CharacterListItem;
}

const CharacterPortrait = ({ character }: Props) => {
  return (
    <div
      className="hidden sm:block ml-2"
      style={{ width: '10.5rem', height: '10.5rem' }}
    >
      <div className="relative">
        <img
          className="rounded-lg absolute object-cover object-top"
          style={{
            width: '10rem',
            height: '10rem',
            top: '0.25rem',
            left: '0.25rem',
          }}
          onError={(ev: any) => {
            ev.target.src = `${process.env.PUBLIC_URL}/img/races/default.png`;
          }}
          src={character.descriptionData.imageUrl}
          alt="character"
        />
        <div
          className="z-10 absolute custom-border custom-border-medium"
          style={{ width: '10.5rem', height: '10.5rem' }}
        ></div>
      </div>
    </div>
  );
};

export default CharacterPortrait;
