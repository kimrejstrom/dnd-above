import React from 'react';
import { getSelectedCharacter } from 'app/selectors';
import { useDispatch, useSelector } from 'react-redux';
import SearchBar from 'components/SearchBar/SearchBar';
import SearchResults from 'components/SearchResults/SearchResults';
import { useFuse } from 'utils/useFuse';
import { ResultType, SourceDataFuseItem } from 'utils/search';
import Notification, {
  NotificationType,
} from 'components/Notification/Notification';
import TextBox from 'components/TextBox/TextBox';
import { toggleModal } from 'components/Modal/modalSlice';
import ExtrasModal from 'features/character/ExtrasModal';
import IconType from 'components/IconType/IconType';
import RatingsLegend from 'components/RatingsLegend/RatingsLegend';
import { removeExtra } from 'features/character/characterListSlice';

interface Props {
  searchIndex: Array<SourceDataFuseItem>;
}

const Extras = ({ searchIndex }: Props) => {
  const dispatch = useDispatch();
  const character = useSelector(getSelectedCharacter);
  const { hits, query, onSearch } = useFuse(searchIndex, {
    keys: ['name'],
    limit: 10,
  });

  const addExtra = (item: SourceDataFuseItem) =>
    dispatch(
      toggleModal({
        visible: true,
        title: 'Save Entry',
        content: <ExtrasModal character={character!} item={item} />,
      }),
    );

  const editExtra = (item: SourceDataFuseItem) =>
    dispatch(
      toggleModal({
        visible: true,
        title: 'Edit Entry',
        content: <ExtrasModal character={character!} item={item} />,
      }),
    );

  return (
    <div>
      <div className="mb-3">
        <SearchBar onSearch={onSearch} />
        {hits.length > 0 && (
          <TextBox extraClassName="bg-light-400 dark:bg-dark-200 md:p-2">
            <SearchResults
              hits={hits}
              query={query}
              onClick={(item: SourceDataFuseItem) => addExtra(item)}
            />
          </TextBox>
        )}
      </div>
      <div>
        {character?.miscData?.extras?.length ? (
          <div>
            <TextBox extraClassName="mb-3 bg-light-400 dark:bg-dark-300">
              <RatingsLegend />
            </TextBox>

            {character?.miscData?.extras.map(item => (
              <div
                key={item.name}
                className="shadow flex flex-col items-center my-2 bg-light-200 dark:bg-dark-200 rounded"
              >
                <div className="py-2 px-2 flex justify-between w-full">
                  <div className="flex items-center">
                    <img
                      src={`${process.env.PUBLIC_URL}/img/icons/${item.rating}stars.svg`}
                      alt="Rating"
                      className="rating-icon w-5 h-5 mr-1"
                    />
                    <IconType type={item.type} />
                    <div className={`rating-${item.rating}`}>{`${item.name} ${
                      item.baseName ? `(${item.baseName})` : ''
                    }`}</div>
                    <div className="text-xs opacity-50 ml-2">
                      {ResultType[item.type]}
                    </div>
                  </div>
                  <div className="flex items-center flex-grow justify-end mr-2">
                    <span
                      className={`inline mr-0.5 source${item.src.toUpperCase()}`}
                    >{`${item.src}`}</span>
                    <span className="inline text-xs opacity-50">{`${
                      item.page ? `p${item.page}` : 'N/A'
                    }`}</span>
                  </div>
                  <div className="flex">
                    <button
                      className="w-6 h-6 flex justify-center items-center"
                      onClick={() => {
                        editExtra(item);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 18 18"
                        className="fill-current dark:text-gray-300 opacity-50"
                      >
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                        <path
                          fillRule="evenodd"
                          d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    <button
                      className="w-6 h-6 flex justify-center items-center"
                      onClick={() => {
                        dispatch(
                          removeExtra({ id: character.id, name: item.name }),
                        );
                      }}
                    >
                      <svg
                        className="fill-current dark:text-gray-300 opacity-50"
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 18 18"
                      >
                        <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="w-full dnd-body text-sm px-4 pb-4 pt-1 whitespace-pre-line">
                  {item.userNotes}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <Notification type={NotificationType.Info}>
              Nothing saved. Start by searching.
            </Notification>
          </div>
        )}
      </div>
    </div>
  );
};

export default Extras;
