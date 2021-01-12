import { CharacterListItem } from 'features/character/characterListSlice';
import CharacterPortrait from 'features/character/CharacterPortrait';
import React from 'react';

interface Props {
  character: CharacterListItem;
}

const MobileCharacterPortrait = ({ character }: Props) => {
  return (
    <>
      <CharacterPortrait character={character} size={'small'} />
      <div className="ml-2">
        <h1 className="whitespace-nowrap">{character.descriptionData.name}</h1>
        <div className="flex justify-start items-start">
          <img
            className="w-8 mt-0.5 mr-2 rounded bg-contain"
            src={`${
              process.env.PUBLIC_URL
            }/img/${character.classData.classElement.toLowerCase()}.jpeg`}
            alt={character.classData.classElement}
            style={{
              filter: 'grayscale(80%)',
            }}
          />
          <div>
            <div className="flex flex-col">
              <div className="text-lg leading-none">
                {character.classData.classElement}
              </div>
              <div className="text-lg leading-none">
                {character.classData.subClass}
              </div>
            </div>
          </div>
        </div>
        <div className="text-lg leading-none mt-1">
          Race: {character.raceData.race}
        </div>
        <div className="text-lg leading-none">
          Level: {character.gameData?.level ? character.gameData.level : 0}
        </div>
      </div>
    </>
  );
};

export default MobileCharacterPortrait;
