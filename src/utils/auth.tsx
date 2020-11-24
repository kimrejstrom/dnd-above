import React, { useState, useContext, createContext } from 'react';
import netlifyIdentity, { User } from 'netlify-identity-widget';

// Netlify Auth Service
interface NetlifyAuth {
  authenticate(callback: any): void;
  signout(callback: any): void;
}

const netlifyAuth: NetlifyAuth = {
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

// Auth Hook
interface IAuthContext {
  user: User | null;
  authenticate: (cb: () => void) => void;
  signout: (cb: () => void) => void;
}

const AuthContext = createContext<IAuthContext | null>(null);

// Provider component that wraps your app and makes auth object ...
// ... available to any child component that calls useAuth().
export const AuthContextProvider = ({ children }: { children: any }) => {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider hook that creates auth object and handles state
function useProvideAuth() {
  const initialUser = netlifyIdentity.currentUser();
  const [user, setUser] = useState<User | null>(initialUser);

  const authenticate = (cb: () => void) => {
    return netlifyAuth.authenticate((user: User) => {
      setUser(user);
      cb();
    });
  };

  const signout = (cb: () => void) => {
    return netlifyAuth.signout(() => {
      setUser(null);
      cb();
    });
  };

  // Return the user object and auth methods
  return {
    user,
    authenticate,
    signout,
  };
}
