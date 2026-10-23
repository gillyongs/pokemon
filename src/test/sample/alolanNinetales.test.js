import sampleList from "../../entity/Pokemon/SamplePokemon";
import { generate } from "../../entity/Pokemon/PokemonInstance";
import Battle from "../../entity/Battle";
import pokemonData from "../../entity/Pokemon/PokemonData";
import skillList from "../../entity/Skill/skillList";
import skillEffectSearch from "../../entity/Skill/SkillEffect";
import { applyAbilityEffects } from "../../entity/Ability";
import { getAccuracy } from "../../function/accuracyCalculate";
import { damageCalculate } from "../../util/damageCalculate";
import { turnEnd } from "../../service/turnEnd";
import { getSkillListForPokemon } from "../../skill/PokemonSkillList";

function makeBattle(player, npc) {
  return new Battle(player, npc, generate("따라큐"), generate("파르셀"), generate("럭키"), generate("마릴리"));
}

describe("알로라나인테일 / 눈퍼뜨리기 / 오로라베일 구현 테스트", () => {
  let mockQueue;
  let enqueue;

  beforeEach(() => {
    mockQueue = [];
    enqueue = jest.fn((item) => mockQueue.push(item));
  });

  it("템플릿 및 종족값 확인", () => {
    const template = sampleList.getDataById("나인테일");
    expect(template).toBeDefined();
    expect(template.pokemon_id).toBe("0038-a");
    expect(template.item).toBe("빛의점토");
    expect(template.abil).toBe("눈퍼뜨리기");
    expect(template.role).toBe("기점잡이");
    expect(template.evsInput).toBe("CS252");
    expect(template.nature).toEqual({ up: "speed", down: "atk" });

    const data = pokemonData.getDataById("0038-a");
    expect(data.name).toBe("나인테일");
    expect(data.type1).toBe("얼음");
    expect(data.type2).toBe("페어리");
    expect(data.hp + data.atk + data.def + data.catk + data.cdef + data.speed).toBe(505);

    const ninetales = generate("나인테일");
    const names = [1, 2, 3, 4].map((n) => ninetales.origin.skill[n].name);
    expect(names).toEqual(["오로라베일", "프리즈드라이", "눈보라", "문포스"]);

    const skills = getSkillListForPokemon("0038-a").map((s) => s.name);
    expect(skills).toContain("오로라베일");
  });

  it("눈퍼뜨리기로 설경이 되고, 설경에서 눈보라는 필중이 된다", () => {
    const ninetales = generate("나인테일");
    const enemy = generate("한카리아스");
    const battle = makeBattle(ninetales, enemy);
    battle.turn.atk = "player";
    battle.turn.def = "npc";

    const blizzard = skillList.search("눈보라");
    expect(getAccuracy(battle, blizzard, ninetales)).toBe(70);

    applyAbilityEffects(battle, "player", enqueue);
    expect(battle.field.weather.isSnow).toBe(true);
    expect(mockQueue.some((q) => q.text?.includes("[특성 눈퍼뜨리기]"))).toBe(true);
    expect(getAccuracy(battle, blizzard, ninetales)).toBe(100);
  });

  it("설경이 아니면 오로라베일은 실패한다", () => {
    const ninetales = generate("나인테일");
    const battle = makeBattle(ninetales, generate("한카리아스"));
    battle.turn.atk = "player";
    battle.turn.def = "npc";

    skillEffectSearch("오로라베일")(battle, enqueue, {});
    expect(battle.field.player.noClean.auroraVeil).toBeNull();
    expect(mockQueue.some((q) => q.text === "하지만 실패했다!")).toBe(true);
  });

  it("설경에서 오로라베일 사용 시 빛의점토로 8턴 지속되고, 물리/특수 데미지가 반감된다", () => {
    const ninetales = generate("나인테일");
    const enemy = generate("한카리아스");
    const battle = makeBattle(ninetales, enemy);
    battle.turn.atk = "player";
    battle.turn.def = "npc";
    applyAbilityEffects(battle, "player", enqueue);

    skillEffectSearch("오로라베일")(battle, enqueue, {});
    expect(battle.field.player.noClean.auroraVeil).toBe(8);

    // 한카리아스가 지진(물리)으로 공격
    battle.turn.atk = "npc";
    battle.turn.def = "player";
    battle.turn.atkSN = 1;
    expect(enemy.origin.skill[1].name).toBe("지진");
    damageCalculate(battle, {}, true);
    expect(enemy.log.damage1).toContain("(오로라베일)");

    // 메가리자몽Y가 화염방사(특수)로 공격
    const charizard = generate("메가리자몽Y");
    battle.npc = charizard;
    expect(charizard.origin.skill[1].name).toBe("화염방사");
    damageCalculate(battle, {}, true);
    expect(charizard.log.damage1).toContain("(오로라베일)");

    // 중복 사용 실패
    battle.turn.atk = "player";
    battle.turn.def = "npc";
    mockQueue.length = 0;
    skillEffectSearch("오로라베일")(battle, enqueue, {});
    expect(mockQueue.some((q) => q.text === "하지만 실패했다!")).toBe(true);
  });

  it("오로라베일은 턴 종료마다 감소하여 사라진다", () => {
    const ninetales = generate("나인테일");
    const battle = makeBattle(ninetales, generate("한카리아스"));
    battle.field.player.noClean.auroraVeil = 2;

    turnEnd(battle, enqueue);
    expect(battle.field.player.noClean.auroraVeil).toBe(1);
    turnEnd(battle, enqueue);
    expect(battle.field.player.noClean.auroraVeil).toBeNull();
    expect(mockQueue.some((q) => q.text?.includes("오로라베일 효과가 사라졌다"))).toBe(true);
  });

  it("벽부수기 기술은 오로라베일을 깨뜨린다", () => {
    const ninetales = generate("나인테일");
    const battle = makeBattle(ninetales, generate("한카리아스"));
    battle.turn.atk = "npc";
    battle.turn.def = "player";
    battle.field.player.noClean.auroraVeil = 5;

    skillEffectSearch("벽부수기")(battle, enqueue, {});
    expect(battle.field.player.noClean.auroraVeil).toBeNull();
  });

  it("설경에서 얼음 타입은 방어가 1.5배가 된다", () => {
    const ninetales = generate("나인테일");
    const enemy = generate("한카리아스");
    const battle = makeBattle(ninetales, enemy);
    battle.turn.atk = "player";
    battle.turn.def = "npc";
    applyAbilityEffects(battle, "player", enqueue);

    battle.turn.atk = "npc";
    battle.turn.def = "player";
    battle.turn.atkSN = 1;
    damageCalculate(battle, {}, true);
    expect(enemy.log.damage1).toContain("(설경+얼음)");
  });
});
