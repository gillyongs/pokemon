// npm test -- src/test/tyranitar.test.js
import { generate } from "../entity/Pokemon/PokemonInstance";
import Battle from "../entity/Battle";
import { applyAbilityEffects } from "../entity/Ability";
import { damageCalculate } from "../util/damageCalculate";
import { turnEnd } from "../service/turnEnd";
import { handleWeatherDamageTurnEnd } from "../entity/Field/Weather";

describe("마기라스 및 돌격조끼/스톤샤워 구현 테스트", () => {
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

  it("마기라스 템플릿 생성, 기술배치, 지닌도구(돌격조끼), 특성(모래날림), 타입(바위/악) 확인", () => {
    const tt = generate("마기라스");

    expect(tt.item).toBe("돌격조끼");
    expect(tt.abil).toBe("모래날림");
    expect(tt.type1).toBe("바위");
    expect(tt.type2).toBe("악");
    expect(tt.origin.pokemon_id).toBe("0248");

    // 기술배치 4개 확인: 지진 / 깨물어부수기 / 스톤샤워 / 탁쳐서떨구기
    const skills = [
      tt.origin.skill[1].name,
      tt.origin.skill[2].name,
      tt.origin.skill[3].name,
      tt.origin.skill[4].name,
    ];
    expect(skills).toEqual(["지진", "깨물어부수기", "스톤샤워", "탁쳐서떨구기"]);

    // 스톤샤워 스펙 확인
    const rockSlide = tt.origin.skill[3];
    expect(rockSlide.type).toBe("바위");
    expect(rockSlide.power).toBe(75);
    expect(rockSlide.accur).toBe(90);
    expect(rockSlide.skillEffectList[0]).toEqual({ name: "풀죽음", probability: 30 });
  });

  it("마기라스 등장 시 모래날림 특성으로 모래바람이 발생해야 한다", () => {
    const player = generate("마기라스");
    const enemy = generate("윈디");
    const b1 = generate("패리퍼");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(player, enemy, b1, b2, eb1, eb2);

    applyAbilityEffects(battle, "player", queueObject.enqueue);

    expect(battle.field.weather.get()).toBe("모래바람");
    expect(battle.field.weather.isSandstorm).toBe(true);
  });

  it("마기라스는 모래바람(1.5배)과 돌격조끼(1.5배)로 특수방어가 2.25배로 계산되어야 한다", () => {
    const attacker = generate("썬더"); // 10만볼트 (특수)
    const defender = generate("마기라스");
    const b1 = generate("패리퍼");
    const b2 = generate("마릴리");
    const eb1 = generate("윈디");
    const eb2 = generate("파르셀");

    const battle = new Battle(attacker, defender, b1, b2, eb1, eb2);
    battle.turn.atk = "player";
    battle.turn.def = "npc";
    battle.turn.atkSN = 1; // 10만볼트
    attacker.turn.useSkill = attacker.origin.skill[1];

    // 모래바람 전개
    battle.field.weather.setWeatherOnBattle(battle, queueObject.enqueue, defender, "모래바람", "모래바람");

    damageCalculate(battle, null, { randNum: 100 });

    // 돌격조끼 1.5배 및 모래바람+바위 1.5배 둘 다 반영 확인
    expect(attacker.log.damage1).toContain("* 1.5 (돌격조끼)");
    expect(attacker.log.damage1).toContain("* 1.5 (모래바람+바위)");
  });

  it("handleWeatherDamageTurnEnd가 weather.js에서 import되어 턴 종료 시 올바르게 동작해야 한다", () => {
    const player = generate("마기라스"); // 바위/악 (모래바람 면역)
    const enemy = generate("윈디"); // 불꽃 (피해 대상)
    const b1 = generate("패리퍼");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(player, enemy, b1, b2, eb1, eb2);
    battle.field.weather.setWeatherOnBattle(battle, queueObject.enqueue, player, "모래바람", "모래바람 시작");

    const enemyHpBefore = enemy.hp;

    // handleWeatherDamageTurnEnd 개별 호출 확인
    handleWeatherDamageTurnEnd(battle, queueObject.enqueue, "player");
    expect(player.hp).toBe(player.origin.hp); // 면역

    handleWeatherDamageTurnEnd(battle, queueObject.enqueue, "npc");
    expect(enemy.hp).toBe(enemyHpBefore - Math.floor(enemy.origin.hp / 16));

    // 전체 turnEnd에서도 에러 없이 2번 호출되어 정상 동작 확인
    turnEnd(battle, queueObject.enqueue);
  });
});
