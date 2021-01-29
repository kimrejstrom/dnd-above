import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { useHistory, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { updateFormData } from 'features/createCharacterForm/createCharacterFormSlice';
import Entry from 'components/Entry/Entry';
import {
  getClass,
  getBackground,
  getOtherItems,
  getArmor,
  getWeapons,
} from 'utils/sourceDataUtils';
import StyledButton, {
  DEFAULT_BUTTON_STYLE,
} from 'components/StyledButton/StyledButton';
import TextBox from 'components/TextBox/TextBox';
import ItemCard from 'components/ItemCard/ItemCard';

const Equipment = () => {
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
    history.push(`/create/summary`);
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
        <Link className={DEFAULT_BUTTON_STYLE} to={`/create/step-4`}>
          Previous
        </Link>
        <h1>Starting Equipment</h1>
        <StyledButton onClick={handleSubmit(onSubmit)}>Next</StyledButton>
      </div>

      <TextBox>
        {selectedClass && (
          <>
            <h2 className="text-lg">
              {selectedClass?.name} Starting Equipment
            </h2>
            <div className="w-full">
              {selectedClass?.startingEquipment.default.map(equipment => (
                <Entry entry={equipment} />
              ))}
            </div>
          </>
        )}

        {selectedBackground && (
          <>
            <h2 className="text-lg mt-4">
              {selectedBackground?.name} Starting Equipment
            </h2>
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
            <h2 className="text-lg mt-4">Current Equipment</h2>
            <div className="w-full flex flex-wrap text-left">
              {itemList.map((itemName, index) => (
                <ItemCard key={index} itemName={itemName} />
              ))}
            </div>
          </>
        )}

        <div className="flex my-4">
          <StyledButton
            onClick={(e: any) => addItemSelect(e, 'Weapon')}
            extraClassName="mr-2"
          >
            + Add weapon
          </StyledButton>
          <StyledButton
            onClick={(e: any) => addItemSelect(e, 'Armor')}
            extraClassName="mr-2"
          >
            + Add armor
          </StyledButton>
          <StyledButton
            onClick={(e: any) => addItemSelect(e, 'Item')}
            extraClassName="mr-2"
          >
            + Add item
          </StyledButton>
        </div>

        <form
          className="flex flex-col dnd-body"
          onSubmit={handleSubmit(onSubmit)}
        >
          {itemSelects.map(selectData => {
            let itemType: any = [];
            switch (selectData.type) {
              case 'Item':
                itemType = getOtherItems();
                break;
              case 'Weapon':
                itemType = getWeapons();
                break;
              case 'Armor':
                itemType = getArmor();
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
                  className={`form-input`}
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
      </TextBox>
    </div>
  );
};

export default Equipment;
