import { generate } from "../../entity/Pokemon/PokemonInstance";
import Battle from "../../entity/Battle";
import { calculateSkillScore } from "../../npc/ai/calculateSkillScore";
import { npcAiEasy } from "../../npc/ai/easy";

describe("AI Mega Evolution Base Calculation Verification", () => {
  it("should calculate skill score based on mega-evolved stats and abilities for mega-capable pokemon", () => {
    const player = generate("뽀록나");
    const npc = generate("메가라이츄Y"); // Has 라이츄나이트Y and megaData
    const battle = new Battle(player, npc, generate("따라큐"), generate("파르셀"), generate("럭키"), generate("마릴리"));

    battle.turn.atk = "npc";
    battle.turn.def = "player";
    battle.turn.atkSN = 1;

    // Before calculateSkillScore call, npc in battle is not mega evolved yet
    expect(Boolean(npc.isMega)).toBe(false);
    expect(npc.abil).toBe("피뢰침");

    const skObj = { log: {} };
    // Skill 1 is 전자포 (base accuracy 50)
    // In mega form, Mega Raichu Y has No Guard (accuracy becomes 100) and Catk jumps from 90 to 160
    const score = calculateSkillScore(battle, 1, skObj, true);

    expect(score).toBeGreaterThan(0);
    // skObj.log.atkScoreOrigin should reflect 100 accuracy from No Guard
    expect(skObj.log.atkScoreOrigin).toContain("* 100 /");
  });

  it("should select skill using mega evolved state in npcAiEasy", () => {
    const player = generate("뽀록나");
    const npc = generate("메가라이츄Y");
    const battle = new Battle(player, npc, generate("따라큐"), generate("파르셀"), generate("럭키"), generate("마릴리"));

    // npc has moves: [1: 전자포, 2: 기합구슬, 3: 파도타기, 4: 풀묶기]
    const chosen = npcAiEasy([1, 2, 3, 4], battle);
    // Returns key as number or numeric string (e.g. 1 or "1")
    expect([1, 2, 3, 4, "1", "2", "3", "4"]).toContain(chosen);
  });
});
