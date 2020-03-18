import React, { useState } from 'react';
import { PLAYABLE_RACES, PLAYABLE_CLASSES, filterSources } from 'utils/data';
import {
  Route,
  useRouteMatch,
  Switch,
  Link,
  useHistory,
} from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { updateFormData } from 'features/createCharacterForm/createCharacterFormSlice';
import { Race } from 'models/race';
import mainRenderer from 'utils/mainRenderer';
import DangerousHtml from 'components/DangerousHtml/DangerousHtml';
import { ClassElement, ClassSubclass } from 'models/class';
import Entry from 'components/Entry/Entry';

interface Props {}

const Create = (props: Props) => {
  let { path, url } = useRouteMatch();
  return (
    <div className="m-auto w-9/12 flex flex-col justify-center">
      <h1 className="text-center">Character Builder</h1>
      <ul className="my-3 flex justify-around">
        <li>1. Race</li>
        <li>2. Class</li>
        <li>3. Abilities</li>
        <li>4. Description</li>
        <li>5. Equipmemnt</li>
      </ul>

      <div className="custom-border p-2">
        <Switch>
          <Route exact path={path}>
            <Step1 url={url} />
          </Route>
          <Route path={`${path}/step-1`}>
            <Step1 url={url} />
          </Route>
          <Route path={`${path}/step-2`}>
            <Step2 url={url} />
          </Route>
          <Route path={`${path}/step-3`}>
            <Step3 url={url} />
          </Route>
          <Route path={`${path}/step-4`}>
            <Step4 url={url} />
          </Route>
          <Route path={`${path}/step-5`}>
            <Step5 url={url} />
          </Route>
          <Route path={`${path}/summary`}>
            <Summary />
          </Route>
        </Switch>
      </div>
    </div>
  );
};

const Step1 = ({ url }: { url: string }) => {
  const dispatch = useDispatch();
  const formState = useSelector(
    (state: RootState) => state.createCharacterForm,
  );
  const history = useHistory();
  const onSubmit = (data: FormData, e?: React.BaseSyntheticEvent) => {
    dispatch(updateFormData(data));
    history.push(`${url}/step-2`);
  };

  const isCurrent = (race: Race) => race.name === formState.data.race?.name;

  type FormData = {
    race: Race;
  };

  return (
    <div>
      <div>
        {PLAYABLE_RACES.map((race: Race, index) => (
          <details>
            <summary className="relative custom-border custom-border-thin p-2 my-2">
              <span className="text-xl">
                {race.name} {isCurrent(race) && '(Your current Race)'}
              </span>
              <button
                onClick={e => onSubmit({ race }, e)}
                className="text-lg dark-hover:bg-primary-dark bg-yellow-100 hover:bg-primary-light dark:bg-transparent dark:text-primary-light px-2 border dark:border-primary-light rounded absolute right-0 mr-2"
              >
                Select
              </button>
            </summary>
            <div className="dnd-body p-2">
              <DangerousHtml
                key={index}
                data={mainRenderer.race.getCompactRenderedString(race)}
              />
            </div>
          </details>
        ))}
      </div>
      <div className="flex justify-between">
        <Link to={`${url}/step-2`}>Next</Link>
      </div>
    </div>
  );
};

const ClassBase = ({ cls }: { cls: ClassElement }) => {
  // HP/hit dice
  let $ptHp = null;
  if (cls.hd) {
    const hdEntry = {
      toRoll: `${cls.hd.number}d${cls.hd.faces}`,
    };

    $ptHp = `<tr class="cls-side__show-hide">
                  <td colspan="6" class="cls-side__section">
                      <h5 class="cls-side__section-head">Hit Points</h5>
                      <div><strong>Hit Dice:</strong> ${hdEntry.toRoll}</div>
                      <div><strong>Hit Points at 1st Level:</strong> ${
                        cls.hd.faces
                      } + your Constitution modifier</div>
                      <div><strong>Hit Points at Higher Levels:</strong> ${
                        hdEntry.toRoll
                      } (or ${cls.hd.faces / 2 +
      1}) + your Constitution modifier per ${cls.name} level after 1st</div>
                  </td>
              </tr>`;
  }

  // starting proficiencies
  const renderArmorProfs = (armorProfs: any) =>
    armorProfs
      .map((a: any) =>
        a.full
          ? a.full
          : a === 'light' || a === 'medium' || a === 'heavy'
          ? `${a} armor`
          : a,
      )
      .join(', ');
  const renderWeaponsProfs = (weaponProfs: any) =>
    weaponProfs
      .map((w: string) =>
        w === 'simple' || w === 'martial' ? `${w} weapons` : w,
      )
      .join(', ');
  const renderSkillsProfs = (skills: any) =>
    `${Parser.skillProficienciesToFull(skills).uppercaseFirst()}.`;

  const profs = cls.startingProficiencies || {};

  // starting equipment
  let $ptEquipment = null;
  if (cls.startingEquipment) {
    const equip = cls.startingEquipment;
    const rendered = [
      equip.additionalFromBackground
        ? '<p>You start with the following items, plus anything provided by your background.</p>'
        : '',
      equip.default && equip.default.length
        ? `<ul class="pl-4"><li>${equip.default
            .map(it => mainRenderer.render(it))
            .join('</li><li>')}</ul>`
        : '',
      equip.goldAlternative != null
        ? `<p>Alternatively, you may start with ${mainRenderer.render(
            equip.goldAlternative,
          )} gp to buy your own equipment.</p>`
        : '',
    ]
      .filter(Boolean)
      .join('');

    $ptEquipment = `<tr class="cls-side__show-hide">
                  <td class="cls-side__section" colspan="6">
                      <h5 class="cls-side__section-head">Starting Equipment</h5>
                      <div>${rendered}</div>
                  </td>
              </tr>`;
  }

  const finalHtml = `<table class="stats shadow-big">
              <tr><th class="border" colspan="6"></th></tr>
              <tr><th colspan="6"><div class="split-v-center pr-1"><div class="cls-side__name">${
                cls.name
              }</div></div></th></tr>
  
              <tr class="cls-side__show-hide"><td class="divider" colspan="6"><div class="my-0"/></td></tr>
  
              ${$ptHp}
  
              <tr class="cls-side__show-hide">
                  <td colspan="6" class="cls-side__section">
                      <h5 class="cls-side__section-head">Proficiencies</h5>
                      <div><b>Armor:</b> <span>${
                        profs.armor ? renderArmorProfs(profs.armor) : 'none'
                      }</span></div>
                      <div><b>Weapons:</b> <span>${
                        profs.weapons
                          ? renderWeaponsProfs(profs.weapons)
                          : 'none'
                      }</span></div>
                      <div><b>Tools:</b> <span>${
                        profs.tools ? profs.tools.join(', ') : 'none'
                      }</span></div>
                      <div><b>Saving Throws:</b> <span>${
                        cls.proficiency
                          ? cls.proficiency
                              .map(p => Parser.attAbvToFull(p))
                              .join(', ')
                          : 'none'
                      }</span></div>
                      <div><b>Skills:</b> <span>${
                        profs.skills ? renderSkillsProfs(profs.skills) : 'none'
                      }</span></div>
                  </td>
              </tr>
  
              ${$ptEquipment}
  
              <tr><th class="border" colspan="6"></th></tr>
          </table>`;

  return (
    <div>
      <DangerousHtml data={finalHtml} />
    </div>
  );
};

const Step2 = ({ url }: { url: string }) => {
  const dispatch = useDispatch();
  const formState = useSelector(
    (state: RootState) => state.createCharacterForm,
  );
  const history = useHistory();
  const onSubmit = (data: FormData, e?: React.BaseSyntheticEvent) => {
    dispatch(updateFormData(data));
    history.push(`${url}/step-3`);
  };
  const [selectedClass, setselectedClass] = useState(
    formState.data.classElement,
  );

  const isCurrent = (classElement: ClassElement) =>
    classElement.name === formState.data.classElement?.name;

  type FormData = {
    classElement: ClassElement;
    subClass: ClassSubclass;
  };

  return (
    <div>
      {selectedClass && (
        <div>
          <h2>Select Sub Class: {selectedClass.subclassTitle}</h2>
          {selectedClass.subclasses
            .filter(subclass => filterSources(subclass))
            .map(feature => (
              <div className="custom-border custom-border-thin p-4 my-2">
                <div className="flex justify-between">
                  <div className="text-2xl font-bold">{feature.name}</div>
                  <button
                    onClick={e =>
                      onSubmit(
                        { classElement: selectedClass, subClass: feature },
                        e,
                      )
                    }
                    className="text-lg dark-hover:bg-primary-dark bg-yellow-100 hover:bg-primary-light dark:bg-transparent dark:text-primary-light px-2 border dark:border-primary-light rounded"
                  >
                    Select
                  </button>
                </div>
                {feature.subclassFeatures.map(feat =>
                  feat.map(entry => (
                    <div>
                      {entry.entries.map(innerEntry => (
                        <div className="dnd-body">
                          <Entry entry={innerEntry} />
                        </div>
                      ))}
                    </div>
                  )),
                )}
              </div>
            ))}
        </div>
      )}
      <div>
        {PLAYABLE_CLASSES.map((classElement: ClassElement, index) => (
          <details>
            <summary className="relative custom-border custom-border-thin p-2 my-2">
              <span className="text-xl">
                {classElement.name}{' '}
                {isCurrent(classElement) && '(Your current class)'}
              </span>
              <button
                onClick={e => setselectedClass(classElement)}
                className="text-lg dark-hover:bg-primary-dark bg-yellow-100 hover:bg-primary-light dark:bg-transparent dark:text-primary-light px-2 border dark:border-primary-light rounded absolute right-0 mr-2"
              >
                Select
              </button>
            </summary>
            <div className="dnd-body p-2">
              <Entry entry={classElement} />
              <ClassBase cls={classElement} />
              {classElement.classFeatures.map((feature, level) =>
                feature.map(feat => {
                  return (
                    <div className="custom-border custom-border-thin p-4 my-2">
                      <div className="font-bold">{`Level ${level + 1} – ${
                        feat.name
                      }:`}</div>
                      {feat.entries.map(entry => {
                        return <Entry entry={entry} />;
                      })}
                    </div>
                  );
                }),
              )}
            </div>
          </details>
        ))}
      </div>
      <div className="flex justify-between my-4">
        <Link to={`${url}/step-1`}>Previous</Link>
        <Link to={`${url}/step-3`}>Next</Link>
      </div>
    </div>
  );
};

const Step3 = ({ url }: { url: string }) => {
  const dispatch = useDispatch();
  const formState = useSelector(
    (state: RootState) => state.createCharacterForm,
  );
  const history = useHistory();
  const { register, handleSubmit, errors } = useForm<FormData>();
  const onSubmit = (data: FormData, e?: React.BaseSyntheticEvent) => {
    dispatch(updateFormData(data));
    history.push(`${url}/step-2`);
  };

  type FormData = {
    firstName: string;
    lastName: string;
  };

  return (
    <div>
      <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <h2>Ability Scores</h2>
        <label>
          First Name:
          <input
            name="firstName"
            ref={register({ required: true })}
            defaultValue={formState.data.firstName}
          />
          {errors.firstName && 'First name is required'}
        </label>
        <label>
          Last Name:
          <input
            name="lastName"
            ref={register}
            defaultValue={formState.data.lastName}
          />
        </label>
        <input type="submit" />
      </form>
      <div className="flex justify-between">
        <Link to={`${url}/step-2`}>Previous</Link>
        <Link to={`${url}/step-4`}>Next</Link>
      </div>
    </div>
  );
};

const Step4 = ({ url }: { url: string }) => {
  const dispatch = useDispatch();
  const formState = useSelector(
    (state: RootState) => state.createCharacterForm,
  );
  const history = useHistory();
  const { register, handleSubmit, errors } = useForm<FormData>();
  const onSubmit = (data: FormData, e?: React.BaseSyntheticEvent) => {
    dispatch(updateFormData(data));
    history.push(`${url}/step-2`);
  };

  type FormData = {
    firstName: string;
    lastName: string;
  };

  return (
    <div>
      <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <h2>Description</h2>
        <label>
          Name
          <input
            name="name"
            ref={register({ required: true })}
            defaultValue={formState.data.name}
          />
          {errors.firstName && 'First name is required'}
        </label>
        <label>
          Background
          <input
            name="background"
            ref={register}
            defaultValue={formState.data.background}
          />
        </label>
        <label>
          Background
          <input
            name="background"
            ref={register}
            defaultValue={formState.data.background}
          />
        </label>
        <input type="submit" />
      </form>
      <div className="flex justify-between">
        <Link to={`${url}/step-3`}>Previous</Link>
        <Link to={`${url}/step-5`}>Next</Link>
      </div>
    </div>
  );
};

const Step5 = ({ url }: { url: string }) => {
  const dispatch = useDispatch();
  const formState = useSelector(
    (state: RootState) => state.createCharacterForm,
  );
  const history = useHistory();
  const { register, handleSubmit, errors } = useForm<FormData>();
  const onSubmit = (data: FormData, e?: React.BaseSyntheticEvent) => {
    dispatch(updateFormData(data));
    history.push(`${url}/step-6`);
  };

  type FormData = {
    firstName: string;
    lastName: string;
  };

  return (
    <div>
      <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <h2>Equipment</h2>
        <label>
          Name
          <input
            name="name"
            ref={register({ required: true })}
            defaultValue={formState.data.name}
          />
          {errors.firstName && 'First name is required'}
        </label>
        <label>
          Background
          <input
            name="background"
            ref={register}
            defaultValue={formState.data.background}
          />
        </label>
        <label>
          Background
          <input
            name="background"
            ref={register}
            defaultValue={formState.data.background}
          />
        </label>
        <input type="submit" />
      </form>
      <div className="flex justify-between">
        <Link to={`${url}/step-5`}>Previous</Link>
        <Link to={`${url}/summary`}>Finalize</Link>
      </div>
    </div>
  );
};

const Summary = () => {
  const formState = useSelector(
    (state: RootState) => state.createCharacterForm,
  );

  return (
    <>
      <h2>Result:</h2>
      <pre>{JSON.stringify(formState, null, 2)}</pre>
    </>
  );
};

export default Create;
