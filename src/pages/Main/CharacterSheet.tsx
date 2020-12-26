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
import ActionButtons from 'features/character/ActionButtons';
import ConditionsDefenses from 'features/character/ConditionsDefenses';
import DetailedEntry from 'features/detailedEntry/DetailedEntry';
import Description from 'features/character/Description';
import { CharacterListItem } from 'features/character/characterListSlice';
import LevelUp from 'features/character/LevelUp';
import CharacterPortrait from 'features/character/CharacterPortrait';

interface Props {
  character: CharacterListItem;
  readonly: boolean;
}

export const CharacterSheet: React.FC<Props> = ({ character, readonly }) => {
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
    <div className="w-full flex justify-center z-10">
      <div
        className="flex flex-wrap overflow-hidden"
        style={{ maxWidth: '62rem' }}
      >
        <div className="w-full justify-center md:justify-start flex flex-wrap">
          <div className="flex flex-col">
            <Name character={character} />
            <Alignment character={character} readonly={readonly} />
          </div>
          <ACHP character={character} readonly={readonly} />
          <CharacterPortrait character={character} />
          <div className="mt-1 sm:mt-3 flex flex-wrap justify-center">
            <Inspiration character={character} />
            <ActionButtons character={character} readonly={readonly} />
          </div>
          <div className="flex flex-wrap text-center mt-3">
            <AbilityScores character={character} />
            <ConditionsDefenses character={character} readonly={readonly} />
            <LevelUp character={character} readonly={readonly} />
          </div>
        </div>
        <div className="w-full md:w-1/2 lg:w-3/12">
          <div className="flex flex-col">
            <SavingThrows character={character} />
            <Senses character={character} />
            <Proficiencies character={character} />
          </div>
        </div>
        <div className="w-full md:w-1/2 lg:w-3/12">
          <Skills character={character} readonly={readonly} />
        </div>
        <div className="w-full lg:w-6/12">
          <div className="custom-border pb-10" style={{ height: '48.75rem' }}>
            <Tabs
              selectedIndex={characterTabPanel.selectedIndex}
              onSelect={tabIndex => handleTabChange(tabIndex)}
              className="h-full"
            >
              <TabList className="flex justify-between text-center tracking-tight">
                <Tab>Actions</Tab>
                {isSpellCaster(character) && <Tab>Spells</Tab>}
                <Tab>Equipment</Tab>
                <Tab>Features &amp; Traits</Tab>
                <Tab>Description</Tab>
                <Tab>Notes</Tab>
                <Tab>Extras</Tab>
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
                <div>Notes</div>
              </TabPanel>
              <TabPanel className="overflow-y-scroll px-2">
                <div>Extras</div>
              </TabPanel>
            </Tabs>
          </div>
        </div>
        {!panelOpen && (
          <div className="w-full mb-4" style={{ height: '10rem' }}>
            <div className="h-full my-2 custom-border bg-yellow-100 dark:bg-tertiary-dark rounded-lg">
              <div className="h-full overflow-y-scroll px-2">
                <DetailedEntry data={selectedEntry} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
