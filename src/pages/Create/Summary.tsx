import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { useHistory } from 'react-router-dom';
import { calculateStats, getAbilityMod, randomize } from 'utils/character';
import {
  getRace,
  getClass,
  getItem,
  getSubClass,
  getBackground,
} from 'utils/sourceDataUtils';
import {
  updateCharacter,
  addCharacter,
  CHARACTER_STATS,
  CharacterListItem,
  StatsTypes,
} from 'features/character/characterListSlice';
import TextBox from 'components/TextBox/TextBox';
import DangerousHtml from 'components/DangerousHtml/DangerousHtml';
import { mainRenderer, Parser } from 'utils/mainRenderer';
import ClassBase from 'pages/Create/ClassBase';
import StyledButton from 'components/StyledButton/StyledButton';
import { setGeneratedFormData } from 'features/createCharacterForm/createCharacterFormSlice';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import ClassTable from 'pages/Create/ClassTable';
import DetailedEntryTrigger from 'features/detailedEntry/DetailedEntryTrigger';
import { RenderItem } from 'utils/render';

const Summary = () => {
  const formState = useSelector(
    (state: RootState) => state.createCharacterForm,
  );
  const existingCharacter = useSelector((state: RootState) => {
    const list = state.characterList;
    const id = state.createCharacterForm.data.id;
    return list.list.find(char => char.id === id);
  });
  const history = useHistory();
  const dispatch = useDispatch();
  const race = getRace(formState.data.raceData.race);
  const classElement = getClass(formState.data.classData.classElement);
  const subClass = getSubClass(
    formState.data.classData.classElement,
    formState.data.classData.subClass,
  );
  const characterSummaryAvailable = classElement !== undefined;

  const handleAddCharacter = () => {
    const raceElement = getRace(formState.data.raceData.race);
    const classElement = getClass(formState.data.classData.classElement);
    const backgroundElement = getBackground(
      formState.data.descriptionData.background,
    );
    dispatch(
      addCharacter({
        formState,
        sourceData: {
          raceElement: raceElement!,
          classElement: classElement!,
          backgroundElement: backgroundElement!,
        },
      }),
    );
  };

  const handleUpdateCharacter = () => {
    dispatch(updateCharacter(formState));
  };

  return (
    <>
      <h1>Summary</h1>
      <div className="flex justify-between my-4">
        <StyledButton
          extraClassName="mr-2"
          onClick={() => {
            dispatch(setGeneratedFormData(randomize()));
          }}
        >
          Randomize
        </StyledButton>
        <div className="flex relative">
          <h1>
            {characterSummaryAvailable
              ? `${formState.data.descriptionData.name}: ${formState.data.raceData.race} ${formState.data.classData.classElement}`
              : 'Overview'}
          </h1>
        </div>
        <StyledButton
          extraClassName="mr-2"
          disabled={!characterSummaryAvailable}
          onClick={() => {
            existingCharacter ? handleUpdateCharacter() : handleAddCharacter();
            history.push(`/`);
          }}
        >
          Save
        </StyledButton>
      </div>

      {characterSummaryAvailable ? (
        <TextBox>
          <div className="w-full flex flex-wrap lg:flex-nowrap">
            <div className="w-full md:w-8/12 border-box px-2">
              <div className="my-3">
                <div>
                  <h1 className="whitespace-nowrap text-2xl font-bold">
                    {formState.data.descriptionData.name}
                  </h1>
                  <div className="flex justify-start items-start">
                    <img
                      className="w-8 mt-0.5 mr-2 rounded bg-contain"
                      src={`${
                        process.env.PUBLIC_URL
                      }/img/${formState.data.classData.classElement.toLowerCase()}.jpeg`}
                      alt={formState.data.classData.classElement}
                      style={{
                        filter: 'grayscale(80%)',
                      }}
                    />
                    <div>
                      <div className="flex flex-col">
                        <div className="text-base leading-tight">
                          Class:{' '}
                          <span className="font-bold">
                            {formState.data.classData.classElement}
                          </span>
                        </div>
                        <div className="text-base leading-tight">
                          Subclass:{' '}
                          <span className="font-bold">
                            {formState.data.classData.subClass}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-base leading-tight">
                    Race:{' '}
                    <span className="font-bold">
                      {formState.data.raceData.race}
                    </span>
                  </div>
                  <div className="text-base leading-tight">
                    Alignment:{' '}
                    <span className="font-bold">
                      {
                        (Parser.ALIGNMENTS as any)[
                          formState.data.descriptionData.alignment
                        ]
                      }
                      {', '}
                      {formState.data.descriptionData.background}
                    </span>
                  </div>
                  <div className="text-base leading-tight">
                    Level:{' '}
                    <span className="font-bold">
                      {existingCharacter?.gameData?.level
                        ? existingCharacter?.gameData?.level
                        : 0}
                    </span>
                  </div>
                </div>
              </div>
              <Tabs>
                <TabList className="flex text-center">
                  <Tab className="mr-2">Info</Tab>
                  <Tab>Table</Tab>
                </TabList>
                <TabPanel>
                  <ClassBase cls={classElement!} />
                </TabPanel>
                <TabPanel>
                  <ClassTable cls={classElement!} subcls={subClass!} />
                </TabPanel>
              </Tabs>
            </div>
            <div className="w-full md:w-4/12 border-box px-2">
              <div className="bg-light-300 dark:bg-dark-200 shadow rounded p-3 mb-3">
                <ul className="mt-1 uppercase flex justify-between">
                  {Object.entries(CHARACTER_STATS).map(([key, value]) => {
                    const score = calculateStats(
                      formState.data as CharacterListItem,
                    )[key as StatsTypes];
                    const mod = getAbilityMod(score);
                    return (
                      <li key={key} className="flex flex-col text-center">
                        <strong>{key}</strong>
                        <span className="text-md">{`${score}(${mod})`}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <DangerousHtml
                prose={false}
                extraClassName="w-full"
                data={mainRenderer.race.getCompactRenderedString(race, false)}
              />
              <img
                onError={(ev: any) => {
                  ev.target.src = `${process.env.PUBLIC_URL}/img/races/default.png`;
                }}
                src={formState.data.descriptionData.imageUrl}
                alt="character portrait"
                className="mt-3 w-full shadow rounded"
              />
              <div className="bg-light-300 dark:bg-dark-200 shadow rounded mt-3 p-4">
                <h3 className="text-center text-lg">Description</h3>
                <ul>
                  <li className="flex justify-between">
                    <strong>Age: </strong>
                    {formState.data.descriptionData.age}
                  </li>
                  <li className="flex justify-between">
                    <strong>Hair: </strong>
                    {formState.data.descriptionData.hair}
                  </li>
                  <li className="flex justify-between">
                    <strong>Skin: </strong>
                    {formState.data.descriptionData.skin}
                  </li>
                  <li className="flex justify-between">
                    <strong>Eyes: </strong>
                    {formState.data.descriptionData.eyes}
                  </li>
                  <li className="flex justify-between">
                    <strong>Height: </strong>
                    {formState.data.descriptionData.height}
                  </li>
                  <li className="flex justify-between">
                    <strong>Weight: </strong>
                    {formState.data.descriptionData.weight}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="my-3">
            <h3>Equipment</h3>
            <div className="flex flex-wrap">
              {formState.data.equipmentData.items.map((itemName, index) => {
                const item = getItem(itemName);
                return (
                  <DetailedEntryTrigger
                    extraClassName="w-full md:w-40 mr-2 mt-2 tight"
                    key={itemName}
                    renderer={RenderItem(item)}
                    data={item}
                  >
                    <TextBox extraClassName="bg-light-200 h-40 w-full dark:bg-dark-200 px-2 py-2">
                      <DangerousHtml
                        extraClassName="text-sm leading-none"
                        prose={false}
                        data={mainRenderer.item.getCompactRenderedString(
                          item,
                          false,
                        )}
                      />
                    </TextBox>
                  </DetailedEntryTrigger>
                );
              })}
            </div>
          </div>
        </TextBox>
      ) : (
        <div>No character data available</div>
      )}
    </>
  );
};

export default Summary;
