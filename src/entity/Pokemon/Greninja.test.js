import sampleList from "./SamplePokemon";
import pokemonRepository from "./PokemonData";
import { megaDataList } from "./MegaData";
import { createBattle } from "../Battle";
import skillList from "../Skill/skillList";
import { damageCalculate } from "../../util/damageCalculate";
import { POKEMON_SKILLS, POKEMON_SKILL_ALIASES } from "../../skill/PokemonSkillList";
import { skillUse } from "../../service/skillUse";

describe("Greninja & Mega Greninja Implementation", () => {
  test("pokemonRepository has Greninja (0658) and Mega Greninja (0658-m)", () => {
    const greninja = pokemonRepository.getDataById("0658");
    expect(greninja).toBeDefined();
    expect(greninja.name).toBe("개굴닌자");
    expect(greninja.type1).toBe("물");
    expect(greninja.type2).toBe("악");
    expect(greninja.hp).toBe(72);
    expect(greninja.atk).toBe(95);
    expect(greninja.def).toBe(67);
    expect(greninja.catk).toBe(103);
    expect(greninja.cdef).toBe(71);
    expect(greninja.speed).toBe(122);
    expect(greninja.abilList).toContain("급류");
    expect(greninja.abilList).toContain("변환자재");

    const megaGreninja = pokemonRepository.getDataById("0658-m");
    expect(megaGreninja).toBeDefined();
    expect(megaGreninja.name).toBe("메가개굴닌자");
    expect(megaGreninja.type1).toBe("물");
    expect(megaGreninja.type2).toBe("악");
    expect(megaGreninja.hp).toBe(72);
    expect(megaGreninja.atk).toBe(135);
    expect(megaGreninja.def).toBe(67);
    expect(megaGreninja.catk).toBe(153);
    expect(megaGreninja.cdef).toBe(71);
    expect(megaGreninja.speed).toBe(132);
    expect(megaGreninja.abilList).toContain("적응력");
  });

  test("Water Shuriken (물수리검) is properly registered as a special multi-hit priority move", () => {
    const shuriken = skillList.getDataById("물수리검");
    expect(shuriken).toBeDefined();
    expect(shuriken.name).toBe("물수리검");
    expect(shuriken.type).toBe("물");
    expect(shuriken.power).toBe(15);
    expect(shuriken.accur).toBe(100);
    expect(shuriken.stype).toBe("catk");
    expect(shuriken.prior).toBe(1);
    expect(shuriken.feature?.serial).toBe("twoFive");
  });

  test("Mega evolution configuration exists for 0658", () => {
    const megaConfig = megaDataList["0658"];
    expect(megaConfig).toBeDefined();
    expect(megaConfig[0].stone).toBe("개굴닌자나이트");
    expect(megaConfig[0].megaFormId).toBe("0658-m");
    expect(megaConfig[0].abil).toBe("적응력");
  });

  test("Mega evolution grants Adaptability and 2.0x STAB boost", () => {
    const megaGreninjaSample = sampleList.getDataById("메가개굴닌자");
    expect(megaGreninjaSample).toBeDefined();

    const dummySample = sampleList.getDataById("럭키");
    const battle = createBattle(
      [megaGreninjaSample, dummySample, dummySample],
      [dummySample, dummySample, dummySample]
    );

    const queue = [];
    const enqueue = (msg) => queue.push(msg);

    const playerMon = battle.player;
    expect(playerMon.isMegaEvolveAble(battle)).toBe(true);
    playerMon.megaEvolve(battle, enqueue);

    expect(playerMon.isMega).toBe(true);
    expect(playerMon.origin.pokemon_id).toBe("0658-m");
    expect(playerMon.abil).toBe("적응력");

    // 데미지 계산 테스트 (악의파동 또는 물수리검 자속보정+적응력 확인)
    battle.turn.atk = "player";
    battle.turn.def = "npc";
    const darkPulseIndex = Object.keys(playerMon.origin.skill).find(
      (k) => playerMon.origin.skill[k].name === "악의파동"
    );
    battle.turn.atkSN = darkPulseIndex;
    playerMon.turn.useSkill = playerMon.origin.skill[darkPulseIndex];

    const damage = damageCalculate(battle, null, { randNum: 100 });
    expect(damage).toBeGreaterThan(0);
    expect(playerMon.log.damage2).toContain("자속보정+적응력");
  });

  test("Base Greninja uses Protean (변환자재) to change type upon skill use", () => {
    const greninjaSample = sampleList.getDataById("개굴닌자");
    expect(greninjaSample).toBeDefined();

    const dummySample = sampleList.getDataById("럭키");
    const battle = createBattle(
      [greninjaSample, dummySample, dummySample],
      [dummySample, dummySample, dummySample]
    );

    const queue = [];
    const enqueue = (msg) => queue.push(msg);

    const playerMon = battle.player;
    expect(playerMon.abil).toBe("변환자재");
    expect(playerMon.type1).toBe("물");
    expect(playerMon.type2).toBe("악");

    // 냉동빔(얼음) 사용 시 얼음 타입으로 변환
    battle.turn.atk = "player";
    battle.turn.def = "npc";
    const iceBeamIndex = Object.keys(playerMon.origin.skill).find(
      (k) => playerMon.origin.skill[k].name === "냉동빔"
    );
    battle.turn.atkSN = iceBeamIndex;
    playerMon.turn.useSkill = playerMon.origin.skill[iceBeamIndex];

    skillUse(battle, enqueue);

    expect(playerMon.type1).toBe("얼음");
    expect(playerMon.type2).toBeNull();
  });

  test("PokemonSkillList registers 0658 and 0658-m with requested core and other moves", () => {
    const skills0658 = POKEMON_SKILLS["0658"];
    expect(skills0658).toBeDefined();
    expect(skills0658.core).toContain("냉동빔");
    expect(skills0658.core).toContain("악의파동");
    expect(skills0658.core).toContain("오물웨이브");
    expect(skills0658.core).toContain("물수리검");
    expect(skills0658.core).toContain("파도타기");
    expect(skills0658.core).toContain("풀묶기");
    expect(skills0658.core).toContain("독압정");

    expect(skills0658.others).toContain("유턴");
    expect(skills0658.others).toContain("야습");
    expect(skills0658.others).toContain("더스트슈트");
    expect(skills0658.others).toContain("카운터");

    expect(POKEMON_SKILL_ALIASES["개굴닌자"]).toBe("0658");
    expect(POKEMON_SKILL_ALIASES["메가개굴닌자"]).toBe("0658-m");
  });
});
