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
  battle.player.turn.choice = actNumber;
  battle.npc.turn.choice = npcActNumber;

  if (isAttack(actNumber)) battle.player.turn.useSkill = battle.player.origin.skill[actNumber];
  if (isAttack(npcActNumber)) battle.npc.turn.useSkill = battle.npc.origin.skill[npcActNumber];

  if (isSwitch(actNumber) && isSwitch(npcActNumber)) {
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
    isSwitch(actNumber) &&
    isAttack(npcActNumber)
  ) {
    battle.turn.fastActUser = "player"; // 교체도 먼저 행동한 것으로 간주
    switchPlayer(battle, actNumber, enqueue);
    attackNpc(battle, actNumber, npcActNumber, enqueue);
  } else if (
    // npc만 교체
    isSwitch(npcActNumber) &&
    isAttack(actNumber)
  ) {
    battle.turn.fastActUser = "npc"; // 교체도 먼저 행동한 것으로 간주
    switchNpc(battle, npcActNumber, enqueue);
    attackPlayer(battle, actNumber, npcActNumber, enqueue);
    if (battle.turn.uturn) {
      return;
    }
  } else if (
    //맞공격
    isAttack(actNumber) &&
    isAttack(npcActNumber)
  ) {
    let fastUser = skillSpeedCheck(battle); // 우선도까지 고려한 스피드 체크
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

function getActionType(act) {
  // 공격 (1~4)
  if (typeof act === "number" && act >= 1 && act <= 4) {
    return "attack";
  }

  // 교체
  const switchList = ["npcBench1", "npcBench2", "playerBench1", "playerBench2"];
  if (typeof act === "string" && switchList.includes(act)) {
    return "switch";
  }

  // 그 외
  console.error("행동타입오류");
}

function isAttack(act) {
  let string = getActionType(act);
  if (string === "attack") return true;
  return false;
}

function isSwitch(act) {
  let string = getActionType(act);
  if (string === "switch") return true;
  return false;
}
