import React from 'react';
import { Roller } from 'pages/Roller/Roller';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { TAB_PANELS, setSelectedIndex } from 'features/tabs/tabsSlice';
import { Spells } from 'components/Spells/Spells';
import { Weapons } from 'components/Weapons/Weapons';
import { Armor } from 'components/Armor/Armor';
import Items from 'components/Items/Items';
// import { Navigation } from 'components/Navigation/Navigation';

interface Props {}

const RightPanel = (props: Props) => {
  const dispatch = useDispatch();
  const { tabPanels } = useSelector((state: RootState) => state.tabs);
  const rightPanelTabPanel = tabPanels[TAB_PANELS.RIGHTPANEL];

  const handleTabChange = (tabIndex: number) => {
    const updatedPanel = {
      [TAB_PANELS.RIGHTPANEL]: { selectedIndex: tabIndex },
    };
    dispatch(setSelectedIndex(updatedPanel));
  };
  return (
    <div className="flex w-4/12 flex-shrink-0 flex-col bg-secondary-light dark:bg-secondary-dark overflow-hidden custom-border custom-border-l dark:border-primary-light">
      {/* Search bar */}
      <div className="flex pl-1 pr-3 py-4 items-center">
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
      <div style={{ height: '70rem' }}>
        <Tabs
          selectedIndex={rightPanelTabPanel.selectedIndex}
          onSelect={tabIndex => handleTabChange(tabIndex)}
          className="pl-1 pr-3 h-full"
        >
          <TabList className="flex justify-between text-center">
            <Tab>Roller</Tab>
            <Tab>Spells</Tab>
            <Tab>Items</Tab>
            <Tab>Weapons</Tab>
            <Tab>Armor</Tab>
          </TabList>
          <div className="h-full my-2 custom-border custom-border-thin bg-yellow-100 dark:bg-tertiary-dark rounded-lg">
            <TabPanel className="overflow-y-scroll px-2">
              <Roller />
            </TabPanel>
            <TabPanel className="overflow-y-scroll px-2">
              <Spells />
            </TabPanel>
            <TabPanel className="overflow-y-scroll px-2">
              <Items />
            </TabPanel>
            <TabPanel className="overflow-y-scroll px-2">
              <Weapons />
            </TabPanel>
            <TabPanel className="overflow-y-scroll px-2">
              <Armor />
            </TabPanel>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default RightPanel;