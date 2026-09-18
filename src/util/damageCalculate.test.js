import { damageCalculate, confuseDamageCalculate } from "./damageCalculate";

describe("damageCalculate", () => {
  const createBasePokemon = () => ({
    name: "테스트몬",
    type1: "물",
    type2: null,
    origin: {
      hp: 100,
      stat: { atk: 100, def: 100, catk: 100, cdef: 100, spd: 100 },
      skill: [
        {
          name: "몸통박치기",
          type: "에스퍼",
          power: 40,
          stype: "atk", // 물리 공격
          feature: {},
          skillEffectList: [],
        },
      ],
      feature: {},
    },
    hp: 100,
    abil: null,
    abilObj: { feature: {} },
    item: null,
    tempStatus: {
      rank: { atk: 0, def: 0, catk: 0, cdef: 0, spd: 0 },
      protosynthesis: null,
      flashFire: false,
    },
    status: {
      burn: null,
      poison: null,
      mpoison: null,
      mabi: null,
      sleep: null,
      freeze: null,
    },
    turn: {
      critical: false,
      useSkill: true,
      recentDamageGet: 0,
    },
    log: {},
    isFlying: () => false,
  });

  const createMockBattle = () => ({
    turn: {
      atk: "player",
      def: "npc",
      atkSN: 0,
      fastActUser: "player",
    },
    player: createBasePokemon(),
    npc: createBasePokemon(),
    field: {
      player: { noClean: { reflect: false, lightScreen: false } },
      npc: { noClean: { reflect: false, lightScreen: false } },
      weather: {
        get: () => null,
        isSunny: false,
      },
      terrain: {
        get: () => null,
        isElectricField: false,
      },
    },
  });

  let mockBattle;

  beforeEach(() => {
    mockBattle = createMockBattle();
    // 0~100 사이 랜덤값이 관여하므로 모의 함수로 강제 고정 가능하면 좋으나,
    // 내부적으로 모듈 스코프의 getRandomNumber()가 있으므로 결과가 범위로 나오는지 검증
  });

  it("should calculate basic damage within a reasonable range", () => {
    // atkStat = 100, defStat = 100, power = 40, level = 50 
    // 고정 공식: (22 * 40 * 100) / 50 / 100 = 17.6 -> floor: 17
    // 17 + 2 = 19
    // 자속 보정(1.5): 19 * 1.5 = 28.5 (보통 반올림/내림 처리)
    // 랜덤 보정 (0.85 ~ 1.0)
    
    // 강제로 자속 보정 제거
    mockBattle.player.origin.skill[0].type = "격투"; 
    
    const damage = damageCalculate(mockBattle, null, false);
    
    // (17 + 2) = 19
    // 19 * 랜덤값(85~100)/100 = 16.15 ~ 19
    expect(damage).toBeGreaterThanOrEqual(16);
    expect(damage).toBeLessThanOrEqual(19);
  });

  it("should apply STAB (Same Type Attack Bonus)", () => {
    mockBattle.player.origin.skill[0].type = "노말"; 
    mockBattle.player.type1 = "노말";
    
    const damage = damageCalculate(mockBattle, null, false);
    
    // 19 * 1.5 (자속) = 28.5 -> floor/랜덤 등
    // 28.5 * 0.85 ~ 1.0 = 24.225 ~ 28.5
    expect(damage).toBeGreaterThanOrEqual(24);
    expect(damage).toBeLessThanOrEqual(28);
  });

  it("should apply Adaptability (적응력) for 2x STAB", () => {
    mockBattle.player.origin.skill[0].type = "노말"; 
    mockBattle.player.type1 = "노말";
    mockBattle.player.abil = "적응력";
    
    const damage = damageCalculate(mockBattle, null, false);
    
    // 19 * 2 (적응력) = 38
    // 38 * 0.85 ~ 1.0 = 32.3 ~ 38
    expect(damage).toBeGreaterThanOrEqual(32);
    expect(damage).toBeLessThanOrEqual(38);
  });

  it("should apply critical hit modifier (1.5x)", () => {
    mockBattle.player.origin.skill[0].type = "격투"; // No STAB
    mockBattle.player.turn.critical = true;
    
    const damage = damageCalculate(mockBattle, null, false);
    
    // 19 * 1.5 (급소) = 28.5
    // 28.5 * 0.85 ~ 1.0 = 24.225 ~ 28.5
    expect(damage).toBeGreaterThanOrEqual(24);
    expect(damage).toBeLessThanOrEqual(28);
  });

  it("should apply weather multipliers (Rain + Water = 1.5x)", () => {
    mockBattle.player.origin.skill[0].type = "물";
    mockBattle.field.weather.get = () => "비";
    
    const damage = damageCalculate(mockBattle, null, false);
    // (17+2) * 1.5 (날씨) = 28 -> * 1.5 (자속) = 42 -> * 0.5 (상성) = 21
    // 21 * 0.85 ~ 1.0 = 17.85 ~ 21
    expect(damage).toBeGreaterThanOrEqual(17);
    expect(damage).toBeLessThanOrEqual(21);
  });

  it("should calculate fixed damage for one-shot moves", () => {
    mockBattle.player.origin.skill[0].feature = { oneShot: true };
    mockBattle.npc.origin.hp = 120;
    mockBattle.npc.hp = 100;
    
    const damage = damageCalculate(mockBattle, null, false);
    // 일격기는 대상의 origin hp 리턴
    expect(damage).toBe(120); 
  });
  
  it("should ignore stat drops on attacker if critical hit", () => {
    mockBattle.player.origin.skill[0].type = "격투"; // No STAB
    mockBattle.player.turn.critical = true;
    mockBattle.player.tempStatus.rank.atk = -2; // 0.5배 공격력
    
    const damage = damageCalculate(mockBattle, null, false);
    // 랭크 다운 무시, 급소 1.5배 적용됨. 24~28
    expect(damage).toBeGreaterThanOrEqual(24);
    expect(damage).toBeLessThanOrEqual(28);
  });

  it("should apply burn effect (-50% damage for physical attacks)", () => {
    mockBattle.player.origin.skill[0].type = "격투"; // No STAB
    mockBattle.player.status.burn = true; // 화상
    
    const damage = damageCalculate(mockBattle, null, false);
    
    // 공격력 절반 -> (22 * 40 * 50) / 50 / 100 = 8.8 -> 8
    // 8 + 2 = 10
    // 10 * 0.85 ~ 1.0 = 8.5 ~ 10
    expect(damage).toBeGreaterThanOrEqual(8);
    expect(damage).toBeLessThanOrEqual(10);
  });

  it("should ignore burn effect if ability is Guts (근성)", () => {
    mockBattle.player.origin.skill[0].type = "격투";
    mockBattle.player.status.burn = true;
    mockBattle.player.abil = "근성";
    
    const damage = damageCalculate(mockBattle, null, false);
    
    // 근성이면 화상 무시 및 공격력 1.5배
    // (22 * 40 * 150) / 50 / 100 = 26.4 -> 26
    // 26 + 2 = 28
    // 28 * 0.85 ~ 1.0 = 23.8 ~ 28
    expect(damage).toBeGreaterThanOrEqual(23);
    expect(damage).toBeLessThanOrEqual(28);
  });
});
