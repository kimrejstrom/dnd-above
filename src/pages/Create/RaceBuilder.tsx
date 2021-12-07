import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { useHistory } from 'react-router-dom';
import { updateFormData } from 'features/createCharacterForm/createCharacterFormSlice';
import { Race } from 'models/race';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import DangerousHtml from 'components/DangerousHtml/DangerousHtml';
import { mainRenderer, Parser } from 'utils/mainRenderer';
import { useForm } from 'react-hook-form';
import {
  CHARACTER_STATS,
  StatsTypes,
} from 'features/character/characterListSlice';
import * as _ from 'lodash';
import { isBoolean } from 'util';
import { getRace, getRaces, getRaceFluff } from 'utils/sourceDataUtils';
import StyledButton from 'components/StyledButton/StyledButton';
import TextBox from 'components/TextBox/TextBox';
import { addDefaultImageSrc } from 'utils/render';

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
      return [
        chosenAbs.reduce(
          (acc: any, curr: string) => ({ ...acc, [curr]: abilityAmount }),
          {},
        ),
      ];
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
            chosenRaceLanguages: Array.isArray(data.chosenRaceLanguages)
              ? data.chosenRaceLanguages
              : [data.chosenRaceLanguages],
            chosenRaceAbilities: chosenAbs,
            chosenRaceSkillProficiencies: Array.isArray(
              data.chosenRaceSkillProficiencies,
            )
              ? data.chosenRaceSkillProficiencies
              : [data.chosenRaceSkillProficiencies],
          },
        }),
      );
      history.push(`/create/step-2`);
    };
    const abilities = race?.ability || [];
    const skillProficiencies = race?.skillProficiencies || [];
    const languages = race?.languageProficiencies || [];
    const abilityAmount = abilities.length
      ? abilities[0].choose?.amount || 1
      : 1;

    return (
      <div>
        <div className="flex justify-between my-4">
          <StyledButton
            onClick={() => dispatch(updateFormData({ raceData: { race: '' } }))}
          >
            Previous
          </StyledButton>
          <div className="flex relative">
            <h1>{race?.name}</h1>
          </div>
          <StyledButton onClick={handleSubmit(onSubmit)}>Next</StyledButton>
        </div>

        <TextBox>
          <form
            name="race-details"
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col dnd-body"
          >
            <h2 className="text-lg mb-2 mt-3">Ability Scores</h2>
            {mainRenderer.getAbilityData(abilities).asText ?? 'None'}
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
                        validate: (data: any) =>
                          Array.isArray(data) ? data.length === count : true,
                      })}
                      className={`form-input`}
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
            <h2 className="text-lg mb-2 mt-3">Skill Proficiencies</h2>
            {skillProficiencies.length
              ? skillProficiencies.map((prof, i) => {
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
                                validate: (data: any) =>
                                  Array.isArray(data)
                                    ? data.length === count
                                    : true,
                              })}
                              className={`form-input`}
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
                              className={`form-input`}
                              name="chosenRaceTools"
                              ref={register({
                                required: true,
                                validate: (data: any) =>
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
                      <div key={i}>
                        {_.keys(_.pickBy(prof, key => isBoolean(key))).join(
                          ', ',
                        )}
                      </div>
                    );
                  }
                })
              : 'None'}

            <h2 className="text-lg mb-2 mt-3">Languages</h2>
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
                            className={`form-input`}
                            multiple={lang.anyStandard > 1}
                            name={`chosenRaceLanguages`}
                            ref={register({
                              required: true,
                              validate: (data: any) =>
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

          <div className="dnd-body p-2">
            <div>
              <h2 className="text-lg">Racial Traits</h2>
              {race?.traitTags?.join(', ')}
            </div>

            <h2 className="text-lg">Racial Abilities</h2>
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
        </TextBox>
      </div>
    );
  };

  const RaceEntry = ({ race }: { race: Race }) => {
    const onSelect = (data: { race: string }, e?: React.BaseSyntheticEvent) => {
      dispatch(updateFormData({ raceData: data }));
    };

    return (
      <details key={race.name}>
        <summary className="items-center justify-start bg-light-100 dark:bg-dark-100 relative custom-border-sm custom-border-thin px-2 my-2 cursor-pointer">
          <span className="text-xl flex-grow">
            <img
              src={`${
                process.env.PUBLIC_URL
              }/img/races/${race.name.toLowerCase()}.png`}
              onError={(ev: any) =>
                addDefaultImageSrc(ev, race.name.toLowerCase())
              }
              alt={race.name.toLowerCase()}
              className="inline h-8 mr-2 rounded bg-contain"
            />
            {`${race.name} (${race.source})`}
          </span>
          <StyledButton
            extraClassName="absolute right-0 mr-2 sm:h-8 -top-px"
            onClick={(e: any) => onSelect({ race: race.name }, e)}
          >
            Select
          </StyledButton>
        </summary>
        <div className="dnd-body rounded p-4 mx-2 -mt-3 bg-light-100 dark:bg-dark-100">
          <Tabs>
            <TabList className="flex text-center py-1">
              <Tab className="mr-2">Traits</Tab>
              <Tab>Info</Tab>
            </TabList>

            <TabPanel className="overflow-y-scroll px-2">
              <div className="wrap-image">
                <div className="pl-0 md:pl-3 bg-light-100 dark:bg-dark-100 float-right">
                  <img
                    src={`${
                      process.env.PUBLIC_URL
                    }/img/races/${race.name.toLowerCase()}.png`}
                    onError={(ev: any) =>
                      addDefaultImageSrc(ev, race.name.toLowerCase())
                    }
                    alt={race.name.toLowerCase()}
                    className="w-80 shadow rounded"
                  />
                </div>

                <div>
                  <DangerousHtml
                    key={race.name}
                    data={mainRenderer.race.getCompactRenderedString(race)}
                  />
                </div>
              </div>
            </TabPanel>
            <TabPanel className="overflow-y-scroll px-2">
              {[getRaceFluff(race.name), getRaceFluff(race._baseName!)].map(
                (fluff, i) => (
                  <DangerousHtml
                    key={`${fluff?.name}-${i}`}
                    extraClassName="tight"
                    data={fluff && mainRenderer.render(fluff)}
                  />
                ),
              )}
            </TabPanel>
          </Tabs>
        </div>
      </details>
    );
  };

  const RaceInfo = () => {
    const groupByRaceName = (arr: Array<any>, key: string) =>
      arr.reduce((acc: any, item: any) => {
        return (
          (acc[item[key].split(' ')[0]] = [
            ...(acc[item[key].split(' ')[0]] || []),
            item,
          ]),
          acc
        );
      }, {});

    const groupedRaces = groupByRaceName(getRaces()!, 'name');

    return (
      <div>
        {Object.entries(groupedRaces).map(([key, value]) => {
          const name = key;
          const races = value as Race[];
          if (races.length === 1) {
            return <RaceEntry key={name} race={races[0]} />;
          } else {
            return (
              <details key={name}>
                <summary className="items-center justify-start bg-light-100 dark:bg-dark-100 relative custom-border-sm custom-border-thin px-2 my-2 cursor-pointer">
                  <span className="text-xl flex-grow">
                    <img
                      src={`${
                        process.env.PUBLIC_URL
                      }/img/races/${name.toLowerCase()}.png`}
                      onError={(ev: any) =>
                        addDefaultImageSrc(ev, name.toLowerCase())
                      }
                      alt={name.toLowerCase()}
                      className="inline h-8 mr-2 rounded bg-contain"
                    />
                    {`${name}* (Subraces)`}
                  </span>
                  <StyledButton
                    disabled
                    extraClassName="absolute right-0 mr-2 sm:h-8 -top-px"
                    onClick={_.noop}
                  >
                    Select
                  </StyledButton>
                </summary>
                <div className="pl-4">
                  {races.map(race => (
                    <RaceEntry key={race.name} race={race} />
                  ))}
                </div>
              </details>
            );
          }
        })}
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
