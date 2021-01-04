import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { useHistory } from 'react-router-dom';
import { updateFormData } from 'features/createCharacterForm/createCharacterFormSlice';
import { useState } from 'react';
import { ClassElement, Skill } from 'models/class';
import { filterSources, PLAYABLE_CLASSES } from 'utils/data';
import Entry from 'components/Entry/Entry';
import ClassBase from 'pages/Create/ClassBase';
import { useForm } from 'react-hook-form';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import DangerousHtml from 'components/DangerousHtml/DangerousHtml';
import { mainRenderer } from 'utils/mainRenderer';
import ClassTable from 'pages/Create/ClassTable';
import _ from 'lodash';
import {
  getClass,
  getClassFeatures,
  getSubClass,
  getSubClassFeatures,
} from 'utils/character';
import StyledButton from 'components/StyledButton/StyledButton';

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
          <StyledButton onClick={handleSubmit(onSubmit)}>Next</StyledButton>
        </div>
        <div className="flex relative">
          <h1>{`${formState.data.classData.classElement} – ${formState.data.classData.subClass}`}</h1>
        </div>
        <div className="custom-border custom-border-thin bg-secondary-light dark:bg-tertiary-dark my-2">
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
                    className={`${
                      count > 1 ? 'form-multiselect' : 'form-select'
                    } block w-full mt-1 bg-primary-light border border-gray-400 text-primary-dark rounded`}
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
        <ClassBase cls={classElement!} />
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
                  <summary className="flex items-center justify-start bg-primary-light dark:bg-primary-dark relative custom-border custom-border-thin px-2 my-2">
                    <span className="text-xl flex-grow">{`${subclass.name} (${subclass.source})`}</span>
                    <StyledButton
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
                      <div key={index}>
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
            {PLAYABLE_CLASSES.map((classElement: ClassElement, index) => (
              <details key={index}>
                <summary className="flex items-center justify-start bg-primary-light dark:bg-primary-dark relative custom-border custom-border-thin px-2 my-2 cursor-pointer">
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
                    extraClassName="absolute right-0 mr-2"
                  >
                    Select
                  </StyledButton>
                </summary>
                <div className="dnd-body p-2">
                  <Tabs>
                    <TabList className="flex text-center">
                      <Tab className="mr-2">Features</Tab>
                      <Tab>Info</Tab>
                    </TabList>
                    <TabPanel className="overflow-y-scroll px-2">
                      <Entry entry={classElement} />
                      <ClassBase cls={classElement} />
                      {getClassFeatures(classElement.name).map(
                        (feature, level) => (
                          <div
                            key={feature.name}
                            className="custom-border custom-border-thin p-4 my-2"
                          >
                            <div className="font-bold">{`Level ${level + 1} – ${
                              feature.name
                            }:`}</div>
                            {feature.entries.map((entry, index) => {
                              return <Entry key={index} entry={entry} />;
                            })}
                          </div>
                        ),
                      )}
                    </TabPanel>
                    <TabPanel className="overflow-y-scroll px-2">
                      <DangerousHtml
                        data={mainRenderer.render(
                          {
                            type: 'entries',
                            entries: classElement.fluff,
                          },
                          1,
                        )}
                      />
                    </TabPanel>
                  </Tabs>
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
