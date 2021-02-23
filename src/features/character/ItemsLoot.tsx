import React from 'react';
import { CharacterListItem } from 'features/character/characterListSlice';
import { ThemeMode } from 'features/theme/themeSlice';
import PillFilter, { ContentBlock } from 'components/PillFilter/PillFilter';
import itemsDark from 'images/items-dark.png';
import itemsLight from 'images/items-light.png';
import { useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { getItem } from 'utils/sourceDataUtils';
import Items from 'components/Items/Items';
import { isDefined } from 'ts-is-present';
import { CommonItem } from 'utils/data';

interface Props {
  character: CharacterListItem;
}

const ItemsLoot = ({ character }: Props) => {
  const theme = useSelector((state: RootState) => state.theme);
  const items = character.equipmentData.items
    .map(itemName => getItem(itemName))
    .filter(isDefined);
  const normalItems = items.filter(item =>
    (item as CommonItem)._attunement ? false : true,
  );
  const attunementItems = items.filter(item =>
    (item as CommonItem)._attunement ? true : false,
  );

  return (
    <>
      <div
        className="w-full mt-2 relative bg-contain bg-center bg-no-repeat"
        style={{
          height: '5rem',
          backgroundImage: `url(${
            theme === ThemeMode.DARK ? itemsLight : itemsDark
          })`,
        }}
      ></div>
      <PillFilter pills={['inventory', 'attunement', 'other possessions']}>
        <ContentBlock name="inventory">
          <Items items={normalItems} />
        </ContentBlock>
        <ContentBlock name="attunement">
          <Items items={attunementItems} />
        </ContentBlock>
        <ContentBlock name="other possessions">
          <div>My Other Possessions</div>
        </ContentBlock>
      </PillFilter>
    </>
  );
};

export default ItemsLoot;
