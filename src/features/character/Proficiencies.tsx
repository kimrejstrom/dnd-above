import React from 'react';
import { CharacterListItem } from 'features/character/characterListSlice';
import {
  getArmorProficiencies,
  getWeaponProficiencies,
  getToolProficiencies,
  getLanguageProficiencies,
} from 'utils/character';
import DetailedEntryTrigger from 'features/detailedEntry/DetailedEntryTrigger';
import { mainRenderer } from 'utils/mainRenderer';
import { getLanguage } from 'utils/sourceDataUtils';

interface Props {
  character: CharacterListItem;
}

const Proficiencies = ({ character }: Props) => {
  return (
    <div
      className="custom-border w-full px-2 overflow-y-scroll"
      style={{ height: '26.25rem' }}
    >
      <div className="text-xl text-center leading-none mt-1 mb-2">
        Proficiencies &amp; Languages
      </div>
      <div>
        <div className="flex flex-col my-2">
          <div className="text-xl">Armor</div>
          <div className="dnd-body">
            {getArmorProficiencies(character).join(', ')}
          </div>
          <div className="mt-1 w-full border-b-2 border-dark-100 dark:border-light-100"></div>
          <div className="text-xl">Weapons</div>
          <div className="dnd-body">
            {getWeaponProficiencies(character).join(', ')}
          </div>
          <div className="mt-1 w-full border-b-2 border-dark-100 dark:border-light-100"></div>
          <div className="text-xl">Tools</div>
          <div className="dnd-body">
            {getToolProficiencies(character).join(', ')}
          </div>
          <div className="mt-1 w-full border-b-2 border-dark-100 dark:border-light-100"></div>
          <div className="text-xl">Languages</div>
          <div className="dnd-body">
            {getLanguageProficiencies(character).map((lang, i) => {
              const lastIndex = getLanguageProficiencies(character).length - 1;
              return (
                <DetailedEntryTrigger
                  key={`${lang}-${i}`}
                  extraClassName={'inline'}
                  data={getLanguage(lang)}
                  renderer={mainRenderer.language.getCompactRenderedString(
                    getLanguage(lang),
                  )}
                >
                  {i === lastIndex ? `${lang}` : `${lang}, `}
                </DetailedEntryTrigger>
              );
            })}
          </div>
          <div className="mt-1 w-full border-b-2 border-dark-100 dark:border-light-100"></div>
        </div>
      </div>
    </div>
  );
};

export default Proficiencies;
