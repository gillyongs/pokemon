// npm test -- src/test/item/신비의물방울.test.js
import { damageCalculate } from "../../util/damageCalculate";

describe("신비의물방울 아이템 테스트", () => {
  let mockBattle;

  const createMockPokemon = (item, skillType) => ({
    name: "테스트몬",
    names: "테스트몬은(는)",
    type1: "노말", // 자속 보정을 받지 않기 위해 노말타입 부여
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
    // 1) 아이템을 장착하지 않았을 때의 데미지 계산 (랜덤난수 100 고정)
    mockBattle.player = createMockPokemon(null, "물");
    mockBattle.npc = createMockPokemon("없음", "노말");
    const damageWithoutItem = damageCalculate(mockBattle, null, { randNum: 100 });
    
    // 2) 아이템을 장착했을 때의 데미지 계산 (랜덤난수 100 고정)
    mockBattle.player = createMockPokemon("신비의물방울", "물");
    mockBattle.npc = createMockPokemon("없음", "노말");
    const damageWithItem = damageCalculate(mockBattle, null, { randNum: 100 });

    // 로그에 1.2배가 잘 찍혔는지 확인
    expect(mockBattle.player.log.damage1).toContain("* 1.2 (신비의물방울)");
    
    // 데미지 계산식: (22 * 40 * 100) / 50 / 100 = 17.6
    // 노템: floor(17.6) + 2 = 19
    // 템장착: floor(17.6 * 1.2) + 2 = floor(21.12) + 2 = 23
    // 포켓몬스터 데미지 계산식의 내림과 +2 연산 때문에 최종 데미지가 정확히 1.2배 차이는 아님 (19 vs 23)
    expect(damageWithoutItem).toBe(19);
    expect(damageWithItem).toBe(23);
  });

  it("2. 물타입이 아닌 기술을 사용하면 데미지가 증가하지 않는다", () => {
    // 1) 아이템을 장착하지 않았을 때 (노말 기술)
    mockBattle.player = createMockPokemon(null, "노말");
    mockBattle.npc = createMockPokemon("없음", "노말");
    const damageWithoutItem = damageCalculate(mockBattle, null, { randNum: 100 });

    // 2) 아이템을 장착했을 때 (노말 기술)
    mockBattle.player = createMockPokemon("신비의물방울", "노말");
    mockBattle.npc = createMockPokemon("없음", "노말");
    const damageWithItem = damageCalculate(mockBattle, null, { randNum: 100 });

    // 로그에 신비의물방울 배율이 찍히지 않아야 함
    expect(mockBattle.player.log.damage1).not.toContain("* 1.2 (신비의물방울)");

    // 데미지가 동일해야 함
    expect(damageWithItem).toBe(damageWithoutItem);
  });

  it("3. 아이템이 없으면 배율이 적용되지 않는다", () => {
    mockBattle.player = createMockPokemon(null, "물");
    mockBattle.npc = createMockPokemon("없음", "노말");

    damageCalculate(mockBattle);

    expect(mockBattle.player.log.damage1).not.toContain("* 1.2 (신비의물방울)");
  });
});
