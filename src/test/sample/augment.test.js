import { generate } from "../../entity/Pokemon/PokemonInstance";
import { createBattle } from "../../entity/Battle";
import { AUGMENT_LIST, getAugmentDesc } from "../../entity/Augment/AugmentData";
import { rollAugments, grantRandomAugment } from "../../util/augmentRoll";
import { getAccuracy } from "../../function/accuracyCalculate";
import { damageCalculate } from "../../util/damageCalculate";
import { afterSkillCheck } from "../../service/skillCheck";
import * as randomCheckModule from "../../util/randomCheck";
import { cloneWithMethods } from "../../util/cloneWithMethods";

describe("아수라장 증강 시스템 테스트", () => {
  test("증강 3개 추첨 확인", () => {
    const poke = generate("배바닐라");
    const rolled = rollAugments(poke, 3);
    expect(rolled.length).toBe(3);
    // 중복 없음
    const ids = rolled.map((r) => r.id);
    expect(new Set(ids).size).toBe(3);
  });

  test("모든 증강에 cost(값) 속성이 정의되어 있음 (0 이상의 정수 또는 '-')", () => {
    AUGMENT_LIST.forEach((aug) => {
      expect(aug.cost).toBeDefined();
      if (aug.cost === "-") {
        expect(aug.cost).toBe("-");
      } else {
        expect(typeof aug.cost).toBe("number");
        expect(aug.cost).toBeGreaterThanOrEqual(0);
      }
    });

    const roulette = AUGMENT_LIST.find((a) => a.id === "rouletteWheel");
    expect(roulette.cost).toBe("-");
  });

  test("포켓몬당 증강은 최대 3개까지만 적용 가능", () => {
    const poke = generate("배바닐라");
    expect(poke.applyAugment(AUGMENT_LIST[0])).toBe(true);
    expect(poke.applyAugment(AUGMENT_LIST[1])).toBe(true);
    expect(poke.applyAugment(AUGMENT_LIST[2])).toBe(true);
    expect(poke.augments.length).toBe(3);

    // 4번째 증강 적용 시도 시 false 반환 및 추가 불가
    expect(poke.applyAugment(AUGMENT_LIST[3])).toBe(false);
    expect(poke.augments.length).toBe(3);
  });

  test("cloneWithMethods 후에도 applyAugment 정상 동작 (extensible 배열 보장)", () => {
    const poke = generate("배바닐라");
    const cloned = cloneWithMethods(poke);
    expect(Array.isArray(cloned.augments)).toBe(true);
    // clone된 인스턴스에 증강 추가 시 에러 없이 정상 적용되어야 함
    expect(() => {
      cloned.applyAugment(AUGMENT_LIST[0]);
    }).not.toThrow();
    expect(cloned.augments.length).toBe(1);
  });

  test("grantRandomAugment: 슬롯이 남은 팀 포켓몬에게 정상 지급", () => {
    const poke1 = generate("배바닐라");
    const poke2 = generate("한카리아스");
    const fakeBattle = {
      player: poke1,
      playerBench1: poke2,
      playerBench2: null,
    };

    const res1 = grantRandomAugment(fakeBattle, poke1);
    expect(res1).not.toBeNull();
    if (res1.augment.id === "rouletteWheel") {
      expect(fakeBattle.player.augments.length).toBe(0);
    } else {
      expect(poke1.augments.length).toBe(1);
    }

    // poke1(또는 교체된 player)을 3개 꽉 채움 (돌림판 제외한 증강들로)
    const activePoke1 = fakeBattle.player;
    const remaining = AUGMENT_LIST.filter((a) => a.id !== "rouletteWheel" && !activePoke1.hasAugment(a.id));
    while (activePoke1.augments.length < 3 && remaining.length > 0) {
      activePoke1.applyAugment(remaining.shift());
    }
    expect(activePoke1.augments.length).toBe(3);

    // 이제 grantRandomAugment 호출 시 poke2(벤치)에게 지급되어야 함
    const res2 = grantRandomAugment(fakeBattle, activePoke1);
    expect(res2).not.toBeNull();
    if (res2.augment.id === "rouletteWheel") {
      expect(fakeBattle.playerBench1.augments.length).toBe(0);
    } else {
      expect(fakeBattle.playerBench1.augments.length).toBe(1);
    }
  });

  test("1. 억까 방지: 명중률 80% 이상 기술 필중 (100) 확인", () => {
    const poke = generate("배바닐라");
    poke.applyAugment(AUGMENT_LIST.find((a) => a.id === "noUnfairMiss"));

    const skill80 = { name: "하이드로펌프", accur: 80, stype: "catk" };
    const skill70 = { name: "기합구슬", accur: 70, stype: "catk" };

    const fakeBt = { turn: { def: "npc" }, field: { weather: { isSnow: false, isRainy: false, isSunny: false } } };

    expect(getAccuracy(fakeBt, skill80, poke)).toBe(100);
    expect(getAccuracy(fakeBt, skill70, poke)).toBe(70);
  });

  test("2. 도박 중독: 기술 위력 3배 및 공격 기술 50% 실패 확인", () => {
    const battle = createBattle(["배바닐라", "배바닐라", "배바닐라"], ["어써러셔", "어써러셔", "어써러셔"]);
    const poke = battle.player;
    battle.turn.atk = "player";
    battle.turn.def = "npc";
    battle.turn.atkSN = 1;

    // 1) 데미지 위력 3배 검증
    const baseSkill = poke.origin.skill[1];
    poke.turn = { useSkill: baseSkill, critical: false };
    const normalDmg = damageCalculate(battle, {}, true);

    poke.applyAugment(AUGMENT_LIST.find((a) => a.id === "gamblingAddict"));
    const tripleDmg = damageCalculate(battle, {}, true);
    expect(tripleDmg).toBeGreaterThan(normalDmg * 2.5);
    expect(tripleDmg).toBeLessThan(normalDmg * 3.5);

    // 2) 명중률 자체는 깎이지 않음 (50% 실패 확률로 대체됨)
    expect(getAccuracy(battle, baseSkill, poke)).toBe(baseSkill.accur === "-" ? 100 : baseSkill.accur);

    // 3) afterSkillCheck 50% 실패 로직 검증
    const queue = [];
    const mockEnqueue = (item) => queue.push(item);

    // random(50)이 false를 반환하도록 모킹 -> 실패 발생
    const randomSpy = jest.spyOn(randomCheckModule, "random").mockReturnValue(false);
    const success = afterSkillCheck(battle, mockEnqueue);
    expect(success).toBe(false);
    expect(queue.some((q) => q.text === "하지만 실패했다!")).toBe(true);

    // 변화기는 도박 중독 실패 영향 없음
    queue.length = 0;
    const bufSkill = { name: "칼춤", power: "-", type: "노말", stype: "buf", accur: "-", feature: {} };
    poke.turn.useSkill = bufSkill;
    const bufSuccess = afterSkillCheck(battle, mockEnqueue);
    expect(bufSuccess).toBe(true);

    randomSpy.mockRestore();
  });

  test("3. 오른손엔 방패 왼손엔 검: 공/방 중 더 높은 값으로 통일 확인", () => {
    const poke = generate("배바닐라");
    const origAtk = poke.origin.stat.atk;
    const origDef = poke.origin.stat.def;
    const origCatk = poke.origin.stat.catk;
    const origCdef = poke.origin.stat.cdef;
    const maxPhys = Math.max(origAtk, origDef);

    poke.applyAugment(AUGMENT_LIST.find((a) => a.id === "swordAndShield"));

    expect(poke.origin.stat.atk).toBe(maxPhys);
    expect(poke.origin.stat.def).toBe(maxPhys);
    expect(poke.origin.stat.catk).toBe(origCatk);
    expect(poke.origin.stat.cdef).toBe(origCdef);
  });

  test("3-1. 오른손엔 방패 왼손엔 스태프: 특공/특방 중 더 높은 값으로 통일 확인", () => {
    const poke = generate("배바닐라");
    const origAtk = poke.origin.stat.atk;
    const origDef = poke.origin.stat.def;
    const origCatk = poke.origin.stat.catk;
    const origCdef = poke.origin.stat.cdef;
    const maxSpec = Math.max(origCatk, origCdef);

    poke.applyAugment(AUGMENT_LIST.find((a) => a.id === "specialSwordAndShield"));

    expect(poke.origin.stat.atk).toBe(origAtk);
    expect(poke.origin.stat.def).toBe(origDef);
    expect(poke.origin.stat.catk).toBe(maxSpec);
    expect(poke.origin.stat.cdef).toBe(maxSpec);
  });


  test("3-2. getAugmentDesc: 포켓몬 현재 수치 반영 확인", () => {
    const poke = generate("배바닐라");
    const swordAug = AUGMENT_LIST.find((a) => a.id === "swordAndShield");
    const staffAug = AUGMENT_LIST.find((a) => a.id === "specialSwordAndShield");

    const swordDesc = getAugmentDesc(swordAug, poke);
    expect(swordDesc).toContain(`공격(${poke.origin.stat.atk})`);
    expect(swordDesc).toContain(`방어(${poke.origin.stat.def})`);

    const staffDesc = getAugmentDesc(staffAug, poke);
    expect(staffDesc).toContain(`특공(${poke.origin.stat.catk})`);
    expect(staffDesc).toContain(`특방(${poke.origin.stat.cdef})`);

    // 포켓몬이 없을 경우 기본 설명 문구 fallback
    expect(getAugmentDesc(swordAug, null)).toBe("공격과 방어 중 더 높은 수치로 두 능력치를 통일합니다.");
    expect(getAugmentDesc(staffAug, null)).toBe("특공과 특방 중 더 높은 수치로 두 능력치를 통일합니다.");
  });

  test("4. 돌려 돌려 돌림판: 포켓몬 교체 확인 및 메서드 정상 유지", () => {
    const poke = generate("배바닐라");
    poke.originalIndex = 0;
    const fakeBattle = { player: poke };
    const origId = poke.id;

    poke.applyAugment(
      AUGMENT_LIST.find((a) => a.id === "rouletteWheel"),
      fakeBattle
    );

    expect(fakeBattle.player.id).not.toBe(origId);
    expect(fakeBattle.player.augments).toEqual([]); // 증강 초기화 확인
    expect(typeof fakeBattle.player.applyAugment).toBe("function");
    expect(poke.id).toBe(fakeBattle.player.id);
  });

  test("5. 돌려 돌려 돌림판: 벤치 포켓몬 대상 교체 확인", () => {
    const poke1 = generate("배바닐라");
    const poke2 = generate("한카리아스");
    poke1.originalIndex = 0;
    poke2.originalIndex = 1;
    const fakeBattle = { player: poke1, playerBench1: poke2 };

    poke2.applyAugment(
      AUGMENT_LIST.find((a) => a.id === "rouletteWheel"),
      fakeBattle
    );

    expect(fakeBattle.playerBench1.id).not.toBe("한카리아스");
    expect(fakeBattle.player.id).toBe("배바닐라");
  });

  test("6. H.H.G.G.H.G.G: 가장 높은 능력치로 모든 능력치 통일 및 코스트 6 확인", () => {
    const hhgghggAug = AUGMENT_LIST.find((a) => a.id === "hhgghgg");
    expect(hhgghggAug).toBeDefined();
    expect(hhgghggAug.name).toBe("H.H.G.G.H.G.G");
    expect(hhgghggAug.cost).toBe(6);

    const poke = generate("배바닐라");
    const stat = poke.origin.stat;
    const maxVal = Math.max(stat.atk, stat.def, stat.catk, stat.cdef, stat.speed);

    // 동적 설명 검증
    const descWithPoke = getAugmentDesc(hhgghggAug, poke);
    expect(descWithPoke).toBe(`가장 높은 능력치(${maxVal})로 모든 능력치가 통일됩니다.`);
    expect(getAugmentDesc(hhgghggAug, null)).toBe("가장 높은 능력치로 모든 능력치가 통일됩니다.");

    // 적용 시 모든 능력치가 maxVal로 통일
    expect(poke.applyAugment(hhgghggAug)).toBe(true);
    expect(poke.origin.stat.atk).toBe(maxVal);
    expect(poke.origin.stat.def).toBe(maxVal);
    expect(poke.origin.stat.catk).toBe(maxVal);
    expect(poke.origin.stat.cdef).toBe(maxVal);
    expect(poke.origin.stat.speed).toBe(maxVal);
  });
});
