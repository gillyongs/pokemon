import { generate } from "../../entity/Pokemon/PokemonInstance";
import { AUGMENT_LIST } from "../../entity/Augment/AugmentData";
import { rollAugments } from "../../util/augmentRoll";
import { getAccuracy } from "../../function/accuracyCalculate";

describe("아수라장 증강 시스템 테스트", () => {
  test("증강 3개 추첨 확인", () => {
    const poke = generate("배바닐라");
    const rolled = rollAugments(poke, 3);
    expect(rolled.length).toBe(3);
    // 중복 없음
    const ids = rolled.map((r) => r.id);
    expect(new Set(ids).size).toBe(3);
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

  test("4. 돌려 돌려 돌림판: 포켓몬 교체 확인", () => {
    const poke = generate("배바닐라");
    const fakeBattle = { player: poke };
    const origId = poke.id;

    poke.applyAugment(AUGMENT_LIST.find((a) => a.id === "rouletteWheel"), fakeBattle);

    expect(fakeBattle.player.id).not.toBe(origId);
    expect(fakeBattle.player.augments).toBeDefined();
  });
});
