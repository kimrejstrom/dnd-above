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
    <div className="w-full flex justify-center">
      <div className="w-full flex flex-col" style={{ maxWidth: '62rem' }}>
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

        <div className="custom-border bg-secondary-light dark:bg-secondary-dark p-2">
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
              <Summary url={url} />
            </Route>
          </Switch>
        </div>
      </div>
    </div>
  );
};

export default Create;
