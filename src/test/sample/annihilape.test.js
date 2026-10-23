import sampleList from "../../entity/Pokemon/SamplePokemon";
import { generate } from "../../entity/Pokemon/PokemonInstance";
import pokemonData from "../../entity/Pokemon/PokemonData";
import { getSkillListForPokemon } from "../../skill/PokemonSkillList";
import Battle from "../../entity/Battle";
import { damageCalculate } from "../../util/damageCalculate";
import { attackDamage } from "../../function/damage";
import { applyAilment } from "../../function/ailment";
import skillEffectSearch from "../../entity/Skill/SkillEffect";

describe("Annihilape (저승갓숭) & Rage Fist (분노의주먹) & Vital Spirit (의기양양) Verification", () => {
  it("should exist in PokemonData with correct stats and types", () => {
    const data = pokemonData.getDataById("0979");
    expect(data).toBeDefined();
    expect(data.name).toBe("저승갓숭");
    expect(data.type1).toBe("격투");
    expect(data.type2).toBe("고스트");
    expect(data.hp).toBe(110);
    expect(data.atk).toBe(115);
    expect(data.def).toBe(80);
    expect(data.catk).toBe(50);
    expect(data.cdef).toBe(90);
    expect(data.speed).toBe(90);
    expect(data.hp + data.atk + data.def + data.catk + data.cdef + data.speed).toBe(535);
    expect(data.abilList).toEqual(["오기", "의기양양", "정신력"]);
  });

  it("should have correct sample preset in SamplePokemon", () => {
    const sample = sampleList.getDataById("저승갓숭");
    expect(sample).toBeDefined();
    expect(sample.pokemon_id).toBe("0979");
    expect(sample.evsInput).toBe("HA252");
    expect(sample.nature).toEqual({ up: "atk", down: "catk" });
    expect(sample.skill[1].name).toBe("분노의주먹");
    expect(sample.skill[2].name).toBe("드레인펀치");
    expect(sample.skill[3].name).toBe("벌크업");
    expect(sample.skill[4].name).toBe("도발");
    expect(sample.item).toBe("먹다남은음식");
    expect(sample.abil).toBe("오기");
    expect(sample.role).toBe("물리딜탱");
  });

  it("should generate a valid Annihilape instance", () => {
    const instance = generate("저승갓숭");
    expect(instance.name).toBe("저승갓숭");
    expect(instance.origin.pokemon_id).toBe("0979");
    expect(instance.item).toBe("먹다남은음식");
    expect(instance.abil).toBe("오기");
    expect(instance.origin.skill[1].name).toBe("분노의주먹");
    expect(instance.origin.skill[2].name).toBe("드레인펀치");
    expect(instance.origin.skill[3].name).toBe("벌크업");
    expect(instance.origin.skill[4].name).toBe("도발");
  });

  it("should have user-provided core and others in PokemonSkillList", () => {
    const skills = getSkillListForPokemon("0979");
    expect(skills.length).toBe(81);

    const names = skills.map((s) => s.name);
    // Core moves
    expect(names).toContain("분노의주먹");
    expect(names).toContain("드레인펀치");
    expect(names).toContain("벌크업");
    expect(names).toContain("도발");
    expect(names).toContain("스텔스록");
    expect(names).toContain("냉동펀치");

    // Standardized moves
    expect(names).toContain("앙코르");
    expect(names).toContain("깨트리기");
    expect(names).toContain("섀도클로");
  });

  it("should scale Rage Fist (분노의주먹) power with hitCount", () => {
    const player = generate("저승갓숭");
    const npc = generate("뽀록나");
    const battle = new Battle(player, npc, generate("따라큐"), generate("파르셀"), generate("럭키"), generate("마릴리"));

    battle.turn.atk = "player";
    battle.turn.def = "npc";
    battle.turn.atkSN = 1;
    player.turn.useSkill = player.origin.skill[1]; // 분노의주먹

    // Base power when 0 hits: 50
    expect(player.tempStatus.hitCount).toBe(0);
    const initialDamage = damageCalculate(battle, null, false);

    // Simulate 1 hit on Annihilape
    const enqueue = jest.fn();
    battle.turn.atk = "npc";
    battle.turn.def = "player";
    battle.turn.atkSN = 2;
    npc.turn.useSkill = npc.origin.skill[2]; // 기가드레인
    attackDamage(battle, 20, "player", enqueue);

    expect(player.tempStatus.hitCount).toBe(1);

    // Now attack with Rage Fist (power should be 100)
    battle.turn.atk = "player";
    battle.turn.def = "npc";
    battle.turn.atkSN = 1;
    player.turn.useSkill = player.origin.skill[1];
    const power1Hit = damageCalculate(battle, null, false);
    expect(power1Hit).toBeGreaterThan(initialDamage);
  });

  it("should prevent sleep status with Vital Spirit (의기양양)", () => {
    const player = generate("저승갓숭", { abil: "의기양양" });
    const npc = generate("뽀록나");
    const battle = new Battle(player, npc, generate("따라큐"), generate("파르셀"), generate("럭키"), generate("마릴리"));

    expect(player.abil).toBe("의기양양");

    // Try applying sleep to player with Vital Spirit
    const enqueue = jest.fn();
    applyAilment("잠듦", battle, "player", enqueue);
    expect(player.ailment.sleep).toBeNull();

    // Try applying Yawn (하품) to player with Vital Spirit
    battle.turn.atk = "npc";
    battle.turn.def = "player";
    const hapumHandler = skillEffectSearch("하품");
    hapumHandler(battle, enqueue, {});
    expect(player.tempStatus.hapum).toBeNull();
  });
});
