import React from 'react';
import { Roller } from 'pages/Roller/Roller';
import { Spells } from 'pages/Spells/Spells';
import { useSelector } from 'react-redux';
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

interface Props {}

export const Main: React.FC<Props> = () => {
  const character: CharacterState = useSelector(
    (state: RootState) => state.character,
  );
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
            <Tabs>
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
                <div>Features &amp; Traits</div>
              </TabPanel>
              <TabPanel className="overflow-y-scroll px-2">
                <div>Description</div>
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
        <div className="flex p-4 items-center">
          <div className="w-full">
            <div className="relative">
              <input
                type="search"
                placeholder="Search"
                className="appearance-none bg-yellow-100 border border-gray-400 text-primary-dark rounded pl-8 pr-4 py-2 w-full"
              />
              <div className="absolute top-0 left-0 p-3 flex items-center justify-center">
                <svg
                  className="fill-current text-primary-dark h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 flex-1 overflow-y-scroll">
          <Roller />
        </div>
      </div>
    </div>
  );
};
