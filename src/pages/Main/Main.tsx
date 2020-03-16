import React from 'react';
import { Spells } from 'components/Spells/Spells';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { CharacterState } from 'features/character/characterSlice';
import Name from 'features/character/Name';
import Alignment from 'features/character/Alignment';
import Inspiration from 'features/character/Inspiration';
import Race from 'features/character/Race';
import AbilityScores from 'features/character/AbilityScores';
import ACHP from 'features/character/ACHP';
import SavingThrows from 'features/character/SavingThrows';
import Senses from 'features/character/Senses';
import Proficiencies from 'features/character/Proficiencies';
import Skills from 'features/character/Skills';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import Sidebar from 'components/Sidebar/Sidebar';
import { setSelectedIndex, TAB_PANELS } from 'features/tabs/tabsSlice';
import FeaturesTraits from 'features/character/FeaturesTraits';
import Entry from 'components/Entry/Entry';
import RightPanel from 'components/RightPanel/RightPanel';

interface Props {}

export const Main: React.FC<Props> = () => {
  const dispatch = useDispatch();
  const character: CharacterState = useSelector(
    (state: RootState) => state.character,
  );
  const { tabPanels } = useSelector((state: RootState) => state.tabs);
  const characterTabPanel = tabPanels[TAB_PANELS.CHARACTER];

  const handleTabChange = (tabIndex: number) => {
    const updatedPanel = {
      [TAB_PANELS.CHARACTER]: { selectedIndex: tabIndex },
    };
    dispatch(setSelectedIndex(updatedPanel));
  };

  return (
    <div className="flex w-full">
      <Sidebar character={character} />
      {/* Main content */}
      <div className="flex w-10/12 flex-wrap bg-yellow-100 dark:bg-primary-dark p-4 h-full">
        <div className="w-full flex flex-wrap">
          <Name character={character} />
          <Alignment character={character} />
          <Inspiration character={character} />
          <Race character={character} />
          <div className="flex flex-wrap items-center text-center mt-2 mb-6">
            <AbilityScores character={character} />
            <ACHP character={character} />
          </div>
        </div>
        <div className="w-3/12 h-full">
          <div className="flex flex-col">
            <SavingThrows character={character} />
            <Senses character={character} />
            <Proficiencies character={character} />
          </div>
        </div>
        <div className="w-3/12 h-full">
          <Skills character={character} />
        </div>
        <div className="w-6/12 h-full">
          <div className="custom-border h-full pb-6">
            <Tabs
              selectedIndex={characterTabPanel.selectedIndex}
              onSelect={tabIndex => handleTabChange(tabIndex)}
            >
              <TabList className="flex justify-between text-center">
                <Tab>Actions</Tab>
                <Tab>Spells</Tab>
                <Tab>Equipment</Tab>
                <Tab>Features &amp; Traits</Tab>
                <Tab>Description</Tab>
                <Tab>Notes</Tab>
                <Tab>Extras</Tab>
              </TabList>

              <TabPanel className="overflow-y-scroll px-2">
                <div>Actions</div>
              </TabPanel>
              <TabPanel className="overflow-y-scroll px-2">
                <Spells />
              </TabPanel>
              <TabPanel className="overflow-y-scroll px-2">
                <div>Equipment</div>
              </TabPanel>
              <TabPanel className="overflow-y-scroll px-2">
                <div className="text-2xl">Features &amp; Traits</div>
                <FeaturesTraits character={character} />
              </TabPanel>
              <TabPanel className="overflow-y-scroll px-2">
                <div>
                  <div className="text-2xl">Background</div>
                  <div className="text-xl">{character.background.name}</div>
                  {character.background.entries?.map(entry => (
                    <div className="font-sans my-2 custom-border custom-border-thin">
                      <Entry entry={entry} />
                    </div>
                  ))}
                </div>
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
      </div>
      {/* Right side */}
      <div className="flex w-4/12 flex-col bg-secondary-light dark:bg-secondary-dark overflow-hidden custom-border custom-border-l dark:border-primary-light">
        <RightPanel />
      </div>
    </div>
  );
};
