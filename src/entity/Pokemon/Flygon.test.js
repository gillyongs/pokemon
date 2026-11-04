import sampleList from "./SamplePokemon";
import PokemonData from "./PokemonData";
import { generate } from "./PokemonInstance";
import { createBattle } from "../Battle";
import { damageCalculate } from "../../util/damageCalculate";
import { abilObject } from "../Ability";
import { AUGMENT_LIST, getAugmentText } from "../Augment/AugmentData";
import { DEDICATED_AUGMENT_POKEMON } from "../../component/battleScreen/augment/AugmentIcon";

describe("Flygon (플라이곤) & Mega Flygon (메가플라이곤) & Soaring (비상) verification", () => {
  test("Flygon and Mega Flygon are NOT in sampleList.items (hidden from Custom selection)", () => {
    const foundInItems = sampleList.items.some(
      (item) => item.id === "플라이곤" || item.id === "메가플라이곤" || item.pokemon_id === "0330" || item.pokemon_id === "0330-m"
    );
    expect(foundInItems).toBe(false);
  });

  test("getDataById retrieves megaFlygonSample with Scale Shot (스케일샷) instead of Outrage (역린)", () => {
    const megaFlygon = sampleList.getDataById("메가플라이곤");
    expect(megaFlygon).toBeDefined();
    expect(megaFlygon.id).toBe("메가플라이곤");
    expect(megaFlygon.pokemon_id).toBe("0330-m");
    expect(megaFlygon.name).toBe("메가플라이곤");
    expect(megaFlygon.type1).toBe("벌레");
    expect(megaFlygon.type2).toBe("드래곤");
    expect(megaFlygon.item).toBe("플라이곤나이트");
    expect(megaFlygon.abil).toBe("색안경");

    // Skills check: 지진, 스케일샷, 용의춤, 유턴
    expect(megaFlygon.skill[1].name).toBe("지진");
    expect(megaFlygon.skill[2].name).toBe("스케일샷");
    expect(megaFlygon.skill[3].name).toBe("용의춤");
    expect(megaFlygon.skill[4].name).toBe("유턴");

    // "플라이곤" or "0330" lookup also points to megaFlygonSample
    expect(sampleList.getDataById("플라이곤")).toBe(megaFlygon);
    expect(sampleList.getDataById("0330")).toBe(megaFlygon);
    expect(sampleList.getDataById("0330-m")).toBe(megaFlygon);
  });

  test("PokemonData has 0330 and 0330-m defined", () => {
    const baseMega = PokemonData.getDataById("0330-m");
    expect(baseMega).toBeDefined();
    expect(baseMega.name).toBe("메가플라이곤");
    expect(baseMega.type1).toBe("벌레");
    expect(baseMega.type2).toBe("드래곤");
    expect(baseMega.atk).toBe(140);
    expect(baseMega.def).toBe(100);
    expect(baseMega.catk).toBe(80);
    expect(baseMega.cdef).toBe(90);
    expect(baseMega.speed).toBe(130);
  });

  test("'비상' (soaring) augment definition and eligibility", () => {
    const soaring = AUGMENT_LIST.find((a) => a.id === "soaring");
    expect(soaring).toBeDefined();
    expect(soaring.name).toBe("비상");
    expect(soaring.cost).toBe("-");

    // Dedicated icon is 0330-m (Mega Flygon)
    expect(DEDICATED_AUGMENT_POKEMON.soaring).toBe("0330-m");

    // Eligible if no Flygon on team
    const pikachu = { name: "피카츄" };
    expect(soaring.isEligible(pikachu, [pikachu])).toBe(true);

    // Ineligible if Flygon is on team
    const megaFlygon = generate("메가플라이곤");
    expect(soaring.isEligible(pikachu, [pikachu, megaFlygon])).toBe(false);
  });

  test("'비상' (soaring) onApply replaces pokemon with Mega Flygon in battle", () => {
    const battle = createBattle(["갸라도스", "어써러셔", "어써러셔"], ["코터스", "어써러셔", "어써러셔"]);
    const target = battle.player;
    expect(target.name).toBe("갸라도스");

    const soaring = AUGMENT_LIST.find((a) => a.id === "soaring");
    target.applyAugment(soaring, battle);

    expect(battle.player.name).toBe("메가플라이곤");
    expect(battle.player.type1).toBe("벌레");
    expect(battle.player.type2).toBe("드래곤");
    expect(battle.player.abil).toBe("색안경");
    expect(battle.player.origin.skill[2].name).toBe("스케일샷");

    const text = getAugmentText(soaring, battle.player, true, "갸라도스");
    expect(text).toContain("갸라도스가 메가플라이곤으로 교체되었다!");
  });

  test("Tinted Lens (색안경) doubles damage of not-very-effective attacks", () => {
    expect(abilObject["색안경"]).toBeDefined();

    const battle = createBattle(["메가플라이곤", "어써러셔", "어써러셔"], ["코터스", "어써러셔", "어써러셔"]);
    battle.turn.atk = "player";
    battle.turn.def = "npc";
    battle.turn.atkSN = 4; // 유턴 (벌레 타입 -> 코터스 불꽃 타입에 0.5배 반감)

    const attacker = battle.player;
    const fixedAi = { randNum: 100 };

    // 1. Without 색안경
    attacker.abil = "부유";
    attacker.log = { damage1: "", damage2: "", statCalculate: "", speedCalculate: "" };
    const dmgWithout = damageCalculate(battle, null, fixedAi);

    // 2. With 색안경
    attacker.abil = "색안경";
    attacker.log = { damage1: "", damage2: "", statCalculate: "", speedCalculate: "" };
    const dmgWith = damageCalculate(battle, null, fixedAi);

    expect(dmgWith).toBe(dmgWithout * 2);
    expect(attacker.log.damage2).toContain("* 2 (색안경)");
  });
});
