// App.js
import React from "react";
import { RecoilRoot } from "recoil";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Battle from "./screen/BattleScreen";
import MainScreen from "./screen/MainScreen";
import CustomScreen from "./screen/CustomScreen";

function App() {
  return (
    <RecoilRoot>
      <div className="App">
        <Router basename="pokemon">
          <Routes>
            <Route path="/battle" element={<Battle />} />
            <Route path="/custom" element={<CustomScreen />} />
            <Route path="/" element={<MainScreen />} />
          </Routes>
        </Router>
      </div>
    </RecoilRoot>
  );
}

export default App;
