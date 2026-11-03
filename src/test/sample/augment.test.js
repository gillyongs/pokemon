import { generate } from "../../entity/Pokemon/PokemonInstance";
import { createBattle } from "../../entity/Battle";
import { AUGMENT_LIST } from "../../entity/Augment/AugmentData";
import { isNoEffect, typeCheckOnBattle } from "../../util/typeEffectCalculate";
import { rollAugments, grantRandomAugment, rollTeamAugments } from "../../util/augmentRoll";
import { getAccuracy } from "../../function/accuracyCalculate";
import { damageCalculate } from "../../util/damageCalculate";
import { afterSkillCheck } from "../../service/skillCheck";
import * as randomCheckModule from "../../util/randomCheck";
import { cloneWithMethods } from "../../util/cloneWithMethods";
import { turnEnd } from "../../service/turnEnd";
import { processAilment } from "../../service/turnEnd/ailmentEvent";
import { applyOnHitEvents } from "../../service/onHit";
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

    // 1) 등장 자격 조건 검증 (danceAug.isEligible)
    const garchomp = generate("한카리아스");
    expect(danceAug.isEligible(garchomp)).toBe(true);

    const nonGarchomp = generate("배바닐라");
    expect(danceAug.isEligible(nonGarchomp)).toBe(false);

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
    expect(danceAug.isEligible(garchomp)).toBe(false);
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

    // 3) 특성 무아지경도 구애받지않는 증강이 있으면 스킬 고정 면제
    const dBattle = createBattle(["불비달마", "배바닐라", "배바닐라"], ["어써러셔", "어써러셔", "어써러셔"]);
    dBattle.player.abil = "무아지경";
    dBattle.player.item = "구애스카프";
    dBattle.player.applyAugment(aug);
    dBattle.turn.atkSN = 1;
    dBattle.turn.atk = "player";
    dBattle.turn.def = "npc";
    dBattle.player.turn.useSkill = dBattle.player.origin.skill[1];

    skillUse(dBattle, () => {});
    expect(dBattle.player.tempStatus.onlySkill).toBeNull();
  });
  test("할머니의 고추기름(grandmasChiliOil): 화상 부가효과 기술 보유 조건 및 화상 데미지 5배 증가", () => {
    const aug = AUGMENT_LIST.find((a) => a.id === "grandmasChiliOil");
    expect(aug).toBeDefined();
    expect(aug.name).toBe("할머니의 고추기름");
    expect(aug.cost).toBe(1);

    // 1) 조건 검증: 현재 기술의 부가효과로 화상이 있는 경우만 출현
    const arcanine = generate("윈디"); // 도깨비불(화상), 플레어드라이브(화상)
    expect(aug.isEligible(arcanine)).toBe(true);

    const kyogre = generate("가이오가"); // 화상 부가효과 없음
    expect(aug.isEligible(kyogre)).toBe(false);

    const garchomp = generate("한카리아스"); // 화상 부가효과 없음
    expect(aug.isEligible(garchomp)).toBe(false);

    // 2) 효과 검증: 상대 포켓몬이 화상 상태일 때 화상 데미지 5배 증가
    const battle = createBattle(["윈디", "배바닐라", "배바닐라"], ["어써러셔", "어써러셔", "어써러셔"]);
    battle.npc.ailment.burn = true;
    const baseDamage = Math.max(1, Math.floor(battle.npc.origin.hp / 16));

    const initialHp = battle.npc.hp;
    processAilment(battle, () => {}, "player", "npc");
    // 증강 미적용 시: 일반 화상 데미지
    expect(battle.npc.hp).toBe(initialHp - baseDamage);

    // 증강 적용
    battle.player.applyAugment(aug);
    const hpBeforeAugment = battle.npc.hp;
    processAilment(battle, () => {}, "player", "npc");
    // 증강 적용 시: 화상 데미지 5배 증가
    expect(battle.npc.hp).toBe(hpBeforeAugment - baseDamage * 5);

    // 본인(플레이어)이 화상일 때는 5배 증가가 적용되지 않음 (상대 포켓몬만 해당)
    battle.player.ailment.burn = true;
    const playerBaseDmg = Math.max(1, Math.floor(battle.player.origin.hp / 16));
    const playerInitHp = battle.player.hp;
    processAilment(battle, () => {}, "player", "npc");
    expect(battle.player.hp).toBe(playerInitHp - playerBaseDmg);

    // 3) 벤치 포켓몬이 고추기름 증강을 가지고 있고, 현재 배틀 중인 포켓몬은 가지고 있지 않은 경우 5배 미적용 (일반 데미지 적용)
    const benchBattle = createBattle(["배바닐라", "윈디", "배바닐라"], ["어써러셔", "어써러셔", "어써러셔"]);
    benchBattle.playerBench1.applyAugment(aug); // 벤치 포켓몬이 증강 보유
    benchBattle.npc.ailment.burn = true;
    const benchNpcInitHp = benchBattle.npc.hp;
    processAilment(benchBattle, () => {}, "player", "npc");
    // 배틀 중인 배바닐라는 증강이 없으므로 일반 1배 화상 데미지만 적용됨
    expect(benchBattle.npc.hp).toBe(benchNpcInitHp - baseDamage);
  });

  test("돌려 돌려 돌림판: 반피 이상일 때만 등장 조건(isEligible) 확인", () => {
    const poke = generate("배바닐라");
    const maxHp = poke.origin.hp;
    const roulette = AUGMENT_LIST.find((a) => a.id === "rouletteWheel");

    // 1) 풀피: 등장 가능
    poke.hp = maxHp;
    expect(roulette.isEligible(poke)).toBe(true);

    // 2) 정확히 반피: 등장 가능
    poke.hp = Math.ceil(maxHp / 2);
    expect(roulette.isEligible(poke)).toBe(true);

    // 3) 반피 미만 (예: 절반 - 1): 등장 불가
    poke.hp = Math.floor(maxHp / 2) - 1;
    expect(roulette.isEligible(poke)).toBe(false);

    // 반피 미만일 때 추첨 풀에 돌려돌려돌림판이 포함되지 않아야 함
    const rolledBelowHalf = rollAugments(poke, 20);
    expect(rolledBelowHalf.some((a) => a.id === "rouletteWheel")).toBe(false);

    const teamChoices = rollTeamAugments([poke]);
    const pokeKey = poke.originalIndex ?? poke.id ?? 0;
    expect((teamChoices[pokeKey] || []).some((a) => a.id === "rouletteWheel")).toBe(false);

    // 4) 기절(HP 0): 등장 불가
    poke.hp = 0;
    expect(roulette.isEligible(poke)).toBe(false);
  });

  test("가시갑옷(thornmail): 타격기술(접촉기) 피격 시 상대에게 1/6 데미지 반사 및 울퉁불퉁멧 중첩 확인", () => {
    const aug = AUGMENT_LIST.find((a) => a.id === "thornmail");
    expect(aug).toBeDefined();
    expect(aug.name).toBe("가시갑옷");
    expect(aug.cost).toBe(3);
    expect(aug.desc).toBe("타격기술을 받을 때 상대방에게 체력의 1/6 데미지를 줍니다.");

    const battle = createBattle(["배바닐라", "한카리아스", "배바닐라"], ["어써러셔", "어써러셔", "어써러셔"]);
    // 플레이어: 한카리아스(피격자), NPC: 어써러셔(공격자)
    battle.player.applyAugment(aug);

    battle.turn.atk = "npc";
    battle.turn.def = "player";

    // 1) 타격기술 (접촉기: feature.touch = true)
    battle.npc.turn.useSkill = {
      name: "웨이브푸시",
      feature: { touch: true },
      type: "물",
      stype: "atk",
    };

    const initialNpcHp = battle.npc.hp;
    const expectedDmg = Math.floor(battle.npc.origin.hp / 6);
    applyOnHitEvents(battle, () => {});

    expect(battle.npc.hp).toBe(initialNpcHp - expectedDmg);

    // 2) 비접촉기 (feature.touch = false): 가시갑옷 반사 데미지 미발동
    battle.npc.turn.useSkill = {
      name: "파도타기",
      feature: { touch: false },
      type: "물",
      stype: "catk",
    };
    const hpBeforeNonTouch = battle.npc.hp;
    applyOnHitEvents(battle, () => {});
    expect(battle.npc.hp).toBe(hpBeforeNonTouch);

    // 3) 울퉁불퉁멧과 동시 장착 시 각각 1/6씩 총 2배(1/3) 데미지 중첩 적용
    battle.player.item = "울퉁불퉁멧";
    battle.npc.turn.useSkill = {
      name: "웨이브푸시",
      feature: { touch: true },
      type: "물",
      stype: "atk",
    };
    const hpBeforeDouble = battle.npc.hp;
    applyOnHitEvents(battle, () => {});
    expect(battle.npc.hp).toBe(hpBeforeDouble - expectedDmg * 2);
  });

  test("원펀맨(onePunchMan): 코스트 999 및 공격기술 위력 999배 증가 검증", () => {
    const aug = AUGMENT_LIST.find((a) => a.id === "onePunchMan");
    expect(aug).toBeDefined();
    expect(aug.name).toBe("진심 펀치");
    expect(aug.cost).toBe(999);
    expect(aug.desc).toBe("공격기술의 위력이 999배 증가합니다.");

    const battle = createBattle(["망나뇽", "배바닐라", "배바닐라"], ["어써러셔", "어써러셔", "어써러셔"]);
    battle.turn.atk = "player";
    battle.turn.def = "npc";
    battle.turn.atkSN = 1;
    battle.player.turn = { useSkill: battle.player.origin.skill[1], critical: false };

    const baseDamage = damageCalculate(battle, {}, true);
    battle.player.applyAugment(aug);
    const opmDamage = damageCalculate(battle, {}, true);

    expect(opmDamage).toBeGreaterThanOrEqual(baseDamage * 800);
  });

  test("이 포켓몬의 이름은 보만다(nameIsSalamence): 보만다 전용 + 지진 미보유 조건, 지진 교체, 코스트 0, 줄바꿈 설명", () => {
    const aug = AUGMENT_LIST.find((a) => a.id === "nameIsSalamence");
    expect(aug).toBeDefined();
    expect(aug.name).toBe("그리고 쓰는 기술은 지진이 있다");
    expect(aug.cost).toBe(0);
    expect(aug.desc).toBe("보  만  다  !!\n  지   진");
    expect(aug.shiftUp).toBe(true);

    const salamence = generate("메가보만다");
    const hasEarthquake = Object.values(salamence.origin.skill).some((sk) => sk?.name === "지진");
    expect(hasEarthquake).toBe(false);
    expect(aug.isEligible(salamence)).toBe(true);

    const garchomp = generate("한카리아스");
    expect(aug.isEligible(garchomp)).toBe(false);

    const battle = createBattle(["메가보만다", "배바닐라", "배바닐라"], ["어써러셔", "어써러셔", "어써러셔"]);
    salamence.applyAugment(aug, battle, { replaceSlot: 2 });

    expect(salamence.origin.skill[2].name).toBe("지진");
    expect(salamence.pp[2]).toBe(16);
    expect(salamence._salamenceReplacedSlot).toBe(2);

    expect(aug.isEligible(salamence)).toBe(false);
  });

  test("무효~! 겟또다제(nullifyGetto): 코스트 5, 이미 무효인 타입 판정, 선택한 타입 데미지 0 및 무효화 검증", () => {
    const aug = AUGMENT_LIST.find((a) => a.id === "nullifyGetto");
    expect(aug).toBeDefined();
    expect(aug.name).toBe("무효~! 겟또다제");
    expect(aug.cost).toBe(5);
    expect(aug.desc).toBe("해당 포켓몬에게 무효 타입을 하나 추가합니다.");

    // 1. 순수 상성상 이미 무효인 타입 판정 검사 (저승갓숭: 격투/고스트 -> 노말/격투는 고스트 상성으로 이미 무효)
    const annihilape = generate("저승갓숭");
    expect(isNoEffect("노말", annihilape.type1, annihilape.type2)).toBe(true);
    expect(isNoEffect("격투", annihilape.type1, annihilape.type2)).toBe(true);
    expect(isNoEffect("페어리", annihilape.type1, annihilape.type2)).toBe(false);

    // 2. 비행 타입 포켓몬 (망나뇽: 드래곤/비행 -> 땅 이미 무효, 얼음은 4배 약점)
    const dragonite = generate("망나뇽");
    expect(isNoEffect("땅", dragonite.type1, dragonite.type2)).toBe(true);
    expect(isNoEffect("얼음", dragonite.type1, dragonite.type2)).toBe(false);

    // 3. 증강 적용 (망나뇽에게 얼음 타입 무효 선택)
    const battle = createBattle(["망나뇽", "배바닐라", "배바닐라"], ["어써러셔", "어써러셔", "어써러셔"]);
    dragonite.applyAugment(aug, battle, { selectedType: "얼음" });

    // 적용 후에는 얼음 타입도 무효로 판정
    expect(dragonite.augments.find((a) => a.id === "nullifyGetto")?.selectedType).toBe("얼음");
    expect(getAugmentDesc(aug, dragonite)).toContain("[얼음] 무효");

    // 4. 배틀에서 실제 얼음 타입 공격 시 상성 배율 0배 및 데미지 0 확인
    battle.turn.atk = "npc";
    battle.turn.def = "player";
    battle.player = dragonite;
    const iceSkill = { name: "눈보라", type: "얼음", power: 110, stype: "catk" };
    battle.npc.turn = { useSkill: iceSkill, critical: false };
    battle.turn.atkSN = 1;
    battle.npc.origin.skill[1] = iceSkill;

    const mult = typeCheckOnBattle(battle, "얼음", dragonite.type1, dragonite.type2, "눈보라");
    expect(mult).toBe(0);

    const dmg = damageCalculate(battle, {}, true);
    expect(dmg).toBe(0);
  });

  test("테라버스트(teraBlast): 기술 교체, 선택한 타입 부여, 공격/특공 중 높은 쪽으로 데미지 계산", () => {
    const aug = AUGMENT_LIST.find((a) => a.id === "teraBlast");
    expect(aug).toBeDefined();
    expect(aug.name).toBe("테라버스트");
    expect(aug.cost).toBe(1);

    // 1. 망나뇽에게 불꽃 타입 테라버스트를 2번 슬롯에 적용
    const battle = createBattle(["망나뇽", "배바닐라", "배바닐라"], ["어써러셔", "어써러셔", "어써러셔"]);
    const dragonite = battle.player;
    dragonite.applyAugment(aug, battle, { replaceSlot: 2, selectedType: "불꽃" });

    const teraSkill = dragonite.origin.skill[2];
    expect(teraSkill).toBeDefined();
    expect(teraSkill.name).toBe("테라버스트");
    expect(teraSkill.type).toBe("불꽃");
    expect(teraSkill.power).toBe(80);
    expect(teraSkill.accur).toBe(100);
    expect(teraSkill.pp).toBe(16); // 10 PP * 1.6 (포인트업 3회)
    expect(teraSkill.stype).toBe("catk");

    // getAugmentDesc (선택 화면용) 확인: (공격/특공 중 높은 능력치로 계산) 제외
    expect(getAugmentDesc(aug, dragonite)).toBe("현재 기술 중 하나를 원하는 타입의 테라버스트로 교체합니다.");
    expect(getAugmentDesc(aug, dragonite)).not.toContain("공격/특공 중 높은 능력치로 계산");

    // getAugmentLogDesc (로그 및 상태용) 확인: [이전기술명]을/를 [타입] 타입 테라버스트로 변경하였습니다
    const logDesc = getAugmentLogDesc(aug, dragonite);
    expect(logDesc).toBe("[역린]을 [불꽃] 타입 테라버스트로 변경하였습니다.");
    expect(logDesc).not.toContain("공격/특공 중 높은 능력치로 계산");

    // 2. 공격 > 특공인 포켓몬 (망나뇽은 공격 134 > 특공 100) -> 물리(atk, def)로 계산
    battle.turn.atk = "player";
    battle.turn.def = "npc";
    battle.player.turn = { useSkill: teraSkill, critical: false };
    battle.turn.atkSN = 2;

    const dmgPhys = damageCalculate(battle, {}, true);
    expect(dmgPhys).toBeGreaterThan(0);

    // 3. 특공 > 공격인 포켓몬으로 교체 테스트 (가이오가: 특공 150 > 공격 100)
    const kyogre = generate("가이오가");
    battle.player = kyogre;
    kyogre.applyAugment(aug, battle, { replaceSlot: 1, selectedType: "전기" });
    const elecTera = kyogre.origin.skill[1];
    expect(elecTera.type).toBe("전기");

    battle.player.turn = { useSkill: elecTera, critical: false };
    battle.turn.atkSN = 1;
    const dmgSpec = damageCalculate(battle, {}, true);
    expect(dmgSpec).toBeGreaterThan(0);
  });

  test("실패하면 반역 성공하면 혁명: 공격과 특공 중 하나가 2배, 다른 하나가 절반이 됨", () => {
    const aug = AUGMENT_LIST.find((a) => a.id === "rebellionOrRevolution");
    expect(aug).toBeDefined();
    expect(aug.name).toBe("실패하면 반역 성공하면 혁명");
    expect(aug.cost).toBe(3);

    // 1) 공격 2배, 특공 절반 케이스
    const battle1 = createBattle(["망나뇽", "한카리아스", "한카리아스"], ["어써러셔", "어써러셔", "어써러셔"]);
    const p1 = battle1.player;
    const origAtk1 = p1.origin.stat.atk;
    const origCatk1 = p1.origin.stat.catk;

    p1.applyAugment(aug, battle1, { targetStat: "atk" });
    expect(p1.origin.stat.atk).toBe(Math.round(origAtk1 * 2));
    expect(p1.origin.stat.catk).toBe(Math.floor(origCatk1 / 2));
    // getAugmentLogDesc는 적용된 결과 표시
    expect(getAugmentLogDesc(aug, p1)).toContain("공격");
    expect(getAugmentLogDesc(aug, p1)).toContain("2배");
    expect(getAugmentLogDesc(aug, p1)).toContain("절반이 되었습니다");

    // 2) 2번째 포켓몬이 증강 목록을 볼 때 (getAugmentDesc), 1번 포켓몬의 결과가 누출되지 않아야 함
    const battle2 = createBattle(["망나뇽", "한카리아스", "한카리아스"], ["어써러셔", "어써러셔", "어써러셔"]);
    const p2 = battle2.player;
    expect(getAugmentDesc(aug, p2)).toContain("중 하나가 2배가 되고 다른 하나가 절반이 됩니다");
    expect(getAugmentDesc(aug, p2)).not.toContain("절반이 되었습니다");

    // 특공 2배, 공격 절반 케이스 적용
    const origAtk2 = p2.origin.stat.atk;
    const origCatk2 = p2.origin.stat.catk;

    p2.applyAugment(aug, battle2, { targetStat: "catk" });
    expect(p2.origin.stat.catk).toBe(Math.round(origCatk2 * 2));
    expect(p2.origin.stat.atk).toBe(Math.floor(origAtk2 / 2));
    expect(getAugmentLogDesc(aug, p2)).toContain("특수공격");
    expect(getAugmentLogDesc(aug, p2)).toContain("2배");
    expect(getAugmentLogDesc(aug, p2)).toContain("절반이 되었습니다");
  })
  test("무한의 대검(infinityEdge): 코스트 3500, 공격력 +75, 치명타 피해량 +30% 검증", () => {
    const aug = AUGMENT_LIST.find((a) => a.id === "infinityEdge");
    expect(aug).toBeDefined();
    expect(aug.name).toBe("무한의 대검");
    expect(aug.cost).toBe(7);

    // 설명 확인
    expect(getAugmentDesc(aug)).toContain("공격력 🗡️ 75");
    expect(getAugmentDesc(aug)).toContain("치명타 확률 💥 25%");
    expect(getAugmentDesc(aug)).toContain("치명타 피해량 ➕💥 30%");

    // 망나뇽에게 적용
    const battle = createBattle(["망나뇽", "배바닐라", "배바닐라"], ["어써러셔", "어써러셔", "어써러셔"]);
    const dragonite = battle.player;
    const baseAtk = dragonite.origin.stat.atk;

    dragonite.applyAugment(aug, battle);
    expect(dragonite.origin.stat.atk).toBe(baseAtk + 75);
    if (dragonite.stat) expect(dragonite.stat.atk).toBe(baseAtk + 75);

    // 급소 데미지 계산 시 30% 증가 검증
    battle.turn.atk = "player";
    battle.turn.def = "npc";
    battle.turn.atkSN = 1; // 신속
    battle.player.turn = { useSkill: dragonite.origin.skill[1], critical: true };

    // IE 적용 상태 데미지
    const ieCritDamage = damageCalculate(battle, {}, false);
    expect(dragonite.log.damage2).toContain("1.5 (급소) * 1.3 (무한의 대검)");
    expect(ieCritDamage).toBeGreaterThan(0);
  });
});
