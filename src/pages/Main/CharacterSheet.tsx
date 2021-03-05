import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/rootReducer';
import Name from 'features/character/Name';
import Alignment from 'features/character/Alignment';
import Inspiration from 'features/character/Inspiration';
import AbilityScores from 'features/character/AbilityScores';
import ACHP from 'features/character/ACHP';
import SavingThrows from 'features/character/SavingThrows';
import Senses from 'features/character/Senses';
import Proficiencies from 'features/character/Proficiencies';
import Skills from 'features/character/Skills';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import { setSelectedIndex, TAB_PANELS } from 'features/tabs/tabsSlice';
import FeaturesTraits from 'features/character/FeaturesTraits';
import ItemsLoot from 'features/character/ItemsLoot';
import Actions from 'features/character/Actions';
import SpellCasting from 'features/character/SpellCasting';
import { isSpellCaster } from 'utils/character';
import ConditionsDefenses from 'features/character/ConditionsDefenses';
import DetailedEntry from 'features/detailedEntry/DetailedEntry';
import Description from 'features/character/Description';
import { CharacterListItem } from 'features/character/characterListSlice';
import LevelUp from 'features/character/LevelUp';
import CharacterPortrait from 'features/character/CharacterPortrait';
import MobileCharacterPortrait from 'features/character/MobileCharacterPortrait';
import Notes from 'features/character/Notes';
import Extras from 'features/character/Extras';
import { SourceDataFuseItem } from 'utils/search';
import FlyOut from 'features/character/FlyOut';

interface Props {
  character: CharacterListItem;
  readonly: boolean;
  searchIndex: Array<SourceDataFuseItem>;
}

export const CharacterSheet: React.FC<Props> = ({
  character,
  readonly,
  searchIndex,
}) => {
  const dispatch = useDispatch();

  const { tabPanels } = useSelector((state: RootState) => state.tabs);
  const characterTabPanel = tabPanels[TAB_PANELS.CHARACTER];
  const panelOpen = useSelector((state: RootState) => state.settings).panelOpen;
  const { selectedEntry } = useSelector(
    (state: RootState) => state.detailedEntry,
  );

  const handleTabChange = (tabIndex: number) => {
    const updatedPanel = {
      [TAB_PANELS.CHARACTER]: { selectedIndex: tabIndex },
    };
    dispatch(setSelectedIndex(updatedPanel));
  };

  return (
    <div className="flex flex-wrap overflow-hidden">
      <FlyOut character={character} readonly={readonly} />
      <div className="bg-light-100 dark:bg-dark-100 mt-3 mb-1 w-full justify-center md:justify-between flex flex-wrap">
        <div className="flex flex-col">
          <div className="lg:hidden w-full flex justify-center md:justify-start mr-2 mb-3">
            <MobileCharacterPortrait character={character} />
          </div>
          <Name character={character} />
          <Alignment character={character} readonly={readonly} />
        </div>
        <ACHP character={character} readonly={readonly} />
        <div className="hidden lg:block">
          <CharacterPortrait character={character} size={'large'} />
          <Inspiration character={character} />
        </div>
        <div className="flex flex-wrap justify-between text-center mt-1 w-full">
          <div className="w-full md:w-1/2 ">
            <AbilityScores character={character} />
          </div>
          <div className="w-full flex flex-wrap md:w-1/2">
            <ConditionsDefenses character={character} readonly={readonly} />
            <LevelUp character={character} readonly={readonly} />
          </div>
        </div>
      </div>
      <div className="w-full sm:w-1/2 lg:w-3/12 box-border pr-1">
        <div className="flex flex-col">
          <SavingThrows character={character} />
          <Senses character={character} />
          <Proficiencies character={character} />
        </div>
      </div>
      <div className="w-full sm:w-1/2 lg:w-3/12">
        <Skills character={character} readonly={readonly} />
      </div>
      <div className="w-full lg:w-6/12 box-border pl-1">
        <div
          className="bg-light-100 dark:bg-dark-100 custom-border pb-10"
          style={{ height: '43.7rem' }}
        >
          <Tabs
            selectedIndex={characterTabPanel.selectedIndex}
            onSelect={tabIndex => handleTabChange(tabIndex)}
            className="h-full"
          >
            <TabList className="flex md:justify-between text-center tracking-tight">
              <Tab className="mr-1 md:mr-0 cursor-pointer">Actions</Tab>
              {isSpellCaster(character) && (
                <Tab className="mr-1 md:mr-0 cursor-pointer">Spells</Tab>
              )}
              <Tab className="mr-1 md:mr-0 cursor-pointer">Equipment</Tab>
              <Tab className="mr-1 md:mr-0 cursor-pointer">
                Features &amp; Traits
              </Tab>
              <Tab className="mr-1 md:mr-0 cursor-pointer">Description</Tab>
              <Tab className="mr-1 md:mr-0 cursor-pointer">Notes</Tab>
              <Tab className="mr-1 md:mr-0 cursor-pointer">Extras</Tab>
            </TabList>

            <TabPanel className="overflow-y-scroll px-2">
              <Actions character={character} />
            </TabPanel>
            {isSpellCaster(character) && (
              <TabPanel className="overflow-y-scroll px-2">
                <SpellCasting character={character} readonly={readonly} />
              </TabPanel>
            )}
            <TabPanel className="overflow-y-scroll px-2">
              <ItemsLoot character={character} />
            </TabPanel>
            <TabPanel className="overflow-y-scroll px-2">
              <FeaturesTraits character={character} />
            </TabPanel>
            <TabPanel className="overflow-y-scroll px-2">
              <Description character={character} />
            </TabPanel>
            <TabPanel className="overflow-y-scroll px-2">
              <Notes character={character} readonly={readonly} />
            </TabPanel>
            <TabPanel className="overflow-y-scroll px-2">
              <Extras
                character={character}
                searchIndex={searchIndex}
                readonly={readonly}
              />
            </TabPanel>
          </Tabs>
        </div>
      </div>
      {!panelOpen && (
        <div className="w-full mb-2" style={{ height: '10rem' }}>
          <div className="h-full my-1 custom-border bg-light-200 dark:bg-dark-300 rounded-lg">
            <div className="detailed-entry h-full overflow-y-scroll px-2">
              <DetailedEntry data={selectedEntry} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
