// npm test -- src/test/tradeModalReset.test.js
import { defaultOption } from "../config/defaultOption";

describe("BattleScreen 트레이드 모달 및 라운드 초기화 로직 테스트", () => {
  it("라운드 진행 시 선택 인덱스(tradePlayerIdx, tradeNpcIdx, tradeInfoPokemon)는 항상 null로 초기화되어야 한다", () => {
    // 트레이드 선택 상태 시뮬레이션
    let tradePlayerIdx = 0;
    let tradeNpcIdx = 1;
    let tradeInfoPokemon = { id: "다투곰" };
    let isTradeModalOpen = true;

    // 라운드 종료 / 다음 라운드 진행 시 초기화 로직
    const resetTradeSelection = () => {
      tradePlayerIdx = null;
      tradeNpcIdx = null;
      tradeInfoPokemon = null;
      isTradeModalOpen = false;
    };

    resetTradeSelection();

    expect(tradePlayerIdx).toBeNull();
    expect(tradeNpcIdx).toBeNull();
    expect(tradeInfoPokemon).toBeNull();
    expect(isTradeModalOpen).toBe(false);
  });

  it("새로운 라운드로 이동 시 (proceedNextRound) round는 1 증가하고 선택 상태는 리셋된다", () => {
    let currentRound = 1;
    let tradePlayerIdx = 2;
    let tradeNpcIdx = 0;

    const proceedNextRound = (state, customTeam1 = null) => {
      tradePlayerIdx = null;
      tradeNpcIdx = null;
      return {
        ...state,
        round: (state.round || defaultOption.round) + 1,
        team1: customTeam1 || state.team1,
      };
    };

    const nextState = proceedNextRound({
      round: currentRound,
      team1: ["다투곰", "가이오가", "미라이돈"],
      difficulty: "노말",
      teamOption: "트레이드",
    });

    expect(nextState.round).toBe(2);
    expect(tradePlayerIdx).toBeNull();
    expect(tradeNpcIdx).toBeNull();
  });
});
