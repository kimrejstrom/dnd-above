import Fuse from 'fuse.js';
import IconType from 'components/IconType/IconType';
import DetailedEntryTrigger from 'features/detailedEntry/DetailedEntryTrigger';
import React from 'react';
import {
  SourceDataFuseItem,
  findSearchResultSourceData,
  ResultType,
} from 'utils/search';
import Button from 'components/Button/Button';

interface Props {
  query: string;
  hits: Fuse.FuseResult<SourceDataFuseItem>[];
  onClick?: (item: any) => void;
}

const SearchResults = ({ query, hits, onClick }: Props) => {
  return (
    <>
      <div>
        {query ? (
          <div className="mb-2 font-bold">
            Showing results for <div className="inline font-mono">{query}:</div>
          </div>
        ) : (
          `No search results`
        )}
      </div>
      <ol>
        {hits.map(hit => {
          const { data, renderer, jsx } = findSearchResultSourceData(hit.item);
          return (
            <li
              className="flex items-center my-1 bg-light-300 dark:bg-dark-200 rounded hover:bg-light-200 dark:hover:bg-dark-100 hover:ring-2 hover:ring-yellow-500 hover:ring-opacity-50"
              key={hit.refIndex}
            >
              <DetailedEntryTrigger
                extraClassName="tight w-full"
                data={data}
                renderer={renderer}
                jsx={jsx}
              >
                <div className="py-1 px-2 flex justify-between dnd-header">
                  <div className="flex items-center">
                    <IconType type={hit.item.type} />
                    <div>{`${hit.item.name} ${
                      hit.item.baseName ? `(${hit.item.baseName})` : ''
                    }`}</div>
                    <div className="text-xs opacity-50 ml-2">
                      {ResultType[hit.item.type]}
                    </div>
                  </div>
                  <div>
                    <span
                      className={`inline mr-0.5 source${hit.item.src.toUpperCase()}`}
                    >{`${hit.item.src}`}</span>
                    <span className="inline text-xs opacity-50">{`${
                      hit.item.page ? `p${hit.item.page}` : 'N/A'
                    }`}</span>
                  </div>
                </div>
              </DetailedEntryTrigger>
              {onClick && (
                <Button
                  className="mr-1 p-1 w-6 h-6 leading-none font-bold dark:hover:bg-highdark-200 bg-highlight-100 hover:bg-highlight-200 dark:bg-highdark-100 dark:text-light-100 "
                  title="+"
                  onClick={() => onClick(hit.item)}
                />
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
};

export default SearchResults;
