import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Header } from 'components/Header/Header';
import { Modal } from 'components/Modal/Modal';
import { useSelector } from 'react-redux';
import { RootState } from 'app/rootReducer';
import { withTracker, initializeGA } from 'utils/analyticsTracker';
import { About } from 'pages/About/About';
import { UpdateNotification } from 'components/UpdateNotification/UpdateNotification';
import { Main } from 'pages/Main/Main';
import { ThemeMode } from 'features/theme/themeSlice';
import Create from 'pages/Create/Create';
import Sidebar from 'components/Sidebar/Sidebar';
import RightPanel from 'components/RightPanel/RightPanel';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

// Google Analytics
initializeGA();

const App: React.FC = () => {
  // Global Modal state
  const { title, content } = useSelector(
    (state: RootState) => state.modalVisibility,
  );
  const theme = useSelector((state: RootState) => state.theme);
  return (
    <div
      className={`flex flex-col min-h-screen theme ${
        theme === ThemeMode.LIGHT ? 'mode-light' : 'mode-dark'
      }`}
    >
      <div className="m-auto bg-yellow-100 dark:bg-primary-dark w-full shadow-xxl relative min-h-screen">
        <Router>
          <ErrorBoundary>
            {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
            <main className="h-full min-h-screen text-primary-dark dark:text-yellow-100 bg-yellow-100 dark:bg-primary-dark flex-grow">
              <UpdateNotification />
              <Header />
              <div
                className="flex w-full"
                style={{ minHeight: 'calc(100vh - 5rem)' }}
              >
                <Sidebar />
                {/* Main content */}
                <div className="flex w-10/12 flex-wrap bg-yellow-100 dark:bg-primary-dark p-4 h-full">
                  <Switch>
                    <Route exact path="/" component={withTracker(Main)} />
                    <Route path="/about" component={withTracker(About)} />
                    <Route path="/create" component={withTracker(Create)} />
                  </Switch>
                </div>
                <Modal title={title} content={content} />
                <RightPanel />
              </div>
            </main>
          </ErrorBoundary>
        </Router>
      </div>
    </div>
  );
};

export default App;
