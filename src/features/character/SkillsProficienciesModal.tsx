import React, { ChangeEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  addCustomProficiency,
  CharacterListItem,
  removeCustomProficiency,
} from 'features/character/characterListSlice';
import { CHARACTER_ABILITIES, SkillTypes } from 'features/character/Skills';
import _ from 'lodash';
import { isProficient, isCustomProficiency } from 'utils/character';

interface Props {
  character: CharacterListItem;
}

const SkillsProficienciesModal: React.FC<Props> = ({ character }) => {
  const dispatch = useDispatch();
  const { register } = useForm();
  const toggleProficiency = (e: ChangeEvent<HTMLInputElement>) => {
    return dispatch(
      e.currentTarget.checked
        ? addCustomProficiency({
            id: character.id!,
            data: e.currentTarget.value as SkillTypes,
          })
        : removeCustomProficiency({
            id: character.id!,
            data: e.currentTarget.value as SkillTypes,
          }),
    );
  };

  return (
    <div className="pb-4">
      <div>
        <form className="flex flex-col">
          {Object.entries(CHARACTER_ABILITIES).map(([key, value]) => {
            const isDisabled =
              isProficient(key as SkillTypes, character) &&
              !isCustomProficiency(key as SkillTypes, character);
            return (
              <label
                className={`inline-flex items-center ${
                  isDisabled ? 'opacity-50' : ''
                }`}
              >
                <input
                  className={`form-checkbox text-primary-dark`}
                  type="checkbox"
                  defaultChecked={isProficient(key as SkillTypes, character)}
                  disabled={isDisabled}
                  name={key}
                  value={key}
                  onChange={toggleProficiency}
                  ref={register}
                />
                <span className="ml-2">{`${_.capitalize(
                  key,
                )} (${value.toUpperCase()})`}</span>
              </label>
            );
          })}
        </form>
      </div>
    </div>
  );
};

export default SkillsProficienciesModal;
