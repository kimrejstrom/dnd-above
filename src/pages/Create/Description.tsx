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
import TextBox from 'components/TextBox/TextBox';
import { getRace, getBackground } from 'utils/character';
import StyledButton, {
  DEFAULT_BUTTON_STYLE,
} from 'components/StyledButton/StyledButton';
import { Parser } from 'utils/mainRenderer';

const Description = () => {
  const dispatch = useDispatch();
  const formState = useSelector(
    (state: RootState) => state.createCharacterForm,
  );
  const history = useHistory();
  const { register, handleSubmit, getValues, errors } = useForm<FormData>();
  const onSubmit = (data: FormData, e?: React.BaseSyntheticEvent) => {
    dispatch(
      updateFormData({
        descriptionData: {
          ...data,
          background: selectedBackground?.name,
          chosenBackgroundSkillProficiencies: Array.isArray(
            data.chosenBackgroundSkillProficiencies,
          )
            ? data.chosenBackgroundSkillProficiencies
            : [data.chosenBackgroundSkillProficiencies],
          chosenBackgroundToolProficiencies: Array.isArray(
            data.chosenBackgroundToolProficiencies,
          )
            ? data.chosenBackgroundToolProficiencies
            : [data.chosenBackgroundToolProficiencies],
          chosenBackgroundLanguages: Array.isArray(
            data.chosenBackgroundLanguages,
          )
            ? data.chosenBackgroundLanguages
            : [data.chosenBackgroundLanguages],
        },
      }),
    );
    history.push(`/create/step-5`);
  };

  type FormData = {
    name: string;
    background: BackgroundElement;
    chosenBackgroundSkillProficiencies: string[];
    chosenBackgroundToolProficiencies: string[];
    chosenBackgroundLanguages: string[];
    alignment: string;
    characteristicsSource: string;
    imageUrl: string;
  };

  const race = getRace(formState.data.raceData.race);

  // Local state
  const [selectedBackground, setSelectedBackground] = useState<
    BackgroundElement | undefined
  >(getBackground(formState.data.descriptionData.background));
  const [selectedAlignment, setSelectedAlignment] = useState<string>();
  const [characteristicsSource, setCharacteristicsSource] = useState<string>(
    formState.data.descriptionData.characteristicsSource,
  );
  const [charaterImageURL, setCharaterImageURL] = useState<string>(
    `${
      process.env.PUBLIC_URL
    }/img/races/${formState.data.raceData.race.toLowerCase()}.png`,
  );

  const handleBackgroundSelect = (
    e: React.SyntheticEvent<HTMLSelectElement, Event>,
  ) => {
    const background = _.find(
      BACKGROUNDS,
      bg => bg.name === e.currentTarget.value,
    );
    setSelectedBackground(background);
    setCharacteristicsSource(background?.name || '');
  };

  return (
    <div>
      <h1>Step 4: Description</h1>
      <div className="flex justify-between my-4">
        <Link className={DEFAULT_BUTTON_STYLE} to={`/create/step-3`}>
          Previous
        </Link>
        <StyledButton onClick={handleSubmit(onSubmit)}>Next</StyledButton>
      </div>
      <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <h2>Character Description</h2>
        <div className="w-full">
          <label className="block">
            Character Name
            <input
              name="name"
              defaultValue={formState.data.descriptionData.name}
              className="form-input block w-full mt-1 bg-light-100 border border-gray-400 text-dark-100 rounded"
              ref={register({ required: true })}
            />
            {errors.name && 'Name is required'}
          </label>
          {/* BACKGROUND */}
          <details>
            <summary className="bg-light-100 dark:bg-dark-100 relative custom-border custom-border-thin p-2 my-2">
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
                  defaultValue={formState.data.descriptionData.background}
                  className={`form-select block w-full mt-1 bg-light-100 border border-gray-400 text-dark-100 rounded`}
                >
                  <option value="initial">-</option>
                  {BACKGROUNDS.map(background => (
                    <option
                      key={`${background.name}-${background.source}`}
                      value={background.name}
                    >
                      {background.name}
                    </option>
                  ))}
                </select>
                {errors.background && (
                  <span>{`You must choose a background`}</span>
                )}
              </label>
              {selectedBackground && (
                <div>
                  <h3>Skill Proficiencies</h3>
                  {selectedBackground.skillProficiencies?.map((prof, i) => {
                    if (prof.choose) {
                      let count = prof.choose.count || 1;
                      return (
                        <>
                          {count > 0 && (
                            <label className="block">
                              {`Choose skill proficiency (${count}):`}
                              <select
                                multiple={count > 1}
                                name="chosenBackgroundSkillProficiencies"
                                ref={register({
                                  required: true,
                                  validate: data =>
                                    Array.isArray(data)
                                      ? data.length === count
                                      : true,
                                })}
                                className={`${
                                  count > 1 ? 'form-multiselect' : 'form-select'
                                } block w-full mt-1 bg-light-100 border border-gray-400 text-dark-100 rounded`}
                              >
                                {prof.choose.from.map(pr => {
                                  if (typeof pr === 'string') {
                                    return (
                                      <option className="capitalize" value={pr}>
                                        {pr}
                                      </option>
                                    );
                                  } else {
                                    return undefined;
                                  }
                                })}
                              </select>
                              {errors.chosenBackgroundSkillProficiencies && (
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
                  })}

                  <h3>Tool Proficiencies</h3>
                  {selectedBackground.toolProficiencies?.map((prof, i) => {
                    if (prof.choose) {
                      let count = 1;
                      return (
                        <>
                          {count > 0 && (
                            <label className="block">
                              {`Choose language proficiency (${count}):`}
                              <select
                                multiple={count > 1}
                                name="chosenBackgroundToolProficiencies"
                                ref={register({
                                  required: true,
                                  validate: data =>
                                    Array.isArray(data)
                                      ? data.length === count
                                      : true,
                                })}
                                className={`${
                                  count > 1 ? 'form-multiselect' : 'form-select'
                                } block w-full mt-1 bg-light-100 border border-gray-400 text-dark-100 rounded`}
                              >
                                {prof.choose.from.map(pr => {
                                  if (typeof pr === 'string') {
                                    return (
                                      <option
                                        key={pr}
                                        className="capitalize"
                                        value={pr}
                                      >
                                        {pr}
                                      </option>
                                    );
                                  } else {
                                    return undefined;
                                  }
                                })}
                              </select>
                              {errors.chosenBackgroundToolProficiencies && (
                                <span>{`You must choose ${count} languages`}</span>
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
                  })}

                  <h3>Languages</h3>
                  {selectedBackground.languageProficiencies?.map((lang, i) => {
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
                              } block w-full mt-1 bg-light-100 border border-gray-400 text-dark-100 rounded`}
                              multiple={lang.anyStandard > 1}
                              name="chosenBackgroundLanguages"
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
                                  key={allLang.toLowerCase()}
                                  className="capitalize"
                                  value={allLang.toLowerCase()}
                                >
                                  {allLang}
                                </option>
                              ))}
                            </select>
                            {errors.chosenBackgroundLanguages && (
                              <span>{`You must choose ${lang.anyStandard} skills`}</span>
                            )}
                          </label>
                        </>
                      );
                    } else {
                      return (
                        <div key={i}>
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
                  <Background background={selectedBackground.name} />
                </div>
              )}
            </div>
          </details>
          {/* ALIGNMENT */}
          <details>
            <summary className="bg-light-100 dark:bg-dark-100 relative custom-border custom-border-thin p-2 my-2">
              <span className="text-xl">Character Details</span>
            </summary>
            <div>
              <TextBox>
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
              </TextBox>

              <div>
                {(race?.entries || []).map(entry =>
                  entry.name === 'Alignment' ? entry.entries.join(', ') : '',
                )}
              </div>

              <label className="block">
                {`Choose Alignment`}
                <select
                  className="form-select block w-full mt-1 bg-light-100 border border-gray-400 text-dark-100 rounded"
                  name="alignment"
                  onChange={() => {
                    setSelectedAlignment((getValues() as any).alignment);
                  }}
                  ref={register({
                    required: true,
                    validate: data => data !== 'initial',
                  })}
                  defaultValue={formState.data.descriptionData.alignment}
                >
                  <option value="initial">-</option>
                  {Object.entries(Parser.ALIGNMENTS).map(([key, value]) => (
                    <option key={key} className="capitalize" value={key}>
                      {value as any}
                    </option>
                  ))}
                </select>
                {errors.alignment && (
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
            <summary className="bg-light-100 dark:bg-dark-100 relative custom-border custom-border-thin p-2 my-2">
              <span className="text-xl">Personal Characteristics</span>
            </summary>
            <div>
              <label className="block">
                {`From Background ${characteristicsSource}`}
                <select
                  className="form-select block w-full mt-1 bg-light-100 border border-gray-400 text-dark-100 rounded"
                  name="characteristicsSource"
                  onChange={e => {
                    setCharacteristicsSource(e.currentTarget.value);
                  }}
                  ref={register}
                  // value={characteristicsSource}
                  defaultValue={
                    formState.data.descriptionData.characteristicsSource
                  }
                >
                  <option value="initial">-</option>
                  {CHARACTERISTICS.map(entry => (
                    <option
                      key={entry.name}
                      className="capitalize"
                      value={entry.name}
                    >
                      {entry.name}
                    </option>
                  ))}
                </select>
                {errors.characteristicsSource && (
                  <span>{`You must choose a background`}</span>
                )}
              </label>
              {characteristicsSource && (
                <div>
                  {_.find(
                    CHARACTERISTICS,
                    item => item.name === characteristicsSource,
                  )
                    ?.tables.map(x => x)
                    .map(item => {
                      if (typeof item === 'string') {
                        return <div key={item}>{item}</div>;
                      } else {
                        const heading = item!.colLabels
                          ? item!.colLabels[1]
                          : 'Unknown';

                        return (
                          <div>
                            <label className="block">
                              {heading}
                              <select
                                className="form-select block w-full mt-1 bg-light-100 border border-gray-400 text-dark-100 rounded"
                                name={`characteristics${heading
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
                                      key={row[1]}
                                      className="capitalize"
                                      value={row[1]}
                                    >
                                      {row[1]}
                                    </option>
                                  ))}
                              </select>
                              {errors.alignment && (
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
            <summary className="bg-light-100 dark:bg-dark-100 relative custom-border custom-border-thin p-2 my-2">
              <span className="text-xl">Physical Characteristics</span>
            </summary>
            <div className="flex w-full">
              <div className="w-1/2 px-1">
                <img
                  src={charaterImageURL}
                  onError={(ev: any) => {
                    ev.target.src = `${process.env.PUBLIC_URL}/img/races/default.png`;
                  }}
                  alt="character-portait"
                  className="custom-border custom-border-thin w-80"
                />
                <label className="block">
                  Character Image
                  <input
                    className="form-input block w-full mt-1 bg-light-100 border border-gray-400 text-dark-100 rounded"
                    name="imageUrl"
                    ref={register}
                    defaultValue={charaterImageURL}
                  />
                  <StyledButton
                    type="button"
                    extraClassName="w-full mt-2"
                    onClick={() =>
                      setCharaterImageURL((getValues() as any).imageUrl)
                    }
                  >
                    Load image
                  </StyledButton>
                </label>
                <TextBox>
                  {(race?.entries || []).map(entry =>
                    entry.name === 'Size' ? entry.entries.join(', ') : '',
                  )}
                </TextBox>
                <TextBox>
                  {(race?.entries || []).map(entry =>
                    entry.name === 'Age' ? entry.entries.join(', ') : '',
                  )}
                </TextBox>
              </div>
              <div className="w-1/2 px-1">
                <label className="block">
                  Hair
                  <input
                    className="form-input block w-full mt-1 bg-light-100 border border-gray-400 text-dark-100 rounded"
                    name="hair"
                    ref={register}
                    defaultValue={formState.data.descriptionData.hair}
                  />
                </label>
                <label className="block">
                  Skin
                  <input
                    className="form-input block w-full mt-1 bg-light-100 border border-gray-400 text-dark-100 rounded"
                    name="skin"
                    ref={register}
                    defaultValue={formState.data.descriptionData.skin}
                  />
                </label>
                <label className="block">
                  Eyes
                  <input
                    className="form-input block w-full mt-1 bg-light-100 border border-gray-400 text-dark-100 rounded"
                    name="eyes"
                    ref={register}
                    defaultValue={formState.data.descriptionData.eyes}
                  />
                </label>
                <label className="block">
                  Height
                  <input
                    className="form-input block w-full mt-1 bg-light-100 border border-gray-400 text-dark-100 rounded"
                    name="height"
                    ref={register}
                    defaultValue={formState.data.descriptionData.height}
                  />
                </label>
                <label className="block">
                  Weight
                  <input
                    className="form-input block w-full mt-1 bg-light-100 border border-gray-400 text-dark-100 rounded"
                    name="weight"
                    ref={register}
                    defaultValue={formState.data.descriptionData.weight}
                  />
                </label>
                <label className="block">
                  Age
                  <input
                    className="form-input block w-full mt-1 bg-light-100 border border-gray-400 text-dark-100 rounded"
                    name="age"
                    ref={register}
                    defaultValue={formState.data.descriptionData.age}
                  />
                </label>
              </div>
            </div>
          </details>
          {/* NOTES */}
          <details>
            <summary className="bg-light-100 dark:bg-dark-100 relative custom-border custom-border-thin p-2 my-2">
              <span className="text-xl">Notes</span>
            </summary>
            <div>
              <label className="block">
                Backstory (Markdown Supported)
                <textarea
                  className="form-textarea block w-full mt-1 bg-light-100 border border-gray-400 text-dark-100 rounded"
                  name="backstory"
                  rows={5}
                  ref={register}
                  defaultValue={formState.data.descriptionData.backstory}
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
