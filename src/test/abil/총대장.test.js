// npm test -- src/test/abil/총대장.test.js
import { damageCalculate } from "../../util/damageCalculate";

describe("총대장 특성 테스트", () => {
  let mockBattle;

  const createMockPokemon = (abil) => ({
    name: "테스트몬",
    names: "테스트몬은(는)",
    type1: "노말",
    type2: null,
    abil: abil,
    abilObj: {},
    item: "없음",
    hp: 100,
    origin: {
      hp: 100,
      skill: {
        1: { name: "테스트기술", type: "노말", stype: "atk", power: 40, feature: {}, skillEffectList: [] },
      },
      stat: { atk: 100, def: 100, catk: 100, cdef: 100 },
      abil: abil,
    },
    atk: 100,
    def: 100,
    catk: 100,
    cdef: 100,
    level: 50,
    tempStatus: {
      rank: { atk: 0, def: 0, catk: 0, cdef: 0 },
      charge: false,
    },
    ailment: { burn: null },
    turn: {
      useSkill: { name: "테스트기술", type: "노말", stype: "atk", power: 40, feature: {}, skillEffectList: [] },
      critical: false,
    },
    log: { damage1: "", damage2: "", damage3: "" },
  });

  beforeEach(() => {
    mockBattle = {
      turn: { atk: "player", def: "npc", atkSN: 1 },
      field: {
        weather: { isSunny: false, isRainy: false, get: () => null },
        terrain: { isElectricField: false, get: () => null },
        player: { noClean: { reflect: false, lightScreen: false } },
        npc: { noClean: { reflect: false, lightScreen: false } },
      },
      player: createMockPokemon("총대장"),
      playerBench1: createMockPokemon("없음"),
      playerBench2: createMockPokemon("없음"),
      npc: createMockPokemon("없음"),
      npcBench1: createMockPokemon("없음"),
      npcBench2: createMockPokemon("없음"),
    };
  });

  it("1. 기절한 아군이 없을 때 위력은 증가하지 않는다", () => {
    mockBattle.playerBench1.hp = 100;
    mockBattle.playerBench2.hp = 100;

    const damage = damageCalculate(mockBattle, null, { randNum: 100 });
    
    expect(mockBattle.player.log.damage1).not.toContain("(총대장)");
    expect(damage).toBe(19); // (22 * 40 * 100 / 50 / 100) = 17.6 -> floor(17.6)+2 = 19
  });

  it("2. 기절한 아군이 1명일 때 위력이 1.1배 증가한다", () => {
    mockBattle.playerBench1.hp = 0; // 기절
    mockBattle.playerBench2.hp = 100;

    const damage = damageCalculate(mockBattle, null, { randNum: 100 });
    
    expect(mockBattle.player.log.damage1).toContain("* 1.1 (총대장)");
    // 17.6 * 1.1 = 19.36 -> floor(19.36) + 2 = 21
    expect(damage).toBe(21);
  });

  it("3. 기절한 아군이 2명일 때 위력이 1.2배 증가한다", () => {
    mockBattle.playerBench1.hp = 0;
    mockBattle.playerBench2.hp = -10; // 0 이하도 포함되는지 확인

    const damage = damageCalculate(mockBattle, null, { randNum: 100 });
    
    expect(mockBattle.player.log.damage1).toContain("* 1.2 (총대장)");
    // 17.6 * 1.2 = 21.12 -> floor(21.12) + 2 = 23
    expect(damage).toBe(23);
  });

  it("4. npc가 총대장일 때 npc 진영의 기절한 아군 수를 기준으로 위력이 증가한다", () => {
    mockBattle.turn.atk = "npc";
    mockBattle.turn.def = "player";
    mockBattle.npc = createMockPokemon("총대장");
    
    // player 쪽이 기절해있어도 npc의 위력은 오르지 않아야 함
    mockBattle.playerBench1.hp = 0; 
    // npc 쪽 아군 1명 기절
    mockBattle.npcBench1.hp = 0;

    const damage = damageCalculate(mockBattle, null, { randNum: 100 });
    
    expect(mockBattle.npc.log.damage1).toContain("* 1.1 (총대장)");
    expect(damage).toBe(21);
  });
});
