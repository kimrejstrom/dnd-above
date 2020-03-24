import React from 'react';
import {
  Route,
  useRouteMatch,
  Switch,
  Link,
  useHistory,
  NavLink,
} from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { updateFormData } from 'features/createCharacterForm/createCharacterFormSlice';
import RaceBuilder from 'pages/Create/RaceBuilder';
import ClassBuilder from 'pages/Create/ClassBuilder';

interface Props {}

const Create = (props: Props) => {
  let { path, url } = useRouteMatch();
  return (
    <div className="m-auto w-9/12 flex flex-col justify-center">
      <h1 className="text-center">Character Builder</h1>
      <ul className="my-3 flex justify-around">
        <li>
          <NavLink to={`${url}/step-1`}>1. Race</NavLink>
        </li>
        <li>
          <NavLink to={`${url}/step-2`}>2. Class</NavLink>
        </li>
        <li>
          <NavLink to={`${url}/step-3`}>3. Abilities</NavLink>
        </li>
        <li>
          <NavLink to={`${url}/step-4`}>4. Description</NavLink>
        </li>
        <li>
          <NavLink to={`${url}/step-5`}>5. Equipmemnt</NavLink>
        </li>
      </ul>

      <div className="custom-border p-2">
        <Switch>
          <Route exact path={path}>
            <div>TODO Character list / new choice</div>
          </Route>
          <Route path={`${path}/step-1`}>
            <RaceBuilder url={url} />
          </Route>
          <Route path={`${path}/step-2`}>
            <ClassBuilder url={url} />
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

// const Step2 = ({ url }: { url: string }) => {
//   const dispatch = useDispatch();
//   const formState = useSelector(
//     (state: RootState) => state.createCharacterForm,
//   );
//   const history = useHistory();
//   const onSubmit = (data: FormData, e?: React.BaseSyntheticEvent) => {
//     dispatch(updateFormData(data));
//     history.push(`${url}/step-3`);
//   };
//   const [selectedClass, setselectedClass] = useState(
//     formState.data.classElement,
//   );

//   const isCurrent = (classElement: ClassElement) =>
//     classElement.name === formState.data.classElement?.name;

//   type FormData = {
//     classElement: ClassElement;
//     subClass: ClassSubclass;
//   };

//   return (
//     <div>
//       {selectedClass && (
//         <div>
//           <h2>Select Sub Class: {selectedClass.subclassTitle}</h2>
//           {selectedClass.subclasses
//             .filter(subclass => filterSources(subclass))
//             .map(feature => (
//               <div className="custom-border custom-border-thin p-4 my-2">
//                 <div className="flex justify-between">
//                   <div className="text-2xl font-bold">{feature.name}</div>
//                   <button
//                     onClick={e =>
//                       onSubmit(
//                         { classElement: selectedClass, subClass: feature },
//                         e,
//                       )
//                     }
//                     className="text-lg dark-hover:bg-primary-dark bg-yellow-100 hover:bg-primary-light dark:bg-transparent dark:text-primary-light px-2 border dark:border-primary-light rounded"
//                   >
//                     Select
//                   </button>
//                 </div>
//                 {feature.subclassFeatures.map(feat =>
//                   feat.map(entry => (
//                     <div>
//                       {entry.entries.map(innerEntry => (
//                         <div className="dnd-body">
//                           <Entry entry={innerEntry} />
//                         </div>
//                       ))}
//                     </div>
//                   )),
//                 )}
//               </div>
//             ))}
//         </div>
//       )}
//       <div>
//         {PLAYABLE_CLASSES.map((classElement: ClassElement, index) => (
//           <details key={index}>
//             <summary className="relative custom-border custom-border-thin p-2 my-2">
//               <span className="text-xl">
//                 {classElement.name}{' '}
//                 {isCurrent(classElement) && '(Your current class)'}
//               </span>
//               <button
//                 onClick={e => setselectedClass(classElement)}
//                 className="text-lg dark-hover:bg-primary-dark bg-yellow-100 hover:bg-primary-light dark:bg-transparent dark:text-primary-light px-2 border dark:border-primary-light rounded absolute right-0 mr-2"
//               >
//                 Select
//               </button>
//             </summary>
//             <div className="dnd-body p-2">
//               <Entry entry={classElement} />
//               <ClassBase cls={classElement} />
//               {classElement.classFeatures.map((feature, level) =>
//                 feature.map(feat => {
//                   return (
//                     <div className="custom-border custom-border-thin p-4 my-2">
//                       <div className="font-bold">{`Level ${level + 1} – ${
//                         feat.name
//                       }:`}</div>
//                       {feat.entries.map(entry => {
//                         return <Entry entry={entry} />;
//                       })}
//                     </div>
//                   );
//                 }),
//               )}
//             </div>
//           </details>
//         ))}
//       </div>
//       <div className="flex justify-between my-4">
//         <Link to={`${url}/step-1`}>Previous</Link>
//         <Link to={`${url}/step-3`}>Next</Link>
//       </div>
//     </div>
//   );
// };

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
