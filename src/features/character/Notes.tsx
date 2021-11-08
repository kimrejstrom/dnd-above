import { RootState } from 'app/rootReducer';
import { toggleModal } from 'components/Modal/modalSlice';
import StyledButton from 'components/StyledButton/StyledButton';
import TextBox from 'components/TextBox/TextBox';
import {
  addNote,
  removeNote,
  CharacterListItem,
  Note,
} from 'features/character/characterListSlice';
import NotesModal from 'features/character/NotesModal';
import { ThemeMode } from 'features/theme/themeSlice';
import skullDividerDark from 'images/skulldivider-dark.png';
import skullDividerLight from 'images/skulldivider-light.png';
import _ from 'lodash';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { getRelativeTime } from 'utils/time';

interface Props {
  character: CharacterListItem;
  readonly: boolean;
}

const Notes = ({ character, readonly }: Props) => {
  const theme = useSelector((state: RootState) => state.theme);
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

  const sortedNotes = _.sortBy(
    character.miscData?.notes,
    'createdAt',
  ).reverse();

  const editNote = (note: Note) =>
    dispatch(
      toggleModal({
        visible: true,
        title: 'Edit Entry',
        content: <NotesModal character={character} note={note} />,
      }),
    );

  return (
    <div className="mt-2">
      <div
        className="w-full my-2 relative bg-contain bg-center bg-no-repeat"
        style={{
          height: '3rem',
          backgroundImage: `url(${
            theme === ThemeMode.DARK ? skullDividerLight : skullDividerDark
          })`,
        }}
      ></div>
      {!readonly && (
        <details>
          <summary className="items-center justify-start bg-light-200 dark:bg-dark-100 relative custom-border-sm custom-border-thin px-2 my-2 cursor-pointer">
            New Note
          </summary>
          <div className="dnd-body rounded p-4 mx-2 -mt-3 bg-light-400 dark:bg-dark-100">
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
                {errors.title && (
                  <span className="form-error">{`Required`}</span>
                )}
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
                {errors.entry && (
                  <span className="form-error">{`Required`}</span>
                )}
              </label>
              <StyledButton
                extraClassName="mt-2 sm:h-8"
                onClick={handleSubmit(onSubmit)}
              >
                Save
              </StyledButton>
            </form>
          </div>
        </details>
      )}

      <div className="mt-2">
        {sortedNotes.map(note => {
          return (
            <div key={note.createdAt} className="dnd-body py-2">
              <TextBox extraClassName="bg-light-200 dark:bg-dark-200">
                <div>
                  <div className="flex justify-between">
                    <div className="flex items-center mb-2">
                      <div className="text-md">{note.title}</div>
                      <div className="ml-2 text-xs opacity-50">
                        {getRelativeTime(note.createdAt)}
                      </div>
                    </div>
                    <div className="flex -mt-2">
                      <button
                        className="w-8 h-8 flex justify-center items-center"
                        onClick={() => {
                          editNote(note);
                        }}
                        disabled={readonly}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 18 18"
                          className="fill-current dark:text-gray-300 opacity-50"
                        >
                          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                          <path
                            fillRule="evenodd"
                            d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button
                        className="w-8 h-8 flex justify-center items-center"
                        onClick={() => {
                          dispatch(
                            removeNote({ id: character.id, noteId: note.id }),
                          );
                        }}
                        disabled={readonly}
                      >
                        <svg
                          className="fill-current dark:text-gray-300 opacity-50"
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                        >
                          <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-sm whitespace-pre-line">{note.entry}</p>
              </TextBox>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Notes;
