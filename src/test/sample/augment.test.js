import { generate } from "../../entity/Pokemon/PokemonInstance";
import { AUGMENT_LIST } from "../../entity/Augment/AugmentData";
import { rollAugments, grantRandomAugment } from "../../util/augmentRoll";
import { getAccuracy } from "../../function/accuracyCalculate";
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

  test("모든 증강에 cost(값) 속성이 양의 정수로 정의되어 있음", () => {
    AUGMENT_LIST.forEach((aug) => {
      expect(typeof aug.cost).toBe("number");
      expect(aug.cost).toBeGreaterThan(0);
    });
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
    expect(poke1.augments.length).toBe(1);

    // 중복되지 않는 증강으로 poke1을 3개 꽉 채움
    const remaining = AUGMENT_LIST.filter((a) => !poke1.hasAugment(a.id));
    poke1.applyAugment(remaining[0]);
    poke1.applyAugment(remaining[1]);
    expect(poke1.augments.length).toBe(3);

    // 이제 grantRandomAugment 호출 시 poke2(벤치)에게 지급되어야 함
    const res2 = grantRandomAugment(fakeBattle, poke1);
    expect(res2).not.toBeNull();
    expect(res2.target).toBe(poke2);
    expect(poke2.augments.length).toBe(1);
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

  test("2. 도박 중독: 공격기 명중률 절반 확인", () => {
    const poke = generate("배바닐라");
    poke.applyAugment(AUGMENT_LIST.find((a) => a.id === "gamblingAddict"));

    const atkSkill = { name: "눈보라", accur: 70, stype: "catk" };
    const bufSkill = { name: "전기자석파", accur: 90, stype: "buf" };

    const fakeBt = { turn: { def: "npc" }, field: { weather: { isSnow: false, isRainy: false, isSunny: false } } };

    expect(getAccuracy(fakeBt, atkSkill, poke)).toBe(35);
    // 변화기는 명중률 감소 없음
    expect(getAccuracy(fakeBt, bufSkill, poke)).toBe(90);
  });

  test("3. 오른손에 방패 왼손엔 검: 공/방, 특공/특방 스왑 확인", () => {
    const poke = generate("배바닐라");
    const origAtk = poke.origin.stat.atk;
    const origDef = poke.origin.stat.def;
    const origCatk = poke.origin.stat.catk;
    const origCdef = poke.origin.stat.cdef;

    poke.applyAugment(AUGMENT_LIST.find((a) => a.id === "swordAndShield"));

    expect(poke.origin.stat.atk).toBe(origDef);
    expect(poke.origin.stat.def).toBe(origAtk);
    expect(poke.origin.stat.catk).toBe(origCdef);
    expect(poke.origin.stat.cdef).toBe(origCatk);
  });

  test("4. 돌려 돌려 돌림판: 포켓몬 교체 확인 및 메서드 정상 유지", () => {
    const poke = generate("배바닐라");
    poke.originalIndex = 0;
    const fakeBattle = { player: poke };
    const origId = poke.id;

    poke.applyAugment(AUGMENT_LIST.find((a) => a.id === "rouletteWheel"), fakeBattle);

    expect(fakeBattle.player.id).not.toBe(origId);
    expect(fakeBattle.player.augments).toBeDefined();
    expect(fakeBattle.player.augments.some((a) => a.id === "rouletteWheel")).toBe(true);
    expect(typeof fakeBattle.player.applyAugment).toBe("function");
    expect(poke.id).toBe(fakeBattle.player.id);
  });

  test("5. 돌려 돌려 돌림판: 벤치 포켓몬 대상 교체 확인", () => {
    const poke1 = generate("배바닐라");
    const poke2 = generate("한카리아스");
    poke1.originalIndex = 0;
    poke2.originalIndex = 1;
    const fakeBattle = { player: poke1, playerBench1: poke2 };

    poke2.applyAugment(AUGMENT_LIST.find((a) => a.id === "rouletteWheel"), fakeBattle);

    expect(fakeBattle.playerBench1.id).not.toBe("한카리아스");
    expect(fakeBattle.player.id).toBe("배바닐라");
  });
});
