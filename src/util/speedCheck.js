export const speedCheck = (battle) => {
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
