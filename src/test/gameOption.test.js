// npm test -- src/test/gameOption.test.js
import React from "react";
import { render, screen, fireEvent, renderHook, act } from "@testing-library/react";
import { RecoilRoot, useRecoilState, useRecoilValue } from "recoil";
import { gameOptionState, getStoredGameOption } from "../util/recoilState";
import { defaultOption } from "../config/defaultOption";

describe("게임 옵션 전역 상태 및 유지 관리 테스트", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("1. localStorage에 저장된 옵션이 없을 때는 defaultOption 값을 기본값으로 반환한다", () => {
    const option = getStoredGameOption();
    expect(option.difficulty).toBe(defaultOption.difficulty);
    expect(option.teamOption).toBe(defaultOption.teamOption);
  });

  it("2. localStorage에 저장된 값이 있으면 해당 값을 읽어온다", () => {
    localStorage.setItem(
      "pokemon_game_option",
      JSON.stringify({ difficulty: "하드", teamOption: "트레이드" })
    );

    const option = getStoredGameOption();
    expect(option.difficulty).toBe("하드");
    expect(option.teamOption).toBe("트레이드");
  });

  it("3. Recoil gameOptionState를 통해 옵션을 변경하면 전역 상태가 업데이트되고 localStorage에 동기화된다", () => {
    const { result } = renderHook(() => useRecoilState(gameOptionState), {
      wrapper: ({ children }) => <RecoilRoot>{children}</RecoilRoot>,
    });

    // 초기 상태 확인
    expect(result.current[0].difficulty).toBe(defaultOption.difficulty);
    expect(result.current[0].teamOption).toBe(defaultOption.teamOption);

    // 옵션 변경 (하드, 트레이드)
    act(() => {
      result.current[1]({ difficulty: "하드", teamOption: "트레이드" });
    });

    // 변경된 상태 확인
    expect(result.current[0].difficulty).toBe("하드");
    expect(result.current[0].teamOption).toBe("트레이드");

    // localStorage에 저장되었는지 확인
    const saved = JSON.parse(localStorage.getItem("pokemon_game_option"));
    expect(saved).toEqual({ difficulty: "하드", teamOption: "트레이드" });
  });

  it("4. 옵션을 변경한 후 컴포넌트가 언마운트/리마운트(뒤로 갔다 오기)되어도 설정한 값이 유지된다", () => {
    // 첫 번째 세션: 사용자가 커스텀 화면 등에서 옵션을 변경
    const { result: session1, unmount } = renderHook(() => useRecoilState(gameOptionState), {
      wrapper: ({ children }) => <RecoilRoot>{children}</RecoilRoot>,
    });

    act(() => {
      session1.current[1]({ difficulty: "노말", teamOption: "고정" });
    });

    expect(session1.current[0]).toEqual({ difficulty: "노말", teamOption: "고정" });
    unmount(); // 화면 이탈 (뒤로 가기)

    // 두 번째 세션: 다시 화면에 진입 (재진입 시 저장된 값 유지 확인)
    const stored = getStoredGameOption();
    expect(stored).toEqual({ difficulty: "노말", teamOption: "고정" });
  });
});
