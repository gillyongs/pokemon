// npm test -- src/test/testmodeNpcChoice.test.js
jest.mock("josa", () => ({ josa: (str) => str }), { virtual: true });

import { createBattle } from "../entity/Battle";
import { testmode, setTestmode, selectedNpcAct, setSelectedNpcAct } from "../config/testMode";
import { npcChoice } from "../npc/npc";

describe("testmode 전역변수 및 NPC 행동 지정 테스트", () => {
  let battle;

  beforeEach(() => {
    battle = createBattle(["찌르호크", "어써러셔", "어써러셔"], ["코터스", "어써러셔", "어써러셔"]);
    setTestmode(true);
    setSelectedNpcAct(null);
  });

  test("testmode가 true이고 특정 기술(1~4)이 선택되었을 때 npcChoice는 해당 기술 번호를 반환하고 선택을 초기화한다", () => {
    setSelectedNpcAct(2);
    expect(selectedNpcAct).toBe(2);

    const act = npcChoice(battle, 1);
    expect(act).toBe(2);
    expect(selectedNpcAct).toBe(null);
  });

  test("testmode가 true이고 벤치 교체(npcBench1/npcBench2)가 선택되었을 때 npcChoice는 해당 교체 키를 반환한다", () => {
    setSelectedNpcAct("npcBench1");
    expect(selectedNpcAct).toBe("npcBench1");

    const act = npcChoice(battle, 1);
    expect(act).toBe("npcBench1");
    expect(selectedNpcAct).toBe(null);
  });

  test("testmode가 false일 때에는 selectedNpcAct가 있어도 일반 AI 결과를 반환한다", () => {
    setTestmode(false);
    setSelectedNpcAct(3);

    const act = npcChoice(battle, 1);
    // 선택된 3이 아니라 일반 AI 가중치 계산 결과가 나와야 함
    expect(act).toBeDefined();
    expect(selectedNpcAct).toBe(3); // 소모되지 않음
  });

  test("selectedNpcAct가 null일 때에는 일반 AI가 정상 동작한다", () => {
    setSelectedNpcAct(null);
    const act = npcChoice(battle, 1);
    expect(act).toBeDefined();
  });
});
