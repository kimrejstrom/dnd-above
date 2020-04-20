import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { useHistory, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { updateFormData } from 'features/createCharacterForm/createCharacterFormSlice';
import { WEAPONS, ARMOR, ALL_OTHER_ITEMS } from 'utils/data';
import Entry from 'components/Entry/Entry';
import { getClass, getBackground, getItem } from 'utils/character';
import mainRenderer from 'utils/mainRenderer';
import DangerousHtml from 'components/DangerousHtml/DangerousHtml';

interface Props {}

const Equipment = ({ url }: { url: string }) => {
  const dispatch = useDispatch();
  const formState = useSelector(
    (state: RootState) => state.createCharacterForm,
  );
  const history = useHistory();
  const { register, handleSubmit } = useForm<FormData>();
  const onSubmit = (data: FormData, e?: React.BaseSyntheticEvent) => {
    dispatch(
      updateFormData({
        equipmentData: {
          items: itemList,
        },
      }),
    );
    history.push(`${url}/summary`);
  };

  type FormData = {
    classEquipment: any;
  };

  const [itemSelects, setItemSelects] = useState<
    { formId: string; type: string }[]
  >([]);

  const [itemList, setItemList] = useState(formState.data.equipmentData.items);

  const selectedClass = getClass(formState.data.classData.classElement);
  const selectedBackground = getBackground(
    formState.data.descriptionData.background,
  );

  const addItemToList = (e: React.SyntheticEvent<HTMLSelectElement, Event>) => {
    setItemList(itemList.concat(e.currentTarget.value));
  };

  const addItemSelect = (e: any, type: string) => {
    e.preventDefault();
    setItemSelects(
      itemSelects.concat([{ formId: `item${itemSelects.length + 1}`, type }]),
    );
  };

  return (
    <div>
      <h1>Step 5: Equipment</h1>
      <div className="flex justify-between my-4">
        <Link
          className="text-lg dark-hover:bg-primary-dark bg-yellow-100 hover:bg-primary-light dark:bg-transparent dark:text-primary-light px-2 border dark:border-primary-light rounded"
          to={`${url}/step-4`}
        >
          Previous
        </Link>
        <button
          className="text-lg dark-hover:bg-primary-dark bg-yellow-100 hover:bg-primary-light dark:bg-transparent dark:text-primary-light px-2 border dark:border-primary-light rounded"
          onClick={handleSubmit(onSubmit)}
        >
          Next
        </button>
      </div>

      {selectedClass && (
        <>
          <h2>{selectedClass?.name} Starting Equipment</h2>
          <div className="w-full">
            {selectedClass?.startingEquipment.default.map(equipment => (
              <Entry entry={equipment} />
            ))}
          </div>
        </>
      )}

      {selectedBackground && (
        <>
          <h2>{selectedBackground?.name} Starting Equipment</h2>
          <div className="w-full">
            {selectedBackground?.entries &&
              selectedBackground?.entries
                .map(entry => {
                  if (entry.type === 'list') {
                    return entry.items
                      ?.map(item =>
                        item.name === 'Equipment' ? (
                          <Entry entry={item.entry!} />
                        ) : (
                          undefined
                        ),
                      )
                      .map(x => x);
                  }
                  return undefined;
                })
                .map(z => z)}
          </div>
        </>
      )}
      {itemList.length > 0 && (
        <>
          <h2>Current Equipment</h2>
          <div className="w-full flex flex-wrap">
            {itemList.map((itemName, index) => (
              <div className="leading-none dnd-body mx-1 bg-tertiary-light dark:bg-primary-dark text-center w-24 h-24 flex justify-center items-center flex-col custom-border custom-border-thin">
                <DangerousHtml
                  data={mainRenderer.item.getCompactRenderedString(
                    getItem(itemName),
                    false,
                  )}
                />
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex my-4">
        <button
          onClick={e => addItemSelect(e, 'Weapon')}
          className="text-lg dark-hover:bg-primary-dark bg-yellow-100 hover:bg-primary-light dark:bg-transparent dark:text-primary-light px-2 border dark:border-primary-light rounded mr-2"
        >
          + Add weapon
        </button>
        <button
          onClick={e => addItemSelect(e, 'Armor')}
          className="text-lg dark-hover:bg-primary-dark bg-yellow-100 hover:bg-primary-light dark:bg-transparent dark:text-primary-light px-2 border dark:border-primary-light rounded mr-2"
        >
          + Add armor
        </button>
        <button
          onClick={e => addItemSelect(e, 'Item')}
          className="text-lg dark-hover:bg-primary-dark bg-yellow-100 hover:bg-primary-light dark:bg-transparent dark:text-primary-light px-2 border dark:border-primary-light rounded mr-2"
        >
          + Add item
        </button>
      </div>

      <form
        className="flex flex-col dnd-body"
        onSubmit={handleSubmit(onSubmit)}
      >
        {itemSelects.map(selectData => {
          let itemType: any = [];
          switch (selectData.type) {
            case 'Item':
              itemType = ALL_OTHER_ITEMS;
              break;
            case 'Weapon':
              itemType = WEAPONS;
              break;
            case 'Armor':
              itemType = ARMOR;
              break;

            default:
              break;
          }
          return (
            <label className="block">
              {`Add ${selectData.type}`}
              <select
                name={selectData.formId}
                ref={register}
                className={`form-select block w-full mt-1 bg-yellow-100 border border-gray-400 text-primary-dark rounded`}
                onChange={addItemToList}
              >
                <option value="initial">-</option>
                {itemType.map((item: any) => (
                  <option value={item.name}>{`${item.name}${
                    item.weaponCategory ? `, ${item.weaponCategory}` : ''
                  }${item.type ? ` (${item.type})` : ''}`}</option>
                ))}
              </select>
            </label>
          );
        })}
      </form>
    </div>
  );
};

export default Equipment;
