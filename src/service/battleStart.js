import { speedCheck, skillSpeedCheck } from "../util/speedCheck";
import { turnEnd } from "./turnEnd";
import { switchNpc, switchPlayer } from "./switch";
import { attackNpc, attackPlayer } from "./attack";

export const battleStart = (battle, actNumber, npcActNumber, queueObject) => {
  //턴을 시작하는 함수
  //선택지와 스피드에 맞게 '교체'와 '공격' 함수를 호출한다

  queueObject.resetQueue();
  const enqueue = queueObject.enqueue;

  let bt = structuredClone(battle);
  Object.keys(bt.turn).forEach((key) => {
    bt.turn[key] = null;
  });

  bt.turn.playerSN = actNumber;
  bt.turn.npcSN = npcActNumber;
  let uTurnTrigger = false;
  let playerUseSkill = null;
  let npcUseSkill = null;
  if (typeof actNumber === "number") {
    playerUseSkill = bt.player.origin["sk" + actNumber];
  }
  if (typeof npcActNumber === "number") {
    npcUseSkill = bt.npc.origin["sk" + npcActNumber];
  }

  if (playerUseSkill.name === "유턴" || playerUseSkill.name === "볼트체인지") {
    uTurnTrigger = true;
  }

  if (typeof actNumber === "string" && typeof npcActNumber === "string") {
    //맞교체
    let fastUser = speedCheck(bt); // 우선도 없이 스피드만 체크
    bt.turn.fastActUser = fastUser; // 기습, 방어 성공여부 떄문에 넣는다
    if (fastUser === "player") {
      switchPlayer(bt, actNumber, enqueue);
      switchNpc(bt, npcActNumber, enqueue);
    } else if (fastUser === "npc") {
      switchNpc(bt, npcActNumber, enqueue);
      switchPlayer(bt, actNumber, enqueue);
    }
  } else if (
    // 플레이어만 교체
    typeof actNumber === "string" &&
    typeof npcActNumber === "number"
  ) {
    bt.turn.fastActUser = "player"; // 교체도 먼저 행동한 것으로 간주
    bt.npc.temp.useSkill = npcUseSkill;
    switchPlayer(bt, actNumber, enqueue);
    attackNpc(bt, actNumber, npcActNumber, enqueue);
  } else if (
    // npc만 교체
    typeof npcActNumber === "string" &&
    typeof actNumber === "number"
  ) {
    bt.turn.fastActUser = "npc"; // 교체도 먼저 행동한 것으로 간주
    bt.player.temp.useSkill = playerUseSkill;
    switchNpc(bt, npcActNumber, enqueue);
    attackPlayer(bt, actNumber, npcActNumber, enqueue);
    if (uTurnTrigger) {
      return;
    }
  } else if (
    //맞공격
    typeof actNumber === "number" &&
    typeof npcActNumber === "number"
  ) {
    let fastUser = skillSpeedCheck(bt);
    bt.turn.fastActUser = fastUser; //기습 사용조건때문에 넣는다
    bt.player.temp.useSkill = playerUseSkill;
    bt.npc.temp.useSkill = npcUseSkill;

    if (fastUser === "player") {
      attackPlayer(bt, actNumber, npcActNumber, enqueue);
      if (uTurnTrigger) {
        return;
      }
      if (bt[bt.turn.def].faint !== true) {
        attackNpc(bt, actNumber, npcActNumber, enqueue);
      }
    } else {
      attackNpc(bt, actNumber, npcActNumber, enqueue);

      if (bt[bt.turn.def].faint !== true) {
        attackPlayer(bt, actNumber, npcActNumber, enqueue);
        if (uTurnTrigger) {
          if (!bt.npc.temp.protect) {
            return;
          }
          //npc가 방어로 유턴을 막은 경우
          //유턴이 실행되지 않았으므로 유턴 트리거 실행 x
        }
      }
    }
  }

  turnEnd(bt, enqueue);
};

const npcAi = (battle, a) => {
  if (a === "playerBench1") {
    return "npcBench1";
  }
  if (a === "playerBench2") {
    return "npcBench2";
  }
  return a;
};
const npcAi2 = (battle) => {
  return 4;
  let choices = [1, 2, 3, 4];
  if (!battle.npcBench1.faint) choices.push("npcBench1");
  if (!battle.npcBench2.faint) choices.push("npcBench2");

  return choices[Math.floor(Math.random() * choices.length)];
};

export default npcAi2;
