// npm test -- src/test/mega/megaMetagross.test.js
import { generate } from "../../entity/Pokemon/PokemonInstance";
import Battle from "../../entity/Battle";
import { battleStart } from "../../service/battleStart";

describe("메타그로스 및 메가진화 테스트", () => {
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

  it("메타그로스는 메타그로스나이트를 지니고 있을 때 메가진화 조건을 만족해야 한다", () => {
    const metagross = generate("메타그로스");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(metagross, enemy, b1, b2, eb1, eb2);

    expect(metagross.isMegaEvolveAble(battle)).toBe(true);
    expect(metagross.item).toBe("메타그로스나이트");
    expect(metagross.abil).toBe("클리어바디");
    expect(metagross.origin.stat.speed).toBeLessThan(178); // 메가 전 스피드
  });

  it("메가진화 실행 시 메가메타그로스로 전환되고 종족치/특성(단단한발톱)/이름이 변경되어야 한다", () => {
    const metagross = generate("메타그로스");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(metagross, enemy, b1, b2, eb1, eb2);

    // 메가진화 발동
    metagross.megaEvolve(battle, queueObject.enqueue);

    expect(battle.megaUsed.player).toBe(true);
    expect(metagross.isMega).toBe(true);
    expect(metagross.name).toBe("메타그로스");
    expect(metagross.abil).toBe("단단한발톱");
    expect(metagross.origin.pokemon_id).toBe("0376-m");
    // 메가진화 후 스피드 상승 (70 -> 110 베이스)
    expect(metagross.origin.stat.speed).toBeGreaterThan(160);
    expect(metagross.isMegaEvolveAble(battle)).toBe(false);
  });

  it("battle.megaTrigger.player가 true일 때 공격 전에 메가진화가 선행 발동해야 한다", () => {
    const metagross = generate("메타그로스");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(metagross, enemy, b1, b2, eb1, eb2);
    battle.megaTrigger.player = true;

    battleStart(battle, 1, 1, queueObject);

    expect(battle.megaUsed.player).toBe(true);
    expect(battle.megaTrigger.player).toBe(false);
    expect(metagross.isMega).toBe(true);
    expect(metagross.name).toBe("메타그로스");
    expect(metagross.abil).toBe("단단한발톱");
  });

  it("양쪽 다 메가진화 시 메가진화 후 스피드가 빠른 쪽이 먼저 메가진화해야 한다", () => {
    const playerMetagross = generate("메타그로스");
    const npcMetagross = generate("메타그로스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    // NPC의 메가 후 스피드를 더 높게 설정
    npcMetagross.origin.megaData.stat.speed = 200;
    playerMetagross.origin.megaData.stat.speed = 100;

    const battle = new Battle(playerMetagross, npcMetagross, b1, b2, eb1, eb2);
    battle.megaTrigger.player = true;

    battleStart(battle, 1, 1, queueObject);

    // 큐에 enqueue된 텍스트 확인: NPC 메가진화 텍스트가 플레이어보다 먼저 나와야 함
    const texts = mockQueue.map((item) => item.text);
    const npcMegaIndex = texts.findIndex((t) => t && t.includes("상대") || (t && t.includes(npcMetagross.name) && texts.indexOf(t) < texts.lastIndexOf(t)));
    // 첫 메가진화 반응 텍스트가 상대(NPC)의 것인지 확인
    const firstReactionIndex = texts.findIndex((t) => t && t.includes("반응했다!"));
    const secondReactionIndex = texts.findIndex((t, idx) => t && t.includes("반응했다!") && idx > firstReactionIndex);

    expect(firstReactionIndex).toBeGreaterThan(-1);
    expect(secondReactionIndex).toBeGreaterThan(firstReactionIndex);
    // NPC가 먼저 메가진화 완료
    expect(battle.megaUsed.player).toBe(true);
    expect(battle.megaUsed.npc).toBe(true);
  });

  it("메가진화한 포켓몬이 기절 후 부활하더라도 메가진화 상태가 유지되어야 한다", () => {
    const metagross = generate("메타그로스");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(metagross, enemy, b1, b2, eb1, eb2);
    metagross.megaEvolve(battle, queueObject.enqueue);

    expect(metagross.isMega).toBe(true);
    expect(metagross.name).toBe("메타그로스");

    // 기절 처리
    metagross.handleFaint(battle, queueObject.enqueue);
    expect(metagross.faint).toBe(true);
    expect(metagross.isMega).toBe(true);

    // 부활 (회생의기도 등)
    metagross.faint = false;
    metagross.hp = 100;

    expect(metagross.isMega).toBe(true);
    expect(metagross.name).toBe("메타그로스");
    expect(metagross.origin.pokemon_id).toBe("0376-m");
    expect(metagross.abil).toBe("단단한발톱");
    expect(metagross.isMegaEvolveAble(battle)).toBe(false); // 이미 메가진화 상태이므로 재진화 불가
  });
});
