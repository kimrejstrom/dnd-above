import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { useHistory } from 'react-router-dom';
import { updateFormData } from 'features/createCharacterForm/createCharacterFormSlice';
import { useState } from 'react';
import { ClassElement, Skill } from 'models/class';
import { filterSources } from 'utils/data';
import Entry from 'components/Entry/Entry';
import { useForm } from 'react-hook-form';
import ClassTable from 'pages/Create/ClassTable';
import _ from 'lodash';
import {
  getClass,
  getPlayableClasses,
  getSubClass,
  getSubClassFeatures,
} from 'utils/sourceDataUtils';
import StyledButton from 'components/StyledButton/StyledButton';
import TextBox from 'components/TextBox/TextBox';
import { RenderClass } from 'utils/render';

const ClassBuilder = () => {
  const dispatch = useDispatch();
  const formState = useSelector(
    (state: RootState) => state.createCharacterForm,
  );

  const classElement = getClass(formState.data.classData.classElement);
  const subClass = getSubClass(
    formState.data.classData.classElement,
    formState.data.classData.subClass,
  );

  const ClassDetails = () => {
    const history = useHistory();
    const { register, handleSubmit, errors } = useForm();
    const onSubmit = (data: any, e?: React.BaseSyntheticEvent) => {
      dispatch(
        updateFormData({
          classData: {
            ...data,
            chosenClassSkillProficiencies: Array.isArray(
              data.chosenClassSkillProficiencies,
            )
              ? data.chosenClassSkillProficiencies
              : [data.chosenClassSkillProficiencies],
          },
        }),
      );
      history.push(`/create/step-3`);
    };

    const classProficiencies: Skill[] =
      classElement?.startingProficiencies.skills || [];

    return (
      <div>
        <div className="flex justify-between my-4">
          <StyledButton
            onClick={() =>
              dispatch(
                updateFormData({
                  classData: {
                    classElement: '',
                    subClass: '',
                  },
                }),
              )
            }
          >
            Previous
          </StyledButton>
          <div className="flex relative">
            <h1>{`${formState.data.classData.classElement} – ${formState.data.classData.subClass}`}</h1>
          </div>
          <StyledButton onClick={handleSubmit(onSubmit)}>Next</StyledButton>
        </div>
        <TextBox>
          <div className="my-2">
            <form
              name="race-details"
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col dnd-body"
            >
              <h3>Skill Proficiencies</h3>
              {classProficiencies.map(prof => {
                const count = prof.choose.count || 1;
                return (
                  <label className="block">
                    {`Choose skill proficiency (${count}):`}
                    <select
                      className={`form-input`}
                      multiple={count > 1}
                      name="chosenClassSkillProficiencies"
                      ref={register({
                        required: true,
                        validate: data =>
                          Array.isArray(data) ? data.length === count : true,
                      })}
                    >
                      {prof.choose.from.map(pr => {
                        if (typeof pr === 'string') {
                          return (
                            <option key={pr} className="capitalize" value={pr}>
                              {_.capitalize(pr)}
                            </option>
                          );
                        } else {
                          return <></>;
                        }
                      })}
                    </select>
                    {errors.chosenClassSkillProficiencies && (
                      <span>{`You must choose ${count} skills`}</span>
                    )}
                  </label>
                );
              })}
            </form>
          </div>
          <ClassTable cls={classElement!} subcls={subClass!} />
        </TextBox>
      </div>
    );
  };

  const ClassInfo = () => {
    const onSelect = (data: { classElement: string; subClass: string }) => {
      dispatch(updateFormData({ classData: data }));
    };
    const [selectedClass, setselectedClass] = useState(classElement);

    return (
      <div>
        {selectedClass ? (
          <div>
            <h2>Select Sub Class: {selectedClass.subclassTitle}</h2>
            {selectedClass.subclasses
              .filter(subclass => filterSources(subclass))
              .map(subclass => (
                <details key={subclass.name}>
                  <summary className="items-center justify-start bg-light-100 dark:bg-dark-100 relative custom-border-sm custom-border-thin px-2 my-2">
                    <span className="text-xl flex-grow">{`${subclass.name} (${subclass.source})`}</span>
                    <StyledButton
                      extraClassName="absolute right-0 mr-2 sm:h-8"
                      onClick={() =>
                        onSelect({
                          classElement: selectedClass.name,
                          subClass: subclass.name,
                        })
                      }
                    >
                      Select
                    </StyledButton>
                  </summary>
                  {getSubClassFeatures(selectedClass.name, subclass.name).map(
                    (entry, index) => (
                      <div
                        className="dnd-body rounded p-4 mx-2 -mt-3 bg-light-100 dark:bg-dark-100"
                        key={index}
                      >
                        {entry.entries.map((innerEntry, i) => (
                          <div key={i} className="dnd-body">
                            <Entry entry={innerEntry} />
                          </div>
                        ))}
                      </div>
                    ),
                  )}
                </details>
              ))}
          </div>
        ) : (
          <div>
            {getPlayableClasses().map((classElement: ClassElement, index) => (
              <details key={index}>
                <summary className="items-center justify-start bg-light-100 dark:bg-dark-100 relative custom-border-sm custom-border-thin px-2 my-2 cursor-pointer">
                  <span className="text-xl flex-grow">
                    <img
                      className="inline w-8 mr-2 rounded bg-contain"
                      src={`${
                        process.env.PUBLIC_URL
                      }/img/${classElement.name.toLowerCase()}.jpeg`}
                      alt={classElement.name}
                      style={{
                        filter: 'grayscale(80%)',
                      }}
                    />
                    {`${classElement.name} (${classElement.source})`}
                  </span>
                  <StyledButton
                    onClick={() => setselectedClass(classElement)}
                    extraClassName="absolute right-0 mr-2 sm:h-8"
                  >
                    Select
                  </StyledButton>
                </summary>
                <div className="dnd-body rounded p-4 mx-2 -mt-3 bg-light-100 dark:bg-dark-100">
                  {RenderClass(classElement)}
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    );
  };
  return (
    <div>
      <h1>Step 2: Select Class</h1>
      {classElement && subClass ? <ClassDetails /> : <ClassInfo />}
    </div>
  );
};

export default ClassBuilder;
