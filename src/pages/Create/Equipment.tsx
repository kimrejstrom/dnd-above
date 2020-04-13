import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { useHistory, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { updateFormData } from 'features/createCharacterForm/createCharacterFormSlice';
import { WEAPONS, ARMOR, ALL_OTHER_ITEMS, ALL_ITEMS } from 'utils/data';
import Entry from 'components/Entry/Entry';
import _ from 'lodash';
import { getClass, getBackground } from 'utils/character';

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
        equipment: Object.values(data).map(item =>
          _.find(ALL_ITEMS, entry => entry.name === item),
        ),
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

  const selectedClass = getClass(formState.data.classData.classElement);
  const selectedBackground = getBackground(
    formState.data.descriptionData.background,
  );

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

      <h2>{selectedClass?.name} Starting Equipment</h2>
      <div className="w-full">
        {selectedClass?.startingEquipment.default.map(equipment => (
          <Entry entry={equipment} />
        ))}
      </div>
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
