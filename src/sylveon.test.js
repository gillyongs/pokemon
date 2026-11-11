import sampleList from "./entity/Pokemon/SamplePokemon";
import { generate } from "./entity/Pokemon/PokemonInstance";
import PokemonData from "./entity/Pokemon/PokemonData";
import { POKEMON_SKILLS, getSkillListForPokemon, noLearnSkill } from "./skill/PokemonSkillList";
import { damageCalculate } from "./util/damageCalculate";
import { itemText, aiItemScore } from "./entity/Item";
import { abilObject } from "./entity/Ability";

describe("님피아 (Sylveon) 등록 및 시스템 검증", () => {
  test("PokemonData에 님피아(0700)가 정상 등록되어야 한다", () => {
    const sylveon = PokemonData.items.find((p) => p.pokemon_id === "0700" || p.name === "님피아");
    expect(sylveon).toBeDefined();
    expect(sylveon.name).toBe("님피아");
    expect(sylveon.type1).toBe("페어리");
    expect(sylveon.type2).toBeNull();
    expect(sylveon.hp).toBe(95);
    expect(sylveon.atk).toBe(65);
    expect(sylveon.def).toBe(65);
    expect(sylveon.catk).toBe(110);
    expect(sylveon.cdef).toBe(130);
    expect(sylveon.speed).toBe(60);
    expect(sylveon.hp + sylveon.atk + sylveon.def + sylveon.catk + sylveon.cdef + sylveon.speed).toBe(525);
    expect(sylveon.abilList).toContain("페어리스킨");
    expect(sylveon.abilList).toContain("헤롱헤롱바디");
  });

  test("도구 요정의깃털과 특성 헤롱헤롱바디가 정의되어야 한다", () => {
    expect(itemText["요정의깃털"]).toBeDefined();
    expect(aiItemScore["요정의깃털"]).toBe(20);
    expect(abilObject["헤롱헤롱바디"]).toBeDefined();
  });

  test("PokemonSkillList에 님피아 기술 풀(주력 6개, 배울 수 있는 기술 65개)이 정상 등록되어야 한다", () => {
    const entry = POKEMON_SKILLS["0700"];
    expect(entry).toBeDefined();
    expect(entry.core).toEqual(["하이퍼보이스", "하품", "희망사항", "방어", "매지컬플레임", "전광석화"]);
    
    // 주력 6개 + 기타 59개 = 65개
    const allSet = new Set([...entry.core, ...entry.others]);
    expect(allSet.size).toBe(65);

    // 테라버스트 등 noLearnSkill 제외 후 64개
    const learnableList = getSkillListForPokemon("0700");
    expect(learnableList.length).toBe(65 - noLearnSkill.filter((s) => allSet.has(s)).length);
    const coreCount = learnableList.filter((s) => s.isCore).length;
    expect(coreCount).toBe(6);
  });

  test("님피아 (막이) 샘플이 올바르게 생성되어야 한다", () => {
    const poke = generate("님피아 (막이)");
    expect(poke).toBeDefined();
    expect(poke.name).toBe("님피아");
    expect(poke.origin.id).toBe("님피아 (막이)");
    expect(poke.item).toBe("먹다남은음식");
    expect(poke.abil).toBe("페어리스킨");
    expect(poke.origin.role).toBe("막이");
    
    // 기술배치 4개
    const skills = [poke.origin.skill[1], poke.origin.skill[2], poke.origin.skill[3], poke.origin.skill[4]].map((s) => s.name);
    expect(skills).toEqual(["하이퍼보이스", "하품", "희망사항", "방어"]);

    // 노력치 HB252 (hp 252, def 252, cdef 4)
    expect(poke.origin.evs.hp).toBe(252);
    expect(poke.origin.evs.def).toBe(252);
    expect(poke.origin.evs.cdef).toBe(4);
    expect(poke.origin.nature.up).toBe("def");
    expect(poke.origin.nature.down).toBe("atk");
  });

  test("님피아 (특수딜탱) 샘플이 올바르게 생성되어야 한다", () => {
    const poke = generate("님피아 (특수딜탱)");
    expect(poke).toBeDefined();
    expect(poke.name).toBe("님피아");
    expect(poke.origin.id).toBe("님피아 (특수딜탱)");
    expect(poke.item).toBe("요정의깃털");
    expect(poke.abil).toBe("페어리스킨");
    expect(poke.origin.role).toBe("특수딜탱");
    
    // 기술배치 4개
    const skills = [poke.origin.skill[1], poke.origin.skill[2], poke.origin.skill[3], poke.origin.skill[4]].map((s) => s.name);
    expect(skills).toEqual(["하이퍼보이스", "전광석화", "매지컬플레임", "명상"]);

    // 노력치 HC252 (hp 252, catk 252, def 4)
    expect(poke.origin.evs.hp).toBe(252);
    expect(poke.origin.evs.catk).toBe(252);
    expect(poke.origin.evs.def).toBe(4);
    expect(poke.origin.nature.up).toBe("catk");
    expect(poke.origin.nature.down).toBe("atk");
  });

  test("요정의깃털 장착 시 페어리 기술 데미지가 1.2배 증가해야 한다", () => {
    const sylveonWithFeather = generate("님피아 (특수딜탱)");
    const sylveonWithoutFeather = generate("님피아 (특수딜탱)");
    sylveonWithoutFeather.item = null;
    sylveonWithoutFeather.origin.item = null;

    const dummyDef = generate("견고라스");

    const battleWith = {
      player: sylveonWithFeather,
      npc: dummyDef,
      turn: { atk: "player", def: "npc" },
    };
    sylveonWithFeather.turn.useSkill = sylveonWithFeather.origin.skill[1]; // 하이퍼보이스 (노말 -> 페어리스킨으로 페어리)

    const battleWithout = {
      player: sylveonWithoutFeather,
      npc: dummyDef,
      turn: { atk: "player", def: "npc" },
    };
    sylveonWithoutFeather.turn.useSkill = sylveonWithoutFeather.origin.skill[1];

    const dmgWithFeather = damageCalculate(battleWith);
    const dmgWithoutFeather = damageCalculate(battleWithout);

    expect(dmgWithFeather).toBe(Math.floor(dmgWithoutFeather * 1.2));
  });
});
