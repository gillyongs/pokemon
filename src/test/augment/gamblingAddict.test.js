import { rollAugments } from "../../calc/augmentRoll";
import { AUGMENT_SYNERGY_MAP } from "../../entity/Augment/AugmentData";
import { createBattle } from "../../entity/Battle";

test("gambling addict synergy includes revolution, sword enhance, and zero-sum game", () => {
  expect(AUGMENT_SYNERGY_MAP.gamblingAddict).toEqual([
    "lifeIsOneShot",
    "allOrNothing",
    "revolution",
    "swordEnhance",
    "zeroSumGame",
  ]);
});

test("random ability is not offered by random augment rolls", () => {
  const battle = createBattle(["갸라도스", "팬텀", "럭키"], ["갸라도스", "팬텀", "럭키"]);
  const choices = rollAugments(battle.player, 100, battle);

  expect(choices.some(({ id }) => id === "randomAbility")).toBe(false);
});
