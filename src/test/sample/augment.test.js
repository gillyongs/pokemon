import { generate } from "../../entity/Pokemon/PokemonInstance";
import { createBattle } from "../../entity/Battle";
import { AUGMENT_LIST, getAugmentDesc, isEligibleForDanceGarchomp } from "../../entity/Augment/AugmentData";
import { rollAugments, grantRandomAugment, rollTeamAugments } from "../../util/augmentRoll";
import { getAccuracy } from "../../function/accuracyCalculate";
import { damageCalculate } from "../../util/damageCalculate";
import { afterSkillCheck } from "../../service/skillCheck";
import * as randomCheckModule from "../../util/randomCheck";
import { cloneWithMethods } from "../../util/cloneWithMethods";
import { turnEnd } from "../../service/turnEnd";
import { skillUse } from "../../service/skillUse";

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

  test("7. 전용 증강 '춤춰라 한카리아스': 등장 조건 및 기술 교환 검증", () => {
    const danceAug = AUGMENT_LIST.find((a) => a.id === "danceOfGarchomp");
    expect(danceAug).toBeDefined();
    expect(danceAug.name).toBe("춤춰라 한카리아스");
    expect(danceAug.cost).toBe(1);

    // 1) 등장 자격 조건 검증 (isEligibleForDanceGarchomp)
    const garchomp = generate("한카리아스");
    expect(isEligibleForDanceGarchomp(garchomp)).toBe(true);

    const nonGarchomp = generate("배바닐라");
    expect(isEligibleForDanceGarchomp(nonGarchomp)).toBe(false);

    // 2) rollAugments: 한카리아스가 아닌 포켓몬에게는 절대 등장하지 않음
    for (let i = 0; i < 20; i++) {
      const rolled = rollAugments(nonGarchomp, 3);
      expect(rolled.some((a) => a.id === "danceOfGarchomp")).toBe(false);
    }

    // 3) 기술 교환 검증: 3번 슬롯(아이언헤드)을 용의춤으로 교환
    expect(garchomp.origin.skill[3].name).toBe("아이언헤드");
    expect(garchomp.applyAugment(danceAug, null, { replaceSlot: 3 })).toBe(true);

    expect(garchomp.origin.skill[1].name).toBe("지진");
    expect(garchomp.origin.skill[2].name).toBe("스케일샷");
    expect(garchomp.origin.skill[3].name).toBe("용의춤");
    expect(garchomp.origin.skill[3].skillNumber).toBe(3);
    expect(garchomp.origin.skill[4].name).toBe("스텔스록");
    expect(garchomp.pp[3]).toBe(32);

    // 4) 이미 용의춤을 배운 한카리아스에게는 다시 등장하지 않음
    expect(isEligibleForDanceGarchomp(garchomp)).toBe(false);
    expect(rollAugments(garchomp, 3).some((a) => a.id === "danceOfGarchomp")).toBe(false);
  });
  test("rollTeamAugments: 포켓몬별 증강 목록이 서로 다르게 추첨됨", () => {
    const p1 = generate("가이오가");
    const p2 = generate("에이스번");
    const p3 = generate("다투곰");
    const team = [p1, p2, p3];

    const teamChoices = rollTeamAugments(team);
    const k1 = p1.originalIndex ?? p1.id ?? 0;
    const k2 = p2.originalIndex ?? p2.id ?? 1;
    const k3 = p3.originalIndex ?? p3.id ?? 2;

    expect(teamChoices[k1].length).toBe(3);
    expect(teamChoices[k2].length).toBe(3);
    expect(teamChoices[k3].length).toBe(3);

    // 포켓몬 1과 포켓몬 2의 3개 목록이 완전히 같지 않음 (서로 다름)
    const ids1 = teamChoices[k1].map((a) => a.id);
    const ids2 = teamChoices[k2].map((a) => a.id);
    const ids3 = teamChoices[k3].map((a) => a.id);

    expect(ids1.sort().join(",")).not.toBe(ids2.sort().join(","));
    expect(ids2.sort().join(",")).not.toBe(ids3.sort().join(","));
  });
  test("적 처치 증강은 한 라운드에 최대 1회만 발생", () => {
    const battle = createBattle(["배바닐라", "배바닐라", "배바닐라"], ["어써러셔", "어써러셔", "어써러셔"], { mayhemMode: true });
    const queue = [];
    const enqueue = (item) => queue.push(item);

    // 1번째 적 쓰러짐
    battle.turn.npcFaintedCount = 1;
    turnEnd(battle, enqueue);

    expect(battle.hasKnockoutAugmentThisRound).toBe(true);
    const augmentItems1 = queue.filter((q) => q.isAugment);
    expect(augmentItems1.length).toBe(1);

    // 2번째 적 쓰러짐 (같은 라운드)
    battle.turn.npcFaintedCount = 1;
    turnEnd(battle, enqueue);

    // 2번째 적이 쓰러져도 추가 증강은 큐에 등록되지 않음
    const augmentItems2 = queue.filter((q) => q.isAugment);
    expect(augmentItems2.length).toBe(1);
  });
  test("구애받지않는(unboundChoice): 구애류 도구 소유 조건, 코스트 2 및 스킬 잠금 면제 검증", () => {
    const aug = AUGMENT_LIST.find((a) => a.id === "unboundChoice");
    expect(aug).toBeDefined();
    expect(aug.name).toBe("구애받지않는");
    expect(aug.cost).toBe(2);

    // 1) 조건 검증: 구애 시리즈 도구 소유 여부
    const scarfPoke = generate("가이오가"); // 기본 도구 구애스카프
    expect(scarfPoke.item).toBe("구애스카프");
    expect(aug.isEligible(scarfPoke)).toBe(true);

    const bandPoke = generate("망나뇽");
    bandPoke.item = "구애머리띠";
    expect(aug.isEligible(bandPoke)).toBe(true);

    const nonChoicePoke = generate("배바닐라");
    expect(aug.isEligible(nonChoicePoke)).toBe(false);

    // 2) 효과 검증: 구애스카프 착용 시 증강이 없으면 onlySkill 잠금, 증강 적용 시 잠금 해제/면제
    const battle = createBattle(["가이오가", "배바닐라", "배바닐라"], ["어써러셔", "어써러셔", "어써러셔"]);
    battle.turn.atkSN = 1;
    battle.turn.atk = "player";
    battle.turn.def = "npc";
    battle.player.turn.useSkill = battle.player.origin.skill[1];

    // 증강 없이 스킬 사용 -> onlySkill 고정됨
    skillUse(battle, () => {});
    expect(battle.player.tempStatus.onlySkill).toBe(battle.player.origin.skill[1].name);

    // 증강 적용 -> onlySkill 잠금 해제됨
    scarfPoke.tempStatus = { onlySkill: "해수스파우팅" };
    expect(scarfPoke.applyAugment(aug)).toBe(true);
    expect(scarfPoke.tempStatus.onlySkill).toBeNull();

    // 증강 적용 후 스킬 사용 -> onlySkill 고정되지 않음
    battle.player.applyAugment(aug);
    battle.player.tempStatus.onlySkill = null;
    skillUse(battle, () => {});
    expect(battle.player.tempStatus.onlySkill).toBeNull();

    // 3) 특성 무아지경은 구애받지않는 증강이 있어도 무아지경으로 인해 잠금 유지
    const dBattle = createBattle(["불비달마", "배바닐라", "배바닐라"], ["어써러셔", "어써러셔", "어써러셔"]);
    dBattle.player.abil = "무아지경";
    dBattle.player.item = "구애스카프";
    dBattle.player.applyAugment(aug);
    dBattle.turn.atkSN = 1;
    dBattle.turn.atk = "player";
    dBattle.turn.def = "npc";
    dBattle.player.turn.useSkill = dBattle.player.origin.skill[1];

    skillUse(dBattle, () => {});
    // 무아지경 효과로 인해 onlySkill은 여전히 고정되어야 함
    expect(dBattle.player.tempStatus.onlySkill).toBe(dBattle.player.origin.skill[1].name);
  });
});