import { AUGMENT_LIST } from "../../entity/Augment/AugmentData";
import { generatePokemonInstance } from "../../entity/Pokemon/PokemonInstance";
import { createBattle } from "../../entity/Battle";
import { getAugmentedStat } from "../../calc/getStat";

describe("헤이스트 증강 테스트", () => {
  const hasteAug = AUGMENT_LIST.find((a) => a.id === "haste");

  test("증강 기본 스펙 검증", () => {
    expect(hasteAug).toBeDefined();
    expect(hasteAug.name).toBe("헤이스트");
    expect(hasteAug.cost).toBe(5);
    expect(hasteAug.desc).toBe("파티 전원의 스피드가 40 증가합니다.");
  });

  test("단일 포켓몬에게 적용 시 스피드가 40 증가해야 한다", () => {
    const poke = generatePokemonInstance("망나뇽");
    const baseSpeed = getAugmentedStat(poke, "speed");

    poke.applyAugment("haste");

    expect(getAugmentedStat(poke, "speed")).toBe(baseSpeed + 40);
  });

  test("배틀에서 파티원에게 적용 시 아군 전원의 스피드가 40 증가해야 하고 적군은 증가하지 않아야 한다", () => {
    const battle = createBattle(["망나뇽", "망나뇽", "망나뇽"], ["망나뇽", "망나뇽", "망나뇽"]);

    const p0BaseSpeed = getAugmentedStat(battle.player, "speed", battle);
    const p1BaseSpeed = getAugmentedStat(battle.playerBench1, "speed", battle);
    const p2BaseSpeed = getAugmentedStat(battle.playerBench2, "speed", battle);
    const npcBaseSpeed = getAugmentedStat(battle.npc, "speed", battle);

    // 플레이어 선봉에게 헤이스트 적용
    battle.player.applyAugment("haste", battle);

    // 아군 전원 스피드 +40 확인
    expect(getAugmentedStat(battle.player, "speed", battle)).toBe(p0BaseSpeed + 40);
    expect(getAugmentedStat(battle.playerBench1, "speed", battle)).toBe(p1BaseSpeed + 40);
    expect(getAugmentedStat(battle.playerBench2, "speed", battle)).toBe(p2BaseSpeed + 40);

    // 상대팀은 스피드 변화 없음 확인
    expect(getAugmentedStat(battle.npc, "speed", battle)).toBe(npcBaseSpeed);
  });

  test("파티 내 이미 헤이스트 보유자가 있는 경우 중복 등장하지 않아야 한다 (isEligible)", () => {
    const battle = createBattle(["망나뇽", "망나뇽", "망나뇽"], ["망나뇽", "망나뇽", "망나뇽"]);
    expect(hasteAug.isEligible(battle.player, battle, [battle.player, battle.playerBench1, battle.playerBench2])).toBe(true);

    battle.player.applyAugment("haste", battle);

    // 적용 후 벤치 포켓몬에게 롤링될 수 없음
    expect(hasteAug.isEligible(battle.playerBench1, battle, [battle.player, battle.playerBench1, battle.playerBench2])).toBe(false);
  });
});
