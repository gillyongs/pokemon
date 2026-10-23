import sampleList from "../../entity/Pokemon/SamplePokemon";
import { generate } from "../../entity/Pokemon/PokemonInstance";
import pokemonData from "../../entity/Pokemon/PokemonData";
import { getSkillListForPokemon } from "../../skill/PokemonSkillList";

describe("Vanilluxe (배바닐라) Verification", () => {
  it("should exist in PokemonData with correct stats and types", () => {
    const data = pokemonData.getDataById("0584");
    expect(data).toBeDefined();
    expect(data.name).toBe("배바닐라");
    expect(data.type1).toBe("얼음");
    expect(data.type2).toBeNull();
    expect(data.hp).toBe(71);
    expect(data.atk).toBe(95);
    expect(data.def).toBe(85);
    expect(data.catk).toBe(110);
    expect(data.cdef).toBe(95);
    expect(data.speed).toBe(79);
    expect(data.hp + data.atk + data.def + data.catk + data.cdef + data.speed).toBe(535);
    expect(data.abilList).toEqual(["눈퍼뜨리기", "아이스바디", "깨어진갑옷"]);
  });

  it("should have correct sample preset in SamplePokemon", () => {
    const sample = sampleList.getDataById("배바닐라");
    expect(sample).toBeDefined();
    expect(sample.pokemon_id).toBe("0584");
    expect(sample.evsInput).toBe("HC252");
    expect(sample.nature).toEqual({ up: "catk", down: "atk" });
    expect(sample.skill[1].name).toBe("프리즈드라이");
    expect(sample.skill[2].name).toBe("눈보라");
    expect(sample.skill[3].name).toBe("얼음뭉치");
    expect(sample.skill[4].name).toBe("오로라베일");
    expect(sample.item).toBe("녹지않는얼음");
    expect(sample.abil).toBe("눈퍼뜨리기");
    expect(sample.role).toBe("기점잡이");
  });

  it("should generate a valid Vanilluxe instance", () => {
    const instance = generate("배바닐라");
    expect(instance.name).toBe("배바닐라");
    expect(instance.origin.pokemon_id).toBe("0584");
    expect(instance.item).toBe("녹지않는얼음");
    expect(instance.abil).toBe("눈퍼뜨리기");
    expect(instance.origin.skill[1].name).toBe("프리즈드라이");
    expect(instance.origin.skill[2].name).toBe("눈보라");
    expect(instance.origin.skill[3].name).toBe("얼음뭉치");
    expect(instance.origin.skill[4].name).toBe("오로라베일");
  });

  it("should have core and others in PokemonSkillList", () => {
    const skills = getSkillListForPokemon("0584");
    expect(skills.length).toBeGreaterThan(0);

    const names = skills.map((s) => s.name);
    // Core moves
    expect(names).toContain("프리즈드라이");
    expect(names).toContain("눈보라");
    expect(names).toContain("얼음뭉치");
    expect(names).toContain("오로라베일");
    expect(names).toContain("도발");
    expect(names).toContain("절대영도");

    // Other moves
    expect(names).toContain("냉동빔");
    expect(names).toContain("러스터캐논");
    expect(names).toContain("얼어붙은바람");
  });
});
