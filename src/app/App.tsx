import React from 'react';
import { useSwipeable } from 'react-swipeable';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  RouteProps,
} from 'react-router-dom';
import { Header } from 'components/Header/Header';
import { Modal } from 'components/Modal/Modal';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { withTracker, initializeGA } from 'utils/analyticsTracker';
import { About } from 'pages/About/About';
import Books from 'pages/Books/Books';
import { UpdateNotification } from 'components/UpdateNotification/UpdateNotification';
import { Main } from 'pages/Main/Main';
import { ThemeMode } from 'features/theme/themeSlice';
import Create from 'pages/Create/Create';
import Sidebar from 'components/Sidebar/Sidebar';
import RightPanel from 'components/RightPanel/RightPanel';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { setPanelClose, setPanelOpen } from 'features/settings/settingsSlice';
import { AuthContextProvider, useAuth } from 'utils/auth';
import { Login } from 'app/Auth';

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
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme);
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      dispatch(setPanelOpen());
    },
    onSwipedRight: () => {
      dispatch(setPanelClose());
    },
  });

  return (
    <div
      className={`flex flex-col min-h-screen theme ${
        theme === ThemeMode.LIGHT ? 'mode-light' : 'mode-dark'
      }`}
    >
      <div className="m-auto bg-yellow-100 dark:bg-primary-dark w-full shadow-xxl relative min-h-screen">
        <AuthContextProvider>
          <Router>
            <ErrorBoundary>
              <main
                {...handlers}
                className="h-full min-h-screen text-primary-dark dark:text-yellow-100 bg-yellow-100 dark:bg-primary-dark"
              >
                <UpdateNotification />
                <Header />
                <div
                  className="flex w-full"
                  style={{ minHeight: 'calc(100vh - 5rem)' }}
                >
                  <Sidebar />
                  {/* Main content */}
                  <div className="flex w-full bg-yellow-100 dark:bg-primary-dark p-4 h-full">
                    {/* A <Switch> looks through its children <Route>s and renders the first one that matches the current URL. */}
                    <Switch>
                      <PrivateRoute exact path="/">
                        <Main />
                      </PrivateRoute>
                      <PrivateRoute path="/create">
                        <Create />
                      </PrivateRoute>
                      <PrivateRoute path="/books">
                        <Books />
                      </PrivateRoute>
                      <Route path="/login" component={withTracker(Login)} />
                      <Route path="/about" component={withTracker(About)} />
                    </Switch>
                  </div>
                  <Modal title={title} content={content} />
                  <RightPanel />
                </div>
              </main>
            </ErrorBoundary>
          </Router>
        </AuthContextProvider>
      </div>
    </div>
  );
};

export default App;
