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
