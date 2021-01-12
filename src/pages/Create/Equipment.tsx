import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { useHistory, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { updateFormData } from 'features/createCharacterForm/createCharacterFormSlice';
import { WEAPONS, ARMOR, ALL_OTHER_ITEMS } from 'utils/data';
import Entry from 'components/Entry/Entry';
import { getClass, getBackground, getItem } from 'utils/character';
import { mainRenderer } from 'utils/mainRenderer';
import DangerousHtml from 'components/DangerousHtml/DangerousHtml';
import StyledButton, {
  DEFAULT_BUTTON_STYLE,
} from 'components/StyledButton/StyledButton';
import TextBox from 'components/TextBox/TextBox';
import DetailedEntryTrigger from 'features/detailedEntry/DetailedEntryTrigger';

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
              {itemList.map((itemName, index) => {
                const item = getItem(itemName);
                return (
                  <DetailedEntryTrigger
                    renderer={mainRenderer.item.getCompactRenderedString(item)}
                    data={item}
                  >
                    <TextBox extraClassName="bg-light-200 dark:bg-dark-200 px-2 py-2 w-full md:w-40 h-40 mr-2 mt-2">
                      <DangerousHtml
                        extraClassName="text-sm leading-none"
                        prose={false}
                        data={mainRenderer.item.getCompactRenderedString(
                          item,
                          false,
                        )}
                      />
                    </TextBox>
                  </DetailedEntryTrigger>
                );
              })}
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
