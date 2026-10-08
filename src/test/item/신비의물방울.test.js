// npm test -- src/test/item/신비의물방울.test.js
import { damageCalculate } from "../../util/damageCalculate";

describe("신비의물방울 아이템 테스트", () => {
  let mockBattle;

  const createMockPokemon = (item, skillType) => ({
    name: "테스트몬",
    names: "테스트몬은",
    type1: "노말", // 자속 보정을 섞지 않기 위해 노말타입 부여
    type2: null,
    abil: "없음",
    abilObj: {},
    item,
    hp: 100,
    origin: {
      hp: 100,
      skill: {
        1: { name: "테스트기술", type: skillType, stype: "atk", power: 40, feature: {}, skillEffectList: [] },
      },
      stat: { atk: 100, def: 100, catk: 100, cdef: 100 },
      abil: "없음",
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
      useSkill: { name: "테스트기술", type: skillType, stype: "atk", power: 40, feature: {}, skillEffectList: [] },
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
    };
  });

  it("1. 신비의물방울을 지니고 물타입 기술을 사용하면 데미지가 1.2배 증가한다", () => {
    mockBattle.player = createMockPokemon("신비의물방울", "물");
    mockBattle.npc = createMockPokemon("없음", "노말");

    damageCalculate(mockBattle);

    // 로그에 1.2배가 잘 찍혔는지 확인
    expect(mockBattle.player.log.damage1).toContain("* 1.2 (신비의물방울)");
  });

  it("2. 물타입이 아닌 기술을 사용하면 데미지 보정이 적용되지 않는다", () => {
    mockBattle.player = createMockPokemon("신비의물방울", "노말");
    mockBattle.npc = createMockPokemon("없음", "노말");

    damageCalculate(mockBattle);

    // 로그에 신비의물방울 적용이 안 되었는지 확인
    expect(mockBattle.player.log.damage1).not.toContain("* 1.2 (신비의물방울)");
  });

  it("3. 아이템을 지니지 않으면 데미지 보정이 적용되지 않는다", () => {
    mockBattle.player = createMockPokemon(null, "물");
    mockBattle.npc = createMockPokemon("없음", "노말");

    damageCalculate(mockBattle);

    expect(mockBattle.player.log.damage1).not.toContain("* 1.2 (신비의물방울)");
  });
});
