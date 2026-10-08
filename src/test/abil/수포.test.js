// npm test -- src/test/abil/수포.test.js
import { damageCalculate } from "../../util/damageCalculate";
import { applyAilment } from "../../function/ailment";

describe("수포(Water Bubble) 특성 테스트", () => {
  let mockBattle;
  let mockEnqueue;

  const createMockPokemon = (name, abil, skillType = "물", type1 = "벌레", type2 = "물") => ({
    name,
    names: require("josa").josa(`${name}#{은}`),
    type1,
    type2,
    abil,
    abilObj: { feature: abil === "틀깨기" ? { tgg: true } : {} },
    item: null,
    hp: 100,
    origin: {
      hp: 100,
      skill: {
        1: { name: "테스트기술", type: skillType, stype: "atk", power: 40, feature: {}, skillEffectList: [] },
      },
      stat: { atk: 100, def: 100, catk: 100, cdef: 100 },
      abil,
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
    status: { burn: null, poison: null, paralysis: null, sleep: null, freeze: null },
    turn: {
      useSkill: { name: "테스트기술", type: skillType, stype: "atk", power: 40, feature: {}, skillEffectList: [] },
      critical: false,
    },
    log: { damage1: "", damage2: "", damage3: "" },
  });

  beforeEach(() => {
    mockEnqueue = jest.fn();
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

  it("1. 수포 특성일 때 자신의 물타입 기술 위력이 2배가 된다", () => {
    mockBattle.player = createMockPokemon("깨비물거미", "수포", "물"); // 물타입 기술 사용
    mockBattle.npc = createMockPokemon("상대몬", "없음", "노말");

    damageCalculate(mockBattle);

    // 공격자의 데미지 로그에 * 2 (수포)가 찍혔는지 확인
    expect(mockBattle.player.log.damage1).toContain("* 2 (수포)");
  });

  it("1-1. 수포 특성이어도 물타입 기술이 아니면 위력이 2배가 되지 않는다", () => {
    mockBattle.player = createMockPokemon("깨비물거미", "수포", "벌레"); // 벌레타입 기술 사용
    mockBattle.npc = createMockPokemon("상대몬", "없음", "노말");

    damageCalculate(mockBattle);

    expect(mockBattle.player.log.damage1).not.toContain("* 2 (수포)");
  });

  it("2. 수포 특성일 때 상대의 불꽃타입 기술 데미지를 반감(0.5배)시킨다", () => {
    // 상대가 불꽃타입 기술로 공격
    mockBattle.player = createMockPokemon("상대몬", "없음", "불꽃");
    mockBattle.npc = createMockPokemon("깨비물거미", "수포", "물");

    damageCalculate(mockBattle);

    // 상대(공격자)의 데미지 로그에 * 0.5 (수포 방어)가 찍혔는지 확인
    expect(mockBattle.player.log.damage1).toContain("* 0.5 (수포 방어)");
  });

  it("3. 공격자가 '틀깨기' 특성일 경우, 수포의 불꽃 데미지 반감을 무시한다", () => {
    // 상대가 틀깨기 특성으로 불꽃타입 기술 사용
    mockBattle.player = createMockPokemon("상대몬", "틀깨기", "불꽃");
    mockBattle.npc = createMockPokemon("깨비물거미", "수포", "물");

    damageCalculate(mockBattle);

    // 틀깨기에 의해 수포의 방어 효과가 무시되었으므로 반감 로그가 없어야 함
    expect(mockBattle.player.log.damage1).not.toContain("* 0.5 (수포 방어)");
  });

  it("4. 수포 특성인 포켓몬은 화상 상태이상에 걸리지 않으며, 실패 텍스트가 출력된다 (도깨비불)", () => {
    mockBattle.npc = createMockPokemon("깨비물거미", "수포", "물");

    // NPC에게 화상을 걸어봄 (도깨비불처럼 printTextIfFail: true 속성을 넘김)
    applyAilment("화상", mockBattle, "npc", mockEnqueue, true);

    // 상태이상이 null로 유지되어야 함
    expect(mockBattle.npc.status.burn).toBeNull();

    // 도깨비불 실패 시 "하지만 실패했다!"가 출력되는지 검증
    expect(mockEnqueue).toHaveBeenCalledWith({
      battle: mockBattle,
      text: "하지만 실패했다!",
    });
  });

  it("5. 공격자의 특성이 '틀깨기'이면 수포인 포켓몬한테 화상을 걸 수 있다", () => {
    mockBattle.npc = createMockPokemon("깨비물거미", "수포", "물");
    mockBattle.player = createMockPokemon("상대몬", "틀깨기", "불꽃");
    // 틀깨기 특성자가 기술을 사용하는 상황 시뮬레이션
    mockBattle.player.tempStatus.recentSkillUse = true;

    applyAilment("화상", mockBattle, "npc", mockEnqueue, true);

    // 수포라도 틀깨기에 의해 화상에 걸림
    expect(mockBattle.npc.status.burn).toBe(true);
    // 화상에 걸렸다는 문구가 뜨는지 확인 (josa 패키지 적용 안된 문자열 직접 비교 대신 정규식 등을 사용할 수도 있음)
    // 여기서는 mock의 names 속성이 제대로 들어갔는지 확인
    expect(mockEnqueue).toHaveBeenCalledWith({
      battle: mockBattle,
      text: `${mockBattle.npc.names} 화상을 입었다!`,
    });
  });

  it("6. 수포인 포켓몬이 화상에 걸려있어도 턴 종료 시 치료된다", () => {
    mockBattle.npc = createMockPokemon("깨비물거미", "수포", "물");
    mockBattle.player = createMockPokemon("상대몬", "없음", "노말");

    // 강제로 화상 부여
    mockBattle.npc.status.burn = true;

    // turnEnd에서 호출되는 processAilment 직접 실행
    const { processAilment } = require("../../service/turnEnd/ailmentEvent");

    processAilment(mockBattle, mockEnqueue, "player", "npc");

    // 화상이 지워졌는지 확인
    expect(mockBattle.npc.status.burn).toBeNull();
    // 텍스트 출력 검증
    expect(mockEnqueue).toHaveBeenCalledWith({
      battle: mockBattle,
      text: "[특성 수포] 깨비물거미의 화상이 나았다!",
    });
  });
});
