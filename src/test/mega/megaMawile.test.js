// npm test -- src/test/mega/megaMawile.test.js
import { generate } from "../../entity/Pokemon/PokemonInstance";
import Battle from "../../entity/Battle";
import { battleStart } from "../../service/battleStart";
import { damageCalculate } from "../../util/damageCalculate";
import { noNullItem } from "../../entity/Item";

describe("입치트 및 메가입치트 구현 테스트", () => {
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

  it("입치트/메가입치트 템플릿 생성 및 기술배치, 지닌물건, 진화 전 특성(위협) 확인", () => {
    const mawile = generate("메가입치트");

    expect(mawile.item).toBe("입치트나이트");
    expect(mawile.abil).toBe("위협");
    expect(mawile.type1).toBe("강철");
    expect(mawile.type2).toBe("페어리");
    expect(mawile.origin.pokemon_id).toBe("0303");

    // 기술배치 4개 확인: 치근거리기 / 칼춤 / 기습 / 냉동펀치
    const skills = [
      mawile.origin.skill[1].name,
      mawile.origin.skill[2].name,
      mawile.origin.skill[3].name,
      mawile.origin.skill[4].name,
    ];
    expect(skills).toEqual(["치근거리기", "칼춤", "기습", "냉동펀치"]);

    // 신규 기술 냉동펀치 스펙 확인
    const icePunch = mawile.origin.skill[4];
    expect(icePunch.type).toBe("얼음");
    expect(icePunch.power).toBe(75);
    expect(icePunch.accur).toBe(100);
    expect(icePunch.feature?.punch).toBe(true);
    expect(icePunch.feature?.touch).toBe(true);
    expect(icePunch.skillEffectList[0]).toEqual({ name: "얼음", probability: 10 });

    // '입치트'로 조회 시에도 정상 생성되는지 확인 (하위 호환)
    const mawileByBaseName = generate("입치트");
    expect(mawileByBaseName.item).toBe("입치트나이트");
    expect(mawileByBaseName.abil).toBe("위협");
  });

  it("입치트나이트는 탁떨 및 트릭에 무효화되지 않는 도구 목록에 포함되어야 한다", () => {
    expect(noNullItem).toContain("입치트나이트");
  });

  it("메가진화 시 메가입치트로 진화하고 특성이 천하장사로 변경되며 공격력 2배 보정이 적용되어야 한다", () => {
    const mawile = generate("메가입치트");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(mawile, enemy, b1, b2, eb1, eb2);

    expect(mawile.isMegaEvolveAble(battle)).toBe(true);

    // 메가진화 실행
    mawile.megaEvolve(battle, queueObject.enqueue);

    expect(battle.megaUsed.player).toBe(true);
    expect(mawile.isMega).toBe(true);
    expect(mawile.abil).toBe("천하장사");
    expect(mawile.origin.pokemon_id).toBe("0303-m");
    expect(mawile.origin.stat.atk).toBeGreaterThan(140); // 105족 풀보정 공격력

    // 배틀에서 데미지 계산 시 천하장사 2배 보정 확인
    battle.turn.atk = "player";
    battle.turn.def = "npc";
    battle.turn.atkSN = 1;
    mawile.turn.useSkill = mawile.origin.skill[1]; // 치근거리기

    damageCalculate(battle, null, { randNum: 100 });
    expect(mawile.log.damage1).toContain("* 2 (천하장사)");
  });

  it("battleStart 실행 시 메가입치트의 메가진화가 선행 발동해야 한다", () => {
    const mawile = generate("메가입치트");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(mawile, enemy, b1, b2, eb1, eb2);
    battle.megaTrigger.player = true;

    battleStart(battle, 1, 1, queueObject);

    expect(battle.megaUsed.player).toBe(true);
    expect(mawile.isMega).toBe(true);
    expect(mawile.abil).toBe("천하장사");
  });
});
