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
import dudeDark from 'images/dude-dark.png';
import dudeLight from 'images/dude-light.png';
import { ThemeMode } from 'features/theme/themeSlice';
import { getSelectedCharacter } from 'app/selectors';
import ConditionsDefenses from 'features/character/ConditionsDefenses';
import DetailedEntry from 'features/detailedEntry/DetailedEntry';
import Description from 'features/character/Description';
import { levelUp } from 'features/character/characterListSlice';

interface Props {}

export const Main: React.FC<Props> = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme);
  const character = useSelector(getSelectedCharacter);
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

  const handleLevelUp = () => {
    dispatch(levelUp({ id: character.id }));
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
            <Alignment character={character} />
          </div>
          <ACHP character={character} />

          <div
            className="hidden sm:block ml-2"
            style={{ width: '10.5rem', height: '10.5rem' }}
          >
            <div className="relative">
              <img
                className="rounded-lg absolute object-cover object-center"
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
          <div className="mt-1 sm:mt-3 flex flex-wrap justify-center">
            <Inspiration character={character} />
            <ActionButtons character={character} />
          </div>
          <div className="flex flex-wrap text-center mt-3">
            <AbilityScores character={character} />
            <ConditionsDefenses character={character} />
            <div
              onClick={handleLevelUp}
              className="bg-secondary-light hover:bg-primary-light dark:bg-tertiary-dark dark:text-primary-light dark-hover:bg-primary-dark cursor-pointer flex justify-center ml-1 custom-border custom-border-medium h-20 w-full md:w-20"
            >
              <div
                className="flex flex-col justify-center items-center rounded-lg"
                style={{
                  height: '4.6rem',
                  width: '4.6rem',
                  marginTop: '-0.55rem',
                }}
              >
                <img
                  className="h-10 ml-2 -mt-1"
                  src={theme === ThemeMode.DARK ? dudeLight : dudeDark}
                  alt="logo"
                />
                <div className="-mb-3 text-sm">Level Up</div>
              </div>
            </div>
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
          <Skills character={character} />
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
                  <SpellCasting character={character} />
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
