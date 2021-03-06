import React, { useState, ChangeEvent } from 'react';
import {
  CharacterListItem,
  DefenseType,
  addDefense,
  removeDefense,
  addCondition,
  removeCondition,
} from 'features/character/characterListSlice';
import SettingsCog from 'components/SettingsCog/SettingsCog';
import { useDispatch } from 'react-redux';
import { toggleModal } from 'components/Modal/modalSlice';
import StyledButton from 'components/StyledButton/StyledButton';
import { useForm } from 'react-hook-form';
import { Parser } from 'utils/mainRenderer';
import _ from 'lodash';

interface Props {
  character: CharacterListItem;
  readonly: boolean;
}

interface ModalProps {
  character: CharacterListItem;
}

const DefensesModal: React.FC<ModalProps> = ({ character }) => {
  const [itemDefenses, setItemDefenses] = useState<
    { formId: string; type: DefenseType }[]
  >([]);
  const defensesList = character.gameData.defenses;
  const dispatch = useDispatch();
  const { register } = useForm();
  const addItemDefense = (e: any, type: DefenseType) => {
    e.preventDefault();
    setItemDefenses(
      itemDefenses.concat([{ formId: `item${itemDefenses.length + 1}`, type }]),
    );
  };

  const addDefenseToList = (
    e: React.SyntheticEvent<HTMLSelectElement, Event>,
    type: DefenseType,
  ) =>
    dispatch(
      addDefense({
        id: character.id!,
        data: { type, name: e.currentTarget.value },
      }),
    );
  const removeDefenseFromList = (data: { type: DefenseType; name: string }) =>
    dispatch(removeDefense({ id: character.id!, data }));

  return (
    <div>
      {defensesList.length > 0 && (
        <div className="pb-4">
          <h3>Active Defenses</h3>
          <div>
            {defensesList.map((defense, index) => (
              <div className="w-full flex items-center" key={index}>
                <div className="mr-2">{`${defense.name} (${defense.type})`}</div>
                <div
                  onClick={() => removeDefenseFromList(defense)}
                  className="modal-close cursor-pointer"
                >
                  <svg
                    className="fill-current dark:text-white opacity-50"
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 18 18"
                  >
                    <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <StyledButton
        onClick={(e: any) => addItemDefense(e, DefenseType.Immunity)}
      >
        Add Immunity
      </StyledButton>
      <StyledButton
        onClick={(e: any) => addItemDefense(e, DefenseType.Resistance)}
      >
        Add Resistance
      </StyledButton>
      <StyledButton
        onClick={(e: any) => addItemDefense(e, DefenseType.Vulnerability)}
      >
        Add Vulnerability
      </StyledButton>
      {itemDefenses.map(selectData => {
        return (
          <div className="flex">
            <label className="block w-full">
              {`New ${selectData.type}`}
              <select
                name={selectData.formId}
                ref={register}
                className={`form-input`}
                onChange={e => addDefenseToList(e, selectData.type)}
              >
                <option value="initial">-</option>
                <optgroup label="Damages">
                  {Parser.DMG_TYPES.map((type: string) => (
                    <option value={type}>{type}</option>
                  ))}
                </optgroup>
                <optgroup label="Conditions">
                  {Parser.CONDITIONS.map((type: string) => (
                    <option value={type}>{type}</option>
                  ))}
                </optgroup>
              </select>
            </label>
          </div>
        );
      })}
    </div>
  );
};

const ConditionsModal: React.FC<ModalProps> = ({ character }) => {
  const conditionsList = character.gameData.conditions;
  const dispatch = useDispatch();
  const { register } = useForm();
  const addConditionToList = (e: ChangeEvent<HTMLInputElement>) => {
    return dispatch(
      e.currentTarget.checked
        ? addCondition({
            id: character.id!,
            data: e.currentTarget.value,
          })
        : removeCondition({
            id: character.id!,
            data: e.currentTarget.value,
          }),
    );
  };

  return (
    <div className="pb-4">
      <div>
        <form className="flex flex-col">
          {_.sortBy(Parser.CONDITIONS).map((type: string) => (
            <label key={type} className="inline-flex items-center">
              <input
                className="form-checkbox"
                type="checkbox"
                defaultChecked={conditionsList.includes(type)}
                name={type}
                value={type}
                onChange={addConditionToList}
                ref={register}
              />
              <span className="ml-2">{type}</span>
            </label>
          ))}
        </form>
      </div>
    </div>
  );
};

const ConditionsDefenses = ({ character, readonly }: Props) => {
  const dispatch = useDispatch();
  return (
    <div className="flex-grow text-left text-sm custom-border-sm h-20 flex">
      <div className="w-1/2 relative">
        <div className="flex -mt-2">
          <div>Defenses</div>
          {!readonly && (
            <SettingsCog
              action={() =>
                dispatch(
                  toggleModal({
                    visible: true,
                    title: 'Defenses',
                    content: <DefensesModal character={character} />,
                  }),
                )
              }
            />
          )}
        </div>
        <div className="-mt-1 text-xs dnd-body">
          {character.gameData.defenses.length ? (
            <ul className="h-12 overflow-y-scroll">
              {character.gameData.defenses.map(defense => (
                <li
                  key={`${defense.name}-${defense.type}`}
                  className="leading-tight capitalize"
                >{`${defense.name} (${defense.type})`}</li>
              ))}
            </ul>
          ) : (
            'No active defenses'
          )}
        </div>
      </div>
      <div className="w-1/2 custom-border-xs custom-border-medium custom-border-l relative">
        <div className="flex -mt-2">
          <div>Conditions</div>
          {!readonly && (
            <SettingsCog
              action={() =>
                dispatch(
                  toggleModal({
                    visible: true,
                    title: 'Conditions',
                    content: <ConditionsModal character={character} />,
                  }),
                )
              }
            />
          )}
        </div>
        <div className="-mt-1 text-xs dnd-body">
          {character.gameData.conditions.length ? (
            <ul className="h-12 overflow-y-scroll">
              {character.gameData.conditions.map(condition => (
                <li key={condition} className="leading-tight capitalize">
                  {condition}
                </li>
              ))}
            </ul>
          ) : (
            'No active conditions'
          )}
        </div>
      </div>
    </div>
  );
};

export default ConditionsDefenses;
