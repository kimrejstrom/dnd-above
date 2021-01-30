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
import {
  findSearchResultSourceData,
  ResultType,
  SourceDataFuseItem,
} from 'utils/search';
import { useFuse } from 'utils/useFuse';
import DetailedEntryTrigger from 'features/detailedEntry/DetailedEntryTrigger';

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
      {/* Search bar */}
      <div className="flex pl-1 pr-3 py-4 items-center">
        <div className="w-full">
          <div className="relative">
            <input
              name="search"
              type="text"
              placeholder="Search..."
              className="form-input rounded pl-8 pr-4 py-2 w-full"
              autoComplete="off"
              onKeyUp={onSearch}
              onChange={onSearch} // handles "clear search" click
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
            <Tab>Search</Tab>
            <Tab>Roller</Tab>
            <Tab>Actions</Tab>
            <Tab>Spells</Tab>
            <Tab>Items</Tab>
          </TabList>
          <div className="h-full my-2 custom-border custom-border-thin bg-light-100 dark:bg-dark-300 rounded-lg">
            <TabPanel className="overflow-y-scroll px-2 dnd-body">
              <div>
                {query ? (
                  <div className="mb-2 font-bold">
                    Showing results for{' '}
                    <div className="inline font-mono">{query}:</div>
                  </div>
                ) : (
                  `No search results`
                )}
              </div>
              <ol>
                {hits.map(hit => {
                  const { data, renderer, jsx } = findSearchResultSourceData(
                    hit.item,
                  );
                  return (
                    <li
                      className="my-1 bg-light-300 dark:bg-dark-200 rounded hover:bg-light-200 dark:hover:bg-dark-100 hover:ring-2 hover:ring-yellow-500 hover:ring-opacity-50"
                      key={hit.refIndex}
                    >
                      <DetailedEntryTrigger
                        extraClassName="tight"
                        data={data}
                        renderer={renderer}
                        jsx={jsx}
                      >
                        <div className="py-1 px-2 flex justify-between">
                          <div>
                            {`${ResultType[hit.item.type]}: ${hit.item.name} ${
                              hit.item.baseName ? `(${hit.item.baseName})` : ''
                            }`}
                          </div>
                          <div>
                            <span
                              className={`inline mr-0.5 source${hit.item.src.toUpperCase()}`}
                            >{`${hit.item.src}`}</span>
                            <span className="inline">{`${
                              hit.item.page ? `p${hit.item.page}` : 'N/A'
                            }`}</span>
                          </div>
                        </div>
                      </DetailedEntryTrigger>
                    </li>
                  );
                })}
              </ol>
            </TabPanel>
            <TabPanel className="overflow-y-scroll px-2">
              <Roller />
            </TabPanel>
            <TabPanel className="overflow-y-scroll px-2">
              {getActions()!.map(actionElement => (
                <TextBox extraClassName="my-2" key={actionElement.name}>
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
