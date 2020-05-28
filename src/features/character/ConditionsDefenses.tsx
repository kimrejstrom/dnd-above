import React, { useState } from 'react';
import {
  CharacterState,
  DefenseType,
} from 'features/character/characterListSlice';
import SettingsCog from 'components/SettingsCog/SettingsCog';
import { useDispatch } from 'react-redux';
import { toggleModal } from 'components/Modal/modalSlice';
import StyledButton from 'components/StyledButton/StyledButton';
import { useForm } from 'react-hook-form';
import { Parser } from 'utils/mainRenderer';

interface Props {
  character: CharacterState;
}

const DefensesModal = () => {
  const [itemDefenses, setItemDefenses] = useState<{ formId: string }[]>([]);
  const { register, handleSubmit } = useForm();
  const addItemDefense = (e: any) => {
    e.preventDefault();
    setItemDefenses(
      itemDefenses.concat([{ formId: `item${itemDefenses.length + 1}` }]),
    );
  };
  return (
    <div>
      <StyledButton onClick={addItemDefense}>Add new +</StyledButton>
      {itemDefenses.map(selectData => {
        return (
          <div className="flex">
            <label className="block w-1/2">
              {`Type`}
              <select
                name={selectData.formId}
                ref={register}
                className={`form-select block w-full mt-1 bg-yellow-100 border border-gray-400 text-primary-dark rounded`}
              >
                <option value="initial">-</option>
                {Object.keys(DefenseType).map(type => (
                  <option value={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="block w-1/2 ml-2">
              {`Defense`}
              <select
                name={selectData.formId}
                ref={register}
                className={`form-select block w-full mt-1 bg-yellow-100 border border-gray-400 text-primary-dark rounded`}
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

const ConditionsModal = () => <div>Todo: Conditions</div>;

const ConditionsDefenses = ({ character }: Props) => {
  const dispatch = useDispatch();
  return (
    <div
      className="text-left text-sm custom-border h-20 flex"
      style={{ width: '24rem' }}
    >
      <div className="w-1/2 relative">
        <div className="flex -mt-2">
          <div>Defenses</div>
          <SettingsCog
            action={() =>
              dispatch(
                toggleModal({
                  visible: true,
                  title: 'Defenses',
                  content: <DefensesModal />,
                }),
              )
            }
          />
        </div>
        <div className="-mt-1 text-xs">
          {character.gameData.defenses.length ? (
            <ul>
              {character.gameData.defenses.map(defense => (
                <li>{`${defense.option} (${defense.type})`}</li>
              ))}
            </ul>
          ) : (
            'No active defenses'
          )}
        </div>
      </div>
      <div className="w-1/2 custom-border custom-border-medium custom-border-l relative">
        <div className="flex -mt-2">
          <div>Conditions</div>
          <SettingsCog
            action={() =>
              dispatch(
                toggleModal({
                  visible: true,
                  title: 'Conditions',
                  content: <ConditionsModal />,
                }),
              )
            }
          />
        </div>
        <div className="-mt-1 text-xs">
          {character.gameData.conditions.length ? (
            <ul>
              {character.gameData.conditions.map(condition => (
                <li>{condition}</li>
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
