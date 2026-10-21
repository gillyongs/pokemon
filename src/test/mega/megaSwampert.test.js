// npm test -- src/test/mega/megaSwampert.test.js
import { generate } from "../../entity/Pokemon/PokemonInstance";
import Battle from "../../entity/Battle";
import { battleStart } from "../../service/battleStart";
import { noNullItem, itemText } from "../../entity/Item";
import { speedCalculate } from "../../util/speedCheck";

describe("대짱이 및 메가대짱이 구현 테스트", () => {
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

  it("대짱이/메가대짱이 템플릿 생성 및 기술배치, 지닌물건, 원본 특성(급류) 확인", () => {
    const swampert = generate("메가대짱이");

    expect(swampert.item).toBe("대짱이나이트");
    expect(swampert.abil).toBe("급류");
    expect(swampert.type1).toBe("물");
    expect(swampert.type2).toBe("땅");
    expect(swampert.origin.pokemon_id).toBe("0260");

    // 기술배치 4개 확인: 웨이브태클 / 지진 / 냉동펀치 / 퀵턴
    const skills = [
      swampert.origin.skill[1].name,
      swampert.origin.skill[2].name,
      swampert.origin.skill[3].name,
      swampert.origin.skill[4].name,
    ];
    expect(skills).toEqual(["웨이브태클", "지진", "냉동펀치", "퀵턴"]);

    // 대짱이로 조회 시에도 정상 생성 확인 (기본 샘플 분리 적용: 자뭉열매)
    const swampertByBase = generate("대짱이");
    expect(swampertByBase.item).toBe("자뭉열매");
    expect(swampertByBase.abil).toBe("급류");
  });

  it("대짱이나이트는 탁떨 방지 목록에 포함되고 설명이 존재해야 한다", () => {
    expect(noNullItem).toContain("대짱이나이트");
    expect(itemText["대짱이나이트"]).toBeDefined();
  });

  it("메가진화 시 메가대짱이로 진화하고 특성이 쓱쓱으로 변경되어야 한다", () => {
    const player = generate("메가대짱이");
    const npc = generate("윈디");
    const b1 = generate("패리퍼");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(player, npc, b1, b2, eb1, eb2);
    battle.megaTrigger.player = true;

    const baseSpeed = player.origin.stat.speed;
    const baseAtk = player.origin.stat.atk;

    // 턴 진행: 1번 기술 웨이브태클 선택하여 메가진화 발동
    battleStart(battle, 1, 1, queueObject);

    expect(player.isMega).toBe(true);
    expect(player.abil).toBe("쓱쓱");
    expect(player.origin.stat.speed).toBeGreaterThan(baseSpeed);
    expect(player.origin.stat.atk).toBeGreaterThan(baseAtk);
  });

  it("쓱쓱 특성은 비가 내릴 때 스피드가 2배가 되어야 한다", () => {
    const player = generate("메가대짱이");
    const npc = generate("윈디");
    const b1 = generate("패리퍼");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(player, npc, b1, b2, eb1, eb2);

    // 메가진화 전개
    battle.megaTrigger.player = true;
    battleStart(battle, 1, 1, queueObject);

    expect(player.abil).toBe("쓱쓱");
    const normalSpeed = speedCalculate(player, player.origin.stat.speed, battle);

    // 날씨를 비로 변경
    battle.field.weather.setWeatherOnBattle(battle, queueObject.enqueue, player, "비", "비가 내린다");
    const rainSpeed = speedCalculate(player, player.origin.stat.speed, battle);

    expect(rainSpeed).toBe(normalSpeed * 2);
  });

  it("패리퍼의 잔비와 연계 시 메가대짱이가 쓱쓱으로 스피드 2배가 적용되어야 한다", () => {
    const pelipper = generate("패리퍼");
    const enemy = generate("윈디");
    const b1 = generate("메가대짱이");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(pelipper, enemy, b1, b2, eb1, eb2);

    // 패리퍼 등장 -> 잔비 발동
    battle.field.weather.setWeatherOnBattle(battle, queueObject.enqueue, pelipper, "비", "잔비 발동");
    expect(battle.field.weather.isRainy).toBe(true);

    const swampert = generate("메가대짱이");
    swampert.team = "player";
    swampert.abil = "쓱쓱";

    const baseSpeed = swampert.origin.stat.speed;
    const calcSpeed = speedCalculate(swampert, baseSpeed, battle);

    expect(calcSpeed).toBe(baseSpeed * 2);
  });
});
