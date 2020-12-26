import { User } from 'netlify-identity-widget';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { isPowerUser } from 'utils/auth';
import { deleteCookie } from 'utils/cookie';

// A custom hook that builds on useLocation to parse
// the query string for you.
export const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

export const useBeforeWindowUnload = (user: User | null | undefined) => {
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user && !isPowerUser(user)) {
        deleteCookie('allSources');
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user]);
};
