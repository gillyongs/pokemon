import { generatePokemonInstance } from "../../entity/Pokemon/PokemonInstance";
import { createBattle } from "../../entity/Battle";

describe("hasAugmentOnTeam 메서드 테스트", () => {
  test("자신이 해당 증강을 보유하고 있는 경우 true를 반환해야 한다", () => {
    const poke = generatePokemonInstance("망나뇽");
    expect(poke.hasAugmentOnTeam("hyperBody")).toBe(false);

    poke.applyAugment("hyperBody");
    expect(poke.hasAugmentOnTeam("hyperBody")).toBe(true);
    expect(poke.hasAugmentOnTeam("하이퍼바디")).toBe(true);
  });

  test("배틀에서 아군이 증강을 보유한 경우 벤치 포켓몬도 hasAugmentOnTeam이 true를 반환해야 한다", () => {
    const battle = createBattle(["망나뇽", "망나뇽", "망나뇽"], ["망나뇽", "망나뇽", "망나뇽"]);
    const p1 = battle.player;
    const p2 = battle.playerBench1;
    const npc = battle.npc;

    expect(p1.hasAugmentOnTeam("haste", battle)).toBe(false);
    expect(p2.hasAugmentOnTeam("haste", battle)).toBe(false);

    p1.applyAugment("haste", battle);

    // 보유자 본인
    expect(p1.hasAugmentOnTeam("haste")).toBe(true);
    expect(p1.hasAugmentOnTeam("haste", battle)).toBe(true);

    // 같은 팀 벤치 포켓몬 (배틀 미전달 시에도 버프 플래그로 true, 배틀 전달 시에도 true)
    expect(p2.hasAugmentOnTeam("haste")).toBe(true);
    expect(p2.hasAugmentOnTeam("haste", battle)).toBe(true);
    expect(p2.hasAugmentOnTeam("헤이스트", battle)).toBe(true);

    // 상대팀은 false
    expect(npc.hasAugmentOnTeam("haste", battle)).toBe(false);
  });

  test("team 배열을 직접 전달했을 때도 정상 동작해야 한다", () => {
    const poke1 = generatePokemonInstance("망나뇽");
    const poke2 = generatePokemonInstance("망나뇽");
    const team = [poke1, poke2];

    expect(poke2.hasAugmentOnTeam("sharpEyes", team)).toBe(false);

    poke1.applyAugment("sharpEyes");

    expect(poke2.hasAugmentOnTeam("sharpEyes", team)).toBe(true);
    expect(poke2.hasAugmentOnTeam("샤프아이즈", team)).toBe(true);
  });

  test("하이퍼바디, 헤이스트, 샤프아이즈, 영웅의 메아리 모두 팀 단위로 정상 인식되어야 한다", () => {
    const battle = createBattle(["망나뇽", "망나뇽", "망나뇽"], ["망나뇽", "망나뇽", "망나뇽"]);
    const p1 = battle.player;
    const p2 = battle.playerBench1;

    p1.applyAugment("hyperBody", battle);
    p1.applyAugment("haste", battle);
    p1.applyAugment("sharpEyes", battle);
    p1.applyAugment("echoOfHero", battle);

    ["hyperBody", "haste", "sharpEyes", "echoOfHero"].forEach((augId) => {
      expect(p1.hasAugmentOnTeam(augId, battle)).toBe(true);
      expect(p2.hasAugmentOnTeam(augId, battle)).toBe(true);
    });
  });
});
