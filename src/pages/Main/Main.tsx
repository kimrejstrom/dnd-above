import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/rootReducer';
import {
  CharacterList,
  DEAFULT_CHARACTER,
} from 'features/character/characterListSlice';
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
import Background from 'pages/Create/Background';
import ItemsLoot from 'features/character/ItemsLoot';
import Actions from 'features/character/Actions';
import SpellCasting from 'features/character/SpellCasting';
import { isSpellCaster } from 'utils/character';
import Feats from 'features/character/Feats';
import Rests from 'features/character/Rests';
import dudeDark from 'images/dude-dark.png';
import dudeLight from 'images/dude-light.png';
import { ThemeMode } from 'features/theme/themeSlice';

interface Props {}

export const Main: React.FC<Props> = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme);
  const characterList: CharacterList = useSelector(
    (state: RootState) => state.characterList,
  );
  const selectedCharacterId: string = useSelector(
    (state: RootState) => state.selectedCharacter,
  );
  const character =
    characterList.find(char => char.id === selectedCharacterId) ||
    DEAFULT_CHARACTER;
  const { tabPanels } = useSelector((state: RootState) => state.tabs);
  const characterTabPanel = tabPanels[TAB_PANELS.CHARACTER];

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
          <div className="flex flex-col mr-2">
            <Name character={character} />
            <Alignment character={character} />
          </div>
          <ACHP character={character} />
          <div className="flex flex-wrap md:flex-no-wrap md:flex-col justify-center md:justify-start">
            <Inspiration character={character} />
            <Rests character={character} />
          </div>
          <div className="flex flex-wrap text-center mt-3">
            <AbilityScores character={character} />
            <div
              className="text-left text-sm custom-border h-20 flex"
              style={{ width: '24rem' }}
            >
              <div className="w-1/2">
                <div className="-mt-2">Defenses</div>
              </div>
              <div className="w-1/2 custom-border custom-border-medium custom-border-l">
                <div className="-mt-2">Conditions</div>
              </div>
            </div>
            <div className="flex justify-center ml-1 custom-border custom-border-medium h-20 w-full md:w-20">
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
            {character.gameData.feats.length > 0 && (
              <Feats character={character} />
            )}
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
              <TabList className="flex justify-between text-center">
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
                <div>
                  <div className="text-2xl">Background</div>
                  <Background
                    background={character.descriptionData.background}
                  />
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
    </div>
  );
};
