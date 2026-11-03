import sampleList from "../../entity/Pokemon/SamplePokemon";
import { generate } from "../../entity/Pokemon/PokemonInstance";
import pokemonData from "../../entity/Pokemon/PokemonData";
import { getSkillListForPokemon } from "../../skill/PokemonSkillList";
import Battle from "../../entity/Battle";
import { getAccuracy } from "../../function/accuracyCalculate";
import skillList from "../../entity/Skill/skillList";

describe("Mega Raichu Y (메가라이츄Y) & No Guard (노가드) & Zap Cannon (전자포) Verification", () => {
  it("should exist in PokemonData with correct stats and types for base and mega form", () => {
    const base = pokemonData.getDataById("0026");
    expect(base).toBeDefined();
    expect(base.name).toBe("라이츄");
    expect(base.type1).toBe("전기");
    expect(base.type2).toBeNull();
    expect(base.hp).toBe(60);
    expect(base.atk).toBe(90);
    expect(base.def).toBe(55);
    expect(base.catk).toBe(90);
    expect(base.cdef).toBe(80);
    expect(base.speed).toBe(110);
    expect(base.hp + base.atk + base.def + base.catk + base.cdef + base.speed).toBe(485);

    const mega = pokemonData.getDataById("0026-y");
    expect(mega).toBeDefined();
    expect(mega.name).toBe("메가라이츄Y");
    expect(mega.type1).toBe("전기");
    expect(mega.type2).toBeNull();
    expect(mega.hp).toBe(60);
    expect(mega.atk).toBe(100);
    expect(mega.def).toBe(55);
    expect(mega.catk).toBe(160);
    expect(mega.cdef).toBe(80);
    expect(mega.speed).toBe(130);
    expect(mega.hp + mega.atk + mega.def + mega.catk + mega.cdef + mega.speed).toBe(585);
    expect(mega.abilList).toEqual(["노가드"]);
  });

  it("should have correct sample preset in SamplePokemon", () => {
    const sample = sampleList.getDataById("메가라이츄Y");
    expect(sample).toBeDefined();
    expect(sample.pokemon_id).toBe("0026");
    expect(sample.evsInput).toBe("CS252");
    expect(sample.nature).toEqual({ up: "speed", down: "atk" });
    expect(sample.skill[1].name).toBe("전자포");
    expect(sample.skill[2].name).toBe("기합구슬");
    expect(sample.skill[3].name).toBe("파도타기");
    expect(sample.skill[4].name).toBe("풀묶기");
    expect(sample.item).toBe("라이츄나이트Y");
    expect(sample.role).toBe("특수어태커");
  });

  it("should mega evolve properly into Mega Raichu Y with No Guard", () => {
    const player = generate("메가라이츄Y");
    const npc = generate("뽀록나");
    const battle = new Battle(player, npc, generate("따라큐"), generate("파르셀"), generate("럭키"), generate("마릴리"));

    expect(player.origin.megaData).toBeDefined();
    expect(player.origin.megaData.name).toBe("메가라이츄Y");
    expect(player.origin.megaData.abil).toBe("노가드");

    const enqueue = jest.fn();
    player.megaEvolve(battle, enqueue);

    expect(player.isMega).toBe(true);
    expect(player.abil).toBe("노가드");
    expect(player.origin.pokemon_id).toBe("0026-y");
  });

  it("should guarantee accuracy with No Guard (노가드) for Zap Cannon (전자포)", () => {
    const player = generate("메가라이츄Y");
    const npc = generate("뽀록나");
    const battle = new Battle(player, npc, generate("따라큐"), generate("파르셀"), generate("럭키"), generate("마릴리"));

    battle.turn.atk = "player";
    battle.turn.def = "npc";

    const zapCannon = skillList.search("전자포");
    expect(zapCannon.name).toBe("전자포");
    expect(zapCannon.accur).toBe(50);

    // Before mega evolve: accuracy is 50
    expect(getAccuracy(battle, zapCannon, player)).toBe(50);

    // After mega evolve: accuracy becomes 100 due to No Guard
    const enqueue = jest.fn();
    player.megaEvolve(battle, enqueue);
    expect(player.abil).toBe("노가드");
    expect(getAccuracy(battle, zapCannon, player)).toBe(100);
  });

  it("should have user-provided core and others in PokemonSkillList (75 total)", () => {
    const skills = getSkillListForPokemon("0026");
    expect(skills.length).toBe(75);

    const names = skills.map((s) => s.name);
    // Core moves
    expect(names).toContain("전자포");
    expect(names).toContain("기합구슬");
    expect(names).toContain("풀묶기");
    expect(names).toContain("대타출동");
    expect(names).toContain("나쁜음모");
    expect(names).toContain("볼트체인지");
    expect(names).not.toContain("앙코르");
    expect(names).not.toContain("테라버스트");
    expect(names).toContain("속이기");
    expect(names).toContain("매혹의보이스");

    // Standardized moves
    expect(names).toContain("깨트리기");
  });
});
