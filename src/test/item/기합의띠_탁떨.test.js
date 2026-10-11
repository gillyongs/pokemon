// npm test -- src/test/item/기합의띠_탁떨.test.js
import { generate } from "../../entity/Pokemon/PokemonInstance";
import Battle from "../../entity/Battle";
import { attackPlayer } from "../../service/attack";

describe("탁쳐서떨구기와 기합의띠 상호작용 테스트", () => {
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

  it("1. 풀피 상태에서 기합의띠를 쥔 포켓몬이 탁쳐서떨구기에 한방컷 데미지를 입으면 기합의 띠로 1로 버텨야 한다", () => {
    const player = generate("마릴리");
    const npc = generate("파르셀");
    const b1 = generate("윈디");
    const b2 = generate("썬더");
    const eb1 = generate("망나뇽");
    const eb2 = generate("블래키");

    // 탁쳐서떨구기가 확실히 한방컷이 나도록 공격력 대폭 상승 세팅
    player.tempStatus.rank.atk = 6;
    npc.item = "기합의띠";
    expect(npc.hp).toBe(npc.origin.hp);

    const battle = new Battle(player, npc, b1, b2, eb1, eb2);

    const knockOffIndex = Object.entries(player.origin.skill).find(([_, s]) => s.name === "탁쳐서떨구기")[0];
    player.turn.useSkill = player.origin.skill[knockOffIndex];

    attackPlayer(battle, Number(knockOffIndex), 1, queueObject.enqueue);

    // 1. 체력이 0이 아닌 1로 생존
    expect(npc.hp).toBe(1);

    // 2. 기합의띠가 소모되어 아이템이 null
    expect(npc.item).toBeNull();

    // 3. '기합의 띠로 버텼다!' 텍스트 출력
    const sashText = mockQueue.some((q) => q.text && q.text.includes("기합의 띠로 버텼다!"));
    expect(sashText).toBe(true);

    // 4. 이미 기합의띠가 소모되었으므로 '탁쳐서 떨구었다!' 텍스트는 출력되지 않음
    const knockOffText = mockQueue.some((q) => q.text && q.text.includes("탁쳐서 떨구었다!"));
    expect(knockOffText).toBe(false);
  });

  it("2. 한방컷이 아닌 일반 데미지인 경우 기합의띠가 발동하지 않고 탁쳐서 떨어져야 한다", () => {
    const player = generate("마릴리");
    const npc = generate("파르셀");
    const b1 = generate("윈디");
    const b2 = generate("썬더");
    const eb1 = generate("망나뇽");
    const eb2 = generate("블래키");

    // 방어력을 올려서 한방컷이 나지 않도록 세팅
    npc.tempStatus.rank.def = 6;
    npc.item = "기합의띠";
    expect(npc.hp).toBe(npc.origin.hp);

    const battle = new Battle(player, npc, b1, b2, eb1, eb2);

    const knockOffIndex = Object.entries(player.origin.skill).find(([_, s]) => s.name === "탁쳐서떨구기")[0];
    player.turn.useSkill = player.origin.skill[knockOffIndex];

    attackPlayer(battle, Number(knockOffIndex), 1, queueObject.enqueue);

    // 1. 체력이 1보다 많이 남아있어야 함
    expect(npc.hp).toBeGreaterThan(1);

    // 2. 기합의 띠로 버틴 것이 아니어야 함
    const sashText = mockQueue.some((q) => q.text && q.text.includes("기합의 띠로 버텼다!"));
    expect(sashText).toBe(false);

    // 3. 기합의띠가 탁쳐서 떨어져야 함
    expect(npc.item).toBeNull();
    const knockOffText = mockQueue.some((q) => q.text && q.text.includes("기합의띠를 탁쳐서 떨구었다!"));
    expect(knockOffText).toBe(true);
  });
});
