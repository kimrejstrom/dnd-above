import React from 'react';
import { Route, useRouteMatch, Switch, Link } from 'react-router-dom';

interface Props {}

const Create = (props: Props) => {
  let { path, url } = useRouteMatch();
  return (
    <div>
      <h1>Create a new character</h1>

      <Switch>
        <Route exact path={path}>
          <h3>Let's get started!</h3>
          <Link to={`${url}/step-1`}>Next</Link>
        </Route>
        <Route path={`${path}/step-1`}>
          <Step1 url={url} />
        </Route>
        <Route path={`${path}/step-2`}>
          <Step2 url={url} />
        </Route>
      </Switch>
    </div>
  );
};

const Step1 = ({ url }: { url: string }) => (
  <>
    <div>This is Step 1 of the Form wizard</div>
    <div className="flex">
      <Link to={`${url}/step-2`}>Next</Link>
      <Link to={`${url}`}>Previous</Link>
    </div>
  </>
);

const Step2 = ({ url }: { url: string }) => (
  <>
    <div>This is Step 2 of the Form wizard</div>
    <div className="flex">
      <Link to={`${url}/step-3`}>Next</Link>
      <Link to={`${url}/step-1`}>Previous</Link>
    </div>
  </>
);

export default Create;
