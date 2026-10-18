// npm test -- src/test/skill/더블펀처.test.js
jest.mock("josa", () => ({ josa: (str) => str }), { virtual: true });

import { generate } from "../../entity/Pokemon/PokemonInstance";
import Battle from "../../entity/Battle";
import { skillUse } from "../../service/skillUse";

describe("멜메탈 더블펀처 연속기 풀죽음 확률 테스트", () => {
  it("멜메탈이 더블펀처(30% 풀죽음 2회 공격)를 10000번 사용하면 약 51% 확률로 풀죽음이 부여된다", () => {
    const melmetal = generate("멜메탈");
    const enemy = generate("마릴리");
    const b1 = generate("윈디");
    const b2 = generate("썬더");
    const eb1 = generate("파르셀");
    const eb2 = generate("한카리아스");

    const battle = new Battle(melmetal, enemy, b1, b2, eb1, eb2);
    battle.turn.atk = "player";
    battle.turn.def = "npc";
    battle.turn.atkSN = 1;

    // 멜메탈의 1번 스킬: 더블펀처
    melmetal.turn.useSkill = melmetal.origin.skill[1];
    expect(melmetal.turn.useSkill.name).toBe("더블펀처");

    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const mockEnqueue = jest.fn();
    const trials = 10000;
    let flinchCount = 0;

    for (let i = 0; i < trials; i++) {
      // 매 시행마다 기절하지 않도록 충분한 체력/PP 유지 및 풀죽음 상태 초기화
      melmetal.hp = melmetal.origin.hp;
      melmetal.faint = null;
      melmetal.pp[1] = 10;

      enemy.hp = 999999;
      enemy.origin.hp = 999999;
      enemy.faint = null;
      enemy.turn.fullDeath = null;

      skillUse(battle, mockEnqueue);

      if (enemy.turn.fullDeath === true) {
        flinchCount++;
      }
    }

    logSpy.mockRestore();

    const flinchRate = flinchCount / trials;

    // 1 - (1 - 0.3)^2 = 0.51 (51%) 근사값 검증 (±3% 오차 범위 내, toBeCloseTo 1자리)
    expect(flinchRate).toBeCloseTo(0.51, 1);
    expect(flinchRate).toBeGreaterThanOrEqual(0.48);
    expect(flinchRate).toBeLessThanOrEqual(0.54);
  });
});
