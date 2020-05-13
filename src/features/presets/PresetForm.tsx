import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  addPreset,
  updatePreset,
  DiceType,
} from 'features/presets/presetsSlice';
import { Preset } from 'features/presets/presetsSlice';
import { useForm } from 'react-hook-form';
import { Alert } from 'components/Alert/Alert';
import { toggleModal } from 'components/Modal/modalSlice';
import { diceRoller } from 'utils/dice';

export const PresetForm: React.FC<{
  existingPreset?: Preset;
  id?: number;
}> = ({ existingPreset, id }) => {
  const dispatch = useDispatch();
  const [error, setError] = useState<Error>();
  const [success, setSuccess] = useState<string>();
  const { register, handleSubmit, getValues, errors } = useForm<FormData>();

  const submitPreset = () => {
    const inputs = getValues();
    try {
      // check if formula is valid
      diceRoller.roll(inputs.formula);

      const newPreset: Preset = {
        diceType: inputs.diceType,
        formula: inputs.formula,
        title: inputs.title,
      };
      setError(undefined);
      if (existingPreset) {
        setSuccess('Preset Updated');
        dispatch(updatePreset({ preset: newPreset, id: id! }));
      } else {
        setSuccess('Preset Added');
        dispatch(addPreset(newPreset));
      }
      // Close modal
      setTimeout(() => {
        dispatch(toggleModal({ visible: false }));
      }, 1000);
    } catch (error) {
      setError(error);
      setSuccess(undefined);
    }
  };

  type FormData = {
    title: string;
    formula: string;
    diceType: DiceType;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-lg text-green-300">{success}</div>
      <form
        className="text-center w-full"
        onSubmit={handleSubmit(submitPreset)}
      >
        <label>
          Title
          <input
            className="w-full text-lg appearance-none font-mono flex dark:bg-primary-dark text-center font-bold py-2 px-4 rounded mb-2 border dark:border-primary-light focus:outline-none focus:border-yellow-400"
            type="text"
            name="title"
            required={true}
            defaultValue={existingPreset?.title}
            ref={register({
              required: true,
            })}
          />
          {errors.title && 'Title is required'}
        </label>
        <label>
          Formula
          <input
            className="w-full text-lg appearance-none font-mono flex dark:bg-primary-dark text-center font-bold py-2 px-4 rounded mb-2 border dark:border-primary-light focus:outline-none focus:border-yellow-400"
            type="text"
            name="formula"
            required={true}
            defaultValue={existingPreset?.formula}
            ref={register({
              required: true,
            })}
          />
          {errors.formula && 'Formula is required'}
        </label>
        <label>
          Dice type
          <div className="inline-block relative w-full">
            <select
              className="relative w-full appearance-none text-lg font-mono flex dark:bg-primary-dark text-center font-bold py-2 px-4 rounded border dark:border-primary-light focus:outline-none focus:border-yellow-400"
              name="diceType"
              defaultValue={existingPreset?.diceType}
              ref={register}
            >
              <option value="d4">d4</option>
              <option value="d6">d6</option>
              <option value="d8">d8</option>
              <option value="d10">d10</option>
              <option value="d12">d12</option>
              <option value="d20">d20</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-200 opacity-75">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </label>
        <div className="flex justify-end mt-4 pt-2">
          <input
            className="bg-transparent text-yellow-200 py-1 hover:dark:bg-primary-dark px-4 border dark:border-primary-light rounded"
            type="submit"
            value="Save"
          />
        </div>
      </form>
      {error && (
        <div className="font-mono mt-4 mb-6 m-auto">
          <Alert title={'Something went wrong'} body={error.message} />
        </div>
      )}
    </div>
  );
};
