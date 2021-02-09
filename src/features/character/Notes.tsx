import StyledButton from 'components/StyledButton/StyledButton';
import TextBox from 'components/TextBox/TextBox';
import {
  addNote,
  CharacterListItem,
} from 'features/character/characterListSlice';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';

interface Props {
  character: CharacterListItem;
}

const Notes = ({ character }: Props) => {
  type FormData = {
    title: string;
    entry: string;
  };
  const { register, handleSubmit, errors, reset } = useForm<FormData>();
  const dispatch = useDispatch();

  const onSubmit = (data: FormData, e?: React.BaseSyntheticEvent) => {
    dispatch(
      addNote({ id: character.id, title: data.title, entry: data.entry }),
    );
    reset();
  };
  return (
    <div className="mt-2">
      <div className="dnd-body">
        <TextBox extraClassName="bg-light-400 dark:bg-dark-300">
          <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
            <label className="block">
              Title
              <input
                type="text"
                className="form-input"
                placeholder="Title"
                name="title"
                ref={register({ required: true })}
              />
              {errors.title && <span className="form-error">{`Required`}</span>}
            </label>
            <label className="block">
              Note
              <textarea
                className="form-input"
                name="entry"
                placeholder="New Note"
                rows={5}
                ref={register({ required: true })}
              />
              {errors.entry && <span className="form-error">{`Required`}</span>}
            </label>
            <StyledButton
              extraClassName="mt-2"
              onClick={handleSubmit(onSubmit)}
            >
              Save
            </StyledButton>
          </form>
        </TextBox>
      </div>
      <div className="mt-2">
        {character.miscData?.notes.map(note => {
          return (
            <div key={note.createdAt} className="dnd-body py-2">
              <TextBox extraClassName="bg-light-200 dark:bg-dark-200">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-md">{note.title}</div>
                  <div className="text-xs opacity-50">
                    {new Date(note.createdAt).toDateString()}
                  </div>
                </div>
                <p className="text-sm">{note.entry}</p>
              </TextBox>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Notes;
