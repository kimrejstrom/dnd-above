import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { toggleAnimations } from 'features/settings/settingsSlice';
import { useAuth } from 'utils/auth';
import { getRelativeTime, parseDate } from 'utils/time';
import TextBox from 'components/TextBox/TextBox';

const Settings: React.FC = () => {
  // Get settings from Redux
  const settingsState = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();
  const auth = useAuth();
  return (
    <TextBox extraClassName="font-sans bg-light-200 dark:bg-dark-300">
      <div className="flex flex-col items-center">
        <h2>Profile Information</h2>
        <div className="flex p-4">
          <dl>
            <dt className="mt-2 opacity-70">E-mail</dt>
            <dd>{auth?.user && auth.user.email}</dd>
            <dt className="mt-2 opacity-70">Role</dt>
            <dd>
              {auth?.user && auth.user.app_metadata.roles.length
                ? auth.user.app_metadata.roles.join(', ')
                : 'No roles'}
            </dd>
            <dt className="mt-2 opacity-70">Registered</dt>
            <dd>
              {auth?.user?.created_at &&
                `${new Date(
                  auth.user.created_at,
                ).toLocaleDateString()} (${getRelativeTime(
                  parseDate(auth.user.created_at),
                )})`}
            </dd>
          </dl>
        </div>
        <h2>Settings</h2>
        <div className="flex p-4">
          Animations:
          {settingsState.animations ? (
            <button onClick={() => dispatch(toggleAnimations(false))}>
              <span className="ml-4 border rounded-full border-gray-300 flex items-center cursor-pointer w-12 bg-green-400 justify-end">
                <span className="rounded-full border w-6 h-6 border-gray-300 shadow-inner bg-white shadow"></span>
              </span>
            </button>
          ) : (
            <button onClick={() => dispatch(toggleAnimations(true))}>
              <span className="ml-4 border rounded-full border-gray-300 flex items-center cursor-pointer w-12 justify-start">
                <span className="rounded-full border w-6 h-6 border-gray-300 shadow-inner bg-white shadow"></span>
              </span>
            </button>
          )}
        </div>
      </div>
    </TextBox>
  );
};

export default Settings;
