// App.js
import React from "react";
import { RecoilRoot } from "recoil";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Battle from "./screen/BattleScreen"; //대회
import Random from "./screen/RandomScreen"; //대회

function App() {
  return (
    <RecoilRoot>
      <div className="App">
        <Router basename="pokemon">
          <Routes>
            <Route path="/battle" element={<Battle />} />
            <Route path="/" element={<Random />} />
          </Routes>
        </Router>
      </div>
    </RecoilRoot>
  );
}

export default App;
