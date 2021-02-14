import React from 'react';
import { Roller } from 'pages/Roller/Roller';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { TAB_PANELS, setSelectedIndex } from 'features/tabs/tabsSlice';
import { Spells } from 'components/Spells/Spells';
import Items from 'components/Items/Items';
import Entry from 'components/Entry/Entry';
import TextBox from 'components/TextBox/TextBox';
import DetailedEntry from 'features/detailedEntry/DetailedEntry';
import { getActions, getAllItems, getSpells } from 'utils/sourceDataUtils';
import { SourceDataFuseItem } from 'utils/search';
import { useFuse } from 'utils/useFuse';
import SearchBar from 'components/SearchBar/SearchBar';
import SearchResults from 'components/SearchResults/SearchResults';

interface Props {
  searchIndex: Array<SourceDataFuseItem>;
}

const RightPanel = ({ searchIndex }: Props) => {
  const dispatch = useDispatch();
  const panelOpen = useSelector((state: RootState) => state.settings).panelOpen;
  const { tabPanels } = useSelector((state: RootState) => state.tabs);
  const { selectedEntry } = useSelector(
    (state: RootState) => state.detailedEntry,
  );

  const rightPanelTabPanel = tabPanels[TAB_PANELS.RIGHTPANEL];
  const handleTabChange = (tabIndex: number) => {
    const updatedPanel = {
      [TAB_PANELS.RIGHTPANEL]: { selectedIndex: tabIndex },
    };
    dispatch(setSelectedIndex(updatedPanel));
  };

  const { hits, query, onSearch } = useFuse(searchIndex, {
    keys: ['name'],
    limit: 20,
  });

  return (
    <div
      style={{ minHeight: 'calc(100% - 5rem)' }}
      className={`${
        panelOpen
          ? 'right-panel-open custom-bg bg-light-400 dark:bg-dark-200 custom-border-lg custom-border-l dark:border-light-100'
          : 'right-panel-close w-0'
      } hidden z-20 right-panel 2xl:relative absolute right-0 lg:flex flex-shrink-0 flex-col overflow-hidden`}
    >
      <div className="pl-1 pr-3">
        <SearchBar onSearch={onSearch} />
      </div>
      <div style={{ height: '30rem' }}>
        <Tabs
          selectedIndex={rightPanelTabPanel.selectedIndex}
          onSelect={tabIndex => handleTabChange(tabIndex)}
          className="pl-1 pr-3 h-full"
        >
          <TabList className="flex justify-between text-center">
            <Tab>Search</Tab>
            <Tab>Roller</Tab>
            <Tab>Actions</Tab>
            <Tab>Spells</Tab>
            <Tab>Items</Tab>
          </TabList>
          <div className="h-full my-2 custom-border custom-border-thin bg-light-100 dark:bg-dark-300 rounded-lg">
            <TabPanel className="overflow-y-scroll px-2 dnd-body">
              <SearchResults query={query} hits={hits} />
            </TabPanel>
            <TabPanel className="overflow-y-scroll px-2">
              <Roller />
            </TabPanel>
            <TabPanel className="overflow-y-scroll px-2">
              {getActions()!.map(actionElement => (
                <TextBox
                  extraClassName="my-2 bg-light-200"
                  key={actionElement.name}
                >
                  <Entry entry={actionElement} />
                </TextBox>
              ))}
            </TabPanel>
            <TabPanel className="overflow-y-scroll px-2">
              <Spells
                spells={getSpells()!}
                columns={['name', 'level', 'time', 'range', 'source']}
              />
            </TabPanel>
            <TabPanel className="overflow-y-scroll px-2">
              <Items items={getAllItems()!} />
            </TabPanel>
          </div>
        </Tabs>
      </div>
      <div className="mt-8 pl-1 pr-3 h-full" style={{ height: '27rem' }}>
        <div className="h-full my-2 custom-border custom-border-thin bg-light-100 dark:bg-dark-300 rounded-lg">
          <div className="detailed-entry h-full overflow-y-scroll px-2">
            <DetailedEntry data={selectedEntry} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
