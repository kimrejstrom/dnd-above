import React from 'react';
import { Route, useRouteMatch, Switch, NavLink } from 'react-router-dom';
import RaceBuilder from 'pages/Create/RaceBuilder';
import ClassBuilder from 'pages/Create/ClassBuilder';
import Abilities from 'pages/Create/Abilities';
import Description from 'pages/Create/Description';
import Equipment from 'pages/Create/Equipment';
import CharacterListing from 'pages/Create/CharacterListing';
import Summary from 'pages/Create/Summary';

interface Props {}

const Create = (props: Props) => {
  let { path, url } = useRouteMatch();
  return (
    <div className="w-full flex flex-col">
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

      <div className="custom-border bg-light-400 dark:bg-dark-200 p-0 md:p-2">
        <Switch>
          <Route exact path={path}>
            <CharacterListing />
          </Route>
          <Route path={`${path}/step-1`}>
            <RaceBuilder />
          </Route>
          <Route path={`${path}/step-2`}>
            <ClassBuilder />
          </Route>
          <Route path={`${path}/step-3`}>
            <Abilities />
          </Route>
          <Route path={`${path}/step-4`}>
            <Description />
          </Route>
          <Route path={`${path}/step-5`}>
            <Equipment />
          </Route>
          <Route path={`${path}/summary`}>
            <Summary />
          </Route>
        </Switch>
      </div>
    </div>
  );
};

export default Create;
