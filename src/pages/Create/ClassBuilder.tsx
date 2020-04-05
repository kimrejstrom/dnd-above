import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { useHistory } from 'react-router-dom';
import { updateFormData } from 'features/createCharacterForm/createCharacterFormSlice';
import { useState } from 'react';
import { ClassElement, ClassSubclass, Skill } from 'models/class';
import { filterSources, PLAYABLE_CLASSES } from 'utils/data';
import Entry from 'components/Entry/Entry';
import ClassBase from 'pages/Create/ClassBase';
import { useForm } from 'react-hook-form';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import DangerousHtml from 'components/DangerousHtml/DangerousHtml';
import mainRenderer from 'utils/mainRenderer';
import ClassTable from 'pages/Create/ClassTable';
import _ from 'lodash';

const ClassBuilder = ({ url }: { url: string }) => {
  const dispatch = useDispatch();
  const formState = useSelector(
    (state: RootState) => state.createCharacterForm,
  );

  const ClassDetails = () => {
    const history = useHistory();
    const { register, handleSubmit, errors } = useForm();
    const onSubmit = (data: any, e?: React.BaseSyntheticEvent) => {
      dispatch(updateFormData(data));
      history.push(`${url}/step-3`);
    };

    const classProficiencies: Skill[] =
      formState.data.classElement?.startingProficiencies.skills || [];

    return (
      <div>
        <div className="flex justify-between my-4">
          <button
            className="text-lg dark-hover:bg-primary-dark bg-yellow-100 hover:bg-primary-light dark:bg-transparent dark:text-primary-light px-2 border dark:border-primary-light rounded"
            onClick={() =>
              dispatch(
                updateFormData({
                  classElement: undefined,
                  subClass: undefined,
                }),
              )
            }
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
          <h1>{`${formState.data.classElement?.name} – ${formState.data.subClass?.name}`}</h1>
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
                    } block w-full mt-1 bg-yellow-100 border border-gray-400 text-primary-dark rounded`}
                    multiple={count > 1}
                    name="chosenClassProficiencies"
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
                  {errors.chosenClassProficiencies && (
                    <span>{`You must choose ${count} skills`}</span>
                  )}
                </label>
              );
            })}
          </form>
        </div>
        <ClassTable
          cls={formState.data.classElement!}
          subcls={formState.data.subClass!}
        />
        <ClassBase cls={formState.data.classElement!} />
      </div>
    );
  };

  const ClassInfo = () => {
    const onSelect = (
      data: {
        classElement: ClassElement;
        subClass: ClassSubclass;
      },
      e?: React.BaseSyntheticEvent,
    ) => {
      dispatch(updateFormData(data));
    };
    const [selectedClass, setselectedClass] = useState(
      formState.data.classElement,
    );

    return (
      <div>
        {selectedClass ? (
          <div>
            <h2>Select Sub Class: {selectedClass.subclassTitle}</h2>
            {selectedClass.subclasses
              .filter(subclass => filterSources(subclass))
              .map(feature => (
                <details key={feature.name}>
                  <summary className="bg-yellow-100 dark:bg-primary-dark relative custom-border custom-border-thin p-2 my-2">
                    <span className="text-xl">{feature.name}</span>
                    <button
                      onClick={e =>
                        onSelect(
                          { classElement: selectedClass, subClass: feature },
                          e,
                        )
                      }
                      className="text-lg dark-hover:bg-primary-dark bg-yellow-100 hover:bg-primary-light dark:bg-transparent dark:text-primary-light px-2 border dark:border-primary-light rounded rounded absolute right-0 mr-2"
                    >
                      Select
                    </button>
                  </summary>
                  {feature.subclassFeatures.map(feat =>
                    feat.map((entry, index) => (
                      <div key={index}>
                        {entry.entries.map((innerEntry, i) => (
                          <div key={i} className="dnd-body">
                            <Entry entry={innerEntry} />
                          </div>
                        ))}
                      </div>
                    )),
                  )}
                </details>
              ))}
          </div>
        ) : (
          <div>
            {PLAYABLE_CLASSES.map((classElement: ClassElement, index) => (
              <details key={index}>
                <summary className="bg-yellow-100 dark:bg-primary-dark relative custom-border custom-border-thin p-2 my-2">
                  <span className="text-xl">
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
                    {classElement.name}
                  </span>
                  <button
                    onClick={e => setselectedClass(classElement)}
                    className="text-lg dark-hover:bg-primary-dark bg-yellow-100 hover:bg-primary-light dark:bg-transparent dark:text-primary-light px-2 border dark:border-primary-light rounded absolute right-0 mr-2"
                  >
                    Select
                  </button>
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
                      {classElement.classFeatures.map((feature, level) =>
                        feature.map(feat => {
                          return (
                            <div
                              key={feat.name}
                              className="custom-border custom-border-thin p-4 my-2"
                            >
                              <div className="font-bold">{`Level ${level +
                                1} – ${feat.name}:`}</div>
                              {feat.entries.map((entry, index) => {
                                return <Entry key={index} entry={entry} />;
                              })}
                            </div>
                          );
                        }),
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
      {formState.data.classElement ? <ClassDetails /> : <ClassInfo />}
    </div>
  );
};

export default ClassBuilder;
