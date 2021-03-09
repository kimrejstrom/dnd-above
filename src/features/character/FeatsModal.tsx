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
import { mainRenderer, Parser } from 'utils/mainRenderer';
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
    <div className="h-5/6 flex flex-col">
      <div style={{ height: '20rem' }}>
        <div className="h-full my-2 custom-border custom-border-thin bg-light-100 dark:bg-dark-300 rounded-lg">
          <div className="h-full overflow-y-scroll">
            <form className="ml-3 flex flex-col">
              {getFeats()!.map(feat => (
                <div
                  key={feat.name}
                  className="flex justify-start items-center"
                >
                  <label className="inline-flex items-center">
                    <input
                      className="form-checkbox cursor-pointer"
                      type="checkbox"
                      defaultChecked={featsList.includes(feat.name)}
                      name={feat.name}
                      value={feat.name}
                      onChange={addFeatToList}
                      ref={register}
                    />
                    <span className="ml-2 font-bold cursor-pointer">{`${feat.name}`}</span>
                  </label>
                  <DetailedEntryTrigger
                    extraClassName="flex-grow"
                    data={feat}
                    renderer={mainRenderer.feat.getCompactRenderedString(feat)}
                  >
                    <div className="w-full flex justify-start">
                      <div className="ml-2 inline">
                        ASI:{' '}
                        {mainRenderer.getAbilityData(feat.ability).asText
                          ? mainRenderer.getAbilityData(feat.ability).asText
                          : 'None'}
                      </div>
                      <div className="ml-2 flex-grow">
                        PreRequisite:{' '}
                        {mainRenderer.utils.getPrerequisiteText(
                          feat.prerequisite,
                          true,
                        ) || '–'}
                      </div>
                      <div
                        className={`ml-2 source ${Parser.sourceJsonToColor(
                          feat.source,
                        )}`}
                        title={Parser.sourceJsonToFull(feat.source)}
                      >
                        {feat.source}
                      </div>
                    </div>
                  </DetailedEntryTrigger>
                </div>
              ))}
            </form>
          </div>
        </div>
      </div>
      <div className="mt-2 flex-grow">
        <div className="h-full my-2 custom-border custom-border-thin bg-light-100 dark:bg-dark-300 rounded-lg">
          <div className="detailed-entry h-full overflow-y-scroll px-2">
            <DetailedEntry data={selectedEntry} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatsModal;
