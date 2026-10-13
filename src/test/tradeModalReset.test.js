// npm test -- src/test/tradeModalReset.test.js
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Battle from "../screen/BattleScreen";
import { RecoilRoot } from "recoil";

import { cloneWithMethods } from "../util/cloneWithMethods";

const mockNavigate = jest.fn();
let mockLocationState = {
  team1: ["달투곰", "가이오가", "미라이돈"],
  team2: ["흑마렉스", "고릴타", "어써러셔"],
  teamOption: "트레이드",
  difficulty: "노말",
  round: 1,
};

jest.mock(
  "react-router-dom",
  () => ({
    useLocation: () => ({ state: mockLocationState }),
    useNavigate: () => mockNavigate,
  }),
  { virtual: true }
);

// Bottom 컴포넌트들 및 이미지 간소화 모킹
jest.mock("../component/Bottom/Bottom-Skill/Bottom-Skill", () => ({ btObj, queueObject }) => {
  const { cloneWithMethods: cloneFn } = require("../util/cloneWithMethods");
  return (
    <div data-testid="bottom-skill">
      <button
        data-testid="win-trigger-btn"
        onClick={() => {
          queueObject.initQueue();
          const winBattle = cloneFn(btObj);
          winBattle.npc.faint = true;
          winBattle.npcBench1.faint = true;
          winBattle.npcBench2.faint = true;
          queueObject.enqueue({ battle: winBattle, text: "승리!" });
        }}>
        Win
      </button>
    </div>
  );
});
jest.mock("../component/Bottom/Bottom-Switch/Bottom-Switch", () => () => <div data-testid="bottom-switch">Switch</div>);
jest.mock("../component/Bottom/Bottom-info/Bottom-Info", () => () => <div data-testid="bottom-info">Info</div>);
jest.mock("../component/Bottom/Bottom-field/Bottom-Field", () => () => <div data-testid="bottom-field">Field</div>);
jest.mock("../component/Top/PokemonInfo", () => () => <div data-testid="pokemon-info">PokemonInfo</div>);
jest.mock("../component/Top/PokemonImage", () => () => <div data-testid="pokemon-image">PokemonImage</div>);
jest.mock("../component/Top/ItemImage", () => () => <div data-testid="item-image">ItemImage</div>);

describe("BattleScreen 트레이드 모달 매 라운드 초기화 테스트", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockLocationState = {
      team1: ["달투곰", "가이오가", "미라이돈"],
      team2: ["흑마렉스", "고릴타", "어써러셔"],
      teamOption: "트레이드",
      difficulty: "노말",
      round: 1,
    };
  });

  it("BattleScreen 렌더링 시 트레이드 모달과 선택 상태가 기본적으로 초기화되어 있어야 한다", () => {
    render(
      <RecoilRoot>
        <Battle />
      </RecoilRoot>
    );

    // 모달이 기본적으로 닫혀있어야 함
    expect(screen.queryByText("포켓몬 트레이드")).not.toBeInTheDocument();
  });

  it("트레이드 모달에서 포켓몬을 선택한 후 다음 라운드로 이동하면 모달 및 선택 상태가 초기화되어야 한다", async () => {
    const { rerender } = render(
      <RecoilRoot>
        <Battle />
      </RecoilRoot>
    );

    // 승리 트리거
    fireEvent.click(screen.getByTestId("win-trigger-btn"));

    // 승리 모달 확인 및 "다음 라운드" 클릭
    const nextRoundBtn = await screen.findByText("다음 라운드");
    fireEvent.click(nextRoundBtn);

    // 트레이드 모달 확인
    expect(await screen.findByText("포켓몬 트레이드")).toBeInTheDocument();

    // 트레이드 대상 카드들 확인
    const daltugom = screen.getByText("다투곰");
    expect(daltugom).toBeInTheDocument();

    // 포켓몬 카드 클릭 (선택)
    fireEvent.click(daltugom);

    // 건너뛰기 클릭하여 라운드 넘어가기
    const skipBtn = screen.getByText("건너뛰기");
    fireEvent.click(skipBtn);

    // navigate가 호출되었는지 확인
    expect(mockNavigate).toHaveBeenCalledWith(
      "/battle",
      expect.objectContaining({
        state: expect.objectContaining({
          round: 2,
        }),
      })
    );

    // 라운드 2 상태로 리렌더링
    mockLocationState = {
      ...mockLocationState,
      round: 2,
    };

    rerender(
      <RecoilRoot>
        <Battle />
      </RecoilRoot>
    );

    // 라운드 2에서는 모달이 닫혀있어야 함
    expect(screen.queryByText("포켓몬 트레이드")).not.toBeInTheDocument();

    // 다시 승리하여 트레이드 모달을 열었을 때 이전 라운드의 선택이 유지되지 않아야 함
    fireEvent.click(screen.getByTestId("win-trigger-btn"));
    fireEvent.click(screen.getByText("다음 라운드"));

    expect(screen.getByText("포켓몬 트레이드")).toBeInTheDocument();

    // 교환 및 진행 버튼이 비활성화 상태여야 함 (아무것도 선택되지 않았으므로)
    const tradeSubmitBtn = screen.getByText("교환 및 진행");
    expect(tradeSubmitBtn).toHaveStyle({ cursor: "not-allowed" });
  });
});
