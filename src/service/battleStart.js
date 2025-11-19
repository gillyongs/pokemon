import { speedCheck, skillSpeedCheck } from "../util/speedCheck";
import { turnEnd } from "./turnEnd";
import { switchNpc, switchPlayer } from "./switch";
import { attackNpc, attackPlayer } from "./attack";

export const battleStart = (battle, actNumber, npcActNumber, queueObject) => {
  // 턴을 시작하는 함수
  // 선택지와 스피드에 맞게 '교체'나 '공격' 함수를 호출한다

  queueObject.resetQueue();
  const enqueue = queueObject.enqueue;

  battle.resetTurn();
  battle.turn.playerSN = actNumber;
  battle.turn.npcSN = npcActNumber;
  let playerUseSkill = null;
  let npcUseSkill = null;
  if (typeof actNumber === "number") playerUseSkill = battle.player.origin["sk" + actNumber];
  if (typeof npcActNumber === "number") npcUseSkill = battle.npc.origin["sk" + npcActNumber];

  if (typeof actNumber === "string" && typeof npcActNumber === "string") {
    //맞교체
    let fastUser = speedCheck(battle); // 우선도 없이 스피드만 체크
    battle.turn.fastActUser = fastUser; // 기습, 방어 성공여부 떄문에 넣는다
    if (fastUser === "player") {
      switchPlayer(battle, actNumber, enqueue);
      switchNpc(battle, npcActNumber, enqueue);
    } else if (fastUser === "npc") {
      switchNpc(battle, npcActNumber, enqueue);
      switchPlayer(battle, actNumber, enqueue);
    }
  } else if (
    // 플레이어만 교체
    typeof actNumber === "string" &&
    typeof npcActNumber === "number"
  ) {
    battle.turn.fastActUser = "player"; // 교체도 먼저 행동한 것으로 간주
    battle.npc.temp.useSkill = npcUseSkill;
    switchPlayer(battle, actNumber, enqueue);
    attackNpc(battle, actNumber, npcActNumber, enqueue);
  } else if (
    // npc만 교체
    typeof npcActNumber === "string" &&
    typeof actNumber === "number"
  ) {
    battle.turn.fastActUser = "npc"; // 교체도 먼저 행동한 것으로 간주
    battle.player.temp.useSkill = playerUseSkill;
    switchNpc(battle, npcActNumber, enqueue);
    attackPlayer(battle, actNumber, npcActNumber, enqueue);
    if (battle.turn.uturn) {
      return;
    }
  } else if (
    //맞공격
    typeof actNumber === "number" &&
    typeof npcActNumber === "number"
  ) {
    let fastUser = skillSpeedCheck(battle);
    battle.player.temp.useSkill = playerUseSkill;
    battle.npc.temp.useSkill = npcUseSkill;
    battle.turn.fastActUser = fastUser; //기습 사용조건때문에 넣는다

    if (fastUser === "player") {
      // 플레이어 선공
      attackPlayer(battle, actNumber, npcActNumber, enqueue);
      if (battle.turn.uturn) return;
      // 유턴으로 교체시 교체화면을 띄우고 거기서 남은 함수 (attackNpc, turnEnd)를 실행한다
      if (battle[battle.turn.def].faint !== true) {
        attackNpc(battle, actNumber, npcActNumber, enqueue);
      }
    } else {
      attackNpc(battle, actNumber, npcActNumber, enqueue);
      if (battle[battle.turn.def].faint !== true) {
        attackPlayer(battle, actNumber, npcActNumber, enqueue);
        if (battle.turn.uturn) return;
        // 유턴으로 교체시 교체화면을 띄우고 거기서 남은 함수 (turnEnd)를 실행한다
      }
    }
  }

  turnEnd(battle, enqueue);
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
