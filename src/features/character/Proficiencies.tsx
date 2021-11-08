import React from 'react';
import { CharacterListItem } from 'features/character/characterListSlice';
import {
  getArmorProficiencies,
  getWeaponProficiencies,
  getToolProficiencies,
  getLanguageProficiencies,
} from 'utils/character';
import DetailedEntryTrigger from 'features/detailedEntry/DetailedEntryTrigger';
import { getItem, getLanguage } from 'utils/sourceDataUtils';
import { RenderItem, RenderLanguage } from 'utils/render';

interface Props {
  character: CharacterListItem;
}

const Proficiencies = ({ character }: Props) => {
  return (
    <div
      className="custom-bg custom-border w-full px-2 overflow-y-scroll"
      style={{ height: '23.55rem' }}
    >
      <div className="text-xl text-center leading-none">
        Proficiencies &amp; Languages
      </div>
      <div>
        <div className="flex flex-col my-2 capitalize">
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
            {getToolProficiencies(character).map((toolName, i) => {
              const lastIndex = getToolProficiencies(character).length - 1;
              const tool = getItem(toolName);
              return tool ? (
                <DetailedEntryTrigger
                  key={`${toolName}-${i}`}
                  extraClassName={'tight inline'}
                  data={tool}
                  renderer={RenderItem(tool)}
                >
                  {i === lastIndex ? `${toolName}` : `${toolName}, `}
                </DetailedEntryTrigger>
              ) : i === lastIndex ? (
                `${toolName}`
              ) : (
                `${toolName}, `
              );
            })}
          </div>
          <div className="mt-1 w-full border-b-2 border-dark-100 dark:border-light-100"></div>
          <div className="text-xl">Languages</div>
          <div className="dnd-body">
            {getLanguageProficiencies(character).map((lang, i) => {
              const lastIndex = getLanguageProficiencies(character).length - 1;
              const currentLang = getLanguage(lang);
              return (
                currentLang && (
                  <DetailedEntryTrigger
                    key={`${lang}-${i}`}
                    extraClassName={'tight inline'}
                    data={currentLang}
                    renderer={RenderLanguage(currentLang)}
                  >
                    {i === lastIndex ? `${lang}` : `${lang}, `}
                  </DetailedEntryTrigger>
                )
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
