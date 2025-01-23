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

function App() {
  return (
    <RecoilRoot>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/pokemon" element={<Battle />} />
          </Routes>
        </Router>
      </div>
    </RecoilRoot>
  );
}

export default App;
