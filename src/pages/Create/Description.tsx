import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { useHistory, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { updateFormData } from 'features/createCharacterForm/createCharacterFormSlice';
import { BackgroundElement } from 'models/background';
import _, { isBoolean } from 'lodash';
import { BACKGROUNDS, CHARACTERISTICS } from 'utils/data';
import Background from 'pages/Create/Background';

const Description = ({ url }: { url: string }) => {
  const dispatch = useDispatch();
  const formState = useSelector(
    (state: RootState) => state.createCharacterForm,
  );
  const history = useHistory();
  const { register, handleSubmit, getValues, errors } = useForm<FormData>();
  const onSubmit = (data: FormData, e?: React.BaseSyntheticEvent) => {
    console.log('TODO: MAP THESE: ' + JSON.stringify(getValues()));
    dispatch(updateFormData({ description: data }));
    history.push(`${url}/step-4`);
  };

  type FormData = {
    name: string;
    background: BackgroundElement;
    backgroundSkillProficiencies: string[];
    backgroundToolProficiencies: string[];
    backgroundLanguageProficiencies: any;
    backgroundAlignment: string;
    backgroundCharacteristics: string;
  };

  // Local state
  const [selectedBackground, setSelectedBackground] = useState<
    BackgroundElement
  >();
  const [selectedAlignment, setSelectedAlignment] = useState<string>();
  const [
    selectedBackgroundCharacteristics,
    setSelectedBackgroundCharacteristics,
  ] = useState<string>('');

  const handleBackgroundSelect = (
    e: React.SyntheticEvent<HTMLSelectElement, Event>,
  ) => {
    const background = _.find(
      BACKGROUNDS,
      bg => bg.name === e.currentTarget.value,
    );
    setSelectedBackground(background);
    setSelectedBackgroundCharacteristics(background?.name || '');
  };

  return (
    <div>
      <div className="flex justify-between my-4">
        <Link
          className="text-lg dark-hover:bg-primary-dark bg-yellow-100 hover:bg-primary-light dark:bg-transparent dark:text-primary-light px-2 border dark:border-primary-light rounded"
          to={`${url}/step-3`}
        >
          Previous
        </Link>
        <button
          className="text-lg dark-hover:bg-primary-dark bg-yellow-100 hover:bg-primary-light dark:bg-transparent dark:text-primary-light px-2 border dark:border-primary-light rounded"
          onClick={handleSubmit(onSubmit)}
        >
          Next
        </button>
      </div>
      <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <h2>Character Description</h2>
        <div className="w-full">
          <label className="block">
            Character Name
            <input
              name="name"
              className="form-input block w-full mt-1 bg-yellow-100 border border-gray-400 text-primary-dark rounded"
              ref={register({ required: true })}
              defaultValue={formState.data.name}
            />
            {errors.name && 'Name is required'}
          </label>
          {/* BACKGROUND */}
          <details>
            <summary className="bg-yellow-100 dark:bg-primary-dark relative custom-border custom-border-thin p-2 my-2">
              <span className="text-xl">Background</span>
            </summary>
            <div>
              <label className="block">
                {`Background`}
                <select
                  name="background"
                  onChange={handleBackgroundSelect}
                  ref={register({
                    required: true,
                    validate: data => data !== 'initial',
                  })}
                  className={`form-select block w-full mt-1 bg-yellow-100 border border-gray-400 text-primary-dark rounded`}
                >
                  <option value="initial">-</option>
                  {BACKGROUNDS.map(background => (
                    <option value={background.name}>{background.name}</option>
                  ))}
                </select>
                {errors.background && (
                  <span>{`You must choose a background`}</span>
                )}
              </label>
              {selectedBackground && (
                <div>
                  <h3>Skill Proficiencies</h3>
                  {selectedBackground.skillProficiencies?.map(prof => {
                    if (prof.choose) {
                      let count = prof.choose.count || 1;
                      return (
                        <>
                          {count > 0 && (
                            <label className="block">
                              {`Choose skill proficiency (${count}):`}
                              <select
                                multiple={count > 1}
                                name="backgroundSkillProficiencies"
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
                                        {pr}
                                      </option>
                                    );
                                  } else {
                                    return <></>;
                                  }
                                })}
                              </select>
                              {errors.backgroundSkillProficiencies && (
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
                  })}

                  <h3>Tool Proficiencies</h3>
                  {selectedBackground.toolProficiencies?.map(prof => {
                    if (prof.choose) {
                      let count = 1;
                      return (
                        <>
                          {count > 0 && (
                            <label className="block">
                              {`Choose language proficiency (${count}):`}
                              <select
                                multiple={count > 1}
                                name="backgroundToolProficiencies"
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
                                        {pr}
                                      </option>
                                    );
                                  } else {
                                    return <></>;
                                  }
                                })}
                              </select>
                              {errors.backgroundToolProficiencies && (
                                <span>{`You must choose ${count} languages`}</span>
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
                  })}

                  <h3>Languages</h3>
                  {selectedBackground.languageProficiencies?.map(lang => {
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
                              name="backgroundLanguageProficiencies"
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
                                  className="capitalize"
                                  value={allLang.toLowerCase()}
                                >
                                  {allLang}
                                </option>
                              ))}
                            </select>
                            {errors.backgroundLanguageProficiencies && (
                              <span>{`You must choose ${lang.anyStandard} skills`}</span>
                            )}
                          </label>
                        </>
                      );
                    } else {
                      return (
                        <div>
                          {_.keys(_.pickBy(lang, key => isBoolean(key))).join(
                            ', ',
                          )}
                        </div>
                      );
                    }
                  })}
                </div>
              )}

              {selectedBackground && (
                <div className="custom-border custom-border-thin my-2">
                  <Background background={selectedBackground} />
                </div>
              )}
            </div>
          </details>
          {/* ALIGNMENT */}
          <details>
            <summary className="bg-yellow-100 dark:bg-primary-dark relative custom-border custom-border-thin p-2 my-2">
              <span className="text-xl">Character Details</span>
            </summary>
            <div>
              <div className="shadow dnd-body mx-1 my-4 p-4 rounded bg-tertiary-light dark:bg-primary-dark">
                <h3>Alignment</h3>
                <p>
                  A typical creature in the worlds of Dungeons &amp; Dragons has
                  an alignment, which broadly describes its moral and personal
                  attitudes. Alignment is a combination of two factors: one
                  identifies morality (good, evil, or neutral), and the other
                  describes attitudes toward society and order (lawful, chaotic,
                  or neutral).
                </p>
                <p className="mt-4">
                  Thus, nine distinct alignments define the possible
                  combinations:{' '}
                  <strong>{Object.values(Parser.ALIGNMENTS).join(', ')}</strong>
                </p>
              </div>

              <div>
                {(formState.data.race?.entries || []).map(entry =>
                  entry.name === 'Alignment' ? entry.entries.join(', ') : '',
                )}
              </div>

              <label className="block">
                {`Choose Alignment`}
                <select
                  className="form-select block w-full mt-1 bg-yellow-100 border border-gray-400 text-primary-dark rounded"
                  name="backgroundAlignment"
                  onChange={() => {
                    setSelectedAlignment(getValues().backgroundAlignment);
                  }}
                  ref={register({
                    required: true,
                    validate: data => data !== 'initial',
                  })}
                >
                  <option value="initial">-</option>
                  {Object.entries(Parser.ALIGNMENTS).map(([key, value]) => (
                    <option className="capitalize" value={key}>
                      {value}
                    </option>
                  ))}
                </select>
                {errors.backgroundAlignment && (
                  <span>{`You must choose an alignment`}</span>
                )}
              </label>
              {selectedAlignment && (
                <p>{(Parser.ALIGNMENTS_DESC as any)[selectedAlignment]}</p>
              )}
            </div>
          </details>
          {/* PERSONAL CHARACTERISTICS */}
          <details>
            <summary className="bg-yellow-100 dark:bg-primary-dark relative custom-border custom-border-thin p-2 my-2">
              <span className="text-xl">Personal Characteristics</span>
            </summary>
            <div>
              <label className="block">
                {`From Background ${selectedBackgroundCharacteristics}`}
                <select
                  className="form-select block w-full mt-1 bg-yellow-100 border border-gray-400 text-primary-dark rounded"
                  name="backgroundCharacteristics"
                  onChange={e => {
                    setSelectedBackgroundCharacteristics(e.currentTarget.value);
                  }}
                  ref={register}
                  value={selectedBackgroundCharacteristics}
                >
                  <option value="initial">-</option>
                  {CHARACTERISTICS.map(entry => (
                    <option className="capitalize" value={entry.name}>
                      {entry.name}
                    </option>
                  ))}
                </select>
                {errors.backgroundCharacteristics && (
                  <span>{`You must choose a background`}</span>
                )}
              </label>
              {selectedBackgroundCharacteristics && (
                <div>
                  {_.find(
                    CHARACTERISTICS,
                    item => item.name === selectedBackgroundCharacteristics,
                  )
                    ?.tables.map(x => x)
                    .map(item => {
                      if (typeof item === 'string') {
                        return <div>{item}</div>;
                      } else {
                        const heading = item!.colLabels
                          ? item!.colLabels[1]
                          : 'Unknown';

                        return (
                          <div>
                            <label className="block">
                              {heading}
                              <select
                                className="form-select block w-full mt-1 bg-yellow-100 border border-gray-400 text-primary-dark rounded"
                                name={`backgroundCharacteristics${heading
                                  .split(' ')
                                  .join('')}`}
                                ref={register({
                                  validate: data => data !== 'initial',
                                })}
                              >
                                <option value="initial">-</option>
                                {item!.rows &&
                                  item!.rows.map(row => (
                                    <option
                                      className="capitalize"
                                      value={row[1]}
                                    >
                                      {row[1]}
                                    </option>
                                  ))}
                              </select>
                              {errors.backgroundAlignment && (
                                <span>{`You must choose one`}</span>
                              )}
                            </label>
                          </div>
                        );
                      }
                    })}
                </div>
              )}
            </div>
          </details>
          {/* PHYSICAL CHARACTERISTICS */}
          <details>
            <summary className="bg-yellow-100 dark:bg-primary-dark relative custom-border custom-border-thin p-2 my-2">
              <span className="text-xl">Physical Characteristics</span>
            </summary>
            <div className="flex w-full">
              <div className="w-1/2 px-1">
                <label className="block">
                  Hair
                  <input
                    className="form-input block w-full mt-1 bg-yellow-100 border border-gray-400 text-primary-dark rounded"
                    name="hair"
                    ref={register}
                  />
                </label>
                <label className="block">
                  Skin
                  <input
                    className="form-input block w-full mt-1 bg-yellow-100 border border-gray-400 text-primary-dark rounded"
                    name="skin"
                    ref={register}
                  />
                </label>
                <label className="block">
                  Eyes
                  <input
                    className="form-input block w-full mt-1 bg-yellow-100 border border-gray-400 text-primary-dark rounded"
                    name="eyes"
                    ref={register}
                  />
                </label>
              </div>
              <div className="w-1/2 px-1">
                {(formState.data.race?.entries || []).map(entry =>
                  entry.name === 'Size' ? entry.entries.join(', ') : '',
                )}
                <label className="block">
                  Height
                  <input
                    className="form-input block w-full mt-1 bg-yellow-100 border border-gray-400 text-primary-dark rounded"
                    name="height"
                    ref={register}
                  />
                </label>
                <label className="block">
                  Weight
                  <input
                    className="form-input block w-full mt-1 bg-yellow-100 border border-gray-400 text-primary-dark rounded"
                    name="weight"
                    ref={register}
                  />
                </label>
                {(formState.data.race?.entries || []).map(entry =>
                  entry.name === 'Age' ? entry.entries.join(', ') : '',
                )}
                <label className="block">
                  Age
                  <input
                    className="form-input block w-full mt-1 bg-yellow-100 border border-gray-400 text-primary-dark rounded"
                    name="age"
                    ref={register}
                  />
                </label>
              </div>
            </div>
          </details>
          {/* NOTES */}
          <details>
            <summary className="bg-yellow-100 dark:bg-primary-dark relative custom-border custom-border-thin p-2 my-2">
              <span className="text-xl">Notes</span>
            </summary>
            <div>
              <label className="block">
                Backstory (Markdown Supported)
                <textarea
                  className="form-textarea block w-full mt-1 bg-yellow-100 border border-gray-400 text-primary-dark rounded"
                  name="backstory"
                  rows={5}
                  ref={register}
                />
              </label>
            </div>
          </details>
        </div>
      </form>
    </div>
  );
};

export default Description;
