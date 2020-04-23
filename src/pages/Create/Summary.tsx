import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { useHistory } from 'react-router-dom';
import {
  getRace,
  getClass,
  calculateStats,
  getAbilityMod,
  getItem,
} from 'utils/character';
import {
  updateCharacter,
  addCharacter,
  CHARACTER_STATS,
  CharacterState,
  StatsTypes,
} from 'features/character/characterListSlice';
import TextBox from 'components/TextBox/TextBox';
import DangerousHtml from 'components/DangerousHtml/DangerousHtml';
import mainRenderer from 'utils/mainRenderer';
import ClassBase from 'pages/Create/ClassBase';

const Summary = ({ url }: { url: string }) => {
  const formState = useSelector(
    (state: RootState) => state.createCharacterForm,
  );
  const history = useHistory();
  const dispatch = useDispatch();
  const race = getRace(formState.data.raceData.race);
  const classElement = getClass(formState.data.classData.classElement);

  return (
    <>
      <h1>Summary</h1>
      <div className="flex justify-end">
        <button
          className="text-lg dark-hover:bg-primary-dark bg-yellow-100 hover:bg-primary-light dark:bg-transparent dark:text-primary-light px-2 border dark:border-primary-light rounded mr-2"
          onClick={() => {
            formState.data.id
              ? dispatch(updateCharacter(formState))
              : dispatch(addCharacter(formState));
            history.push(`/`);
          }}
        >
          Save Character
        </button>
      </div>

      <div>
        <h1>{formState.data.descriptionData.name}</h1>
        <div className="flex flex-wrap lg:flex-no-wrap">
          <div className="flex-grow">
            <TextBox>
              <DangerousHtml
                data={mainRenderer.race.getCompactRenderedString(race, false)}
              />
              <div>
                <div className="mt-4 font-bold text-md text-center">
                  {
                    (Parser.ALIGNMENTS as any)[
                      formState.data.descriptionData.alignment
                    ]
                  }
                  {', '}
                  {formState.data.descriptionData.background}
                </div>
                <div className="flex justify-between my-3">
                  <ul className="mr-2">
                    <li>
                      <strong>Age: </strong>
                      {formState.data.descriptionData.age}
                    </li>
                    <li>
                      <strong>Hair: </strong>
                      {formState.data.descriptionData.hair}
                    </li>
                    <li>
                      <strong>Skin: </strong>
                      {formState.data.descriptionData.skin}
                    </li>
                    <li>
                      <strong>Eyes: </strong>
                      {formState.data.descriptionData.eyes}
                    </li>
                    <li>
                      <strong>Height: </strong>
                      {formState.data.descriptionData.height}
                    </li>
                    <li>
                      <strong>Weight: </strong>
                      {formState.data.descriptionData.weight}
                    </li>
                  </ul>
                  <ul className="ml-2">
                    {Object.entries(CHARACTER_STATS).map(([key, value]) => {
                      const score = calculateStats(
                        formState.data as CharacterState,
                      )[key as StatsTypes];
                      const mod = getAbilityMod(score);
                      return (
                        <li>
                          <strong>{value}: </strong> {`${score} (${mod})`}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </TextBox>
          </div>
          <img
            src={formState.data.descriptionData.imageUrl}
            alt="character portrait"
            className="rounded h-full object-cover object-top shadow my-2 ml-2"
            style={{
              width: '17rem',
            }}
          />
        </div>
        <TextBox>
          <h3>
            <strong>
              {formState.data.classData.classElement} –{' '}
              {formState.data.classData.subClass}
            </strong>
          </h3>
          <ClassBase cls={classElement!} />
        </TextBox>
        <div className="flex flex-wrap">
          {formState.data.equipmentData.items.map((itemName, index) => (
            <TextBox key={index}>
              <DangerousHtml
                data={mainRenderer.item.getCompactRenderedString(
                  getItem(itemName),
                  false,
                )}
              />
            </TextBox>
          ))}
        </div>
      </div>
    </>
  );
};

export default Summary;
