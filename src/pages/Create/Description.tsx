import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { useHistory, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { updateFormData } from 'features/createCharacterForm/createCharacterFormSlice';
import { BackgroundElement } from 'models/background';
import _, { isBoolean } from 'lodash';
import Background from 'pages/Create/Background';
import {
  getRace,
  getBackground,
  getBackgroundCharacteristics,
  getBackgrounds,
} from 'utils/sourceDataUtils';
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
  const [characterImageURL, setCharacterImageURL] = useState<string>(
    formState.data.descriptionData.imageUrl
      ? formState.data.descriptionData.imageUrl
      : `${
          process.env.PUBLIC_URL
        }/img/races/${formState.data.raceData.race.toLowerCase()}.png`,
  );

  const handleBackgroundSelect = (
    e: React.SyntheticEvent<HTMLSelectElement, Event>,
  ) => {
    const background = _.find(
      getBackgrounds()!,
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
        <h1>Character Description</h1>
        <StyledButton onClick={handleSubmit(onSubmit)}>Next</StyledButton>
      </div>
      <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full">
          <label className="block text-lg px-2">
            Character Name
            <input
              type="text"
              name="name"
              defaultValue={formState.data.descriptionData.name}
              className="bg-light-400 dark:bg-dark-200 mt-0 block w-full px-1 border-0 border-b-2 border-gray-400 focus:ring-0 focus:border-black dark:focus:border-gray-200 text-3xl"
              ref={register({ required: true })}
            />
            {errors.name && 'Name is required'}
          </label>
          {/* BACKGROUND */}
          <details>
            <summary className="bg-light-100 dark:bg-dark-100 relative custom-border-sm custom-border-thin p-2 my-2">
              <span className="text-xl">Background</span>
            </summary>
            <div className="dnd-body rounded p-4 mx-2 -mt-3 bg-light-100 dark:bg-dark-100">
              <label className="block">
                {`Select Background`}
                <select
                  name="background"
                  onChange={handleBackgroundSelect}
                  ref={register({
                    required: true,
                    validate: (data: any) => data !== 'initial',
                  })}
                  defaultValue={formState.data.descriptionData.background}
                  className={`form-input`}
                >
                  <option value="initial">-</option>
                  {getBackgrounds()!.map(background => (
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
                  <h3 className="my-3 text-lg">Skill Proficiencies</h3>
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

                  <h3 className="my-3 text-lg">Tool Proficiencies</h3>
                  {selectedBackground.toolProficiencies?.map((prof, i) => {
                    if (prof.choose) {
                      let count = 1;
                      return (
                        <>
                          {count > 0 && (
                            <label className="block">
                              {`Choose tool proficiency (${count}):`}
                              <select
                                multiple={count > 1}
                                name="chosenBackgroundToolProficiencies"
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
                                <span>{`You must choose ${count} tools`}</span>
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

                  <h3 className="my-3 text-lg">Languages</h3>
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
                              className={`form-input`}
                              multiple={lang.anyStandard > 1}
                              name="chosenBackgroundLanguages"
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
                <div className="my-2">
                  <Background background={selectedBackground.name} />
                </div>
              )}
            </div>
          </details>
          {/* ALIGNMENT */}
          <details>
            <summary className="bg-light-100 dark:bg-dark-100 relative custom-border-sm custom-border-thin p-2 my-2">
              <span className="text-xl">Character Details</span>
            </summary>
            <div className="dnd-body rounded p-4 mx-2 -mt-3 bg-light-100 dark:bg-dark-100">
              <h3 className="my-3 text-lg">Alignment</h3>
              <p>
                A typical creature in the worlds of Dungeons &amp; Dragons has
                an alignment, which broadly describes its moral and personal
                attitudes. Alignment is a combination of two factors: one
                identifies morality (good, evil, or neutral), and the other
                describes attitudes toward society and order (lawful, chaotic,
                or neutral).
              </p>
              <p className="mt-4">
                Thus, nine distinct alignments define the possible combinations:{' '}
                <strong>{Object.values(Parser.ALIGNMENTS).join(', ')}</strong>
              </p>

              <div>
                {(race?.entries || []).map(entry =>
                  entry.name === 'Alignment' ? entry.entries.join(', ') : '',
                )}
              </div>

              <label className="block mt-3">
                {`Choose Alignment`}
                <select
                  className="form-input"
                  name="alignment"
                  onChange={() => {
                    setSelectedAlignment((getValues() as any).alignment);
                  }}
                  ref={register({
                    required: true,
                    validate: (data: any) => data !== 'initial',
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
            <summary className="bg-light-100 dark:bg-dark-100 relative custom-border-sm custom-border-thin p-2 my-2">
              <span className="text-xl">Personal Characteristics</span>
            </summary>
            <div className="dnd-body rounded p-4 mx-2 -mt-3 bg-light-100 dark:bg-dark-100">
              <label className="block mb-4">
                {`From Background ${characteristicsSource}`}
                <select
                  className="form-input"
                  name="characteristicsSource"
                  onChange={e => {
                    setCharacteristicsSource(e.currentTarget.value);
                  }}
                  ref={register}
                  defaultValue={
                    formState.data.descriptionData.characteristicsSource
                  }
                >
                  <option value="initial">-</option>
                  {getBackgroundCharacteristics()?.map(entry => (
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
                    getBackgroundCharacteristics(),
                    item => item.name === characteristicsSource,
                  )
                    ?.tables.map(x => x)
                    .map(item => {
                      if (typeof item === 'string') {
                        return (
                          <div className="rd__b-inset" key={item}>
                            {item}
                          </div>
                        );
                      } else {
                        const heading = item!.colLabels
                          ? item!.colLabels[1]
                          : 'Unknown';
                        const elementName = `characteristics${heading
                          .split(' ')
                          .join('')}`;

                        return (
                          <div className="mt-3">
                            <label className="block">
                              {heading}
                              <select
                                className="form-input"
                                name={elementName}
                                ref={register({
                                  validate: (data: any) => data !== 'initial',
                                })}
                                defaultValue={
                                  (formState.data.descriptionData as any)[
                                    elementName
                                  ]
                                }
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
            <summary className="bg-light-100 dark:bg-dark-100 relative custom-border-sm custom-border-thin p-2 my-2">
              <span className="text-xl">Physical Characteristics</span>
            </summary>
            <div className="dnd-body rounded p-4 mx-2 -mt-3 bg-light-100 dark:bg-dark-100">
              <div className="w-full flex">
                <div className="w-5/12 border-box px-2">
                  <img
                    src={characterImageURL}
                    onError={(ev: any) => {
                      ev.target.src = `${process.env.PUBLIC_URL}/img/races/default.png`;
                    }}
                    alt="character-portait"
                    className="shadow rounded w-full"
                  />
                  <label className="block">
                    Character Image
                    <input
                      type="text"
                      className="form-input"
                      name="imageUrl"
                      ref={register}
                      defaultValue={characterImageURL}
                    />
                    <StyledButton
                      type="button"
                      extraClassName="w-full mt-2"
                      onClick={() =>
                        setCharacterImageURL((getValues() as any).imageUrl)
                      }
                    >
                      Load image
                    </StyledButton>
                  </label>
                </div>
                <div className="w-7/12 border-box px-2">
                  <div className="rd__b-inset">
                    {race?.entries
                      ? (race?.entries || []).map(entry =>
                          entry.name === 'Size' ? entry.entries.join(', ') : '',
                        )
                      : 'No size description available'}
                  </div>
                  <div className="rd__b-inset">
                    {race?.entries
                      ? (race?.entries || []).map(entry =>
                          entry.name === 'Age' ? entry.entries.join(', ') : '',
                        )
                      : 'No age description available'}
                  </div>
                  <label className="block">
                    Hair
                    <input
                      type="text"
                      className="form-input"
                      name="hair"
                      ref={register}
                      defaultValue={formState.data.descriptionData.hair}
                    />
                  </label>
                  <label className="block">
                    Skin
                    <input
                      type="text"
                      className="form-input"
                      name="skin"
                      ref={register}
                      defaultValue={formState.data.descriptionData.skin}
                    />
                  </label>
                  <label className="block">
                    Eyes
                    <input
                      type="text"
                      className="form-input"
                      name="eyes"
                      ref={register}
                      defaultValue={formState.data.descriptionData.eyes}
                    />
                  </label>
                  <label className="block">
                    Height
                    <input
                      type="text"
                      className="form-input"
                      name="height"
                      ref={register}
                      defaultValue={formState.data.descriptionData.height}
                    />
                  </label>
                  <label className="block">
                    Weight
                    <input
                      type="text"
                      className="form-input"
                      name="weight"
                      ref={register}
                      defaultValue={formState.data.descriptionData.weight}
                    />
                  </label>
                  <label className="block">
                    Age
                    <input
                      type="text"
                      className="form-input"
                      name="age"
                      ref={register}
                      defaultValue={formState.data.descriptionData.age}
                    />
                  </label>
                </div>
              </div>
            </div>
          </details>
          {/* NOTES */}
          <details>
            <summary className="bg-light-100 dark:bg-dark-100 relative custom-border-sm custom-border-thin p-2 my-2">
              <span className="text-xl">Notes</span>
            </summary>
            <div className="dnd-body rounded p-4 mx-2 -mt-3 bg-light-100 dark:bg-dark-100">
              <label className="block">
                Backstory (Markdown Supported)
                <textarea
                  className="form-input"
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
