import { speedCheck, skillSpeedCheck } from "../util/speedCheck";
import { statCalculate } from "../function/statCalculate";
import { skillEffectsAfter } from "./skiiEffect";
import { skillUse } from "./skillUse";
import { turnEnd } from "./turnEnd";
import { switchPokemon } from "../util/switch";
import { josa } from "josa";

export const battleStart = (battle, actNumber, queueObject) => {
  queueObject.resetQueue();
  const enqueue = queueObject.enqueue;

  let bt = structuredClone(battle);
  statCalculate(bt);
  Object.keys(bt.turn).forEach((key) => {
    bt.turn[key] = null;
  });

  const npcActNumber = npcAi(actNumber);
  bt.turn.playerSN = actNumber;
  bt.turn.npcSN = npcActNumber;

  if (typeof actNumber === "string" && typeof npcActNumber === "string") {
    let fastUser = speedCheck(bt);
    if (fastUser === "player") {
      enqueue({ battle: bt, text: battle.player.origin.name + " 돌아와!" });
      switchPokemon(bt, "player", actNumber);
      enqueue({
        battle: bt,
        text: "가랏! " + battle[actNumber].origin.name + "!",
      });
      enqueue({
        battle: bt,
        text: "상대는 " + battle.npc.origin.namess + " 넣어 버렸다!",
      });
      switchPokemon(bt, "npc", npcActNumber);
      enqueue({
        battle: bt,
        text: "상대는 " + battle[npcActNumber].origin.namess + " 내보냈다!",
      });
    } else if (fastUser === "npc") {
      switchPokemon(bt, "npc", npcActNumber);
      switchPokemon(bt, "player", actNumber);
    }
  }

  if (typeof actNumber === "number" && typeof npcActNumber === "number") {
    let fastUser = skillSpeedCheck(bt);
    bt.turn.fastUser = fastUser;

    setAtkDef(
      bt,
      fastUser,
      fastUser === "player" ? "npc" : "player",
      fastUser === "player" ? actNumber : npcActNumber,
      fastUser === "player" ? npcActNumber : actNumber
    );

    skillUse(bt, enqueue);
    skillEffectsAfter(bt, enqueue);
    if (bt[bt.turn.def].faint === true) {
      return;
    }

    setAtkDef(bt, bt.turn.def, bt.turn.atk, bt.turn.defSN, bt.turn.atkSN);

    skillUse(bt, enqueue);
    skillEffectsAfter(bt, enqueue);
  }

  turnEnd(bt, enqueue);
};

const setAtkDef = (bt, attacker, defender, atkSN, defSN) => {
  bt.turn.atk = attacker;
  bt.turn.def = defender;
  bt.turn.atkSN = atkSN;
  bt.turn.defSN = defSN;
};

const npcAi = (a) => {
  if (a === "playerBench1") {
    return "npcBench1";
  }
  if (a === "playerBench2") {
    return "npcBench2";
  }
  return a;
};
