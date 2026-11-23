import { AUGMENT_LIST } from "../../entity/Augment/AugmentData";
import { generatePokemonInstance } from "../../entity/Pokemon/PokemonInstance";
import { createBattle } from "../../entity/Battle";
import { criticalCalculate } from "../../calc/criticalCalculate";
import { damageCalculate } from "../../calc/damageCalculate";

describe("샤프아이즈 증강 테스트", () => {
  const sharpEyesAug = AUGMENT_LIST.find((a) => a.id === "sharpEyes");

  test("증강 기본 스펙 검증", () => {
    expect(sharpEyesAug).toBeDefined();
    expect(sharpEyesAug.name).toBe("샤프아이즈");
    expect(sharpEyesAug.cost).toBe(2);
    expect(sharpEyesAug.desc).toBe("파티 전원의 급소 확률이 15%, 급소 데미지가 40% 증가합니다.");
  });

  test("단일 포켓몬에게 적용 시 급소 확률이 15% 증가해야 한다", () => {
    const poke = generatePokemonInstance("망나뇽");

    // 기본 급소 랭크 2의 확률은 0.5 (1/2)
    // Math.random이 0.55일 때 기본은 false (0.55 >= 0.5), 샤프아이즈 적용 시 true (0.55 < 0.65)
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.55);

    expect(criticalCalculate(2, poke)).toBe(false);

    poke.applyAugment("sharpEyes");

    expect(criticalCalculate(2, poke)).toBe(true);

    spy.mockRestore();
  });

  test("급소 데미지가 40% 증가해야 한다", () => {
    const battle = createBattle(["망나뇽", "망나뇽", "망나뇽"], ["망나뇽", "망나뇽", "망나뇽"]);
    battle.turn.atk = "player";
    battle.turn.def = "npc";
    battle.turn.atkSN = 1;
    battle.player.turn.critical = true;

    // getRandomNumber()가 일정한 난수(100)를 반환하도록 Mock
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.999);

    const normalCritDmg = damageCalculate(battle, null, null);

    battle.player.applyAugment("sharpEyes", battle);

    const sharpEyesCritDmg = damageCalculate(battle, null, null);

    // 급소 데미지 40% 증가 확인 (Math.floor로 인한 미세 차이 감안)
    expect(sharpEyesCritDmg).toBe(Math.floor(normalCritDmg * 1.4));

    spy.mockRestore();
  });

  test("배틀에서 파티원에게 적용 시 아군 전원에게 버프가 동기화되어야 한다", () => {
    const battle = createBattle(["망나뇽", "망나뇽", "망나뇽"], ["망나뇽", "망나뇽", "망나뇽"]);

    expect(battle.player.hasSharpEyesBuff).toBeFalsy();
    expect(battle.playerBench1.hasSharpEyesBuff).toBeFalsy();
    expect(battle.playerBench2.hasSharpEyesBuff).toBeFalsy();

    battle.player.applyAugment("sharpEyes", battle);

    expect(battle.player.hasSharpEyesBuff).toBe(true);
    expect(battle.playerBench1.hasSharpEyesBuff).toBe(true);
    expect(battle.playerBench2.hasSharpEyesBuff).toBe(true);

    // 상대팀은 미적용 확인
    expect(battle.npc.hasSharpEyesBuff).toBeFalsy();
  });

  test("파티 내 이미 샤프아이즈 보유자가 있는 경우 중복 등장하지 않아야 한다 (isEligible)", () => {
    const battle = createBattle(["망나뇽", "망나뇽", "망나뇽"], ["망나뇽", "망나뇽", "망나뇽"]);
    expect(sharpEyesAug.isEligible(battle.player, battle, [battle.player, battle.playerBench1, battle.playerBench2])).toBe(true);

    battle.player.applyAugment("sharpEyes", battle);

    expect(sharpEyesAug.isEligible(battle.playerBench1, battle, [battle.player, battle.playerBench1, battle.playerBench2])).toBe(false);
  });
});
