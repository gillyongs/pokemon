export const speedCheck = (battle) => {
  // 스피드가 더 빠른쪽 리턴
  // battleScreen(맞특성)
  // battleStart(맞교체)
  // turnEnd(필드효과, 상태이상 etc)
  const playerSpeed = battle.player.speed;
  const npcSpeed = battle.npc.speed;
  const trickRoom = battle.field.trickRoom;
  if (playerSpeed === npcSpeed) {
    return Math.random() < 0.5 ? "player" : "npc";
  }

  const faster = playerSpeed > npcSpeed ? "player" : "npc";
  return trickRoom ? (faster === "player" ? "npc" : "player") : faster;
};

export const skillSpeedCheck = (battle) => {
  // 스킬의 우선도까지 고려하여 빠른쪽 리턴
  // battleStart.js에서 사용
  const playerPri = priCalculate(battle, "player");
  const npcPri = priCalculate(battle, "npc");
  if (playerPri === 777) {
    console.error("플레이어 우선도 확인 필요");
  }
  if (npcPri === 777) {
    console.error("NPC 우선도 확인 필요");
  }

  if (playerPri > npcPri) {
    return "player";
  } else if (npcPri > playerPri) {
    return "npc";
  } else {
    return speedCheck(battle);
  }
};

const priCalculate = (battle, pokemon) => {
  const sn = pokemon + "SN";
  const sk = battle[pokemon].origin["sk" + battle.turn[sn]];
  if (sk.name === "그래스슬라이더") {
    if (battle.field.field === "그래스필드") {
      return 1;
    } else return 0;
  }
  return sk.prior;
};
