// npm test -- src/test/skill/역린_자동턴.test.js
import { generate } from "../../entity/Pokemon/PokemonInstance";
import Battle from "../../entity/Battle";
import { turnEnd } from "../../service/turnEnd";

describe("역린 사용 시 자동 턴 진행 텍스트 테스트", () => {
  let mockQueue;
  let mockEnqueue;

  beforeEach(() => {
    mockQueue = [];
    mockEnqueue = jest.fn((item) => mockQueue.push(item));
  });

  it("역린 진행 중(auto > 0)일 때는 턴 종료 시 '~는 무엇을 할까?' 텍스트가 큐에 들어가지 않아야 한다", () => {
    const salamence = generate("메가보만다");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(salamence, enemy, b1, b2, eb1, eb2);

    // 역린 발동 상태 (2턴 남음)
    battle.player.auto = 2;
    battle.player.autoSN = 3;

    turnEnd(battle, mockEnqueue, "player", "npc");

    // 턴 종료 후 auto는 1로 감소
    expect(battle.player.auto).toBe(1);

    // 큐에 들어간 텍스트들 중 "~는 무엇을 할까?"가 없어야 함
    const texts = mockQueue.map((item) => item.text);
    const hasWhatToDo = texts.some((t) => t && t.includes("무엇을 할까?"));
    expect(hasWhatToDo).toBe(false);

    // 대신 autoTurn: true 플래그가 들어있어야 함
    const autoTurnItem = mockQueue.find((item) => item.autoTurn);
    expect(autoTurnItem).toBeDefined();
    expect(autoTurnItem.autoTurn).toBe(true);
  });

  it("역린이 종료되어 혼란에 걸린 턴에는 '~는 무엇을 할까?' 텍스트가 정상적으로 큐에 들어가야 한다", () => {
    const salamence = generate("메가보만다");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(salamence, enemy, b1, b2, eb1, eb2);

    // 역린 마지막 턴 (auto = 1)
    battle.player.auto = 1;
    battle.player.autoSN = 3;

    turnEnd(battle, mockEnqueue, "player", "npc");

    // 역린 종료로 auto는 null이 됨
    expect(battle.player.auto).toBeNull();
    expect(battle.player.tempStatus.confuse).toBeGreaterThan(0);

    // 다음 턴에 기술을 선택할 수 있으므로 "~는 무엇을 할까?"가 들어가야 함
    const texts = mockQueue.map((item) => item.text);
    const hasWhatToDo = texts.some((t) => t && t.includes("무엇을 할까?"));
    expect(hasWhatToDo).toBe(true);
  });
});
