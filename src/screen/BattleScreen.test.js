import React from "react";

jest.mock(
  "react-router-dom",
  () => ({
    useLocation: () => ({ state: {} }),
    useNavigate: () => jest.fn(),
  }),
  { virtual: true }
);

jest.mock("recoil", () => ({
  useRecoilValue: () => ({}),
  atom: () => ({}),
}));

import Battle from "./BattleScreen";
import RoundOptionsModal from "../component/battleScreen/RoundOptionsModal";
import GameResultModal from "../component/battleScreen/GameResultModal";
import TestingTools from "../component/battleScreen/TestingTools";
import AfterBattleTradeModal, { AfterBattleTradeModel } from "../component/battleScreen/AfterBattleTradeModal";

describe("BattleScreen & Split Modals Compilation", () => {
  test("Components are defined and can be imported", () => {
    expect(Battle).toBeDefined();
    expect(RoundOptionsModal).toBeDefined();
    expect(GameResultModal).toBeDefined();
    expect(TestingTools).toBeDefined();
    expect(AfterBattleTradeModal).toBeDefined();
    expect(AfterBattleTradeModel).toBe(AfterBattleTradeModal);
  });
});
