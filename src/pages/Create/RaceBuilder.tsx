import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { useHistory } from 'react-router-dom';
import { updateFormData } from 'features/createCharacterForm/createCharacterFormSlice';
import { Race } from 'models/race';
import { PLAYABLE_RACES, PLAYABLE_RACES_FLUFF } from 'utils/data';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import DangerousHtml from 'components/DangerousHtml/DangerousHtml';
import mainRenderer from 'utils/mainRenderer';
import Entry from 'components/Entry/Entry';
import { useForm } from 'react-hook-form';
import { CHARACTER_STATS, StatsTypes } from 'features/character/characterSlice';
import * as _ from 'lodash';
import { isBoolean } from 'util';

interface Props {
  url: string;
}

const RaceBuilder = ({ url }: Props) => {
  const dispatch = useDispatch();
  const formState = useSelector(
    (state: RootState) => state.createCharacterForm,
  );

  const RaceDetails = () => {
    const history = useHistory();
    const { register, handleSubmit, errors } = useForm();
    const onSubmit = (data: any, e?: React.BaseSyntheticEvent) => {
      dispatch(updateFormData(data));
      history.push(`${url}/step-2`);
    };

    const abilities = formState.data.race!.ability || [];
    const proficiencies = formState.data.race!.skillProficiencies || [];
    const languages = formState.data.race!.languageProficiencies || [];

    return (
      <div>
        <div className="flex justify-between my-4">
          <button
            className="text-lg dark-hover:bg-primary-dark bg-yellow-100 hover:bg-primary-light dark:bg-transparent dark:text-primary-light px-2 border dark:border-primary-light rounded"
            onClick={() => dispatch(updateFormData({ race: undefined }))}
          >
            Previous
          </button>
          <button
            className="text-lg dark-hover:bg-primary-dark bg-yellow-100 hover:bg-primary-light dark:bg-transparent dark:text-primary-light px-2 border dark:border-primary-light rounded"
            onClick={handleSubmit(onSubmit)}
          >
            Next
          </button>
        </div>
        <div className="flex relative">
          <h1>{formState.data.race?.name}</h1>
        </div>

        <div className="custom-border custom-border-thin">
          <form
            name="race-details"
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col"
          >
            <h2>Ability Scores</h2>
            {mainRenderer.getAbilityData(abilities).asText}
            {abilities.map(ab => {
              if (ab.choose) {
                const count = ab.choose.count || 1;
                return (
                  <label className="block">
                    {`Choose ability (${count}):`}
                    <select
                      multiple={count > 1}
                      name="abilities"
                      ref={register({
                        required: true,
                        validate: data =>
                          Array.isArray(data) ? data.length === count : true,
                      })}
                      className={`${
                        count > 1 ? 'form-multiselect' : 'form-select'
                      } block w-full mt-1`}
                    >
                      {ab.choose.from.map(abil => (
                        <option value={abil}>
                          {CHARACTER_STATS[abil as StatsTypes]}
                        </option>
                      ))}
                    </select>
                    {errors.abilities && (
                      <span>{`You must choose ${count} skills`}</span>
                    )}
                  </label>
                );
              } else {
                return <></>;
              }
            })}

            <h2>Skill Proficiencies</h2>
            {proficiencies.map(prof => {
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
                          name="raceProficiencies"
                          ref={register({
                            required: true,
                            validate: data =>
                              Array.isArray(data)
                                ? data.length === count
                                : true,
                          })}
                          className={`${
                            count > 1 ? 'form-multiselect' : 'form-select'
                          } block w-full mt-1`}
                        >
                          {prof.choose.from.map(pr => {
                            if (typeof pr === 'string') {
                              return (
                                <option className="uppercase" value={pr}>
                                  {pr}
                                </option>
                              );
                            } else {
                              return <></>;
                            }
                          })}
                        </select>
                        {errors.raceProficiencies && (
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
                          } block w-full mt-1`}
                          name="tools"
                          ref={register({
                            required: true,
                            validate: data =>
                              Array.isArray(data)
                                ? data.length === count
                                : true,
                          })}
                        >
                          {Parser.TOOL_PROFICIENCY.map(pr => (
                            <option className="uppercase" value={pr}>
                              {pr}
                            </option>
                          ))}
                        </select>
                        {errors.tools && (
                          <span>{`You must choose ${count} skills`}</span>
                        )}
                      </label>
                    )}
                  </>
                );
              } else {
                return (
                  <div>
                    {_.keys(_.pickBy(prof, key => isBoolean(key))).join(', ')}
                  </div>
                );
              }
            })}

            <h2>Languages</h2>
            {languages.map(lang => {
              if (lang.anyStandard) {
                return (
                  <>
                    {_.keys(_.pickBy(lang, key => isBoolean(key))).join(', ')}
                    <label className="block">
                      {`Choose language (${lang.anyStandard}):`}
                      <select
                        className={`${
                          lang.anyStandard > 1
                            ? 'form-multiselect'
                            : 'form-select'
                        } block w-full mt-1`}
                        multiple={lang.anyStandard > 1}
                        name={`languages`}
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
                        ).map(allLang => (
                          <option
                            className="uppercase"
                            value={allLang.toLowerCase()}
                          >
                            {allLang}
                          </option>
                        ))}
                      </select>
                      {errors.languages && (
                        <span>{`You must choose ${lang.anyStandard} skills`}</span>
                      )}
                    </label>
                  </>
                );
              } else {
                return (
                  <div>
                    {_.keys(_.pickBy(lang, key => isBoolean(key))).join(', ')}
                  </div>
                );
              }
            })}

            <input type="submit" />
          </form>
        </div>

        <div>
          <h2>Racial Traits</h2>
          {formState.data.race?.traitTags?.join(', ')}
        </div>

        <h2>Racial Abilities</h2>
        <DangerousHtml
          data={mainRenderer.render(
            {
              type: 'entries',
              entries: formState.data.race?.entries?.filter(
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
    );
  };

  const RaceInfo = () => {
    const onSelect = (data: { race: Race }, e?: React.BaseSyntheticEvent) => {
      dispatch(updateFormData(data));
    };
    return (
      <div>
        <div>
          {PLAYABLE_RACES.map((race: Race, index) => (
            <details>
              <summary className="relative custom-border custom-border-thin p-2 my-2">
                <span className="text-xl">{race.name}</span>
                <button
                  onClick={e => onSelect({ race }, e)}
                  className="text-lg dark-hover:bg-primary-dark bg-yellow-100 hover:bg-primary-light dark:bg-transparent dark:text-primary-light px-2 border dark:border-primary-light rounded absolute right-0 mr-2"
                >
                  Select
                </button>
              </summary>
              <div className="dnd-body p-2">
                <Tabs>
                  <TabList className="flex text-center">
                    <Tab className="mr-2">Traits</Tab>
                    <Tab>Info</Tab>
                  </TabList>

                  <TabPanel className="overflow-y-scroll px-2">
                    <DangerousHtml
                      key={index}
                      data={mainRenderer.race.getCompactRenderedString(race)}
                    />
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
      </div>
    );
  };

  return (
    <div>
      <h1>Step 1: Select Race</h1>
      {formState.data.race ? <RaceDetails /> : <RaceInfo />}
    </div>
  );
};

export default RaceBuilder;
