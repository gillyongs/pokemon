import { hasPokemonName, hasPokemonNameOnTeam, AUGMENT_LIST, changePokemonAbility } from "./AugmentData";
import { generate } from "../Pokemon/PokemonInstance";

describe("hasPokemonNameOnTeam & legendaryTitan eligibility", () => {
  const titan = AUGMENT_LIST.find((a) => a.id === "legendaryTitan");

  test("hasPokemonName correctly identifies pokemon name", () => {
    expect(hasPokemonName({ name: "레지기가스" }, "레지기가스")).toBe(true);
    expect(hasPokemonName({ origin: { name: "레지기가스" } }, "레지기가스")).toBe(true);
    expect(hasPokemonName({ name: "피카츄" }, "레지기가스")).toBe(false);
    expect(hasPokemonName(null, "레지기가스")).toBe(false);
  });

  test("hasPokemonNameOnTeam detects pokemon in target array", () => {
    const team = [{ name: "피카츄" }, { name: "레지기가스" }];
    expect(hasPokemonNameOnTeam(team, "레지기가스")).toBe(true);
    expect(hasPokemonNameOnTeam([{ name: "피카츄" }], "레지기가스")).toBe(false);
  });

  test("hasPokemonNameOnTeam detects pokemon in context team array", () => {
    const pikachu = { name: "피카츄" };
    const team = [pikachu, { name: "레지기가스" }];
    expect(hasPokemonNameOnTeam(pikachu, "레지기가스", team)).toBe(true);

    const teamWithout = [pikachu, { name: "파이리" }];
    expect(hasPokemonNameOnTeam(pikachu, "레지기가스", teamWithout)).toBe(false);
  });

  test("hasPokemonNameOnTeam detects pokemon in battle object", () => {
    const player = { name: "피카츄", team: "player" };
    const battleWithRegiBench = {
      player,
      playerBench1: { name: "레지기가스", team: "player" },
      playerBench2: null,
    };
    expect(hasPokemonNameOnTeam(player, "레지기가스", battleWithRegiBench)).toBe(true);

    const battleWithoutRegi = {
      player,
      playerBench1: { name: "파이리", team: "player" },
      playerBench2: null,
    };
    expect(hasPokemonNameOnTeam(player, "레지기가스", battleWithoutRegi)).toBe(false);
  });

  test("legendaryTitan isEligible condition", () => {
    expect(titan).toBeDefined();

    // 1. 단일 레지기가스인 경우 비적격 (false)
    expect(titan.isEligible({ name: "레지기가스" })).toBe(false);

    // 2. 단일 피카츄인 경우 적격 (true)
    expect(titan.isEligible({ name: "피카츄" })).toBe(true);

    // 3. 팀에 레지기가스가 포함되어 있으면 피카츄라도 비적격 (false)
    const teamWithRegi = [{ name: "피카츄" }, { name: "레지기가스" }];
    expect(titan.isEligible(teamWithRegi[0], teamWithRegi)).toBe(false);

    // 4. 팀에 레지기가스가 없으면 적격 (true)
    const teamWithoutRegi = [{ name: "피카츄" }, { name: "파이리" }];
    expect(titan.isEligible(teamWithoutRegi[0], teamWithoutRegi)).toBe(true);

    // 5. 배틀 벤치에 레지기가스가 있으면 비적격 (false)
    const battle = {
      player: { name: "피카츄", team: "player" },
      playerBench1: { name: "레지기가스", team: "player" },
      playerBench2: null,
    };
    expect(titan.isEligible(battle.player, battle)).toBe(false);
  });
});

describe("changePokemonAbility common function", () => {
  test("correctly changes pokemon ability and abilObj including origin", () => {
    const poke = {
      name: "레지기가스",
      abil: "슬로스타트",
      abilObj: { name: "슬로스타트", text: "5턴 동안 공격과 스피드가 절반이 된다." },
      origin: {
        abil: "슬로스타트",
        abilObj: { name: "슬로스타트", text: "5턴 동안 공격과 스피드가 절반이 된다." },
      },
    };

    const resultObj = changePokemonAbility(poke, "패스트스타트");

    expect(poke.abil).toBe("패스트스타트");
    expect(poke.origin.abil).toBe("패스트스타트");
    expect(poke.abilObj.name).toBe("패스트스타트");
    expect(poke.abilObj.text).toContain("공격과 스피드가 2배");
    expect(poke.origin.abilObj.name).toBe("패스트스타트");
    expect(poke.origin.abilObj.text).toContain("공격과 스피드가 2배");
    expect(resultObj.name).toBe("패스트스타트");
  });

  test("works on PokemonInstance and supports instance method changeAbility", () => {
    const regi = generate("레지기가스");
    expect(regi.abil).toBe("슬로스타트");

    regi.changeAbility("패스트스타트");
    expect(regi.abil).toBe("패스트스타트");
    expect(regi.origin.abil).toBe("패스트스타트");
    expect(regi.abilObj.name).toBe("패스트스타트");
    expect(regi.origin.abilObj.name).toBe("패스트스타트");

    // FastStarter augment onApply
    const fastStarter = AUGMENT_LIST.find((a) => a.id === "fastStarter");
    expect(fastStarter).toBeDefined();

    regi.changeAbility("슬로스타트");
    fastStarter.onApply(regi);
    expect(regi.abil).toBe("패스트스타트");
    expect(regi.origin.abil).toBe("패스트스타트");

    // HugePower augment onApply
    const hugePower = AUGMENT_LIST.find((a) => a.id === "hugePower");
    expect(hugePower).toBeDefined();
    hugePower.onApply(regi);
    expect(regi.abil).toBe("천하장사");
    expect(regi.origin.abil).toBe("천하장사");
    expect(regi.abilObj.name).toBe("천하장사");
  });
});
