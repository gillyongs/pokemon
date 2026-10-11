import { getMultiplier } from "../function/rankStat";
export const speedCalculate = (pokemon, baseSpeed = pokemon.origin.stat.speed) => {
  let speed = baseSpeed;
  pokemon.log = pokemon.log || {};
  pokemon.log.speedCalculate = speed;
  speed *= getMultiplier(pokemon.tempStatus.rank.speed); // 랭크업
  if (pokemon.tempStatus.rank.speed !== 0) {
    pokemon.log.speedCalculate += " * " + getMultiplier(pokemon.tempStatus.rank.speed) + " (랭크)";
  }
  if (pokemon.ailment.mabi) {
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
  // 곡예: 원래 도구를 지니고 있었는데 잃은 경우 스피드 2배
  if (pokemon.abil === "곡예" && pokemon.origin?.item && !pokemon.item) {
    speed *= 2;
    pokemon.log.speedCalculate += " * 2 (곡예)";
  }
  pokemon.log.speedCalculate += " = " + speed;
  return speed;
};

export const getExpectedMegaSpeed = (pokemon) => {
  const megaBaseSpeed = pokemon.origin?.megaData?.stat?.speed ?? pokemon.origin.stat.speed;
  return speedCalculate(pokemon, megaBaseSpeed);
};

export const megaSpeedCheck = (battle) => {
  const playerSpeed = getExpectedMegaSpeed(battle.player);
  const npcSpeed = getExpectedMegaSpeed(battle.npc);
  battle.player.log = battle.player.log || {};
  battle.player.log.megaSpeedVS = "Player Mega: " + playerSpeed + " vs NPC Mega: " + npcSpeed;

  if (playerSpeed === npcSpeed) {
    battle.player.log.megaSpeedVS += " (동점)";
    return Math.random() < 0.5 ? "player" : "npc";
  }

  let faster = playerSpeed > npcSpeed ? "player" : "npc";
  if (battle.field?.room?.isTrickRoom) {
    battle.player.log.megaSpeedVS += " (트릭룸)";
    faster = faster === "player" ? "npc" : "player";
  }
  battle.player.log.megaSpeedVS += " => " + faster;
  return faster;
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
  if (playerSpeed === npcSpeed) {
    battle.player.log.speedVS += " (동점)";
    return Math.random() < 0.5 ? "player" : "npc";
  }

  let faster = playerSpeed > npcSpeed ? "player" : "npc";
  if (battle.field.room.isTrickRoom) {
    battle.player.log.speedVS += " (트릭룸)";
    faster = faster === "player" ? "npc" : "player";
  }
  battle.player.log.speedVS += " => " + faster;
  return faster;
};

export const skillSpeedCheck = (battle) => {
  // 스킬의 우선도까지 고려하여 빠른쪽 리턴
  // battleStart.js에서 사용
  const playerPri = priCalculate(battle, "player", battle.player.turn.useSkill);
  const npcPri = priCalculate(battle, "npc", battle.npc.turn.useSkill);
  if (playerPri === "change") {
    console.error("플레이어 우선도 확인 필요");
  }
  if (npcPri === "change") {
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

export const priCalculate = (battle, pokemon, skill) => {
  // 상황에 따라 우선도가 변하는 스킬

  if (skill.name === "그래스슬라이더") {
    if (battle.field.terrain.isGrassField) {
      return 1;
    } else return 0;
  }

  if (battle[pokemon].abil === "질풍날개" && skill.type === "비행") {
    return skill.prior + 1;
  }

  // 짓궂은마음: 변화 기술 우선도 +1
  if (battle[pokemon].abil === "짓궂은마음" && (skill.stype === "natk" || skill.stype === "buf")) {
    return skill.prior + 1;
  }
  return skill.prior;
};
