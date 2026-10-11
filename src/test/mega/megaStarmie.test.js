// npm test -- src/test/mega/megaStarmie.test.js
import { generate } from "../../entity/Pokemon/PokemonInstance";
import Battle from "../../entity/Battle";
import { battleStart } from "../../service/battleStart";
import { damageCalculate } from "../../util/damageCalculate";
import { noNullItem } from "../../entity/Item";
import { applySkillEffects } from "../../service/skillEffect";

describe("아쿠스타 및 메가아쿠스타 구현 테스트", () => {
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

  it("아쿠스타/메가아쿠스타 템플릿 생성 및 기술배치, 지닌물건, 원본 특성(자연회복) 확인", () => {
    const starmie = generate("메가아쿠스타");

    expect(starmie.item).toBe("아쿠스타나이트");
    expect(starmie.abil).toBe("자연회복");
    expect(starmie.type1).toBe("물");
    expect(starmie.type2).toBe("에스퍼");
    expect(starmie.origin.pokemon_id).toBe("0121");

    // 기술배치 4개 확인: 아쿠아브레이크 / 아이스스피너 / 퀵턴 / 아쿠아제트
    const skills = [
      starmie.origin.skill[1].name,
      starmie.origin.skill[2].name,
      starmie.origin.skill[3].name,
      starmie.origin.skill[4].name,
    ];
    expect(skills).toEqual(["아쿠아브레이크", "아이스스피너", "퀵턴", "아쿠아제트"]);

    // 신규 기술 아이스스피너 스펙 확인
    const iceSpinner = starmie.origin.skill[2];
    expect(iceSpinner.type).toBe("얼음");
    expect(iceSpinner.power).toBe(80);
    expect(iceSpinner.accur).toBe(100);
    expect(iceSpinner.feature?.touch).toBe(true);
    expect(iceSpinner.skillEffectList[0]).toEqual({ name: "필드파괴" });

    // '아쿠스타'로 조회 시에도 정상 생성되는지 확인 (하위 호환)
    const starmieByBaseName = generate("아쿠스타");
    expect(starmieByBaseName.item).toBe("아쿠스타나이트");
    expect(starmieByBaseName.abil).toBe("자연회복");
  });

  it("아이스스피너 효과(필드파괴) 발동 시 필드에 전개된 지형 효과가 제거되어야 한다", () => {
    const starmie = generate("메가아쿠스타");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(starmie, enemy, b1, b2, eb1, eb2);

    // 필드에 일렉트릭필드 설치
    battle.field.terrain.setTerrainOnBattle(battle, queueObject.enqueue, starmie, "일렉트릭필드", "발밑에 전기가 흘렀다!");
    expect(battle.field.terrain.get()).toBe("일렉트릭필드");

    // 아이스스피너 기술 효과 발동
    battle.turn.atk = "player";
    battle.turn.def = "npc";
    starmie.turn.useSkill = starmie.origin.skill[2]; // 아이스스피너

    applySkillEffects(battle, queueObject.enqueue);

    // 필드가 파괴되어 null이 되어야 함
    expect(battle.field.terrain.get()).toBeNull();
  });

  it("아쿠스타나이트는 탁떨 및 트릭에 무효화되지 않는 도구 목록에 포함되어야 한다", () => {
    expect(noNullItem).toContain("아쿠스타나이트");
  });

  it("메가진화 시 메가아쿠스타로 진화하고 특성이 천하장사로 변경되며 공격력 2배 보정 및 스펙이 적용되어야 한다", () => {
    const starmie = generate("메가아쿠스타");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(starmie, enemy, b1, b2, eb1, eb2);

    expect(starmie.isMegaEvolveAble(battle)).toBe(true);

    // 메가진화 실행
    starmie.megaEvolve(battle, queueObject.enqueue);

    expect(battle.megaUsed.player).toBe(true);
    expect(starmie.isMega).toBe(true);
    expect(starmie.abil).toBe("천하장사");
    expect(starmie.origin.pokemon_id).toBe("0121-m");

    // 종족값 기반 스펙: 공격 155족, 스피드 125족
    expect(starmie.origin.stat.atk).toBeGreaterThan(200); // 155족 풀보정
    expect(starmie.origin.stat.speed).toBeGreaterThan(170); // 125족 252보정

    // 배틀에서 데미지 계산 시 천하장사 2배 보정 확인
    battle.turn.atk = "player";
    battle.turn.def = "npc";
    battle.turn.atkSN = 1;
    starmie.turn.useSkill = starmie.origin.skill[1]; // 아쿠아브레이크

    damageCalculate(battle, null, { randNum: 100 });
    expect(starmie.log.damage1).toContain("* 2 (천하장사)");
  });

  it("battleStart 실행 시 메가아쿠스타의 메가진화가 선행 발동해야 한다", () => {
    const starmie = generate("메가아쿠스타");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(starmie, enemy, b1, b2, eb1, eb2);
    battle.megaTrigger.player = true;

    battleStart(battle, 1, 1, queueObject);

    expect(battle.megaUsed.player).toBe(true);
    expect(starmie.isMega).toBe(true);
    expect(starmie.abil).toBe("천하장사");
  });
});
