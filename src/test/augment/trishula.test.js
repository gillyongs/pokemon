import { AUGMENT_LIST } from "../../entity/Augment/AugmentData";
import { createBattle } from "../../entity/Battle";
import skillEffectSearch from "../../entity/Skill/SkillEffect";
import { applyAilment } from "../../service/ailment";

const trishula = AUGMENT_LIST.find((augment) => augment.id === "trishula");

const createBattleWithTrishula = () => {
  const battle = createBattle(["갸라도스", "팬텀", "럭키"], ["갸라도스", "팬텀", "럭키"]);
  battle.turn.atk = "player";
  battle.turn.def = "npc";
  battle.turn.atkSN = 1;
  battle.player.turn.useSkill = battle.player.skill[1];
  battle.player.applyAugment(trishula, battle);
  return battle;
};

const attack = (battle) => skillEffectSearch("공통")(battle, () => {});

test("three frost stacks freeze an ailment-free target and clear the stacks", () => {
  const battle = createBattleWithTrishula();

  attack(battle);
  attack(battle);
  expect(battle.npc.tempStatus.trishulaFrost).toBe(2);

  attack(battle);
  expect(battle.npc.ailment.freeze).toBe(true);
  expect(battle.npc.tempStatus.trishulaFrost).toBe(0);
});

test("frost stacks to three alongside another ailment but does not freeze until it clears", () => {
  const battle = createBattleWithTrishula();
  battle.npc.ailment.burn = 1;

  attack(battle);
  attack(battle);
  attack(battle);
  expect(battle.npc.tempStatus.trishulaFrost).toBe(3);
  expect(battle.npc.ailment.freeze).toBeNull();

  attack(battle);
  expect(battle.npc.tempStatus.trishulaFrost).toBe(3);

  battle.npc.ailment.burn = null;
  attack(battle);
  expect(battle.npc.ailment.freeze).toBe(true);
  expect(battle.npc.tempStatus.trishulaFrost).toBe(0);
});

test.each([
  ["already frozen", (pokemon) => { pokemon.ailment.freeze = true; }],
  ["Fire type", (pokemon) => { pokemon.type1 = "불꽃"; }],
  ["Ice type", (pokemon) => { pokemon.type1 = "얼음"; }],
])("does not add frost to a target that is %s", (_condition, configureTarget) => {
  const battle = createBattleWithTrishula();
  configureTarget(battle.npc);

  attack(battle);

  expect(battle.npc.tempStatus.trishulaFrost).toBe(0);
});

test("any successfully applied freeze clears Trishula frost", () => {
  const battle = createBattleWithTrishula();
  battle.npc.tempStatus.trishulaFrost = 2;

  applyAilment("얼음", battle, "npc", () => {});

  expect(battle.npc.ailment.freeze).toBe(true);
  expect(battle.npc.tempStatus.trishulaFrost).toBe(0);
});
