export const statCalculate = (battle) => {
  const player = battle.player;
  const npc = battle.npc;

  const attributes = ["atk", "def", "catk", "cdef", "speed"];

  attributes.forEach((attr) => {
    player[attr] = player.origin[attr] * getMultiplier(player.tempStatus.rank[attr]);
    npc[attr] = npc.origin[attr] * getMultiplier(npc.tempStatus.rank[attr]);
    //랭크업 미반영 스탯. 천진 데미지 계산에 사용
    player.noRankStat[attr] = player.origin[attr];
    npc.noRankStat[attr] = npc.origin[attr];
    // 로그
    player.log.stat[attr] = player.origin[attr] + " * " + getMultiplier(player.tempStatus.rank[attr]) + "(랭크업)";
    npc.log.stat[attr] = npc.origin[attr] + " * " + getMultiplier(npc.tempStatus.rank[attr]) + "(랭크업)";
  });

  [battle.player, battle.npc].forEach((entity, index, arr) => {
    const opponent = arr[1 - index]; // player와 npc를 서로 바꿔줌

    if (entity.status.mabi) {
      entity.speed *= 0.5;
      entity.noRankStat.speed *= 0.5;
      entity.log.stat.speed += " * 0.5 (마비)";
    }

    // 아이템 ===========================================================================

    if (entity.item === "구애스카프") {
      entity.speed *= 1.5;
      entity.noRankStat.speed *= 1.5;
      entity.log.stat.speed += " * 1.5 (구애스카프)";
    }

    if (entity.item === "구애안경") {
      entity.catk *= 1.5;
      entity.noRankStat.catk *= 1.5;
      entity.log.stat.catk += " * 1.5 (구애안경)";
    }

    if (entity.item === "구애머리띠") {
      entity.atk *= 1.5;
      entity.noRankStat.atk *= 1.5;
      entity.log.stat.atk += " * 1.5 (구애머리띠)";
    }
    if (entity.item === "돌격조끼") {
      entity.cdef *= 1.5;
      entity.noRankStat.cdef *= 1.5;
      entity.log.stat.cdef += " * 1.5 (돌격조끼)";
    }

    // 특성 ===========================================================================

    if (entity.abil === "근성" && (entity.status.burn || entity.status.mabi || entity.status.poison || entity.status.mpoison)) {
      entity.atk *= 1.5;
      entity.noRankStat.atk *= 1.5;
      entity.log.stat.atk += " * 1.5 (근성)";
    }

    if (entity.abil === "고대활성" && entity.tempStatus.protosynthesis !== null) {
      let num = 1.3;
      if (entity.tempStatus.protosynthesis === "speed") {
        num = 1.5;
        //고대활성은 가장 높은 능력치가 1.3배 증가.
        //스피드만 1.5배
      }
      entity[entity.tempStatus.protosynthesis] *= num;
      entity.noRankStat[entity.tempStatus.protosynthesis] *= num;
      entity.log.stat[entity.tempStatus.protosynthesis] += " * " + num + "(고대활성)";
    }
    const calamityMap = {
      재앙의검: "def",
      재앙의그릇: "catk",
      재앙의구슬: "cdef",
      재앙의목간: "atk",
    };

    Object.entries(calamityMap).forEach(([abil, stat]) => {
      // p1이 abil일 때 p2에 적용
      if (entity.abil === abil && opponent.abil !== abil) {
        if (abil === "재앙의그릇" || abil === "재앙의목간") {
          //공,특공을 떨구는 특성으로 틀깨기면 적용 안됨
          if (opponent.abil !== "틀깨기" && opponent.abil !== "테라볼티지" && opponent.abil !== "터보블레이즈") {
            opponent[stat] *= 0.75;
            opponent.noRankStat[stat] *= 0.75;
            opponent.log.stat[stat] += " * 0.75 (" + abil + ")";
          }
        } else {
          opponent[stat] *= 0.75;
          opponent.noRankStat[stat] *= 0.75;
          opponent.log.stat[stat] += " * 0.75 (" + abil + ")";
        }
      }
    });

    if (entity.abil === "하드론엔진" && battle.field.field === "일렉트릭필드") {
      entity.catk *= 1.3;
      entity.noRankStat.catk *= 1.3;
      entity.log.stat.catk += "* 1.3 (하드론엔진)";
    }

    if (entity.abil === "진홍빛고동" && battle.field.weather === "쾌청") {
      entity.atk *= 1.3;
      entity.noRankStat.atk *= 1.3;
      entity.log.stat.atk += "* 1.3 (진홍빛고동)";
    }
  });

  attributes.forEach((attr) => {
    player[attr] = Math.floor(player[attr]);
    npc[attr] = Math.floor(npc[attr]);
    player.log.stat[attr] += " = " + player[attr];
    npc.log.stat[attr] += " = " + npc[attr];
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
