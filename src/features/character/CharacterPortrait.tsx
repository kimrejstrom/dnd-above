import { CharacterListItem } from 'features/character/characterListSlice';
import React from 'react';

interface Props {
  character: CharacterListItem;
  size: 'small' | 'large';
}

const CharacterPortrait: React.FC<Props> = ({ character, size }) => {
  const isLarge = size === 'large';
  const imageSize = {
    width: isLarge ? '8rem' : '7rem',
    height: isLarge ? '8rem' : '7rem',
    top: '0.25rem',
    left: '0.25rem',
  };
  const containerSize = {
    width: isLarge ? '8.5rem' : '7.5rem',
    height: isLarge ? '8.5rem' : '7.5rem',
  };
  return (
    <div className="flex-shrink-0" style={containerSize}>
      <div className="relative">
        <img
          className="rounded-lg absolute object-cover object-top"
          style={imageSize}
          onError={(ev: any) => {
            ev.target.src = `${process.env.PUBLIC_URL}/img/races/default.png`;
          }}
          src={character.descriptionData.imageUrl}
          alt="character"
        />
        <div
          className="z-10 absolute custom-border-sm custom-border-thin"
          style={containerSize}
        ></div>
      </div>
    </div>
  );
};

export default CharacterPortrait;
