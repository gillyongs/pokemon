export const statCalculate = (battle) => {
  const player = battle.player;
  const npc = battle.npc;

  const attributes = ["atk", "def", "catk", "cdef", "speed"];

  attributes.forEach((attr) => {
    player[attr] =
      player.origin[attr] * getMultiplier(player.tempStatus.rank[attr]);
    npc[attr] = npc.origin[attr] * getMultiplier(npc.tempStatus.rank[attr]);
  });
  if (player.item === "돌격조끼") {
    player["cdef"] *= 1.5;
  }
  if (npc.item === "돌격조끼") {
    npc["cdef"] *= 1.5;
  }
  if (player.abil === "재앙의검" && npc.abil !== "재앙의검") {
    npc["def"] *= 0.75;
  }
  if (npc.abil === "재앙의검" && player.abil !== "재앙의검") {
    player["def"] *= 0.75;
  }
  return battle;
};

export const getMultiplier = (rank) => {
  const mRank = {
    "-1": 2 / 3,
    "-2": 1 / 2,
    "-3": 2 / 5,
    "-4": 1 / 3,
    "-5": 2 / 7,
    "-6": 1 / 4,
  };
  if (rank >= 1 && rank <= 6) {
    return 1 + rank * 0.5; // 예: 1일 경우 1.5, 2일 경우 2
  } else if (rank <= -1 && rank >= -6) {
    return mRank[String(rank)];
  } else if (rank === 0) {
    return 1;
  }
  console.error("능력치 증감 범위 벗어남");
  return 1; // rank가 0 또는 범위를 벗어난 경우
};
