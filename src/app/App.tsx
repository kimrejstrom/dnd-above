import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  RouteProps,
} from 'react-router-dom';
import { Header } from 'components/Header/Header';
import { Modal } from 'components/Modal/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { withTracker, initializeGA } from 'utils/analyticsTracker';
import Books from 'pages/Books/Books';
import { UpdateNotification } from 'components/UpdateNotification/UpdateNotification';
import { Main } from 'pages/Main/Main';
import { ThemeMode } from 'features/theme/themeSlice';
import Create from 'pages/Create/Create';
import Sidebar from 'components/Sidebar/Sidebar';
import RightPanel from 'components/RightPanel/RightPanel';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { AuthContextProvider, useAuth } from 'utils/auth';
import { Login } from 'pages/Login/Login';
import { useBeforeWindowUnload } from 'utils/customHooks';
import PublicCharacter from 'pages/PublicCharacter/PublicCharacter';
import Edit from 'pages/Edit/Edit';
import { Loading } from 'components/Loading/Loading';
import { loadSourceData } from 'features/sourceData/sourceDataSlice';
import { SourceDataFuseItem, initializeSearch } from 'utils/search';
import Settings from 'features/settings/Settings';

// Google Analytics
initializeGA();

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
function PrivateRoute({ children, ...rest }: RouteProps) {
  const auth = useAuth();
  return (
    <Route
      {...rest}
      render={({ location }) =>
        auth?.user ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: location },
            }}
          />
        )
      }
    />
  );
}

const App: React.FC = () => {
  // Global Modal state
  const { title, content } = useSelector(
    (state: RootState) => state.modalVisibility,
  );
  const theme = useSelector((state: RootState) => state.theme);
  const sourceData = useSelector((state: RootState) => state.sourceData);
  const panelOpen = useSelector((state: RootState) => state.settings).panelOpen;
  const dispatch = useDispatch();
  const auth = useAuth();

  const [searchIndex, setSearchIndex] = useState<Array<SourceDataFuseItem>>([]);

  useEffect(() => {
    if (!sourceData.hydrated) {
      dispatch(loadSourceData());
    } else {
      setSearchIndex(initializeSearch());
    }
  }, [dispatch, sourceData.hydrated]);

  // Hook to cleanup on window unload
  useBeforeWindowUnload(auth?.user);

  return sourceData.hydrated ? (
    <div
      className={`flex flex-col min-h-screen theme ${
        theme === ThemeMode.LIGHT ? 'light' : 'dark'
      }`}
    >
      <div className="m-auto bg-light-100 dark:bg-dark-100 w-full shadow-xxl relative min-h-screen">
        <AuthContextProvider>
          <Router>
            <ErrorBoundary>
              <main className="h-full min-h-screen text-dark-100 dark:text-light-100 bg-light-100 dark:bg-dark-100">
                <UpdateNotification />
                <Header />
                <div
                  className="flex w-full"
                  style={{ minHeight: 'calc(100vh - 4rem)' }}
                >
                  <Sidebar />
                  {/* Main content */}
                  <div className="flex justify-center w-full bg-light-100 dark:bg-dark-100 p-2 md:p-4 h-full">
                    <div className="w-full flex justify-center max-w-5xl">
                      {/* A <Switch> looks through its children <Route>s and renders the first one that matches the current URL. */}
                      <Switch>
                        <PrivateRoute exact path="/">
                          <Main />
                        </PrivateRoute>
                        <PrivateRoute path="/create">
                          <Create />
                        </PrivateRoute>
                        <PrivateRoute path="/edit">
                          <Edit />
                        </PrivateRoute>
                        <PrivateRoute path="/books">
                          <Books />
                        </PrivateRoute>
                        <PrivateRoute path="/settings">
                          <Settings />
                        </PrivateRoute>
                        <Route path="/login" component={withTracker(Login)} />
                        <Route
                          path="/character/:listId/:characterId"
                          component={withTracker(PublicCharacter)}
                        />
                      </Switch>
                    </div>
                  </div>
                  <Modal title={title} content={content} />
                  {panelOpen && <RightPanel searchIndex={searchIndex} />}
                </div>
              </main>
            </ErrorBoundary>
          </Router>
        </AuthContextProvider>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default App;
