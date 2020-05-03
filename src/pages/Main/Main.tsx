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
import StyledButton from 'components/StyledButton/StyledButton';

interface Props {}

export const Main: React.FC<Props> = () => {
  const dispatch = useDispatch();
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
    <>
      <div className="w-full flex flex-wrap">
        <div>
          <Name character={character} />
          <Alignment character={character} />
        </div>
        <ACHP character={character} />
        {/* <Alignment character={character} /> */}
        <div className="flex flex-col">
          <Inspiration character={character} />

          <StyledButton
            extraClassName="ml-2 -mt-1 mb-1 h-10"
            onClick={() => console.log('short')}
          >
            Short Rest
          </StyledButton>
          <StyledButton
            extraClassName="ml-2 mb-1 h-10"
            onClick={() => console.log('long')}
          >
            Long Rest
          </StyledButton>
        </div>
        <div className="flex flex-wrap items-center text-center mt-2 mb-6">
          <div>
            <AbilityScores character={character} />
          </div>
        </div>
      </div>
      <div className="w-3/12 h-full">
        <div className="flex flex-col">
          <SavingThrows character={character} />
          <Senses character={character} />
          <Proficiencies character={character} />
          {character.gameData.feats.length > 0 && (
            <Feats character={character} />
          )}
        </div>
      </div>
      <div className="w-3/12 h-full">
        <Skills character={character} />
      </div>
      <div className="w-6/12 h-full">
        <div className="custom-border pb-10" style={{ height: '50rem' }}>
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
                <Background background={character.descriptionData.background} />
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
    </>
  );
};
