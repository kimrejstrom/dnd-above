import { getSelectedCharacter } from 'app/selectors';
import Notification, {
  NotificationType,
} from 'components/Notification/Notification';
import StyledButton from 'components/StyledButton/StyledButton';
import { replaceCharacter } from 'features/character/characterListSlice';
import { validateCharacterListItem } from 'features/character/validations';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

interface Props {}

const Edit = (props: Props) => {
  const dispatch = useDispatch();
  const character = useSelector(getSelectedCharacter);

  type FormData = {
    characterJSON: string;
  };

  const { register, handleSubmit, setValue, errors, setError } = useForm<
    FormData
  >();

  useEffect(() => {
    setValue('characterJSON', JSON.stringify(character, undefined, 2));
  });

  const [submitSuccessful, setSubmitSuccessful] = useState(false);

  const onEditSubmit = async (data: FormData) => {
    try {
      const characterDataString = JSON.parse(data.characterJSON);
      const validatedCharacter = await validateCharacterListItem(
        characterDataString,
      );
      setSubmitSuccessful(true);
      dispatch(
        replaceCharacter({
          id: validatedCharacter.id!,
          character: validatedCharacter,
        }),
      );
    } catch (error) {
      setSubmitSuccessful(false);
      if (error instanceof Error) {
        setError('characterJSON', {
          type: 'validation',
          message: _.capitalize(error.message),
        });
      }
    }
  };
  return (
    <div className="w-full flex flex-col">
      <h1 className="text-center">Character Edit</h1>
      <Notification type={NotificationType.Warning}>
        <div className="dnd-body text-sm">
          Here be dragons. Be extremely careful with what you change here. You
          can easily corrupt your character data if you make a mistake!
        </div>
      </Notification>
      <form onSubmit={handleSubmit(onEditSubmit)} className="mt-2 text-2xl">
        <label className="block">
          <span className="text-gray-700 dark:text-gray-100">
            Character Data (JSON)
          </span>
          <textarea
            className="form-input font-mono"
            rows={20}
            name="characterJSON"
            ref={register({ required: true })}
          ></textarea>
        </label>
        {errors.characterJSON && (
          <div className="mt-3">
            <Notification type={NotificationType.Error}>
              <div className="dnd-body text-sm">
                {errors.characterJSON.message
                  ? errors.characterJSON.message
                  : 'There was an unexpected problem'}
              </div>
            </Notification>
          </div>
        )}
        <div className="flex w-full justify-end">
          <StyledButton
            extraClassName="mt-2"
            onClick={handleSubmit(onEditSubmit)}
          >
            Save
          </StyledButton>
        </div>
      </form>
      {submitSuccessful && (
        <div className="mt-3">
          <Notification type={NotificationType.Success}>
            Character Data updated
          </Notification>
        </div>
      )}
    </div>
  );
};

export default Edit;
