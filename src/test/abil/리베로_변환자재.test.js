// npm test -- src/test/abil/리베로_변환자재.test.js
import { afterSkillCheck } from "../../service/skillCheck";
import { damageCalculate } from "../../util/damageCalculate";

describe("리베로 및 변환자재 특성 테스트", () => {
  let mockBattle;
  let enqueuedLogs;

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
        1: { name: "화염방사", type: "불꽃", stype: "catk", power: 90, accur: 100, feature: {}, skillEffectList: [] },
      },
      stat: { atk: 100, def: 100, catk: 100, cdef: 100 },
      abil: abil,
    },
    atk: 100,
    def: 100,
    catk: 100,
    cdef: 100,
    level: 50,
    faint: false,
    tempStatus: {
      rank: { atk: 0, def: 0, catk: 0, cdef: 0 },
      charge: false,
    },
    ailment: { burn: null },
    turn: {
      useSkill: { name: "화염방사", type: "불꽃", stype: "catk", power: 90, accur: 100, feature: {}, skillEffectList: [] },
      critical: false,
      protect: false,
    },
    log: { damage1: "", damage2: "", damage3: "" },
  });

  beforeEach(() => {
    enqueuedLogs = [];
    mockBattle = {
      turn: { atk: "player", def: "npc", atkSN: 1 },
      field: {
        weather: { isSunny: false, isRainy: false, get: () => null },
        terrain: { isElectricField: false, get: () => null },
        player: { noClean: { reflect: false, lightScreen: false } },
        npc: { noClean: { reflect: false, lightScreen: false } },
      },
      player: createMockPokemon("리베로"),
      npc: createMockPokemon("없음"),
    };
  });

  const mockEnqueue = (log) => {
    enqueuedLogs.push(log.text);
  };

  it("1. 리베로 특성인 경우 사용한 기술의 타입(불꽃)으로 타입이 변한다", () => {
    // afterSkillCheck 실행
    afterSkillCheck(mockBattle, mockEnqueue);

    // 1) 타입 변경 확인
    expect(mockBattle.player.type1).toBe("불꽃");
    expect(mockBattle.player.type2).toBe(null);

    // 2) 로그 출력 확인
    const hasLog = enqueuedLogs.some(log => log.includes("[리베로]") && log.includes("불꽃 타입이 됐다!"));
    expect(hasLog).toBe(true);

    // 3) 자속 보정(STAB) 데미지 확인
    const damage = damageCalculate(mockBattle, null, { randNum: 100 });
    expect(mockBattle.player.log.damage1).toContain("* 1.5 (자속보정)");
  });

  it("2. 변환자재 특성인 경우 사용한 기술의 타입(불꽃)으로 타입이 변한다", () => {
    mockBattle.player = createMockPokemon("변환자재");

    afterSkillCheck(mockBattle, mockEnqueue);

    expect(mockBattle.player.type1).toBe("불꽃");
    expect(mockBattle.player.type2).toBe(null);

    const hasLog = enqueuedLogs.some(log => log.includes("[변환자재]") && log.includes("불꽃 타입이 됐다!"));
    expect(hasLog).toBe(true);
    
    // 자속 보정 적용 확인
    const damage = damageCalculate(mockBattle, null, { randNum: 100 });
    expect(mockBattle.player.log.damage1).toContain("* 1.5 (자속보정)");
  });

  it("3. 이미 기술과 같은 타입이라면 발동하지 않는다", () => {
    mockBattle.player.type1 = "불꽃";
    
    afterSkillCheck(mockBattle, mockEnqueue);

    // 로그가 찍히지 않아야 함
    const hasLog = enqueuedLogs.some(log => log.includes("[리베로]"));
    expect(hasLog).toBe(false);
  });
});
