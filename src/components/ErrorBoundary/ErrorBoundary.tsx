import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import beholder from 'images/beholder-light.png';

interface Props {}
interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="fixed bg-dark-100 w-full h-full top-0 left-0 flex flex-col items-center justify-center">
          <img
            src={beholder}
            className="h-40 w-40 px-2 py-2 shape-shadow"
            alt="logo"
          />
          <h1 className="text-center mb-6 text-light-100">
            Oh no!
            <br />
            Something went wrong
          </h1>
          <Link
            to="/"
            className="text-lg bg-dark-100 bg-transparent text-light-100 px-2 border border-light-100 rounded"
          >
            Go Back
          </Link>
        </div>
      );
    }

    return this.props.children;
  }
}
