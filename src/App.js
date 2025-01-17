// App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Battle from "./Battle"; //대회

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Battle />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
