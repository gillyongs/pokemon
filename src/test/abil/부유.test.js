// npm test -- src/test/abil/부유.test.js
import { typeCheckOnBattle } from "../../util/typeEffectCalculate";

describe("부유 특성 테스트", () => {
  let mockBattle;

  const createMockPokemon = (abil) => ({
    type1: "노말",
    type2: null,
    abil: abil,
    abilObj: abil === "틀깨기" ? { feature: { tgg: true } } : {},
    item: "없음",
  });

  beforeEach(() => {
    mockBattle = {
      player: createMockPokemon("부유"),
      npc: createMockPokemon("없음"),
    };
  });

  it("1. 부유 특성은 땅타입 기술에 데미지를 입지 않는다 (상성 0배)", () => {
    const atkPokemon = mockBattle.npc;
    const defPokemon = mockBattle.player;
    const skill = { type: "땅" };

    const multiplier = typeCheckOnBattle(atkPokemon, defPokemon, skill);
    expect(multiplier).toBe(0);
  });

  it("2. 공격자가 틀깨기 특성일 경우 부유 특성을 무시하고 데미지를 입힌다", () => {
    mockBattle.npc = createMockPokemon("틀깨기");
    
    const atkPokemon = mockBattle.npc;
    const defPokemon = mockBattle.player; // 부유 특성 (단일 노말 타입)
    const skill = { type: "땅" };

    const multiplier = typeCheckOnBattle(atkPokemon, defPokemon, skill);
    
    // 땅 타입 기술이 노말 타입에게 명중하므로 상성은 1배여야 함
    expect(multiplier).toBe(1);
  });

  it("3. 부유 특성이어도 땅타입이 아닌 기술은 정상적으로 데미지를 입는다", () => {
    const atkPokemon = mockBattle.npc;
    const defPokemon = mockBattle.player;
    const skill = { type: "불꽃" };

    const multiplier = typeCheckOnBattle(atkPokemon, defPokemon, skill);
    expect(multiplier).toBe(1);
  });
});
