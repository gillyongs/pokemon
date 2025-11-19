import { switchNpc } from "./switch";
import { speedCheck } from "../util/speedCheck";
import { processSkillEffects } from "./turnEnd/skillEvent";
import { processStatusCondition } from "./turnEnd/statusConditonEvent";
export const turnEnd = (battle, enqueue) => {
  // 턴이 종료될때 실행되는 이벤트 모음
  // 화상딜, 독딜, 날개쉬기 타입복구, NPC 기절시 교체
  // turnEnd를 trigger로 사용하여 모든 이벤트가 끝나야 교체화면이 나오게 함
  // player.temp의 프로퍼티들은 여기서 초기화된다.
  // battle.turn은 turnEnd 때문에 턴 시작할때 (battleStart.js)에서 초기화된다

  const fastUser = speedCheck(battle);
  const slowUser = fastUser === "player" ? "npc" : "player";

  // 트릭룸 카운트
  battle.field.room.handleTrickRoomTurnEnd(battle, enqueue);

  // 날씨 카운트
  battle.field.weather.handleWeatherTurnEnd(battle, enqueue);

  // 필드 카운트
  battle.field.terrain.handleTerrainTurnEnd(battle, enqueue);

  // 희망사항
  battle.field[fastUser].handleWishTurnEnd(battle, enqueue);
  battle.field[slowUser].handleWishTurnEnd(battle, enqueue);
  // 희망사항 -> 먹밥 -> 독뎀 순서, 어지간하면 회복이 먼저

  // 아이템 (먹밥)
  battle[fastUser].leftOver(battle, enqueue);
  battle[slowUser].leftOver(battle, enqueue);

  // 기술 (씨뿌리기, 마그마스톰, 도발, 하품, 역린)
  processSkillEffects(battle, enqueue, fastUser, slowUser);

  // 상태이상 처리
  processStatusCondition(battle, enqueue, fastUser, slowUser);

  let tempPlayer = battle.player.temp;
  let tempNpc = battle.npc.temp;

  if (tempPlayer.roost) {
    tempPlayer.roost = null;
    battle.player.type1 = battle.player.origin.type1;
    battle.player.type2 = battle.player.origin.type2;
  }
  if (tempNpc.roost) {
    tempNpc.roost = null;
    battle.npc.type1 = battle.npc.origin.type1;
    battle.npc.type2 = battle.npc.origin.type2;
  }

  Object.keys(tempPlayer).forEach((key) => {
    tempPlayer[key] = null;
  });
  Object.keys(tempNpc).forEach((key) => {
    tempNpc[key] = null;
  });

  battle.turn.turnEnd = true;
  if (battle.npc.faint && !battle.player.faint) {
    if (battle.npcBench1.faint !== true) {
      // 1번이 기절 안했으면 1번 교체
      switchNpc(battle, "npcBench1", enqueue);
    } else if (battle.npcBench2.faint !== true && battle.npcBench1.faint === true) {
      //1번 기절했고 2번 기절 안했으면 2번 교체
      switchNpc(battle, "npcBench2", enqueue);
    }
  }
  if (battle.player.faint) {
    battle.turn.textFreeze = true;
    enqueue({
      battle: battle,
      text: "누구로 교체 할까?",
    });
  } else {
    enqueue({
      battle: battle,
      text: battle.player.origin.names + " 무엇을 할까?",
      skip: true,
    });
    //이거 없으면 텍스트 없는게 (enqueue 안한게) 반영이 안됨
  }
};
