// npm test -- src/test/abil/급류.test.js
import { damageCalculate } from "../../util/damageCalculate";

describe("급류 특성 테스트", () => {
  let mockBattle;

  const createMockPokemon = (hp, originHp, abil, skillType) => ({
    name: "테스트몬",
    names: "테스트몬은",
    type1: "물",
    type2: null,
    abil,
    abilObj: {},
    item: null,
    hp,
    origin: {
      hp: originHp,
      skill: {
        1: { name: "테스트기술", type: skillType, stype: "atk", power: 40, feature: {}, skillEffectList: [] },
      },
      stat: { atk: 100, def: 100, catk: 100, cdef: 100 },
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

  const createDefMockPokemon = () => ({
    name: "상대몬",
    names: "상대몬은",
    type1: "노말",
    type2: null,
    abil: "없음",
    abilObj: {},
    item: null,
    hp: 100,
    origin: { 
      hp: 100,
      stat: { atk: 100, def: 100, catk: 100, cdef: 100 },
    },
    atk: 100,
    def: 100,
    catk: 100,
    cdef: 100,
    level: 50,
    tempStatus: {
      rank: { atk: 0, def: 0, catk: 0, cdef: 0 },
    },
    ailment: { burn: null },
    turn: { protect: false },
    log: {},
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

  it("1. 체력 1/3 이하일 때 물타입 기술 데미지 보정 (1.5배) 적용", () => {
    // 체력이 딱 1/3인 경우 (33 / 100) -> 급류 발동
    mockBattle.player = createMockPokemon(33, 100, "급류", "물");
    mockBattle.npc = createDefMockPokemon();

    const damage = damageCalculate(mockBattle);
    
    // 로그에 급류가 기록되었는지 확인
    expect(mockBattle.player.log.damage1).toContain("* 1.5 (급류)");
    
    // 데미지가 급류가 없을 때보다 1.5배가 되는지는 로그 텍스트를 통해 증명됨
    // (데미지 계산식 내 랜덤값 때문에 정확한 데미지 수치 비교는 오차가 있을 수 있지만
    // 1.5배 보정 적용 여부는 로그로 확실히 판단 가능합니다.)
  });

  it("2. 체력 1/3 초과일 때 데미지 보정 미적용", () => {
    // 체력이 1/3보다 큰 경우 (34 / 100) -> 급류 미발동
    mockBattle.player = createMockPokemon(34, 100, "급류", "물");
    mockBattle.npc = createDefMockPokemon();

    const damage = damageCalculate(mockBattle);

    expect(mockBattle.player.log.damage1).not.toContain("* 1.5 (급류)");
  });

  it("3. 물타입 기술이 아닐 때 체력이 1/3 이하여도 데미지 보정 미적용", () => {
    // 체력은 1/3 이하이지만 기술이 노말 타입
    mockBattle.player = createMockPokemon(33, 100, "급류", "노말");
    mockBattle.npc = createDefMockPokemon();

    const damage = damageCalculate(mockBattle);

    expect(mockBattle.player.log.damage1).not.toContain("* 1.5 (급류)");
  });
});
