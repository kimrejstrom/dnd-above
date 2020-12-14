import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { deleteCookie } from 'utils/cookie';

// A custom hook that builds on useLocation to parse
// the query string for you.
export const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

export const useBeforeWindowUnload = () => {
  useEffect(() => {
    const handleBeforeUnload = () => {
      deleteCookie('allSources');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);
};
