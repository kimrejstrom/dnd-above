import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { useHistory } from 'react-router-dom';
import { updateFormData } from 'features/createCharacterForm/createCharacterFormSlice';
import { Race } from 'models/race';
import { PLAYABLE_RACES, PLAYABLE_RACES_FLUFF } from 'utils/data';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import DangerousHtml from 'components/DangerousHtml/DangerousHtml';
import { mainRenderer, Parser } from 'utils/mainRenderer';
import Entry from 'components/Entry/Entry';
import { useForm } from 'react-hook-form';
import {
  CHARACTER_STATS,
  StatsTypes,
} from 'features/character/characterListSlice';
import * as _ from 'lodash';
import { isBoolean } from 'util';
import { getRace } from 'utils/character';
import StyledButton from 'components/StyledButton/StyledButton';

const RaceBuilder = () => {
  const dispatch = useDispatch();
  const formState = useSelector(
    (state: RootState) => state.createCharacterForm,
  );
  const race = getRace(formState.data.raceData.race);

  const parseChosenRaceAbilities = (
    abilityAmount: number,
    abs?: string | string[],
  ) => {
    if (abs) {
      const chosenAbs = Array.isArray(abs) ? abs : [abs];
      return chosenAbs.reduce(
        (acc: any, curr: string) => ({ ...acc, [curr]: abilityAmount }),
        {},
      );
    }
    return [];
  };

  const RaceDetails = () => {
    const history = useHistory();
    const { register, handleSubmit, errors } = useForm();
    const onSubmit = (data: any, e?: React.BaseSyntheticEvent) => {
      const chosenAbs = parseChosenRaceAbilities(
        abilityAmount,
        data.chosenRaceAbilities,
      );
      dispatch(
        updateFormData({
          raceData: {
            ...data,
            chosenRaceAbilities: chosenAbs,
          },
        }),
      );
      history.push(`/create/step-2`);
    };
    const abilities = race?.ability || [];
    const skillProficiencies = race?.skillProficiencies || [];
    const languages = race?.languageProficiencies || [];
    const abilityAmount = abilities[0].choose?.amount || 1;

    return (
      <div>
        <div className="flex justify-between my-4">
          <StyledButton
            onClick={() => dispatch(updateFormData({ raceData: { race: '' } }))}
          >
            Previous
          </StyledButton>
          <StyledButton onClick={handleSubmit(onSubmit)}>Next</StyledButton>
        </div>
        <div className="flex relative">
          <h1>{race?.name}</h1>
        </div>

        <div className="custom-border custom-border-thin bg-yellow-100 dark:bg-primary-dark">
          <form
            name="race-details"
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col dnd-body"
          >
            <h3>Ability Scores</h3>
            {mainRenderer.getAbilityData(abilities).asText}
            {abilities.map(ab => {
              if (ab.choose) {
                const count = ab.choose.count || 1;
                return (
                  <label className="block">
                    {`Choose ability (${count}):`}
                    <select
                      multiple={count > 1}
                      name="chosenRaceAbilities"
                      ref={register({
                        required: true,
                        validate: data =>
                          Array.isArray(data) ? data.length === count : true,
                      })}
                      className={`${
                        count > 1 ? 'form-multiselect' : 'form-select'
                      } block w-full mt-1 bg-yellow-100 border border-gray-400 text-primary-dark rounded`}
                    >
                      {ab.choose.from.map(abil => (
                        <option value={abil}>
                          {CHARACTER_STATS[abil as StatsTypes]}
                        </option>
                      ))}
                    </select>
                    {errors.chosenRaceAbilities && (
                      <span>{`You must choose ${count} skills`}</span>
                    )}
                  </label>
                );
              } else {
                return undefined;
              }
            })}

            <h3>Skill Proficiencies</h3>
            {skillProficiencies.length
              ? skillProficiencies.map(prof => {
                  if (prof.choose) {
                    const hasToolOption =
                      typeof _.last(prof.choose.from) !== 'string';
                    let count = prof.choose.count || 1;
                    if (hasToolOption) {
                      count = count - 1;
                    }
                    return (
                      <>
                        {count > 0 && (
                          <label className="block">
                            {`Choose skill proficiency (${count}):`}
                            <select
                              multiple={count > 1}
                              name="chosenRaceSkillProficiencies"
                              ref={register({
                                required: true,
                                validate: data =>
                                  Array.isArray(data)
                                    ? data.length === count
                                    : true,
                              })}
                              className={`${
                                count > 1 ? 'form-multiselect' : 'form-select'
                              } block w-full mt-1 bg-yellow-100 border border-gray-400 text-primary-dark rounded`}
                            >
                              {prof.choose.from.map(pr => {
                                if (typeof pr === 'string') {
                                  return (
                                    <option className="capitalize" value={pr}>
                                      {_.capitalize(pr)}
                                    </option>
                                  );
                                } else {
                                  return <></>;
                                }
                              })}
                            </select>
                            {errors.chosenRaceSkillProficiencies && (
                              <span>{`You must choose ${count} skills`}</span>
                            )}
                          </label>
                        )}
                        {hasToolOption && (
                          <label className="block">
                            {`Choose tool proficiency (1):`}
                            <select
                              className={`${
                                count > 1 ? 'form-multiselect' : 'form-select'
                              } block w-full mt-1 bg-yellow-100 border border-gray-400 text-primary-dark rounded`}
                              name="chosenRaceTools"
                              ref={register({
                                required: true,
                                validate: data =>
                                  Array.isArray(data)
                                    ? data.length === count
                                    : true,
                              })}
                            >
                              {Parser.TOOL_PROFICIENCY.map((pr: any) => (
                                <option className="capitalize" value={pr}>
                                  {pr}
                                </option>
                              ))}
                            </select>
                            {errors.chosenRaceTools && (
                              <span>{`You must choose ${count} skills`}</span>
                            )}
                          </label>
                        )}
                      </>
                    );
                  } else {
                    return (
                      <div>
                        {_.keys(_.pickBy(prof, key => isBoolean(key))).join(
                          ', ',
                        )}
                      </div>
                    );
                  }
                })
              : 'None'}

            <h3>Languages</h3>
            {languages.length
              ? languages.map((lang, i) => {
                  if (lang.anyStandard) {
                    return (
                      <>
                        {_.keys(_.pickBy(lang, key => isBoolean(key))).join(
                          ', ',
                        )}
                        <label className="block">
                          {`Choose language (${lang.anyStandard}):`}
                          <select
                            className={`${
                              lang.anyStandard > 1
                                ? 'form-multiselect'
                                : 'form-select'
                            } block w-full mt-1 bg-yellow-100 border border-gray-400 text-primary-dark rounded`}
                            multiple={lang.anyStandard > 1}
                            name={`chosenRaceLanguages`}
                            ref={register({
                              required: true,
                              validate: data =>
                                Array.isArray(data)
                                  ? data.length === lang.anyStandard
                                  : true,
                            })}
                          >
                            {Parser.LANGUAGES_STANDARD.concat(
                              Parser.LANGUAGES_EXOTIC,
                            ).map((allLang: any) => (
                              <option
                                className="capitalize"
                                value={allLang.toLowerCase()}
                              >
                                {allLang}
                              </option>
                            ))}
                          </select>
                          {errors.chosenRaceLanguages && (
                            <span>{`You must choose ${lang.anyStandard} skills`}</span>
                          )}
                        </label>
                      </>
                    );
                  } else {
                    return (
                      <div key={i} className="capitalize">
                        {_.keys(
                          _.pickBy(lang, key => typeof key === 'boolean'),
                        ).join(', ')}
                      </div>
                    );
                  }
                })
              : 'None'}
          </form>
        </div>
        <div className="dnd-body p-2">
          <div>
            <h3>Racial Traits</h3>
            {race?.traitTags?.join(', ')}
          </div>

          <h3>Racial Abilities</h3>
          <DangerousHtml
            data={mainRenderer.render(
              {
                type: 'entries',
                entries: race?.entries?.filter(
                  item =>
                    !_.includes(
                      ['Age', 'Size', 'Alignment', 'Languages'],
                      item.name,
                    ),
                ),
              },
              1,
            )}
          />
        </div>
      </div>
    );
  };

  const RaceInfo = () => {
    const onSelect = (data: { race: string }, e?: React.BaseSyntheticEvent) => {
      dispatch(updateFormData({ raceData: data }));
    };

    const addDefaultImageSrc = (ev: any, name: string) => {
      ev.target.src = `${process.env.PUBLIC_URL}/img/races/${
        name.split(' ')[0]
      }.png`;
    };

    return (
      <div>
        {PLAYABLE_RACES.map((race: Race, index) => (
          <details key={race.name}>
            <summary className="bg-yellow-100 dark:bg-primary-dark relative custom-border custom-border-thin px-2 my-2 cursor-pointer">
              <span className="text-xl">{race.name}</span>
              <StyledButton
                onClick={(e: any) => onSelect({ race: race.name }, e)}
                extraClassName="absolute right-0 mr-2"
              >
                Select
              </StyledButton>
            </summary>
            <div className="dnd-body p-2">
              <Tabs>
                <TabList className="flex text-center">
                  <Tab className="mr-2">Traits</Tab>
                  <Tab>Info</Tab>
                </TabList>

                <TabPanel className="overflow-y-scroll px-2">
                  <div>
                    <img
                      src={`${
                        process.env.PUBLIC_URL
                      }/img/races/${race.name.toLowerCase()}.png`}
                      onError={(ev: any) =>
                        addDefaultImageSrc(ev, race.name.toLowerCase())
                      }
                      alt={race.name.toLowerCase()}
                      className="custom-border custom-border-thin shadow float-right ml-2"
                      style={{
                        width: '20rem',
                      }}
                    />
                    <div>
                      <DangerousHtml
                        key={index}
                        data={mainRenderer.race.getCompactRenderedString(race)}
                      />
                    </div>
                  </div>
                </TabPanel>
                <TabPanel className="overflow-y-scroll px-2">
                  {
                    <Entry
                      entry={
                        PLAYABLE_RACES_FLUFF.find(
                          fluff => fluff.name === race.name,
                        ) || 'No info available'
                      }
                    />
                  }
                </TabPanel>
              </Tabs>
            </div>
          </details>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h1>Step 1: Select Race</h1>
      {race ? <RaceDetails /> : <RaceInfo />}
    </div>
  );
};

export default RaceBuilder;
