import React, { Component, useState } from 'react';
import netlifyIdentity, { User } from 'netlify-identity-widget';
import { Redirect, Route, RouteProps, useHistory } from 'react-router-dom';
import StyledButton from 'components/StyledButton/StyledButton';

interface NetlifyAuth {
  isAuthenticated: boolean;
  user: User | undefined;
  authenticate(callback: any): void;
  signout(callback: any): void;
}

const netlifyAuth: NetlifyAuth = {
  isAuthenticated: false,
  user: undefined,
  authenticate(callback: any) {
    this.isAuthenticated = true;
    netlifyIdentity.open();
    netlifyIdentity.on('login', user => {
      this.user = user;
      callback(user);
    });
  },
  signout(callback: any) {
    this.isAuthenticated = false;
    netlifyIdentity.logout();
    netlifyIdentity.on('logout', () => {
      this.user = undefined;
      callback();
    });
  },
};

export const AuthButton = () => {
  const history = useHistory();
  return netlifyAuth.isAuthenticated ? (
    <p>
      Welcome!{' '}
      <StyledButton
        onClick={() => {
          netlifyAuth.signout(() => history.push('/'));
        }}
      >
        Sign out
      </StyledButton>
    </p>
  ) : (
    <p>
      You are not logged in.{' '}
      <StyledButton
        onClick={() => {
          netlifyAuth.authenticate(() => history.push('/'));
        }}
      >
        Log In
      </StyledButton>
    </p>
  );
};

export const Login = (props: { location: { state: { from: Location } } }) => {
  const [redirectToReferrer, setRedirectToReferrer] = useState(false);
  // eslint-disable-next-line no-debugger
  console.log('redirectToReferrer', redirectToReferrer);
  const login = () => {
    netlifyAuth.authenticate(() => {
      setRedirectToReferrer(true);
    });
  };

  const { from } = props.location.state || { from: { pathname: '/' } };
  console.log('from', from);

  //   if (redirectToReferrer) return <Redirect to={from} />;

  return (
    <div>
      <p>You must log in to view the page at {from.pathname}</p>
      <button onClick={login}>Log in</button>
    </div>
  );
};

export const PrivateRoute = ({ component, ...rest }: RouteProps) => {
  console.log(netlifyAuth.isAuthenticated);
  return (
    <Route
      {...rest}
      render={props =>
        netlifyAuth.isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
};
