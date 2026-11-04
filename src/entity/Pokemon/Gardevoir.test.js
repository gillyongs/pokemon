import sampleList from "./SamplePokemon";
import pokemonRepository from "./PokemonData";
import { megaDataList } from "./MegaData";
import { createBattle } from "../Battle";
import { damageCalculate } from "../../util/damageCalculate";
import { POKEMON_SKILLS, POKEMON_SKILL_ALIASES } from "../../skill/PokemonSkillList";

describe("Gardevoir & Mega Gardevoir Implementation", () => {
  test("pokemonRepository has Gardevoir (0282) and Mega Gardevoir (0282-m)", () => {
    const gardevoir = pokemonRepository.getDataById("0282");
    expect(gardevoir).toBeDefined();
    expect(gardevoir.name).toBe("가디안");
    expect(gardevoir.type1).toBe("에스퍼");
    expect(gardevoir.type2).toBe("페어리");
    expect(gardevoir.hp).toBe(68);
    expect(gardevoir.catk).toBe(125);
    expect(gardevoir.cdef).toBe(115);
    expect(gardevoir.speed).toBe(80);

    const megaGardevoir = pokemonRepository.getDataById("0282-m");
    expect(megaGardevoir).toBeDefined();
    expect(megaGardevoir.name).toBe("메가가디안");
    expect(megaGardevoir.type1).toBe("에스퍼");
    expect(megaGardevoir.type2).toBe("페어리");
    expect(megaGardevoir.hp).toBe(68);
    expect(megaGardevoir.atk).toBe(85);
    expect(megaGardevoir.catk).toBe(165);
    expect(megaGardevoir.cdef).toBe(135);
    expect(megaGardevoir.speed).toBe(100);
    expect(megaGardevoir.abilList).toContain("페어리스킨");
  });

  test("Mega evolution configuration exists for 0282", () => {
    const megaConfig = megaDataList["0282"];
    expect(megaConfig).toBeDefined();
    expect(megaConfig[0].stone).toBe("가디안나이트");
    expect(megaConfig[0].megaFormId).toBe("0282-m");
    expect(megaConfig[0].abil).toBe("페어리스킨");
  });

  test("Mega evolution transforms Normal skills to Fairy and triggers Pixilate boost in damage", () => {
    const megaGardevoirSample = sampleList.getDataById("메가가디안");
    expect(megaGardevoirSample).toBeDefined();

    const dummySample = sampleList.getDataById("럭키");
    const battle = createBattle(
      [megaGardevoirSample, dummySample, dummySample],
      [dummySample, dummySample, dummySample]
    );

    const queue = [];
    const enqueue = (msg) => queue.push(msg);

    const playerMon = battle.player;
    expect(playerMon.isMegaEvolveAble(battle)).toBe(true);
    playerMon.megaEvolve(battle, enqueue);

    expect(playerMon.isMega).toBe(true);
    expect(playerMon.origin.pokemon_id).toBe("0282-m");
    expect(playerMon.abil).toBe("페어리스킨");
    expect(playerMon.origin.stat.catk).toBe(217);

    // 하이퍼보이스 (원래 노말) 가 페어리 타입으로 변환되었는지 확인
    const hyperVoice = Object.values(playerMon.origin.skill).find((s) => s.name === "하이퍼보이스");
    expect(hyperVoice).toBeDefined();
    expect(hyperVoice.type).toBe("페어리");
    expect(hyperVoice.originType).toBe("노말");

    // 데미지 계산 테스트
    battle.turn.atk = "player";
    battle.turn.def = "npc";
    const hvIndex = Object.keys(playerMon.origin.skill).find((k) => playerMon.origin.skill[k].name === "하이퍼보이스");
    battle.turn.atkSN = hvIndex;
    playerMon.turn.useSkill = playerMon.origin.skill[hvIndex];

    const damage = damageCalculate(battle, null, { randNum: 100 });
    expect(damage).toBeGreaterThan(0);
    // 로그에 페어리스킨 및 자속보정 반영 확인
    expect(playerMon.log.damage1).toContain("페어리스킨");
    expect(playerMon.log.damage2).toContain("자속보정");
  });

  test("PokemonSkillList registers 0282 and 0282-m with requested core and other moves", () => {
    const skills0282 = POKEMON_SKILLS["0282"];
    expect(skills0282).toBeDefined();
    expect(skills0282.core).toContain("하이퍼보이스");
    expect(skills0282.core).toContain("매지컬플레임");
    expect(skills0282.core).toContain("진공파");
    expect(skills0282.core).toContain("문포스");
    expect(skills0282.core).toContain("사이코키네시스");
    expect(skills0282.core).toContain("10만볼트");
    expect(skills0282.core).toContain("사이코노이즈");
    expect(skills0282.core).toContain("사이코쇼크");
    expect(skills0282.core).toContain("와이드포스");

    expect(skills0282.others).toContain("명상");
    expect(skills0282.others).toContain("트릭룸");
    expect(skills0282.others).toContain("길동무");
    expect(skills0282.others).toContain("도깨비불");

    expect(POKEMON_SKILL_ALIASES["가디안"]).toBe("0282");
    expect(POKEMON_SKILL_ALIASES["메가가디안"]).toBe("0282-m");
  });
});
