export const speedCheck = (battle) => {
  // 특성, 교체를 누가 먼저할지 정함
  // battleScreen이랑 battleStart에서 각각 발동
  const playerSpeed = battle.player.speed;
  const npcSpeed = battle.npc.speed;
  if (playerSpeed > npcSpeed) {
    return "player";
  } else if (playerSpeed < npcSpeed) {
    return "npc";
  } else if (playerSpeed === npcSpeed) {
    if (Math.random() < 0.5) {
      return "player";
    } else {
      return "npc";
    }
  }
};

export const skillSpeedCheck = (battle) => {
  // 스킬의 우선도를 고려하여 누가 먼저 공격할지 정함
  // battleStart.js에서 사용
  const playerPri = battle.player.origin["sk" + battle.turn.playerSN].prior;
  const npcPri = battle.npc.origin["sk" + battle.turn.npcSN].prior;
  if (playerPri > npcPri) {
    return "player";
  } else if (npcPri > playerPri) {
    return "npc";
  } else {
    return speedCheck(battle);
  }
};
