// npm test -- src/test/pelipper.test.js
import { generate } from "../entity/Pokemon/PokemonInstance";
import Battle from "../entity/Battle";
import { applyAbilityEffects } from "../entity/Ability";
import { damageCalculate } from "../util/damageCalculate";
import { applySkillEffects } from "../service/skillEffect";
import { speedCheck, speedCalculate } from "../util/speedCheck";

describe("패리퍼 구현 및 특성/도구 테스트", () => {
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

  it("패리퍼 템플릿 생성 및 기술배치, 지닌물건, 특성(잔비) 확인", () => {
    const pelipper = generate("패리퍼");

    expect(pelipper.item).toBe("축축한바위");
    expect(pelipper.abil).toBe("잔비");
    expect(pelipper.type1).toBe("물");
    expect(pelipper.type2).toBe("비행");
    expect(pelipper.origin.pokemon_id).toBe("0279");

    // 기술배치 4개 확인: 하이드로펌프 / 폭풍 / 유턴 / 순풍
    const skills = [
      pelipper.origin.skill[1].name,
      pelipper.origin.skill[2].name,
      pelipper.origin.skill[3].name,
      pelipper.origin.skill[4].name,
    ];
    expect(skills).toEqual(["하이드로펌프", "폭풍", "유턴", "순풍"]);

    // 신규 기술 하이드로펌프 스펙 확인
    const hydroPump = pelipper.origin.skill[1];
    expect(hydroPump.type).toBe("물");
    expect(hydroPump.power).toBe(110);
    expect(hydroPump.accur).toBe(80);
    expect(hydroPump.stype).toBe("catk");

    // 신규 기술 순풍 스펙 확인
    const tailwind = pelipper.origin.skill[4];
    expect(tailwind.type).toBe("비행");
    expect(tailwind.stype).toBe("buf");
  });

  it("배틀 등장 시 잔비 특성과 축축한바위 효과로 8턴 지속의 비가 내려야 한다", () => {
    const pelipper = generate("패리퍼");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(pelipper, enemy, b1, b2, eb1, eb2);

    // 특성 발동
    applyAbilityEffects(battle, "player", queueObject.enqueue);

    expect(battle.field.weather.get()).toBe("비");
    expect(battle.field.weather.isRainy).toBe(true);

    const rainText = mockQueue.find((item) => item.text && item.text.includes("비가 내리기 시작했다"));
    expect(rainText).toBeDefined();

    // 턴 종료 7회 진행 후에도 비가 유지되어야 함 (8턴 지속)
    for (let i = 0; i < 7; i++) {
      battle.field.weather.handleWeatherTurnEnd(battle, queueObject.enqueue);
      expect(battle.field.weather.isRainy).toBe(true);
    }

    // 8번째 턴 종료 시 비가 그침
    battle.field.weather.handleWeatherTurnEnd(battle, queueObject.enqueue);
    expect(battle.field.weather.isRainy).toBe(false);
    expect(battle.field.weather.get()).toBeNull();
  });

  it("비 날씨에서 하이드로펌프 사용 시 비 보정(1.5배)이 데미지 계산에 반영되어야 한다", () => {
    const pelipper = generate("패리퍼");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(pelipper, enemy, b1, b2, eb1, eb2);

    // 날씨 비 세팅
    applyAbilityEffects(battle, "player", queueObject.enqueue);

    battle.turn.atk = "player";
    battle.turn.def = "npc";
    battle.turn.atkSN = 1;
    pelipper.turn.useSkill = pelipper.origin.skill[1]; // 하이드로펌프

    damageCalculate(battle, null, { randNum: 100 });

    expect(pelipper.log.damage1).toContain("* 1.5 (비+물)");
  });

  it("순풍 사용 시 아군 필드에 4턴 순풍이 발동하여 스피드가 2배가 되고, 4턴 후 해제되어야 한다", () => {
    const pelipper = generate("패리퍼");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(pelipper, enemy, b1, b2, eb1, eb2);
    battle.turn.atk = "player";
    battle.turn.def = "npc";
    pelipper.turn.useSkill = pelipper.origin.skill[4]; // 순풍

    const baseSpeed = speedCalculate(pelipper, pelipper.origin.stat.speed, battle);

    // 순풍 사용
    applySkillEffects(battle, queueObject.enqueue);

    expect(battle.field.player.noClean.tailwind).toBe(4);
    const tailwindText = mockQueue.find((item) => item.text && item.text.includes("순풍이 불기 시작했다"));
    expect(tailwindText).toBeDefined();

    // 순풍 하에서 스피드가 2배로 계산되어야 함
    const tailwindSpeed = speedCalculate(pelipper, pelipper.origin.stat.speed, battle);
    expect(tailwindSpeed).toBe(baseSpeed * 2);

    // 턴 종료 3회 진행 (남은 턴 감소)
    for (let i = 0; i < 3; i++) {
      battle.field.player.handleTailwindTurnEnd(battle, queueObject.enqueue);
      expect(battle.field.player.noClean.tailwind).toBeGreaterThan(0);
    }

    // 4번째 턴 종료 시 순풍 해제
    battle.field.player.handleTailwindTurnEnd(battle, queueObject.enqueue);
    expect(battle.field.player.noClean.tailwind).toBeNull();

    const endText = mockQueue.find((item) => item.text && item.text.includes("순풍이 멎었다"));
    expect(endText).toBeDefined();

    // 해제 후 스피드가 원래대로 복귀
    const restoredSpeed = speedCalculate(pelipper, pelipper.origin.stat.speed, battle);
    expect(restoredSpeed).toBe(baseSpeed);
  });
});
