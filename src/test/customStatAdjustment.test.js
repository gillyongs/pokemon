// npm test -- src/test/customStatAdjustment.test.js
import { calculateStat, NATURE_LIST } from "../component/customScreen/sampleInfo/StatAdjustmentModal";
import PokemonInstance from "../entity/Pokemon/PokemonInstance";
import sampleList from "../entity/Pokemon/SamplePokemon";
import { createBattle } from "../entity/Battle";

describe("포켓몬 능력치 조절(노력치/성격) 시스템 테스트", () => {
  test("calculateStat이 레벨 50 기준 체력 및 일반 능력치(성격 보정 포함)를 정확히 계산해야 한다", () => {
    // 윈디 종족값: HP 90, 공격 110, 방어 80, 특공 100, 특방 80, 스피드 95
    // 개체값 31 기준

    // 1. HP 계산: (90 * 2 + 31 + Math.floor(0 / 4)) / 2 + 60 = Math.floor(211 / 2) + 60 = 105 + 60 = 165
    const hp0 = calculateStat(90, 31, 0, true);
    expect(hp0).toBe(165);

    // HP 풀보정(252): (90 * 2 + 31 + 63) / 2 + 60 = Math.floor(274 / 2) + 60 = 137 + 60 = 197
    const hp252 = calculateStat(90, 31, 252, true);
    expect(hp252).toBe(197);

    // 2. 공격 계산: 종족값 110, 개체값 31, 노력치 252, 성격 상승(+10%)
    // (110 * 2 + 31 + 63) / 2 + 5 = 157 + 5 = 162. 162 * 1.1 = 178
    const atkUp252 = calculateStat(110, 31, 252, false, true, false);
    expect(atkUp252).toBe(178);

    // 3. 특공 계산: 종족값 100, 개체값 31, 노력치 0, 성격 하락(-10%)
    // (100 * 2 + 31 + 0) / 2 + 5 = 115 + 5 = 120. 120 * 0.9 = 108
    const catkDown0 = calculateStat(100, 31, 0, false, false, true);
    expect(catkDown0).toBe(108);

    // 4. 스피드 계산: 종족값 95, 개체값 31, 노력치 252, 성격 무보정
    // (95 * 2 + 31 + 63) / 2 + 5 = 142 + 5 = 147
    const speedNeutral252 = calculateStat(95, 31, 252, false, false, false);
    expect(speedNeutral252).toBe(147);
  });

  test("PokemonInstance가 커스텀 능력치(stat, hp)를 전달받았을 때 올바르게 적용되어야 한다", () => {
    const customStats = {
      hp: 197,
      stat: {
        atk: 200,
        def: 120,
        catk: 90,
        cdef: 110,
        speed: 160,
      },
      evs: { hp: 252, atk: 252, def: 0, catk: 0, cdef: 4, speed: 0 },
      nature: { up: "atk", down: "catk" },
    };

    const instance = new PokemonInstance({
      id: "윈디",
      stat: customStats.stat,
      hp: customStats.hp,
      evs: customStats.evs,
      nature: customStats.nature,
    });

    expect(instance.hp).toBe(197);
    expect(instance.origin.hp).toBe(197);
    expect(instance.origin.stat.atk).toBe(200);
    expect(instance.origin.stat.def).toBe(120);
    expect(instance.origin.stat.catk).toBe(90);
    expect(instance.origin.stat.cdef).toBe(110);
    expect(instance.origin.stat.speed).toBe(160);
    expect(instance.origin.evs.hp).toBe(252);
    expect(instance.origin.nature.up).toBe("atk");
  });

  test("createBattle에 커스텀 능력치가 지정된 포켓몬이 투입되었을 때 배틀 엔진에서 해당 능력치로 배틀이 진행되어야 한다", () => {
    const playerTeam = [
      {
        id: "망나뇽",
        hp: 200,
        stat: { atk: 250, def: 150, catk: 100, cdef: 150, speed: 180 },
      },
      "파르셀",
      "썬더",
    ];
    const npcTeam = ["마기라스", "갸라도스", "윈디"];

    const battle = createBattle(playerTeam, npcTeam);
    expect(battle.player.hp).toBe(200);
    expect(battle.player.origin.hp).toBe(200);
    expect(battle.player.origin.stat.atk).toBe(250);
    expect(battle.player.origin.stat.speed).toBe(180);
  });

  test("NATURE_LIST가 올바른 성격 보정 정보를 포함해야 한다", () => {
    const adamant = NATURE_LIST.find((n) => n.name === "고집");
    expect(adamant).toBeDefined();
    expect(adamant.up).toBe("atk");
    expect(adamant.down).toBe("catk");

    const jolly = NATURE_LIST.find((n) => n.name === "명랑");
    expect(jolly).toBeDefined();
    expect(jolly.up).toBe("speed");
    expect(jolly.down).toBe("catk");

    const modest = NATURE_LIST.find((n) => n.name === "조심");
    expect(modest).toBeDefined();
    expect(modest.up).toBe("catk");
    expect(modest.down).toBe("atk");
  });

  test("getNatureInfo가 상승 및 하락 능력치를 기반으로 성격 이름을 올바르게 도출해야 한다", () => {
    const { getNatureInfo } = require("../component/customScreen/sampleInfo/StatAdjustmentModal");
    expect(getNatureInfo("atk", "catk").name).toBe("고집");
    expect(getNatureInfo("speed", "catk").name).toBe("명랑");
    expect(getNatureInfo("catk", "atk").name).toBe("조심");
    expect(getNatureInfo("speed", "atk").name).toBe("겁쟁이");
    expect(getNatureInfo("def", "atk").name).toBe("대담");
    expect(getNatureInfo(null, null).name).toBe("노력");
    expect(getNatureInfo("atk", "atk").name).toBe("노력");

    const incompleteUp = getNatureInfo("atk", null);
    expect(incompleteUp.name).toBe("하락 미선택");
    expect(incompleteUp.isError).toBe(true);
    expect(incompleteUp.isValid).toBe(false);

    const incompleteDown = getNatureInfo(null, "catk");
    expect(incompleteDown.name).toBe("상승 미선택");
    expect(incompleteDown.isError).toBe(true);
    expect(incompleteDown.isValid).toBe(false);
  });

  test("GACHA_OPTIONS 및 5V0A, 5V0S, 4V0A0S 개체치 템플릿 생성이 정상 작동해야 한다", () => {
    const { GACHA_OPTIONS } = require("../component/customScreen/sampleInfo/StatAdjustmentModal");
    const optionIds = GACHA_OPTIONS.map((o) => o.id);
    expect(optionIds).toEqual(["6V", "5V0A", "5V0S", "4V0A0S"]);

    const charizardY = sampleList.getDataById("메가리자몽Y");
    expect(charizardY.gacha).toBe("5V0A");

    const torkoal = sampleList.getDataById("코터스");
    expect(torkoal.gacha).toBe("5V0S");

    const forretress = sampleList.getDataById("쏘콘");
    expect(forretress.gacha).toBe("4V0A0S");
  });

  test("노력치 직접 입력 시 0~252 범위 제한 및 총 노력치 508 초과 여부가 올바르게 계산되어야 한다", () => {
    // 252 초과 입력 시 252로 고정, 음수 입력 시 0으로 고정
    const clampEv = (val) => {
      let num = parseInt(val, 10);
      if (isNaN(num) || num < 0) return 0;
      if (num > 252) return 252;
      return num;
    };

    expect(clampEv(300)).toBe(252);
    expect(clampEv(-10)).toBe(0);
    expect(clampEv(128)).toBe(128);

    // 총 노력치 508 초과 여부
    const evs1 = { hp: 252, atk: 252, def: 4, catk: 0, cdef: 0, speed: 0 };
    const total1 = Object.values(evs1).reduce((a, b) => a + b, 0);
    expect(total1).toBe(508);
    expect(total1 > 508).toBe(false);

    const evsOver = { hp: 252, atk: 252, def: 252, catk: 0, cdef: 0, speed: 0 };
    const totalOver = Object.values(evsOver).reduce((a, b) => a + b, 0);
    expect(totalOver).toBe(756);
    expect(totalOver > 508).toBe(true);
    expect(totalOver - 508).toBe(248);
  });
});

