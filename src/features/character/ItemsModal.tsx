import React from 'react';
import Items from 'components/Items/Items';
import DetailedEntry from 'features/detailedEntry/DetailedEntry';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { addItem, removeItem } from 'features/character/characterListSlice';
import { getSelectedCharacter } from 'app/selectors';
import ItemCard from 'components/ItemCard/ItemCard';

const ItemsModal: React.FC = () => {
  const dispatch = useDispatch();
  const character = useSelector(getSelectedCharacter);
  const { selectedEntry } = useSelector(
    (state: RootState) => state.detailedEntry,
  );
  const { allItems } = useSelector(
    (state: RootState) => state.sourceData,
  ).sourceData;

  const myItems = character?.equipmentData.items;

  const handleAddItem = (itemName: string) => {
    dispatch(addItem({ id: character?.id!, data: itemName }));
  };

  const handleRemoveItem = (itemName: string) => {
    dispatch(removeItem({ id: character?.id!, data: itemName }));
  };

  return (
    <>
      <div className="w-full flex flex-col">
        <div>Current Items</div>
        <div className="flex w-full overflow-x-scroll">
          {myItems?.map(itemName => (
            <ItemCard
              key={itemName}
              itemName={itemName}
              removeAction={handleRemoveItem}
            />
          ))}
        </div>
      </div>
      <div className="h-4/6 flex flex-col mt-2">
        <div style={{ height: '20rem' }}>
          <div className="h-full my-2 custom-border custom-border-thin bg-light-100 dark:bg-dark-300 rounded-lg">
            <div className="h-full overflow-y-scroll">
              <Items
                columns={['name', 'type', 'rarity', 'value', 'source']}
                items={allItems}
                rowButtons={{ buttonTitle: '+', header: 'Add' }}
                onRowButtonClick={handleAddItem}
                filteringEnabled={true}
              />
            </div>
          </div>
        </div>
        <div className="mt-2" style={{ maxHeight: '25rem' }}>
          <div className="h-full my-2 custom-border custom-border-thin bg-light-100 dark:bg-dark-300 rounded-lg">
            <div className="h-full overflow-y-scroll px-2">
              <DetailedEntry data={selectedEntry} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ItemsModal;
