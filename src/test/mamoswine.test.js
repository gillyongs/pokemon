// npm test -- src/test/mamoswine.test.js
import { generate } from "../entity/Pokemon/PokemonInstance";
import Battle from "../entity/Battle";
import { battleStart } from "../service/battleStart";
import { applyAbilityEffects } from "../entity/Ability";
import { damageCalculate } from "../util/damageCalculate";

describe("맘모꾸리 및 둔감, 죽기살기 구현 테스트", () => {
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

  it("맘모꾸리 템플릿 생성, 기술배치, 지닌도구(기합의띠), 특성(둔감), 타입 확인", () => {
    const mamo = generate("맘모꾸리");

    expect(mamo.item).toBe("기합의띠");
    expect(mamo.abil).toBe("둔감");
    expect(mamo.type1).toBe("얼음");
    expect(mamo.type2).toBe("땅");
    expect(mamo.origin.pokemon_id).toBe("0473");

    // 기술배치 4개 확인: 지진 / 얼음뭉치 / 고드름떨구기 / 죽기살기
    const skills = [
      mamo.origin.skill[1].name,
      mamo.origin.skill[2].name,
      mamo.origin.skill[3].name,
      mamo.origin.skill[4].name,
    ];
    expect(skills).toEqual(["지진", "얼음뭉치", "고드름떨구기", "죽기살기"]);

    // 얼음뭉치 우선도 1
    expect(mamo.origin.skill[2].prior).toBe(1);
  });

  it("둔감 특성은 위협을 받아도 공격력이 떨어지지 않아야 한다", () => {
    const player = generate("맘모꾸리");
    const enemy = generate("윈디"); // 위협 특성
    const b1 = generate("패리퍼");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(player, enemy, b1, b2, eb1, eb2);

    // 윈디(NPC)의 위협 발동
    applyAbilityEffects(battle, "npc", queueObject.enqueue);

    // 맘모꾸리의 공격 랭크가 떨어지지 않음
    expect(player.tempStatus.rank.atk).toBe(0);
    const guardLog = mockQueue.find((item) => item.text && item.text.includes("[특성 둔감]"));
    expect(guardLog).toBeDefined();
    expect(guardLog.text).toContain("공격은 떨어지지 않는다");
  });

  it("둔감 특성은 상대의 도발 기술에 넘어가지 않아야 한다", () => {
    const player = generate("맘모꾸리");
    const enemy = generate("날개치는머리"); // 도발 보유
    const b1 = generate("패리퍼");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(player, enemy, b1, b2, eb1, eb2);

    // enemy가 도발(4번 기술) 사용
    enemy.turn.useSkill = enemy.origin.skill[4]; // 도발
    player.turn.useSkill = player.origin.skill[1]; // 지진

    battleStart(battle, 1, 4, queueObject);

    // 도발 상태가 부여되지 않아야 함
    expect(player.tempStatus.taunt).toBeNull();
    const tauntBlockLog = mockQueue.find((item) => item.text && item.text.includes("도발에 넘어가지 않는다"));
    expect(tauntBlockLog).toBeDefined();
  });

  it("죽기살기는 자신의 체력이 상대 이상일 때 실패해야 한다", () => {
    const player = generate("맘모꾸리");
    const enemy = generate("윈디");
    const b1 = generate("패리퍼");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(player, enemy, b1, b2, eb1, eb2);

    // 양쪽 모두 풀피인 상태 (자신 HP >= 상대 HP)
    expect(player.hp).toBeGreaterThanOrEqual(enemy.hp);
    player.tempStatus.rank.speed = 6; // 선공 보장

    // 플레이어가 4번 기술(죽기살기) 사용
    battleStart(battle, 4, 1, queueObject);

    const failLog = mockQueue.find((item) => item.text && item.text.includes("하지만 실패했다!"));
    expect(failLog).toBeDefined();
  });

  it("죽기살기는 자신의 체력이 상대보다 적을 때 상대 HP를 자신과 같아지도록 피해를 입혀야 한다", () => {
    const player = generate("맘모꾸리");
    const enemy = generate("윈디");
    const b1 = generate("패리퍼");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(player, enemy, b1, b2, eb1, eb2);

    // 기합의띠로 맘모꾸리 HP가 1이 된 상태 가정
    player.hp = 1;
    const enemyInitialHp = enemy.hp;

    // 데미지 계산 확인: (enemy.hp - player.hp)
    battle.turn.atk = "player";
    battle.turn.def = "npc";
    battle.turn.atkSN = 4; // 죽기살기
    player.turn.useSkill = player.origin.skill[4];

    const damage = damageCalculate(battle);
    expect(damage).toBe(enemyInitialHp - 1);

    // 실제 턴 진행
    // 윈디가 방어 대신 공격기를 쓰고 맘모꾸리가 더 빨라서 먼저 죽기살기를 쓰는 상황
    player.tempStatus.rank.speed = 6; // 선공 보장
    battleStart(battle, 4, 1, queueObject);

    expect(enemy.hp).toBe(1);
  });

  it("죽기살기는 고스트 타입 상대에게 효과가 없어야 한다", () => {
    const player = generate("맘모꾸리");
    const enemy = generate("샹델라"); // 고스트/불꽃
    const b1 = generate("패리퍼");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(player, enemy, b1, b2, eb1, eb2);
    player.hp = 1;
    player.tempStatus.rank.speed = 6;

    battleStart(battle, 4, 1, queueObject);

    const noEffectLog = mockQueue.find((item) => item.text && item.text.includes("효과가 없는 것 같다"));
    expect(noEffectLog).toBeDefined();
    // 샹델라 체력 보존
    expect(enemy.hp).toBe(enemy.origin.hp);
  });
});
