import { RootState } from 'app/rootReducer';
import Entry from 'components/Entry/Entry';
import Items from 'components/Items/Items';
import SearchBar from 'components/SearchBar/SearchBar';
import SearchResults from 'components/SearchResults/SearchResults';
import { Spells } from 'components/Spells/Spells';
import TextBox from 'components/TextBox/TextBox';
import DetailedEntry from 'features/detailedEntry/DetailedEntry';
import { TAB_PANELS, setSelectedIndex } from 'features/tabs/tabsSlice';
import { Roller } from 'pages/Roller/Roller';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import { SourceDataFuseItem } from 'utils/search';
import { getActions, getSpells, getAllItems } from 'utils/sourceDataUtils';
import { useFuse } from 'utils/useFuse';

interface Props {
  searchIndex: Array<SourceDataFuseItem>;
}

const ToolKit = ({ searchIndex }: Props) => {
  const dispatch = useDispatch();
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
    <>
      <div className="px-1">
        <SearchBar
          onSearch={e => {
            onSearch(e);
            if (tabPanels[TAB_PANELS.RIGHTPANEL].selectedIndex !== 0) {
              const updatedPanel = {
                [TAB_PANELS.RIGHTPANEL]: { selectedIndex: 0 },
              };
              dispatch(setSelectedIndex(updatedPanel));
            }
          }}
        />
      </div>
      <div style={{ height: '30rem' }}>
        <Tabs
          selectedIndex={rightPanelTabPanel.selectedIndex}
          onSelect={tabIndex => handleTabChange(tabIndex)}
          className="px-1 h-full"
        >
          <TabList className="flex justify-between text-center">
            <Tab>Search</Tab>
            <Tab>Roller</Tab>
            <Tab>Actions</Tab>
            <Tab>Spells</Tab>
            <Tab>Items</Tab>
          </TabList>
          <div className="h-full my-2 custom-border custom-border-heavy bg-light-100 dark:bg-dark-300 rounded-lg">
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
      <div className="mt-8 px-1 h-full" style={{ height: '28rem' }}>
        <div className="h-full my-2 custom-border custom-border-heavy bg-light-100 dark:bg-dark-300 rounded-lg">
          <div className="detailed-entry h-full overflow-y-scroll px-2">
            <DetailedEntry data={selectedEntry} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ToolKit;
