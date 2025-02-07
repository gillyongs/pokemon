export const statCalculate = (battle) => {
  const player = battle.player;
  const npc = battle.npc;

  const attributes = ["atk", "def", "catk", "cdef", "speed"];

  attributes.forEach((attr) => {
    player[attr] =
      player.origin[attr] * getMultiplier(player.tempStatus.rank[attr]);
    npc[attr] = npc.origin[attr] * getMultiplier(npc.tempStatus.rank[attr]);
  });

  [player, npc].forEach((entity) => {
    if (entity.item === "돌격조끼") {
      entity.cdef *= 1.5;
    }
    [battle.player, battle.npc].forEach((entity, index, arr) => {
      const opponent = arr[1 - index]; // player와 npc를 서로 바꿔줌

      if (entity.item === "돌격조끼") {
        entity.cdef *= 1.5;
      }

      if (entity.item === "구애스카프") {
        entity.speed *= 1.5;
      }

      if (entity.item === "구애안경") {
        entity.catk *= 1.5;
      }

      if (entity.item === "구애머리띠") {
        entity.atk *= 1.5;
      }

      if (entity.abil === "재앙의검" && opponent.abil !== "재앙의검") {
        opponent.def *= 0.75;
      }

      if (
        entity.abil === "하드론엔진" &&
        battle.field.field === "일렉트릭필드"
      ) {
        entity.catk *= 1.3;
      }
    });
  });
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
