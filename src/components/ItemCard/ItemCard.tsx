import DangerousHtml from 'components/DangerousHtml/DangerousHtml';
import TextBox from 'components/TextBox/TextBox';
import DetailedEntryTrigger from 'features/detailedEntry/DetailedEntryTrigger';
import React from 'react';
import { isDefined } from 'ts-is-present';
import { mainRenderer } from 'utils/mainRenderer';
import { RenderItem } from 'utils/render';
import { getItem } from 'utils/sourceDataUtils';

interface Props {
  itemName: string;
  removeAction?: any;
}

const ItemCard = ({ itemName, removeAction }: Props) => {
  const item = getItem(itemName);
  return (
    <DetailedEntryTrigger
      extraClassName="mr-2 mt-2 tight md:w-44 w-full my-2"
      key={itemName}
      renderer={RenderItem(item)}
      data={item}
    >
      <TextBox extraClassName="w-full bg-light-200 h-52 dark:bg-dark-200 px-2 py-2">
        {isDefined(removeAction) && (
          <div className="flex justify-end w-full -mt-1">
            <button
              className="w-5 h-5 flex justify-center items-center"
              onClick={() => {
                removeAction(itemName);
              }}
            >
              <svg
                className="fill-current dark:text-gray-300 opacity-50"
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
              >
                <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path>
              </svg>
            </button>
          </div>
        )}
        <DangerousHtml
          extraClassName="text-sm leading-none"
          prose={false}
          data={mainRenderer.item.getCompactRenderedString(item, {
            compact: true,
          })}
        />
      </TextBox>
    </DetailedEntryTrigger>
  );
};

export default ItemCard;
