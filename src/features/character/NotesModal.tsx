import { toggleModal } from 'components/Modal/modalSlice';
import StyledButton from 'components/StyledButton/StyledButton';
import {
  updateNote,
  CharacterListItem,
  Note,
} from 'features/character/characterListSlice';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';

interface Props {
  character: CharacterListItem;
  note: Note;
}

const NotesModal = ({ character, note }: Props) => {
  const dispatch = useDispatch();
  const { register, handleSubmit, errors } = useForm();
  type FormData = { title: string; entry: string };
  const onSubmit = (data: FormData) => {
    dispatch(
      updateNote({
        id: character.id,
        note: { ...note, title: data.title, entry: data.entry },
      }),
    );
    // Close modal
    setTimeout(() => {
      dispatch(toggleModal({ visible: false }));
    }, 500);
  };
  return (
    <div className="dnd-body rounded p-4 mx-2 -mt-3 bg-light-400 dark:bg-dark-100">
      <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <label className="block">
          Title
          <input
            type="text"
            className="form-input"
            placeholder="Title"
            name="title"
            defaultValue={note.title}
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
            defaultValue={note.entry}
            ref={register({ required: true })}
          />
          {errors.entry && <span className="form-error">{`Required`}</span>}
        </label>
        <StyledButton
          extraClassName="mt-2 sm:h-8"
          onClick={handleSubmit(onSubmit)}
        >
          Save
        </StyledButton>
      </form>
    </div>
  );
};

export default NotesModal;
