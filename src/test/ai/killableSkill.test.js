// npm test -- src/test/ai/killableSkill.test.js
import { getKillableSkill, hasStrongDemerit, hasWeakDemerit } from "../../npc/ai/easy";
import skillList from "../../entity/Skill/skillList";

describe("getKillableSkill 결정 로직 및 디메리트 분류 테스트", () => {
  const dummyBt = {
    npc: {
      origin: { hp: 100, stat: { atk: 100, catk: 100, def: 100, cdef: 100, speed: 100 } },
      abil: "맹화",
      tempStatus: { rank: {} },
    },
    player: {
      origin: { hp: 100, stat: { atk: 100, catk: 100, def: 100, cdef: 100, speed: 100 }, role: "물리어태커" },
      role: "물리어태커",
      tempStatus: { rank: {} },
      ailment: { burn: null },
    },
    field: {
      weather: { isRainy: false, isSunny: false },
    },
    weather: "맑음",
  };

  describe("디메리트 판별 테스트", () => {
    it("강한 디메리트 스킬을 올바르게 판별해야 한다 (자폭, 반동휴식, 철제광선반동, 자동, 특공/공격 2랭크 하락)", () => {
      const explosion = { sk: skillList.getDataById("대폭발") };
      const hyperBeam = { sk: skillList.getDataById("파괴광선") };
      const steelBeam = { sk: skillList.getDataById("철제광선") };
      const outrage = { sk: skillList.getDataById("역린") };
      const dracoMeteor = { sk: skillList.getDataById("용성군") };
      const overheat = { sk: skillList.getDataById("오버히트") };
      const earthquake = { sk: skillList.getDataById("지진") };

      expect(hasStrongDemerit(explosion, dummyBt)).toBe(true);
      expect(hasStrongDemerit(hyperBeam, dummyBt)).toBe(true);
      expect(hasStrongDemerit(steelBeam, dummyBt)).toBe(true);
      expect(hasStrongDemerit(outrage, dummyBt)).toBe(true);
      expect(hasStrongDemerit(dracoMeteor, dummyBt)).toBe(true);
      expect(hasStrongDemerit(overheat, dummyBt)).toBe(true);
      expect(hasStrongDemerit(earthquake, dummyBt)).toBe(false);
    });

    it("화상치료(물거품아리아): 상대가 물리어태커/딜탱이고 화상에 걸렸을 때만 강한 디메리트여야 한다", () => {
      const sparkAria = { sk: skillList.getDataById("물거품아리아") };

      // Case 1: 물리어태커 + 화상 O -> 강한 디메리트
      const physicalBurnBt = {
        ...dummyBt,
        player: { ...dummyBt.player, role: "물리어태커", ailment: { burn: 1 } },
      };
      expect(hasStrongDemerit(sparkAria, physicalBurnBt)).toBe(true);

      // Case 2: 물리딜탱 + 화상 O -> 강한 디메리트
      const physicalTankBurnBt = {
        ...dummyBt,
        player: { ...dummyBt.player, role: "물리딜탱", origin: { ...dummyBt.player.origin, role: "물리딜탱" }, ailment: { burn: 1 } },
      };
      expect(hasStrongDemerit(sparkAria, physicalTankBurnBt)).toBe(true);

      // Case 3: 물리어태커이지만 화상 X -> 강한 디메리트 아님
      const physicalNoBurnBt = {
        ...dummyBt,
        player: { ...dummyBt.player, role: "물리어태커", origin: { ...dummyBt.player.origin, role: "물리어태커" }, ailment: { burn: null } },
      };
      expect(hasStrongDemerit(sparkAria, physicalNoBurnBt)).toBe(false);

      // Case 4: 특수어태커 + 화상 O -> 강한 디메리트 아님
      const specialBurnBt = {
        ...dummyBt,
        player: { ...dummyBt.player, role: "특수어태커", origin: { ...dummyBt.player.origin, role: "특수어태커" }, ailment: { burn: 1 } },
      };
      expect(hasStrongDemerit(sparkAria, specialBurnBt)).toBe(false);
    });

    it("약한 디메리트 스킬을 올바르게 판별해야 한다 (빗나감패널티, 반동, 방어/특방 1랭크 하락, 연속사용불가)", () => {
      const highJumpKick = { sk: skillList.getDataById("무릎차기") };
      const thunderDive = { sk: skillList.getDataById("썬더다이브") };
      const braveBird = { sk: skillList.getDataById("브레이브버드") };
      const closeCombat = { sk: skillList.getDataById("인파이트") };
      const bloodMoon = { sk: skillList.getDataById("블러드문") };
      const earthquake = { sk: skillList.getDataById("지진") };

      expect(hasWeakDemerit(highJumpKick, dummyBt)).toBe(true);
      expect(hasWeakDemerit(thunderDive, dummyBt)).toBe(true);
      expect(hasWeakDemerit(braveBird, dummyBt)).toBe(true);
      expect(hasWeakDemerit(closeCombat, dummyBt)).toBe(true);
      expect(hasWeakDemerit(bloodMoon, dummyBt)).toBe(true);
      expect(hasWeakDemerit(earthquake, dummyBt)).toBe(false);
    });

    it("강한 디메리트 기술(용성군, 대폭발, 역린)은 약한 디메리트에서 제외되어야 한다", () => {
      const dracoMeteor = { sk: skillList.getDataById("용성군") };
      const explosion = { sk: skillList.getDataById("대폭발") };
      const outrage = { sk: skillList.getDataById("역린") };

      expect(hasWeakDemerit(dracoMeteor, dummyBt)).toBe(false);
      expect(hasWeakDemerit(explosion, dummyBt)).toBe(false);
      expect(hasWeakDemerit(outrage, dummyBt)).toBe(false);
    });

    it("돌머리 특성일 때 반동기는 약한 디메리트가 아니어야 한다", () => {
      const rockHeadBt = {
        ...dummyBt,
        npc: { ...dummyBt.npc, abil: "돌머리" },
      };
      const braveBird = { sk: skillList.getDataById("브레이브버드") };
      expect(hasWeakDemerit(braveBird, rockHeadBt)).toBe(false);
    });
  });

  describe("getKillableSkill 우선순위 계층 테스트 (우선도 -> 강한 디메리트 없음 -> 명중률 -> 약한 디메리트 없음 -> 데미지)", () => {
    it("1단계: 우선도가 더 높은 기술이 우선 선택되어야 한다", () => {
      // 1: 야습 (우선도 +1, minDmg 20), 2: 지진 (우선도 0, minDmg 100)
      const skObj = {
        1: { number: 1, minDmg: 20, maxDmg: 25, sk: skillList.getDataById("야습") },
        2: { number: 2, minDmg: 100, maxDmg: 120, sk: skillList.getDataById("지진") },
      };
      // 상대 체력 10 -> 둘 다 킬 가능
      const selected = getKillableSkill(skObj, 10, dummyBt);
      expect(selected).toBe(1);
    });

    it("2단계: 우선도가 동일할 때 강한 디메리트가 없는 기술이 우선 선택되어야 한다 (용성군/역린 대신 지진)", () => {
      // 1: 용성군 (우선도 0, 명중 90, minDmg 130, 강한디메리트-특공2랭다운)
      // 2: 지진 (우선도 0, 명중 100, minDmg 100, 디메리트 없음)
      const skObj = {
        1: { number: 1, minDmg: 130, maxDmg: 130, sk: skillList.getDataById("용성군") },
        2: { number: 2, minDmg: 100, maxDmg: 100, sk: skillList.getDataById("지진") },
      };
      const selected = getKillableSkill(skObj, 50, dummyBt);
      expect(selected).toBe(2);
    });

    it("3단계: 강한 디메리트 여부가 동일할 때 명중률이 더 높은 기술이 우선 선택되어야 한다", () => {
      // 1: 번개 (우선도 0, 명중 70, minDmg 110)
      // 2: 10만볼트 (우선도 0, 명중 100, minDmg 90)
      const skObj = {
        1: { number: 1, minDmg: 110, maxDmg: 110, sk: skillList.getDataById("번개") },
        2: { number: 2, minDmg: 90, maxDmg: 90, sk: skillList.getDataById("10만볼트") },
      };
      // 상대 체력 50 -> 명중률 100인 10만볼트 선택
      const selected = getKillableSkill(skObj, 50, dummyBt);
      expect(selected).toBe(2);
    });

    it("4단계: 명중률이 동일할 때 약한 디메리트가 없는 기술이 우선 선택되어야 한다 (무릎차기 대신 지진/암석액스)", () => {
      // 1: 무릎차기 (우선도 0, 명중 90, minDmg 130, 약한디메리트-빗나감패널티)
      // 2: 암석액스 (우선도 0, 명중 90, minDmg 65, 약한디메리트 없음)
      const skObj = {
        1: { number: 1, minDmg: 130, maxDmg: 130, sk: skillList.getDataById("무릎차기") },
        2: { number: 2, minDmg: 65, maxDmg: 65, sk: skillList.getDataById("암석액스") },
      };
      // 상대 체력 50 -> 둘 다 킬 가능. 명중률 90으로 동일. 약한 디메리트 없는 암석액스 선택
      const selected = getKillableSkill(skObj, 50, dummyBt);
      expect(selected).toBe(2);
    });

    it("5단계: 디메리트 여부 및 명중률까지 동일할 때 데미지가 더 높은 기술이 선택되어야 한다", () => {
      // 1: 방전 (우선도 0, 명중 100, minDmg 80)
      // 2: 10만볼트 (우선도 0, 명중 100, minDmg 90)
      const skObj = {
        1: { number: 1, minDmg: 80, maxDmg: 80, sk: skillList.getDataById("방전") },
        2: { number: 2, minDmg: 90, maxDmg: 90, sk: skillList.getDataById("10만볼트") },
      };
      const selected = getKillableSkill(skObj, 50, dummyBt);
      expect(selected).toBe(2);
    });

    it("강한 디메리트 기술만 킬을 낼 수 있는 경우 해당 기술을 사용할 수 있어야 한다", () => {
      // 상대 체력 200
      // 1: 대폭발 (minDmg 250, 강한디메리트)
      // 2: 지진 (minDmg 100, 노디메리트)
      const skObj = {
        1: { number: 1, minDmg: 250, maxDmg: 250, sk: skillList.getDataById("대폭발") },
        2: { number: 2, minDmg: 100, maxDmg: 100, sk: skillList.getDataById("지진") },
      };
      const selected = getKillableSkill(skObj, 200, dummyBt);
      expect(selected).toBe(1);
    });
  });
});
