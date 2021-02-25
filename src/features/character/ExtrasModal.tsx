import DangerousHtml from 'components/DangerousHtml/DangerousHtml';
import Entry from 'components/Entry/Entry';
import IconType from 'components/IconType/IconType';
import { toggleModal } from 'components/Modal/modalSlice';
import RatingsLegend from 'components/RatingsLegend/RatingsLegend';
import StyledButton from 'components/StyledButton/StyledButton';
import {
  addExtra,
  CharacterListItem,
  ExtrasItem,
} from 'features/character/characterListSlice';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { findSearchResultSourceData, ResultType } from 'utils/search';

interface Props {
  character: CharacterListItem;
  item: ExtrasItem;
}

const ExtrasModal = ({ character, item }: Props) => {
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();
  const { data, renderer, jsx } = findSearchResultSourceData(item);
  type FormData = { notes: string; rating: number };
  const onSubmit = (data: FormData) => {
    dispatch(
      addExtra({
        id: character.id,
        data: { ...item, userNotes: data.notes, rating: Number(data.rating) },
      }),
    );
    // Close modal
    setTimeout(() => {
      dispatch(toggleModal({ visible: false }));
    }, 500);
  };
  return (
    <div>
      <div className="flex items-center my-1 bg-light-300 dark:bg-dark-200 rounded">
        <div className="py-1 px-2 flex justify-between w-full">
          <div className="flex items-center">
            <IconType type={item.type} />
            <div>{`${item.name} ${
              item.baseName ? `(${item.baseName})` : ''
            }`}</div>
            <div className="text-xs opacity-50 ml-2">
              {ResultType[item.type]}
            </div>
          </div>
          <div>
            <span
              className={`inline mr-0.5 source${item.src.toUpperCase()}`}
            >{`${item.src}`}</span>
            <span className="inline text-xs opacity-50">{`${
              item.page ? `p${item.page}` : 'N/A'
            }`}</span>
          </div>
        </div>
      </div>
      <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <label>
          Rating
          <select
            name="rating"
            ref={register({
              required: true,
            })}
            defaultValue={item.rating?.toString()}
            className={`form-input`}
          >
            <option value="4">4 Stars - Fantastic</option>
            <option value="3">3 Stars - Good</option>
            <option value="2">2 Stars - Decent</option>
            <option value="1">1 Star - Bad</option>
            <option value="0">0 Stars - Horrible</option>
          </select>
        </label>
        <div className="p-1 mb-1">
          <RatingsLegend />
        </div>

        <label>
          Notes
          <textarea
            name="notes"
            rows={5}
            className="form-input"
            defaultValue={item.userNotes}
            ref={register}
          ></textarea>
        </label>
        <div className="flex w-full justify-end">
          <StyledButton extraClassName="mt-2" onClick={handleSubmit(onSubmit)}>
            Save
          </StyledButton>
        </div>
      </form>
      <div
        style={{ maxHeight: '25rem' }}
        className="mt-3 overflow-y-scroll custom-border custom-border-thin bg-light-100 dark:bg-dark-300 rounded-lg"
      >
        <div className="detailed-entry px-2">
          {jsx ? (
            jsx
          ) : renderer ? (
            <DangerousHtml data={renderer} />
          ) : (
            <Entry entry={data} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ExtrasModal;
