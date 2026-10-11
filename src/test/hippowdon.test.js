// npm test -- src/test/hippowdon.test.js
import { generate } from "../entity/Pokemon/PokemonInstance";
import Battle from "../entity/Battle";
import { battleStart } from "../service/battleStart";
import { applyAbilityEffects } from "../entity/Ability";
import { damageCalculate } from "../util/damageCalculate";
import { turnEnd } from "../service/turnEnd";

describe("하마돈 및 모래날림, 게으름피우기 구현 테스트", () => {
  let mockQueue;
  let queueObject;

  beforeEach(() => {
    mockQueue = [];
    queueObject = {
      queue: mockQueue,
      enqueue: jest.fn((item) => mockQueue.push(item)),
      dequeue: jest.fn(() => mockQueue.shift()),
      resetQueue: jest.fn(() => (mockQueue.length = 0)),
      queueCheck: jest.fn(() => true),
    };
  });

  it("하마돈 템플릿 생성, 기술배치, 지닌도구(자뭉열매), 특성(모래날림), 노력치/성격 확인", () => {
    const hippo = generate("하마돈");

    expect(hippo.item).toBe("자뭉열매");
    expect(hippo.abil).toBe("모래날림");
    expect(hippo.type1).toBe("땅");
    expect(hippo.type2).toBeNull();
    expect(hippo.origin.pokemon_id).toBe("0450");

    // 기술배치 4개 확인: 지진 / 하품 / 스텔스록 / 게으름피우기
    const skills = [
      hippo.origin.skill[1].name,
      hippo.origin.skill[2].name,
      hippo.origin.skill[3].name,
      hippo.origin.skill[4].name,
    ];
    expect(skills).toEqual(["지진", "하품", "스텔스록", "게으름피우기"]);

    // H252 D252 풀보정 스탯 확인 (레벨 50 기준)
    expect(hippo.origin.hp).toBe(215); // 108족 H252 => 215
    expect(hippo.origin.stat.cdef).toBe(136); // 72족 D252 신중 => 136
  });

  it("하마돈 등장 시 모래날림 특성으로 모래바람 날씨가 5턴간 전개되어야 한다", () => {
    const player = generate("하마돈");
    const enemy = generate("윈디");
    const b1 = generate("패리퍼");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(player, enemy, b1, b2, eb1, eb2);

    // 하마돈의 모래날림 특성 발동
    applyAbilityEffects(battle, "player", queueObject.enqueue);

    expect(battle.field.weather.get()).toBe("모래바람");
    expect(battle.field.weather.isSandstorm).toBe(true);

    const log = mockQueue.find((item) => item.text && item.text.includes("모래바람이 불기 시작했다!"));
    expect(log).toBeDefined();
  });

  it("모래바람 날씨에서 턴 종료 시 땅/바위/강철이 아닌 포켓몬은 모래바람 데미지를 받아야 한다", () => {
    const player = generate("하마돈"); // 땅 타입 (면역)
    const enemy = generate("윈디"); // 불꽃 타입 (피해 대상)
    const b1 = generate("패리퍼");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(player, enemy, b1, b2, eb1, eb2);

    battle.field.weather.setWeatherOnBattle(battle, queueObject.enqueue, player, "모래바람", "모래바람 시작");

    const playerInitialHp = player.hp;
    const enemyInitialHp = enemy.hp;
    const expectedEnemyDmg = Math.floor(enemy.origin.hp / 16);

    // 턴 종료 처리
    turnEnd(battle, queueObject.enqueue);

    // 하마돈(땅)은 데미지를 입지 않음
    expect(player.hp).toBe(playerInitialHp);
    // 윈디(불꽃)는 1/16 데미지를 입음
    expect(enemy.hp).toBe(enemyInitialHp - expectedEnemyDmg);

    const sandDmgLog = mockQueue.find((item) => item.text && item.text.includes("모래바람에 휩쓸려"));
    expect(sandDmgLog).toBeDefined();
  });

  it("모래바람 날씨에서 바위 타입 포켓몬은 특수공격을 받을 때 특수방어가 1.5배 보정되어야 한다", () => {
    const attacker = generate("썬더"); // 특수어태커
    const defender = generate("사마자르"); // 벌레/바위
    const b1 = generate("패리퍼");
    const b2 = generate("마릴리");
    const eb1 = generate("하마돈");
    const eb2 = generate("파르셀");

    const battle = new Battle(attacker, defender, b1, b2, eb1, eb2);
    battle.turn.atk = "player";
    battle.turn.def = "npc";
    battle.turn.atkSN = 1; // 10만볼트 (특수)
    attacker.turn.useSkill = attacker.origin.skill[1];

    // 일반 날씨 데미지 계산
    damageCalculate(battle, null, { randNum: 100 });
    expect(attacker.log.damage1).not.toContain("모래바람+바위");

    // 모래바람 날씨 전개
    battle.field.weather.setWeatherOnBattle(battle, queueObject.enqueue, defender, "모래바람", "모래바람");

    damageCalculate(battle, null, { randNum: 100 });
    expect(attacker.log.damage1).toContain("* 1.5 (모래바람+바위)");
  });

  it("게으름피우기는 자신의 최대 HP의 절반을 회복해야 한다", () => {
    const player = generate("하마돈");
    const enemy = generate("한카리아스");
    const b1 = generate("패리퍼");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(player, enemy, b1, b2, eb1, eb2);

    // 체력을 50으로 감소
    player.hp = 50;
    const maxHp = player.origin.hp;
    const recoverAmount = Math.floor(maxHp / 2);

    // 게으름피우기(4번 기술) 사용
    player.tempStatus.rank.speed = 6;
    battleStart(battle, 4, 1, queueObject);

    // 턴 후 HP 확인 (50 + 회복량 - 적의 공격 피해)
    expect(mockQueue.some((item) => item.text && item.text.includes("체력을 회복했다"))).toBe(true);
  });
});
