import { getMultiplier } from "./rankStat";
import { getAugmentedStat, getHighestStatInfo } from "./getStat";
import { skillTypeCalculate } from "./skillTypeCalculate";

// 스피드 실 수치 계산 함수
export const speedCalculate = (pokemon, baseSpeed = null, battle = null, abil = pokemon?.abil?.name || pokemon?.abil, rankOverride = null) => {
  let speedStatKey = "speed";
  let speed;
  let rankNum = pokemon?.tempStatus?.rank?.speed ?? 0;

  if (baseSpeed !== null && baseSpeed !== undefined) {
    speed = baseSpeed;
    if (rankOverride !== null && rankOverride !== undefined) {
      rankNum = rankOverride;
    }
  } else if (pokemon?.hasAugment?.("hhgghgg")) {
    const highest = getHighestStatInfo(pokemon, battle);
    if (highest) {
      speedStatKey = highest.statKey;
      speed = highest.augmented;
      rankNum = highest.rank;
    } else {
      speed = getAugmentedStat(pokemon, "speed", battle);
    }
  } else {
    speed = getAugmentedStat(pokemon, "speed", battle);
  }

  pokemon.log = pokemon.log || {};
  pokemon.log.speedCalc = speedStatKey !== "speed" ? `${speed}(${speedStatKey})` : speed;
  const rankMult = getMultiplier(rankNum);
  speed *= rankMult; // 랭크업
  if (rankNum !== 0) {
    pokemon.log.speedCalc += " * " + rankMult + " (랭크)";
  }
  if (pokemon.ailment.mabi) {
    // 마비에 걸릴시 스피드 절반 감소
    speed *= 0.5;
    pokemon.log.speedCalc += " * 0.5 (마비)";
  }
  if (pokemon.item === "구애스카프" && !(pokemon.tempStatus?.dynamax > 0)) {
    speed *= 1.5;
    pokemon.log.speedCalc += " * 1.5 (구애스카프)";
  }
  if (pokemon.tempStatus.protosynthesis === "speed") {
    speed *= 1.5;
    pokemon.log.speedCalc += " * 1.5 (고대활성)";
  }
  if (pokemon.tempStatus.quarkDrive === "speed") {
    speed *= 1.5;
    pokemon.log.speedCalc += " * 1.5 (쿼크차지)";
  }
  // 곡예: 도구가 없어지고 곡예 상태일 때 스피드 2배 (교체 시 초기화)
  if (abil === "곡예" && pokemon?.tempStatus?.unburden) {
    speed *= 2;
    pokemon.log.speedCalc += " * 2 (곡예)";
  }
  // 순풍: 아군 필드에 순풍이 활성화되어 있는 경우 스피드 2배
  if (battle?.field?.[pokemon.team]?.noClean?.tailwind) {
    speed *= 2;
    pokemon.log.speedCalc += " * 2 (순풍)";
  }
  // 쓱쓱: 비가 내릴 때 스피드 2배
  if (abil === "쓱쓱" && battle.isRainy) {
    speed *= 2;
    pokemon.log.speedCalc += " * 2 (쓱쓱)";
  }
  // 엽록소: 쾌청일 때 스피드 2배
  if (abil === "엽록소" && battle.isSunny) {
    speed *= 2;
    pokemon.log.speedCalc += " * 2 (엽록소)";
  }
  // 눈치우기: 설경일 때 스피드 2배
  if (abil === "눈치우기" && battle.isSnow) {
    speed *= 2;
    pokemon.log.speedCalc += " * 2 (눈치우기)";
  }
  if (abil === "패스트스타트" && (pokemon.tempStatus?.turnsOnField ?? 0) >= 5) {
    speed *= 2;
    pokemon.log.speedCalc += " * 2 (패스트스타트)";
  }
  if (abil === "슬로스타트" && (pokemon.tempStatus?.turnsOnField ?? 0) < 5) {
    speed *= 0.5;
    pokemon.log.speedCalc += " * 0.5 (슬로스타트)";
  }
  if (battle && pokemon?.hasAugment?.("dragonHunter")) {
    const opponent = pokemon.team === "player" ? battle.npc : pokemon.team === "npc" ? battle.player : battle.player === pokemon ? battle.npc : battle.player;
    if (opponent && (opponent.type1 === "드래곤" || opponent.type2 === "드래곤")) {
      speed *= 2;
      pokemon.log.speedCalc += " * 2 (용 사냥꾼)";
    }
  }
  if (pokemon?.hasAugment?.("dragonDie")) {
    const dragonKills = Number(pokemon.dragonKillCount ?? pokemon.augments?.find((a) => a.id === "dragonDie")?.dragonKillCount ?? 0);
    const stacks = Math.floor(dragonKills / 2);
    if (stacks > 0) {
      const mult = Number((1 + stacks * 0.1).toFixed(2));
      speed *= mult;
      pokemon.log.speedCalc += ` * ${mult} (용용 죽겠지)`;
    }
  }
  if (pokemon?.hasAugment?.("lifePartner")) {
    speed *= 1.1;
    pokemon.log.speedCalc += " * 1.1 (인생의 동반자)";
  }
  if (battle && pokemon?.hasAugment?.("lastWarrior")) {
    const side = pokemon?.team === "npc" ? "npc" : "player";
    if (battle.isLastPokemon?.(side)) {
      speed *= 2;
      pokemon.log.speedCalc += " * 2 (최후의 전사)";
    }
  }
  if (battle && pokemon?.hasAugment?.("believeInMyself")) {
    const side = pokemon?.team === "npc" ? "npc" : "player";
    if (battle.hasFewerPokemonThanOpponent?.(side)) {
      speed *= 2;
      pokemon.log.speedCalc += " * 2 (나를 믿는 내가 최강이다!)";
    }
  }
  const trishulaFrost = Number(pokemon?.tempStatus?.trishulaFrost || 0);
  if (trishulaFrost > 0) {
    const frostMultiplier = Math.max(0, 1 - trishulaFrost * 0.15);
    speed = Math.round(speed * frostMultiplier);
    pokemon.log.speedCalc += ` * ${frostMultiplier} (트리슈라 서리 ${trishulaFrost}중첩)`;
  }
  pokemon.log.speedCalc += " = " + speed;
  return speed;
};

export const speedCheck = (battle) => {
  // 스피드가 더 빠른쪽 리턴
  // battleScreen(맞특성)
  // battleStart(맞교체)
  // turnEnd(필드효과, 상태이상 etc)
  const playerSpeed = speedCalculate(battle.player, null, battle);
  const npcSpeed = speedCalculate(battle.npc, null, battle);
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

// 상황에 따라 우선도가 변하는 스킬
export const priCalculate = (battle, pokemon, skill) => {
  if (!skill) return 0;
  let prior = typeof skill.prior === "number" ? skill.prior : 0;

  if (skill.name === "그래스슬라이더" && battle?.field?.terrain?.isGrassField) {
    prior += 1;
  }

  const pokeObj = typeof pokemon === "string" ? battle?.[pokemon] : pokemon;

  // 민첩한 몸놀림: 증강 보유 중이고 강화 대상으로 선택된 기술과 일치할 때 우선도 +1
  const nimbleSkillName = pokeObj?.nimbleSkillName || pokeObj?.augments?.find((a) => a.id === "nimbleMoves")?.nimbleSkillName;
  if (pokeObj?.hasAugment?.("nimbleMoves") && nimbleSkillName && nimbleSkillName === skill.name) {
    prior += 1;
  }
  const skillType = skillTypeCalculate(battle, skill, pokeObj);
  const pokeMaxHp = pokeObj.maxHp;
  const isFullHp = Boolean(pokeObj && pokeMaxHp > 0 && pokeObj.hp >= pokeMaxHp);
  const hasHarmfulBird = Boolean(pokeObj?.hasAugment?.("harmfulBird"));
  if (pokeObj?.abil?.name === "질풍날개" && skillType === "비행" && (isFullHp || hasHarmfulBird)) {
    prior += 1;
  }

  // 짓궂은마음: 변화 기술 우선도 +1
  if (pokeObj?.abil?.name === "짓궂은마음" && (skill.stype === "natk" || skill.stype === "buf")) {
    prior += 1;
  }
  return prior;
};
