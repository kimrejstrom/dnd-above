import React, { ChangeEvent } from 'react';
import DetailedEntry from 'features/detailedEntry/DetailedEntry';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import DetailedEntryTrigger from 'features/detailedEntry/DetailedEntryTrigger';
import {
  addFeat,
  CharacterListItem,
  removeFeat,
} from 'features/character/characterListSlice';
import { useForm } from 'react-hook-form';
import { mainRenderer } from 'utils/mainRenderer';
import { getFeats } from 'utils/sourceDataUtils';

interface Props {
  character: CharacterListItem;
}

const FeatsModal: React.FC<Props> = ({ character }) => {
  const featsList = character.gameData.feats;
  const dispatch = useDispatch();
  const { register } = useForm();
  const addFeatToList = (e: ChangeEvent<HTMLInputElement>) => {
    return dispatch(
      e.currentTarget.checked
        ? addFeat({
            id: character.id!,
            data: e.currentTarget.value,
          })
        : removeFeat({
            id: character.id!,
            data: e.currentTarget.value,
          }),
    );
  };
  const { selectedEntry } = useSelector(
    (state: RootState) => state.detailedEntry,
  );

  return (
    <div>
      <div style={{ height: '20rem' }}>
        <div className="h-full my-2 custom-border custom-border-thin bg-light-100 dark:bg-dark-300 rounded-lg">
          <div className="h-full overflow-y-scroll">
            <form className="ml-3 flex flex-col">
              {getFeats()!.map(feat => (
                <DetailedEntryTrigger
                  data={feat}
                  renderer={mainRenderer.feat.getCompactRenderedString(feat)}
                >
                  <label className="inline-flex items-center">
                    <input
                      className="form-checkbox"
                      type="checkbox"
                      defaultChecked={featsList.includes(feat.name)}
                      name={feat.name}
                      value={feat.name}
                      onChange={addFeatToList}
                      ref={register}
                    />
                    <span className="ml-2">{`${feat.name}`}</span>
                  </label>
                </DetailedEntryTrigger>
              ))}
            </form>
          </div>
        </div>
      </div>
      <div className="mt-2 h-full" style={{ height: '12rem' }}>
        <div className="h-full my-2 custom-border custom-border-thin bg-light-100 dark:bg-dark-300 rounded-lg">
          <div className="h-full overflow-y-scroll px-2">
            <DetailedEntry data={selectedEntry} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatsModal;
