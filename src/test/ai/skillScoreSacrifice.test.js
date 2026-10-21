// npm test -- src/test/ai/skillScoreSacrifice.test.js
import { getLowHpFactor } from "../../npc/ai/calculateSkillScore";
import { skillEffectsAfter } from "../../service/skillEffect";

describe("희생/퇴장기 AI 점수 및 skillEffectsAfter 검증 테스트", () => {
  describe("getLowHpFactor 공통 곡선 함수 테스트", () => {
    it("체력이 100%일 때 0, 체력이 낮아질수록 1에 수렴해야 한다", () => {
      // 100% HP -> 0
      expect(getLowHpFactor(100, 100)).toBe(0);

      // 80% HP -> 매우 낮은 값 (약 0.02)
      expect(getLowHpFactor(80, 100)).toBeCloseTo(0.0247, 2);

      // 50% HP -> 약 0.20
      expect(getLowHpFactor(50, 100)).toBeCloseTo(0.203, 2);

      // 20% HP -> 약 0.60
      expect(getLowHpFactor(20, 100)).toBeCloseTo(0.598, 2);

      // 10% HP -> 약 0.78
      expect(getLowHpFactor(10, 100)).toBeCloseTo(0.785, 2);

      // 0% HP -> 1.0
      expect(getLowHpFactor(0, 100)).toBe(1);
    });

    it("예외 상황(HP 초과 또는 음수)에서도 0~1 범위를 안전하게 유지해야 한다", () => {
      expect(getLowHpFactor(150, 100)).toBe(0);
      expect(getLowHpFactor(-20, 100)).toBe(1);
      expect(getLowHpFactor(50, 0)).toBe(0);
    });
  });

  describe("skillEffectsAfter 배열 순회 및 faint 조건 테스트", () => {
    it("포켓몬이 이미 기절한 상태라면 빗나감패널티, 자폭, 철제광선반동 모두 발동하지 않아야 한다", () => {
      const mockBattle = {
        turn: { atk: "player" },
        player: {
          faint: true,
          turn: {
            useSkill: {
              skillEffectList: [
                { name: "빗나감패널티" },
                { name: "자폭" },
                { name: "철제광선반동" },
              ],
            },
          },
        },
      };

      const mockEnqueue = jest.fn();
      // faint 상태에서는 아무런 부가효과도 실행되지 않아야 함
      expect(() => skillEffectsAfter(mockBattle, mockEnqueue)).not.toThrow();
      expect(mockEnqueue).not.toHaveBeenCalled();
    });
  });

  describe("AI damageCalculate 확정급소 보정 테스트 (급소 제외 및 mustCritical 반영)", () => {
    it("AI 모드에서 일반 기술은 급소가 제외되고, mustCritical 스킬은 확정급소(1.5배)로 계산되어야 한다", () => {
      const { default: Battle } = require("../../entity/Battle");
      const { generate } = require("../../entity/Pokemon/PokemonInstance");
      const { default: skillList } = require("../../entity/Skill/skillList");
      const { damageCalculate } = require("../../util/damageCalculate");
      const { calculateSkillScore } = require("../../npc/ai/calculateSkillScore");

      const wickedBlow = skillList.getDataById("암흑강타"); // feature: { mustCritical: true }
      const earthquake = skillList.getDataById("지진"); // 일반 기술
      expect(wickedBlow.feature?.mustCritical).toBe(true);

      const npc = generate("망나뇽 (물리)");
      const player = generate("파르셀");
      const b1 = generate("썬더 (특수)");
      const b2 = generate("마릴리");
      const eb1 = generate("블래키");
      const eb2 = generate("럭키");

      const bt = new Battle(player, npc, eb1, eb2, b1, b2);
      bt.turn.atk = "npc";
      bt.turn.def = "player";

      // 1. 일반 기술 (지진): AI 계산 시 급소 제외
      bt.turn.atkSN = 1;
      bt.npc.origin.skill[1] = earthquake;
      const normalDmg = damageCalculate(bt, null, { atkSN: 1, randNum: 100 });
      expect(bt.npc.log.damage2).not.toContain("(급소)");

      // 2. 확정급소 기술 (암흑강타): AI 계산 시 급소 자동 적용 (1.5배)
      bt.turn.atkSN = 2;
      bt.npc.origin.skill[2] = wickedBlow;
      const critDmg = damageCalculate(bt, null, { atkSN: 2, randNum: 100 });
      expect(bt.npc.log.damage2).toContain(" * 1.5 (급소)");

      // 3. calculateSkillScore 가중치에도 정상 반영 (randNum: 92 기준 데미지)
      const critDmg92 = damageCalculate(bt, null, { atkSN: 2, randNum: 92 });
      const skObj = {
        name: "암흑강타",
        sk: wickedBlow,
        number: 2,
        log: {},
      };
      const score = calculateSkillScore(bt, 2, skObj, true);
      expect(score).toBeGreaterThan(0);
      expect(skObj.log.atkScoreOrigin).toContain(`${critDmg92}`);
    });
  });
});
