import DangerousHtml from 'components/DangerousHtml/DangerousHtml';
import TextBox from 'components/TextBox/TextBox';
import DetailedEntryTrigger from 'features/detailedEntry/DetailedEntryTrigger';
import React from 'react';
import { mainRenderer } from 'utils/mainRenderer';
import { RenderItem } from 'utils/render';
import { getItem } from 'utils/sourceDataUtils';

interface Props {
  itemName: string;
}

const ItemCard = ({ itemName }: Props) => {
  const item = getItem(itemName);
  return (
    <DetailedEntryTrigger
      extraClassName="w-full md:w-40 mr-2 mt-2 tight"
      key={itemName}
      renderer={RenderItem(item)}
      data={item}
    >
      <TextBox extraClassName="bg-light-200 h-52 w-full dark:bg-dark-200 px-2 py-2">
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
