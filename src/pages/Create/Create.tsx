import React from 'react';
import { Route, useRouteMatch, Switch, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/rootReducer';
import RaceBuilder from 'pages/Create/RaceBuilder';
import ClassBuilder from 'pages/Create/ClassBuilder';
import Abilities from 'pages/Create/Abilities';
import Description from 'pages/Create/Description';
import Equipment from 'pages/Create/Equipment';
import CharacterListing from 'pages/Create/CharacterListing';
import {
  addCharacter,
  updateCharacter,
} from 'features/character/characterListSlice';

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
          <NavLink to={`${url}/step-5`}>5. Equipment</NavLink>
        </li>
      </ul>

      <div className="custom-border bg-secondary-light dark:bg-secondary-dark dar p-2">
        <Switch>
          <Route exact path={path}>
            <CharacterListing url={url} />
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
            <Equipment url={url} />
          </Route>
          <Route path={`${path}/summary`}>
            <Summary />
          </Route>
        </Switch>
      </div>
    </div>
  );
};

const Summary = () => {
  const formState = useSelector(
    (state: RootState) => state.createCharacterForm,
  );
  const dispatch = useDispatch();

  return (
    <>
      <h2>Summary</h2>
      <button
        className="text-lg dark-hover:bg-primary-dark bg-yellow-100 hover:bg-primary-light dark:bg-transparent dark:text-primary-light px-2 border dark:border-primary-light rounded mr-2"
        onClick={() => {
          formState.data.id
            ? dispatch(updateCharacter(formState))
            : dispatch(addCharacter(formState));
        }}
      >
        Save Character
      </button>
      <pre className="bg-tertiary-light">
        {JSON.stringify(formState, null, 2)}
      </pre>
    </>
  );
};

export default Create;
