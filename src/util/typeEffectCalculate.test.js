import { typeCheck, typeCheckOnBattle } from "./typeEffectCalculate";

describe("typeEffectCalculate", () => {
  describe("typeCheck", () => {
    it("should calculate correct multipliers for basic types", () => {
      // 1x
      expect(typeCheck("노말", "노말", null)).toBe(1);
      
      // 2x
      expect(typeCheck("불꽃", "풀", null)).toBe(2);
      expect(typeCheck("물", "불꽃", null)).toBe(2);
      expect(typeCheck("풀", "물", null)).toBe(2);
      
      // 0.5x
      expect(typeCheck("불꽃", "물", null)).toBe(0.5);
      
      // 0x (Immunity)
      expect(typeCheck("노말", "고스트", null)).toBe(0);
      expect(typeCheck("전기", "땅", null)).toBe(0);
      expect(typeCheck("땅", "비행", null)).toBe(0);
      expect(typeCheck("독", "강철", null)).toBe(0);
      
      // 4x (Dual types)
      expect(typeCheck("얼음", "풀", "땅")).toBe(4); // 풀 2배, 땅 2배
      
      // 0.25x (Dual types)
      expect(typeCheck("벌레", "격투", "독")).toBe(0.25); // 격투 0.5배, 독 0.5배
      
      // 0x (Dual types with one immunity)
      expect(typeCheck("전기", "물", "땅")).toBe(0); // 땅에 막힘
    });
  });

  describe("typeCheckOnBattle", () => {
    let mockBattle;

    beforeEach(() => {
      mockBattle = {
        turn: {
          atk: "player",
          def: "npc",
        },
        player: {
          abil: null,
          abilObj: {},
          item: null,
        },
        npc: {
          abil: null,
          abilObj: {},
          item: null,
        },
      };
    });

    it("should calculate basic type advantages without abilities", () => {
      expect(typeCheckOnBattle(mockBattle, "불꽃", "풀", null)).toBe(2);
    });

    it("should apply '부유' (Levitate) ability for Ground-type immunity", () => {
      mockBattle.npc.abil = "부유";
      expect(typeCheckOnBattle(mockBattle, "땅", "전기", null)).toBe(0);
    });

    it("should ignore '부유' (Levitate) if attacker has '틀깨기' (Mold Breaker) feature", () => {
      mockBattle.npc.abil = "부유";
      mockBattle.player.abilObj = { feature: { tgg: true } };
      expect(typeCheckOnBattle(mockBattle, "땅", "전기", null)).toBe(2);
    });

    it("should apply '풍선' (Air Balloon) item for Ground-type immunity", () => {
      mockBattle.npc.item = "풍선";
      expect(typeCheckOnBattle(mockBattle, "땅", "전기", null)).toBe(0);
    });

    it("should apply '심안' (Mind's Eye) ability to hit Ghost types with Normal/Fighting moves", () => {
      mockBattle.player.abil = "심안";
      
      // Normally 0x
      expect(typeCheckOnBattle(mockBattle, "노말", "고스트", null)).toBe(1);
      expect(typeCheckOnBattle(mockBattle, "격투", "고스트", null)).toBe(1);
      expect(typeCheckOnBattle(mockBattle, "격투", "노말", "고스트")).toBe(2); // 고스트 무시, 노말에 2배
    });

    it("should still give 0x if Ghost type but skill is not Normal or Fighting (Mind's Eye)", () => {
      mockBattle.player.abil = "심안";
      // 심안 doesn't help with Poison vs Steel, etc.
      expect(typeCheckOnBattle(mockBattle, "독", "강철", null)).toBe(0);
    });
  });
});
