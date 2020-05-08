import React, { useState } from 'react';
import { Roller } from 'pages/Roller/Roller';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { TAB_PANELS, setSelectedIndex } from 'features/tabs/tabsSlice';
import { Spells } from 'components/Spells/Spells';
import Items from 'components/Items/Items';
import { ALL_ITEMS, ACTIONS, ALL_SPELLS } from 'utils/data';
import Entry from 'components/Entry/Entry';
import TextBox from 'components/TextBox/TextBox';
import DetailedEntry from 'features/detailedEntry/DetailedEntry';
import { ThemeMode } from 'features/theme/themeSlice';

interface Props {}

const RightPanel = (props: Props) => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme);
  const { tabPanels } = useSelector((state: RootState) => state.tabs);
  const { selectedEntry } = useSelector(
    (state: RootState) => state.detailedEntry,
  );
  const rightPanelTabPanel = tabPanels[TAB_PANELS.RIGHTPANEL];
  const [panelOpen, setPanelOpen] = useState(true);

  const handleTabChange = (tabIndex: number) => {
    const updatedPanel = {
      [TAB_PANELS.RIGHTPANEL]: { selectedIndex: tabIndex },
    };
    dispatch(setSelectedIndex(updatedPanel));
  };

  return (
    <>
      <button
        className="absolute"
        style={{ top: '1.8rem', right: '4rem' }}
        onClick={() => setPanelOpen(!panelOpen)}
      >
        <img
          src={`https://icon.now.sh/view_quilt/24/${
            theme === ThemeMode.DARK ? 'fffff0' : ''
          }`}
          alt="toggle"
        />
      </button>
      <div
        style={{ minHeight: 'calc(100% - 5rem)' }}
        className={`${
          panelOpen
            ? 'right-panel-open bg-secondary-light dark:bg-secondary-dark custom-border custom-border-l dark:border-primary-light'
            : 'right-panel-close w-0'
        } z-20 right-panel xl:relative absolute right-0 flex flex-shrink-0 flex-col overflow-hidden`}
      >
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
            <div className="h-full my-2 custom-border custom-border-thin bg-yellow-100 dark:bg-tertiary-dark rounded-lg">
              <TabPanel className="overflow-y-scroll px-2">
                <Roller />
              </TabPanel>
              <TabPanel className="overflow-y-scroll px-2">
                {ACTIONS.action.map(actionElement => (
                  <TextBox>
                    <Entry entry={actionElement} />
                  </TextBox>
                ))}
              </TabPanel>
              <TabPanel className="overflow-y-scroll px-2">
                <Spells spells={ALL_SPELLS} />
              </TabPanel>
              <TabPanel className="overflow-y-scroll px-2">
                <Items items={ALL_ITEMS} />
              </TabPanel>
            </div>
          </Tabs>
        </div>
        <div className="mt-8 pl-1 pr-3 h-full" style={{ height: '25rem' }}>
          <div className="h-full my-2 custom-border custom-border-thin bg-yellow-100 dark:bg-tertiary-dark rounded-lg">
            <div className="h-full overflow-y-scroll px-2">
              <DetailedEntry data={selectedEntry} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RightPanel;
