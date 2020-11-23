import React from 'react';
import netlifyIdentity from 'netlify-identity-widget';
import { useHistory, useLocation } from 'react-router-dom';
import StyledButton from 'components/StyledButton/StyledButton';
import { useAuth } from 'utils/auth';
import beholder from 'images/beholder-dark.png';

interface NetlifyAuth {
  authenticate(callback: any): void;
  signout(callback: any): void;
}

export const netlifyAuth: NetlifyAuth = {
  authenticate(callback: any) {
    netlifyIdentity.open();
    netlifyIdentity.on('login', user => {
      callback(user);
    });
  },
  signout(callback: any) {
    netlifyIdentity.logout();
    netlifyIdentity.on('logout', () => {
      callback();
    });
  },
};

export const AuthButton = () => {
  const history = useHistory();
  const auth = useAuth();
  return auth?.user ? (
    <p>
      Welcome!{' '}
      <StyledButton
        onClick={() => {
          auth.signout(() => history.push('/'));
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
          auth?.authenticate(() => history.push('/'));
        }}
      >
        Log In
      </StyledButton>
    </p>
  );
};

export const Login = () => {
  let history = useHistory();
  let location = useLocation();
  let auth = useAuth();

  let { from } = (location.state as any) || { from: { pathname: '/' } };
  let login = () => {
    // auth?.authenticate(() => {
    //   history.replace(from);
    // });
    auth?.fakeLogin(() => {
      history.replace(from);
    });
  };

  return (
    <div className="fixed bg-tertiary-light w-full h-full top-0 left-0 flex flex-col items-center justify-center">
      <div className="p-20 custom-border bg-yellow-100 flex flex-col items-center justify-center">
        <img
          src={beholder}
          className="h-40 w-40 px-2 py-2 shape-shadow"
          alt="logo"
        />
        <div className="text-center mb-6">
          <h1>D&amp;D Above</h1>
          <h3>The ultimate D&D Character Builder and Character Sheet</h3>
          <div>You must log in to view the page</div>
        </div>
        <StyledButton onClick={login}>Log in</StyledButton>
      </div>
    </div>
  );
};
