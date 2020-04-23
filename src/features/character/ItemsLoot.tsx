import React from 'react';
import { CharacterState } from 'features/character/characterListSlice';
import { ThemeMode } from 'features/theme/themeSlice';
import PillFilter, { ContentBlock } from 'components/PillFilter/PillFilter';
import itemsDark from 'images/items-dark.png';
import itemsLight from 'images/items-light.png';
import { useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { getItem } from 'utils/character';
import Items from 'components/Items/Items';
import { isDefined } from 'ts-is-present';

interface Props {
  character: CharacterState;
}

const ItemsLoot = ({ character }: Props) => {
  const theme = useSelector((state: RootState) => state.theme);
  const items = character.equipmentData.items
    .map(itemName => getItem(itemName))
    .filter(isDefined);

  return (
    <>
      <div>
        <div
          className="w-full my-2 relative bg-contain bg-center bg-no-repeat"
          style={{
            height: '4rem',
            backgroundImage: `url(${
              theme === ThemeMode.DARK ? itemsLight : itemsDark
            })`,
          }}
        ></div>
        <PillFilter pills={['inventory', 'attunement', 'other possessions']}>
          <ContentBlock name="inventory">
            <Items items={items} />
          </ContentBlock>
          <ContentBlock name="attunement">
            <div>My attunements</div>
          </ContentBlock>
          <ContentBlock name="other possessions">
            <div>My Other Possessions</div>
          </ContentBlock>
        </PillFilter>
      </div>
    </>
  );
};

export default ItemsLoot;
