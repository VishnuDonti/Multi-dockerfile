import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Fib from './Fib';
import otherPage from './otherPage';

function App() {
  return (
    <Router>
      <div className="App">
        <header>
          <Link to="/">Home</Link>
          <Link to="/otherPage">Other Page</Link>
        </header>
        <div>
          <Route exact path="/" component={Fib} />
          <Route path="/otherPage" component={otherPage} />
        </div>
      </div>
    </Router>
  );
}

export default App;
