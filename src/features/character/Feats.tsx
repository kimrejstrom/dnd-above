import React from 'react';
import { CharacterListItem } from 'features/character/characterListSlice';
import { getFeat } from 'utils/sourceDataUtils';
import DetailedEntryTrigger from 'features/detailedEntry/DetailedEntryTrigger';

interface Props {
  character: CharacterListItem;
}

const Feats = ({ character }: Props) => {
  return (
    <div className="custom-border w-full px-2">
      <div className="text-xl text-center leading-none my-1">Feats</div>
      <div className="flex flex-wrap">
        {character.gameData.feats.map(featName => {
          const feat = getFeat(featName);
          return (
            <div className="flex w-full p-1">
              <DetailedEntryTrigger data={feat} extraClassName="w-full">
                <div className="custom-border custom-border-thin uppercase flex justify-between items-center w-full h-8">
                  <div className="text-lg ml-3 flex-grow">{feat?.name}</div>
                  <div className="text-md ml-1">({feat?.source})</div>
                </div>
              </DetailedEntryTrigger>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Feats;
