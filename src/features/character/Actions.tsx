import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { ThemeMode } from 'features/theme/themeSlice';
import PillFilter, { ContentBlock } from 'components/PillFilter/PillFilter';
import actionsDark from 'images/actions-dark.png';
import actionsLight from 'images/actions-light.png';
import { CharacterState } from 'features/character/characterListSlice';
import { getItem } from 'utils/character';
import Items from 'components/Items/Items';
import { isDefined } from 'ts-is-present';
import mainRenderer from 'utils/mainRenderer';
import { Property } from 'models/item';

interface Props {
  character: CharacterState;
}

const Actions = ({ character }: Props) => {
  const theme = useSelector((state: RootState) => state.theme);
  const attackEquipment = character.equipmentData.items
    .map(itemName => getItem(itemName))
    .map(item => {
      const [
        damage,
        damageType,
        propertiesTxt,
      ] = mainRenderer.item.getDamageAndPropertiesText(item);
      if (damage && damageType && propertiesTxt) {
        return {
          ...item,
          name: item?.name,
          range: item?.range
            ? item.range
            : item?.property?.includes(Property.R)
            ? '10'
            : '5',
          damage: damage,
          type: damageType,
          notes: propertiesTxt,
        };
      } else {
        return undefined;
      }
    })
    .filter(isDefined);
  return (
    <>
      <div
        className="w-full my-2 relative bg-contain bg-center bg-no-repeat"
        style={{
          height: '5rem',
          backgroundImage: `url(${
            theme === ThemeMode.DARK ? actionsLight : actionsDark
          })`,
        }}
      ></div>
      <PillFilter pills={['attack', 'action', 'bonus action', 'reaction']}>
        <ContentBlock name="attack">
          <div>Attack</div>
          <Items
            items={attackEquipment as any}
            columns={['name', 'range', 'damage', 'type', 'notes']}
          />
        </ContentBlock>
        <ContentBlock name="action">
          <div>Action</div>
        </ContentBlock>
        <ContentBlock name="bonus action">
          <div>Bonus Action</div>
        </ContentBlock>
        <ContentBlock name="reaction">
          <div>Reaction</div>
        </ContentBlock>
      </PillFilter>
    </>
  );
};

export default Actions;
