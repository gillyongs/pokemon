import { switchNpcAuto } from "./switch";
import { speedCheck } from "../util/speedCheck";
import { processSkillEffects } from "./turnEnd/skillEvent";
import { processAilment } from "./turnEnd/ailmentEvent";

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

  // 순풍
  battle.field[fastUser].handleTailwindTurnEnd(battle, enqueue);
  battle.field[slowUser].handleTailwindTurnEnd(battle, enqueue);

  // 리플렉터, 빛의장막, 오로라베일
  battle.field[fastUser].handleWallTurnEnd(battle, enqueue);
  battle.field[slowUser].handleWallTurnEnd(battle, enqueue);

  // 아이템 (먹밥)
  battle[fastUser].leftOver(battle, enqueue);
  battle[slowUser].leftOver(battle, enqueue);

  // 기술 (씨뿌리기, 마그마스톰, 도발, 하품, 역린)
  processSkillEffects(battle, enqueue, fastUser, slowUser);

  // 상태이상 처리
  processAilment(battle, enqueue, fastUser, slowUser);

  // 날씨 데미지 (모래바람)
  battle.field.weather.handleWeatherDamageTurnEnd(battle, enqueue, fastUser);
  battle.field.weather.handleWeatherDamageTurnEnd(battle, enqueue, slowUser);

  let tempPlayer = battle.player.turn;
  let tempNpc = battle.npc.turn;

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

  const playerSwitched = battle.turn?.playerSwitched || battle.player?.turn?.choice === "playerBench1" || battle.player?.turn?.choice === "playerBench2" || battle.turn?.uturn;

  const npcSwitched = battle.turn?.npcSwitched || battle.npc?.turn?.choice === "npcBench1" || battle.npc?.turn?.choice === "npcBench2";

  // 첫 턴 여부 (속이기, 만나자마자 성공 체크)
  // 교체/유턴으로 나온 다음턴에 속이기/만나자마자 쓰면 성공하는게 맞음
  if (battle.player?.tempStatus && !playerSwitched) battle.player.tempStatus.firstTurn = false;
  if (battle.npc?.tempStatus && !npcSwitched) battle.npc.tempStatus.firstTurn = false;

  battle.turn.turnEnd = true;
  if (battle.npc.faint && !battle.player.faint) {
    // NPC"만" 기절한 경우
    // 둘다 기절했을 경우엔 플레이어의 교체 UI를 띄우고
    // 플레이어가 교체할 포켓몬을 선택한 다음에 NPC 교체를 진행하여야 함
    // (아니면 NPC가 교체할 포켓몬을 플레이어가 알게 되므로)
    switchNpcAuto(battle, enqueue);
  }

  // 적을 쓰러뜨리고, turnEnd 마지막에 "증강을 선택하세요", isAugment:true queue 추가
  // (적 포켓몬을 쓰러뜨리고 얻는 증강은 한 라운드에 1회만 가능)
  if (
    battle.isMayhem &&
    !battle.hasKnockoutAugmentThisRound &&
    (battle.turn?.npcFaintedCount > 0 || battle.turn?.npcFaintedThisTurn)
  ) {
    if (battle.turn) {
      battle.turn.npcFaintedCount = 0;
      battle.turn.npcFaintedThisTurn = false;
    }
    const hasSlot = [battle.player, battle.playerBench1, battle.playerBench2].some(
      (p) => p && (p.augments || []).length < 3
    );
    if (hasSlot) {
      battle.hasKnockoutAugmentThisRound = true;
      enqueue({
        id: "122fb584-429d-4b41-9558-755143829687",
        battle: battle,
        text: "증강을 선택하세요.",
        isAugment: true,
      });
    }
  } else if (battle.turn) {
    battle.turn.npcFaintedCount = 0;
    battle.turn.npcFaintedThisTurn = false;
  }

  if (battle.player.faint) {
    battle.turn.textFreeze = true;
    enqueue({
      id: "bf1b2882-a834-49f8-8ef4-aebc64735142",
      battle: battle,
      text: "누구로 교체 할까?",
      bottomMode: "mustSwitch",
      waitInput: true,
    });
  } else if (battle.player.auto || battle.player.charge || battle.player.recharge) {
    enqueue({
      id: "2ef883d0-9649-4aee-92ae-9e16e5010e62",
      battle: battle,
      text: "",
      autoActTurn: true,
      bottomMode: "auto",
      waitInput: false,
      allowAct: true,
    });
  } else {
    enqueue({
      id: "a5b4b821-d398-45a0-8169-dfad0859a11b",
      battle: battle,
      text: battle.player.origin.names + " 무엇을 할까?",
      bottomMode: "skill",
      waitInput: true,
      allowAct: true,
    });
    //이거 없으면 텍스트 없는게 (enqueue 안한게) 반영이 안됨
  }
};
