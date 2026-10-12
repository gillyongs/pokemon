// npm test -- src/test/mega/megaTyranitar.test.js
import { generate } from "../../entity/Pokemon/PokemonInstance";
import Battle from "../../entity/Battle";
import { battleStart } from "../../service/battleStart";
import { damageCalculate } from "../../util/damageCalculate";
import { noNullItem, itemText } from "../../entity/Item";

describe("메가마기라스 및 스톤에지 구현 테스트", () => {
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

  it("메가마기라스 템플릿 생성, 기술배치, 도구(마기라스나이트), 특성(모래날림) 확인", () => {
    const megaTT = generate("메가마기라스");

    expect(megaTT.item).toBe("마기라스나이트");
    expect(megaTT.abil).toBe("모래날림");
    expect(megaTT.type1).toBe("바위");
    expect(megaTT.type2).toBe("악");
    expect(megaTT.origin.pokemon_id).toBe("0248");

    // 기술배치 4개 확인: 스톤에지 / 지진 / 탁쳐서떨구기 / 용의춤
    const skills = [
      megaTT.origin.skill[1].name,
      megaTT.origin.skill[2].name,
      megaTT.origin.skill[3].name,
      megaTT.origin.skill[4].name,
    ];
    expect(skills).toEqual(["스톤에지", "지진", "탁쳐서떨구기", "용의춤"]);

    // 신규 기술 스톤에지 스펙 확인
    const stoneEdge = megaTT.origin.skill[1];
    expect(stoneEdge.type).toBe("바위");
    expect(stoneEdge.power).toBe(100);
    expect(stoneEdge.accur).toBe(80);
    expect(stoneEdge.skillEffectList[0]).toEqual({ name: "급소" });
  });

  it("마기라스나이트는 탁떨 방지 목록에 포함되고 아이템 설명이 존재해야 한다", () => {
    expect(noNullItem).toContain("마기라스나이트");
    expect(itemText["마기라스나이트"]).toBeDefined();
  });

  it("배틀 중 메가진화 시 메가마기라스로 진화하고 스탯 상승 및 모래날림 특성이 유지/발동되어야 한다", () => {
    const player = generate("메가마기라스");
    const enemy = generate("윈디");
    const b1 = generate("패리퍼");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(player, enemy, b1, b2, eb1, eb2);
    battle.megaTrigger.player = true;

    const baseAtk = player.origin.stat.atk;
    const baseDef = player.origin.stat.def;
    const baseSpeed = player.origin.stat.speed;

    // 턴 진행 (스톤에지 선택)
    battleStart(battle, 1, 1, queueObject);

    expect(player.isMega).toBe(true);
    expect(player.origin.pokemon_id).toBe("0248-m");
    expect(player.abil).toBe("모래날림");

    // 종족값 상승 (공격 164, 방어 150, 스피드 71) 확인
    expect(player.origin.stat.atk).toBeGreaterThan(baseAtk);
    expect(player.origin.stat.def).toBeGreaterThan(baseDef);
    expect(player.origin.stat.speed).toBeGreaterThan(baseSpeed);

    // 모래바람 날씨 전개 확인
    expect(battle.field.weather.get()).toBe("모래바람");
  });

  it("메가마기라스는 모래바람 날씨에서 바위 타입 특수방어 1.5배 보정을 받아야 한다", () => {
    const attacker = generate("썬더");
    const defender = generate("메가마기라스");
    const b1 = generate("패리퍼");
    const b2 = generate("마릴리");
    const eb1 = generate("윈디");
    const eb2 = generate("파르셀");

    const battle = new Battle(attacker, defender, b1, b2, eb1, eb2);

    // defender 메가진화
    defender.megaEvolve(battle, queueObject.enqueue);

    battle.turn.atk = "player";
    battle.turn.def = "npc";
    battle.turn.atkSN = 1; // 10만볼트 (특수)
    attacker.turn.useSkill = attacker.origin.skill[1];

    damageCalculate(battle, null, { randNum: 100 });
    expect(attacker.log.damage1).toContain("* 1.5 (모래바람+바위)");
  });
});
