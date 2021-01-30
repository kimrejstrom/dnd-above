import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  addPreset,
  updatePreset,
  DiceType,
} from 'features/presets/presetsSlice';
import { Preset } from 'features/presets/presetsSlice';
import { useForm } from 'react-hook-form';
import { toggleModal } from 'components/Modal/modalSlice';
import { diceRoller } from 'utils/dice';
import StyledButton from 'components/StyledButton/StyledButton';
import Notification, {
  NotificationType,
} from 'components/Notification/Notification';
import { Info } from 'components/Info/Info';

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
      {success && (
        <Notification type={NotificationType.Success}>{success}</Notification>
      )}
      <form className="w-full" onSubmit={handleSubmit(submitPreset)}>
        <label>
          Title
          <input
            className="form-input"
            type="text"
            name="title"
            placeholder="Preset name"
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
            className="form-input"
            type="text"
            placeholder="Dice formula"
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
              className="form-input"
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
          <StyledButton type="submit">Save</StyledButton>
        </div>
      </form>
      {error && (
        <div className="w-full mt-4">
          <Notification type={NotificationType.Error}>
            {error.message}
          </Notification>
        </div>
      )}
      <Info />
    </div>
  );
};
