import React, { ChangeEvent } from 'react';
import { FEATS } from 'utils/data';
import DetailedEntry from 'features/detailedEntry/DetailedEntry';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import DetailedEntryTrigger from 'features/detailedEntry/DetailedEntryTrigger';
import { getSelectedCharacter } from 'app/selectors';
import { addFeat, removeFeat } from 'features/character/characterListSlice';
import { useForm } from 'react-hook-form';
import { mainRenderer } from 'utils/mainRenderer';

interface Props {}

const FeatsModal = (props: Props) => {
  const character = useSelector(getSelectedCharacter);
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
        <div className="h-full my-2 custom-border custom-border-thin bg-yellow-100 dark:bg-tertiary-dark rounded-lg">
          <div className="h-full overflow-y-scroll">
            <form className="ml-3 flex flex-col">
              {FEATS.map(feat => (
                <DetailedEntryTrigger
                  data={feat}
                  renderer={mainRenderer.feat.getCompactRenderedString(feat)}
                >
                  <label className="inline-flex items-center">
                    <input
                      className="form-checkbox text-primary-dark"
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
        <div className="h-full my-2 custom-border custom-border-thin bg-yellow-100 dark:bg-tertiary-dark rounded-lg">
          <div className="h-full overflow-y-scroll px-2">
            <DetailedEntry data={selectedEntry} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatsModal;