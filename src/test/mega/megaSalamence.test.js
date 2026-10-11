// npm test -- src/test/mega/megaSalamence.test.js
import { generate } from "../../entity/Pokemon/PokemonInstance";
import Battle from "../../entity/Battle";
import { battleStart } from "../../service/battleStart";
import { switchPokemon } from "../../function/switchPokemon";
import { damageCalculate } from "../../util/damageCalculate";
import { getTypeEffectText } from "../../util/typeEffectCalculate";
import { cloneWithMethods } from "../../util/cloneWithMethods";

describe("보만다 메가진화 테스트", () => {
  let mockQueue;
  let queueObject;

  beforeEach(() => {
    mockQueue = [];
    queueObject = {
      queue: mockQueue,
      enqueue: jest.fn((item) => mockQueue.push(cloneWithMethods(item))),
      dequeue: jest.fn(() => mockQueue.shift()),
      resetQueue: jest.fn(() => (mockQueue.length = 0)),
      queueCheck: jest.fn(() => true),
    };
  });

  it("보만다는 보만다나이트를 통해 스카이스킨 특성으로 메가진화해야 한다", () => {
    const salamence = generate("메가보만다");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(salamence, enemy, b1, b2, eb1, eb2);

    expect(salamence.type1).toBe("드래곤");
    expect(salamence.type2).toBe("비행");
    expect(salamence.abil).toBe("위협");
    expect(salamence.item).toBe("보만다나이트");
    expect(salamence.origin.skill[1].name).toBe("이판사판태클");
    expect(salamence.origin.skill[2].name).toBe("용의춤");
    expect(salamence.origin.skill[3].name).toBe("역린");
    expect(salamence.origin.skill[4].name).toBe("날개쉬기");
    expect(salamence.isMegaEvolveAble(battle)).toBe(true);

    salamence.megaEvolve(battle, queueObject.enqueue);

    expect(battle.megaUsed.player).toBe(true);
    expect(salamence.isMega).toBe(true);
    expect(salamence.name).toBe("보만다"); // 기본 이름 유지
    expect(salamence.type1).toBe("드래곤");
    expect(salamence.type2).toBe("비행");
    expect(salamence.abil).toBe("스카이스킨");
    expect(salamence.origin.pokemon_id).toBe("0373-m");
    expect(salamence.origin.stat.atk).toBeGreaterThan(180); // 메가진화 공격력 상승
    expect(salamence.origin.stat.def).toBe(150); // 방어 대폭 상승 (80 -> 130 종족값, 실수치 100 -> 150)
  });

  it("스카이스킨 특성에 의해 노말 기술(이판사판태클)이 비행 타입이 되고 1.2배 위력 증가 및 자속보정을 받아야 한다", () => {
    const salamence = generate("메가보만다");
    const grassEnemy = generate("샤로다"); // 풀 단일 타입
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(salamence, grassEnemy, b1, b2, eb1, eb2);
    salamence.megaEvolve(battle, queueObject.enqueue);

    // 이판사판태클 (skill 1)
    battle.turn.atk = "player";
    battle.turn.def = "npc";
    battle.turn.atkSN = 1;
    salamence.turn.useSkill = salamence.origin.skill[1];

    damageCalculate(battle, null, { randNum: 100 });

    // 1) 스카이스킨 1.2배 데미지 증가 확인
    expect(salamence.log.damage1).toContain("* 1.2 (스카이스킨)");

    // 2) 비행 타입이 되어 자속보정 1.5배 적용 확인
    expect(salamence.log.damage2).toContain("* 1.5 (자속보정)");

    // 3) 풀 타입인 샤로다에게 상성 2배(비행 -> 풀) 적용 확인
    expect(salamence.log.damage2).toContain("* 2(상성보정)");

    // 4) UI 버튼 상성 텍스트 확인 (효과가 굉장함)
    const effectText = getTypeEffectText(salamence, "노말", grassEnemy.type1, grassEnemy.type2, "atk");
    expect(effectText).toBe("◎ 효과가 굉장함");
  });

  it("고스트 타입 상대에게 이판사판태클 사용 시 스카이스킨으로 비행 타입이 되어 데미지가 무효화되지 않아야 한다", () => {
    const salamence = generate("메가보만다");
    const ghostEnemy = generate("블래키"); // 일반 포켓몬으로 설정 후 고스트로 테스트
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(salamence, ghostEnemy, b1, b2, eb1, eb2);
    salamence.megaEvolve(battle, queueObject.enqueue);

    // 상대 타입을 고스트로 설정
    battle.npc.type1 = "고스트";
    battle.npc.type2 = null;

    battle.turn.atk = "player";
    battle.turn.def = "npc";
    battle.turn.atkSN = 1;
    salamence.turn.useSkill = salamence.origin.skill[1];

    const damage = damageCalculate(battle, null, { randNum: 100 });
    expect(damage).toBeGreaterThan(0);
    expect(salamence.log.damage2).toContain("* 1(상성보정)");
  });

  it("메가보만다가 교체되어 벤치로 들어갔다 나와도 메가진화 상태 및 타입이 유지되어야 한다", () => {
    const salamence = generate("메가보만다");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(salamence, enemy, b1, b2, eb1, eb2);
    salamence.megaEvolve(battle, queueObject.enqueue);

    // 교체 실행 (player <-> playerBench1)
    switchPokemon(battle, "player", "playerBench1");

    const benched = battle.playerBench1;
    expect(benched.isMega).toBe(true);
    expect(benched.type1).toBe("드래곤");
    expect(benched.type2).toBe("비행");
    expect(benched.abil).toBe("스카이스킨");

    // 다시 교체로 나옴
    switchPokemon(battle, "player", "playerBench1");
    expect(battle.player.isMega).toBe(true);
    expect(battle.player.type1).toBe("드래곤");
    expect(battle.player.type2).toBe("비행");
    expect(battle.player.abil).toBe("스카이스킨");
  });

  it("battleStart 실행 시 메가보만다의 메가진화가 선행 발동해야 한다", () => {
    const salamence = generate("메가보만다");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(salamence, enemy, b1, b2, eb1, eb2);
    battle.megaTrigger.player = true;

    battleStart(battle, 1, 1, queueObject);

    expect(battle.megaUsed.player).toBe(true);
    expect(salamence.isMega).toBe(true);
    expect(salamence.abil).toBe("스카이스킨");
  });

  it("보만다나이트 반응 텍스트에서는 노말로 나오고 메가진화 완료 시 비행으로 바뀌어야 한다", () => {
    const salamence = generate("메가보만다");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(salamence, enemy, b1, b2, eb1, eb2);
    const normalSkill = salamence.origin.skill[1]; // 이판사판태클 (노말)

    salamence.megaEvolve(battle, queueObject.enqueue);

    // 1) "보만다의 보만다나이트이(가) 반응했다!" 시점의 큐 아이템
    const reactItem = mockQueue.find((item) => item.text && item.text.includes("반응했다!"));
    expect(reactItem).toBeDefined();
    const isAerilateAtReact = reactItem.battle.player.abil === "스카이스킨";
    const typeAtReact = isAerilateAtReact && normalSkill.type === "노말" ? "비행" : normalSkill.type;
    expect(typeAtReact).toBe("노말"); // 도구 반응 시점에는 노말!

    // 2) "메가보만다로 메가진화했다!" 시점의 큐 아이템
    const megaItem = mockQueue.find((item) => item.text && item.text.includes("메가진화했다!"));
    expect(megaItem).toBeDefined();
    const isAerilateAtMega = megaItem.battle.player.abil === "스카이스킨";
    const typeAtMega = isAerilateAtMega && normalSkill.type === "노말" ? "비행" : normalSkill.type;
    expect(typeAtMega).toBe("비행"); // 메가진화 완료 시점에는 비행으로 변경!
  });
});
