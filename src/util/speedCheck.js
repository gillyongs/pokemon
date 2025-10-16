import { getMultiplier } from "../function/rankStat";
const speedCalculate = (pokemon) => {
  let speed = pokemon.origin.stat.speed;
  pokemon.log.speedCalculate = speed;
  speed *= getMultiplier(pokemon.tempStatus.rank.speed); // 랭크업
  if (pokemon.status.mabi) {
    // 마비에 걸릴시 스피드 절반 감소
    speed *= 0.5;
    pokemon.log.speedCalculate += " * 0.5 (마비)";
  }
  if (pokemon.item === "구애스카프") {
    speed *= 1.5;
    pokemon.log.speedCalculate += " * 1.5 (구애스카프)";
  }
  if (pokemon.tempStatus.protosynthesis === "speed") {
    speed *= 1.5;
    pokemon.log.speedCalculate += " * 1.5 (고대활성)";
  }
  pokemon.log.speedCalculate += " = " + speed;
  return speed;
};
export const speedCheck = (battle) => {
  // 스피드가 더 빠른쪽 리턴
  // battleScreen(맞특성)
  // battleStart(맞교체)
  // turnEnd(필드효과, 상태이상 etc)
  const playerSpeed = speedCalculate(battle.player);
  const npcSpeed = speedCalculate(battle.npc);
  battle.player.log.speedVS = "Player: " + playerSpeed + " vs NPC: " + npcSpeed;

  // 스피드 스탯은 오직 speedCheck에서만 사용한다
  // 원본 스탯에 랭크업과 아이템을 적용한다
  const trickRoom = battle.field.trickRoom;
  if (playerSpeed === npcSpeed) {
    battle.player.log.speedVS += " (동점)";
    return Math.random() < 0.5 ? "player" : "npc";
  }

  let faster = playerSpeed > npcSpeed ? "player" : "npc";
  if (trickRoom) {
    battle.player.log.speedVS += " (트릭룸)";
    faster = faster === "player" ? "npc" : "player";
  }
  battle.player.log.speedVS += " => " + faster;
  return faster;
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
  // 상황에 따라 우선도가 변하는 스킬
  const sn = pokemon + "SN";
  const sk = battle[pokemon].origin["sk" + battle.turn[sn]];
  if (sk.name === "그래스슬라이더") {
    if (battle.field.field === "그래스필드") {
      return 1;
    } else return 0;
  }

  if (battle[pokemon].abil === "질풍날개" && sk.type === "비행") {
    return sk.prior + 1;
  }
  return sk.prior;
};
