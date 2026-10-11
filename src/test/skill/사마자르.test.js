// npm test -- src/test/skill/사마자르.test.js
import { generate } from "../../entity/Pokemon/PokemonInstance";
import Battle from "../../entity/Battle";
import { damageCalculate } from "../../util/damageCalculate";
import { applySkillEffects } from "../../service/skillEffect";
import { afterSkillCheck } from "../../service/skillCheck";

describe("사마자르 구현 및 기술/특성 테스트", () => {
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

  it("사마자르 템플릿 생성 및 기술배치, 지닌물건, 특성(예리함) 확인", () => {
    const kleavor = generate("사마자르");

    expect(kleavor.item).toBe("기합의띠");
    expect(kleavor.abil).toBe("예리함");
    expect(kleavor.type1).toBe("벌레");
    expect(kleavor.type2).toBe("바위");
    expect(kleavor.origin.pokemon_id).toBe("0900");

    // 기술배치 4개 확인: 시저크로스 / 암석액스 / 깜짝베기 / 페인트
    const skills = [
      kleavor.origin.skill[1].name,
      kleavor.origin.skill[2].name,
      kleavor.origin.skill[3].name,
      kleavor.origin.skill[4].name,
    ];
    expect(skills).toEqual(["시저크로스", "암석액스", "깜짝베기", "페인트"]);

    // 베는 기술 플래그 확인
    expect(kleavor.origin.skill[1].feature?.slice).toBe(true); // 시저크로스
    expect(kleavor.origin.skill[2].feature?.slice).toBe(true); // 암석액스
    expect(kleavor.origin.skill[3].feature?.slice).toBe(true); // 깜짝베기

    // 페인트 스펙 확인 (노말, 위력 30, 명중 100, 우선도 +2, touch, feint)
    const feint = kleavor.origin.skill[4];
    expect(feint.type).toBe("노말");
    expect(feint.power).toBe(30);
    expect(feint.accur).toBe(100);
    expect(feint.prior).toBe(2);
    expect(feint.feature?.touch).toBe(true);
    expect(feint.feature?.feint).toBe(true);
  });

  it("베는 기술(시저크로스, 암석액스, 깜짝베기)에 예리함 1.5배 위력 보정이 적용되어야 한다", () => {
    const kleavor = generate("사마자르");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(kleavor, enemy, b1, b2, eb1, eb2);
    battle.turn.atk = "player";
    battle.turn.def = "npc";
    battle.turn.atkSN = 1;

    // 1) 시저크로스 데미지 계산 시 예리함 확인
    kleavor.turn.useSkill = kleavor.origin.skill[1];
    damageCalculate(battle, null, { randNum: 100 });
    expect(kleavor.log.damage1).toContain("* 1.5 (예리함)");

    // 2) 암석액스 데미지 계산 시 예리함 확인
    kleavor.turn.useSkill = kleavor.origin.skill[2];
    damageCalculate(battle, null, { randNum: 100 });
    expect(kleavor.log.damage1).toContain("* 1.5 (예리함)");

    // 3) 깜짝베기 데미지 계산 시 예리함 확인
    kleavor.turn.useSkill = kleavor.origin.skill[3];
    damageCalculate(battle, null, { randNum: 100 });
    expect(kleavor.log.damage1).toContain("* 1.5 (예리함)");
  });

  it("암석액스 사용 후 부가효과로 상대 진영에 스텔스록이 설치되어야 한다", () => {
    const kleavor = generate("사마자르");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(kleavor, enemy, b1, b2, eb1, eb2);
    battle.turn.atk = "player";
    battle.turn.def = "npc";
    kleavor.turn.useSkill = kleavor.origin.skill[2]; // 암석액스

    expect(battle.field.npc.sRock).toBeNull();

    // 부가효과 실행
    applySkillEffects(battle, queueObject.enqueue);

    // 스텔스록 설치 확인
    expect(battle.field.npc.sRock).toBe(true);

    const sRockText = mockQueue.find((item) => item.text && item.text.includes("뾰족한 바위가 떠다니기 시작했다"));
    expect(sRockText).toBeDefined();
  });

  it("페인트는 상대의 방어(protect) 상태를 뚫고 공격하며 상대의 방어를 해제해야 한다", () => {
    const kleavor = generate("사마자르");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(kleavor, enemy, b1, b2, eb1, eb2);
    battle.turn.atk = "player";
    battle.turn.def = "npc";
    kleavor.turn.useSkill = kleavor.origin.skill[4]; // 페인트

    // 상대가 방어를 쓴 상태
    enemy.turn.useSkill = { name: "방어", stype: "buf" };
    enemy.turn.protect = true;

    // skillCheck 실행
    const checkResult = afterSkillCheck(battle, queueObject.enqueue);

    // 방어에 막히지 않고 공격 성공
    expect(checkResult).toBe(true);

    // 상대의 방어 상태가 해제됨
    expect(enemy.turn.protect).toBeNull();

    // 방어 해제 메시지 출력 확인
    const breakText = mockQueue.find((item) => item.text && item.text.includes("방어가 해제되었다"));
    expect(breakText).toBeDefined();
  });

  it("상대가 방어를 쓰지 않았을 때도 페인트는 정상적으로 명중해야 한다", () => {
    const kleavor = generate("사마자르");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(kleavor, enemy, b1, b2, eb1, eb2);
    battle.turn.atk = "player";
    battle.turn.def = "npc";
    kleavor.turn.useSkill = kleavor.origin.skill[4]; // 페인트
    enemy.turn.useSkill = enemy.origin.skill[1]; // 지진 (방어 아님)
    enemy.turn.protect = null;

    // skillCheck 실행
    const checkResult = afterSkillCheck(battle, queueObject.enqueue);

    // 5세대 이후 사양: 방어를 쓰지 않았어도 공격 성공
    expect(checkResult).toBe(true);
  });
});
