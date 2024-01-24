// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import './stylesheets/App.css';
import FakeStackOverflow from './components/fakestackoverflow.js'
import React from 'react';
import axios from 'axios';

function App() {
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = "http://localhost:8000/"
  return (
    <section className="fakeso">
      <FakeStackOverflow />
    </section>
  );
}

export default App;
