import React, { useEffect, useState } from 'react';
import { Roller } from 'pages/Roller/Roller';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { TAB_PANELS, setSelectedIndex } from 'features/tabs/tabsSlice';
import { Spells } from 'components/Spells/Spells';
import Items from 'components/Items/Items';
import { ALL_ITEMS, ACTIONS, loadSpells } from 'utils/data';
import Entry from 'components/Entry/Entry';
import TextBox from 'components/TextBox/TextBox';
import DetailedEntry from 'features/detailedEntry/DetailedEntry';
import { SpellElement } from 'models/spells';

interface Props {}

const RightPanel = (props: Props) => {
  const dispatch = useDispatch();
  const panelOpen = useSelector((state: RootState) => state.settings).panelOpen;
  const { tabPanels } = useSelector((state: RootState) => state.tabs);
  const { selectedEntry } = useSelector(
    (state: RootState) => state.detailedEntry,
  );
  const [spells, setSpells] = useState<SpellElement[]>([]);

  useEffect(() => {
    const getSpells = async () => {
      const spells = await loadSpells();
      setSpells(spells);
    };
    getSpells();
  }, []);

  const rightPanelTabPanel = tabPanels[TAB_PANELS.RIGHTPANEL];
  const handleTabChange = (tabIndex: number) => {
    const updatedPanel = {
      [TAB_PANELS.RIGHTPANEL]: { selectedIndex: tabIndex },
    };
    dispatch(setSelectedIndex(updatedPanel));
  };

  return (
    <div
      style={{ minHeight: 'calc(100% - 5rem)' }}
      className={`${
        panelOpen
          ? 'right-panel-open bg-light-400 dark:bg-dark-200 custom-border-lg custom-border-l dark:border-light-100'
          : 'right-panel-close w-0'
      } hidden z-20 right-panel 2xl:relative absolute right-0 lg:flex flex-shrink-0 flex-col overflow-hidden`}
    >
      {/* Search bar */}
      <div className="flex pl-1 pr-3 py-4 items-center">
        <div className="w-full">
          <div className="relative">
            <input
              type="search"
              placeholder="Search"
              className="appearance-none bg-light-100 border border-gray-400 text-dark-100 rounded pl-8 pr-4 py-2 w-full"
            />
            <div className="absolute top-0 left-0 p-3 flex items-center justify-center">
              <svg
                className="fill-current text-dark-100 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div style={{ height: '35rem' }}>
        <Tabs
          selectedIndex={rightPanelTabPanel.selectedIndex}
          onSelect={tabIndex => handleTabChange(tabIndex)}
          className="pl-1 pr-3 h-full"
        >
          <TabList className="flex justify-between text-center">
            <Tab>Roller</Tab>
            <Tab>Actions</Tab>
            <Tab>Spells</Tab>
            <Tab>Items</Tab>
          </TabList>
          <div className="h-full my-2 custom-border custom-border-thin bg-light-100 dark:bg-dark-300 rounded-lg">
            <TabPanel className="overflow-y-scroll px-2">
              <Roller />
            </TabPanel>
            <TabPanel className="overflow-y-scroll px-2">
              {ACTIONS.action.map(actionElement => (
                <TextBox key={actionElement.name}>
                  <Entry entry={actionElement} />
                </TextBox>
              ))}
            </TabPanel>
            <TabPanel className="overflow-y-scroll px-2">
              <Spells
                spells={spells}
                columns={['name', 'source', 'level', 'school', 'time', 'range']}
              />
            </TabPanel>
            <TabPanel className="overflow-y-scroll px-2">
              <Items items={ALL_ITEMS} />
            </TabPanel>
          </div>
        </Tabs>
      </div>
      <div className="mt-8 pl-1 pr-3 h-full" style={{ height: '29rem' }}>
        <div className="h-full my-2 custom-border custom-border-thin bg-light-100 dark:bg-dark-300 rounded-lg">
          <div className="h-full overflow-y-scroll px-2">
            <DetailedEntry data={selectedEntry} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
