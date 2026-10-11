// npm test -- src/test/abil/클리어바디.test.js
import { generate } from "../../entity/Pokemon/PokemonInstance";
import Battle from "../../entity/Battle";

describe("클리어바디 특성 테스트", () => {
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

  it("1. 상대방에 의한 랭크 다운(isOpponent = true)은 방어하고 메시지를 띄워야 한다", () => {
    const metagross = generate("메타그로스");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(metagross, enemy, b1, b2, eb1, eb2);

    // 상대방에 의한 단일 랭크 다운 (공격 -1)
    metagross.rankUp(battle, queueObject.enqueue, "atk", -1, null, true);

    expect(metagross.tempStatus.rank.atk).toBe(0);
    expect(queueObject.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining("[특성 클리어바디] 메타그로스의 능력치는 떨어지지 않는다!"),
      })
    );
  });

  it("2. 자신이 사용하는 기술에 의한 랭크 다운(isOpponent = false)은 정상적으로 적용되어야 한다", () => {
    const metagross = generate("메타그로스");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(metagross, enemy, b1, b2, eb1, eb2);

    // 자신의 인파이트/스케일샷 등 자가 랭크 다운 (isOpponent = false)
    metagross.rankUp(battle, queueObject.enqueue, "def", -1, null, false);

    expect(metagross.tempStatus.rank.def).toBe(-1);
  });

  it("3. 상대방에 의한 다수 랭크 다운(rankUpMulti, isOpponent = true)도 일괄 방어되어야 한다", () => {
    const metagross = generate("메타그로스");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(metagross, enemy, b1, b2, eb1, eb2);

    // 막말내뱉기 등 다수 랭크 다운 시도
    metagross.rankUpMulti(battle, queueObject.enqueue, [{ stat: "atk", value: -1 }, { stat: "catk", value: -1 }], null, true);

    expect(metagross.tempStatus.rank.atk).toBe(0);
    expect(metagross.tempStatus.rank.catk).toBe(0);
    expect(queueObject.enqueue).toHaveBeenCalledTimes(2);
    expect(queueObject.enqueue).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        text: expect.stringContaining("[특성 클리어바디] 메타그로스의 능력치는 떨어지지 않는다!"),
      })
    );
    expect(queueObject.enqueue).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        text: expect.stringContaining("[특성 클리어바디] 메타그로스의 능력치는 떨어지지 않는다!"),
      })
    );
  });

  it("4. 특성에 의한 랭크업일 경우 abilText가 출력 텍스트 앞에 붙어야 한다", () => {
    const metagross = generate("메타그로스");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(metagross, enemy, b1, b2, eb1, eb2);

    // [특성 자기과신] 메타그로스의 공격이 올라갔다!
    metagross.rankUp(battle, queueObject.enqueue, "atk", 1, "[특성 자기과신]", false);

    expect(metagross.tempStatus.rank.atk).toBe(1);
    expect(queueObject.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining("[특성 자기과신] 메타그로스의 공격이 올라갔다!"),
      })
    );
  });
});
