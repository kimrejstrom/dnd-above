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
import Abilities from 'pages/Create/Abilities';
import Description from 'pages/Create/Description';

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

      <div className="custom-border bg-secondary-light dark:bg-secondary-dark dar p-2">
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
            <Abilities url={url} />
          </Route>
          <Route path={`${path}/step-4`}>
            <Description url={url} />
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
