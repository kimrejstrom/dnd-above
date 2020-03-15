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
      <div className="m-auto bg-primary-dark w-full shadow-xxl relative min-h-screen">
        <Router>
          {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
          <main className="text-primary-dark dark:text-yellow-100 bg-primary-dark flex-grow">
            <UpdateNotification />
            <Header />
            <Switch>
              <Route path="/about" component={withTracker(About)} />
              <Route path="/" component={withTracker(Main)} />
            </Switch>
            <Modal title={title} content={content} />
          </main>
        </Router>
      </div>
    </div>
  );
};

export default App;
