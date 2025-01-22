export const rank = (battle, enqueue, rankPokemon, rankType, rankValue) => {
  let pokemon;
  if (rankPokemon === "npc") {
    pokemon = battle.npc;
  } else if (rankPokemon === "player") {
    pokemon = battle.player;
  }
  let rank = pokemon.tempStatus.rank;
  let rankText = pokemon.name + "의 " + getStatName(rankType); //공격'은' 더 이상 올라갈 수 없다!
  let rankText2 = pokemon.name + "의 " + getStatName2(rankType); //공격'이' 크게 올랐다!

  if (rank[rankType] === -6 && rankValue < 0) {
    rankText2 = rankText2 + " 더 이상 떨어질 수 없다!";
    enqueue({ battle, text: rankText2 });
    return;
  } else if (rank[rankType] === 6 && rankValue > 0) {
    rankText2 = rankText2 + " 더 이상 증가할 수 없다!";
    enqueue({ battle, text: rankText2 });
    return;
  }

  rank[rankType] += rankValue;
  if (rank[rankType] > 6) {
    rank[rankType] = 6;
  }
  if (rank[rankType] < -6) {
    rank[rankType] = -6;
  }
  const multiplier = getMultiplier(rank[rankType]);
  pokemon[rankType] = Math.floor(pokemon.origin[rankType] * multiplier);

  if (rankValue > 2 || rankValue < -2) {
    rankText = rankText + " 매우";
  }
  if (rankValue === 2 || rankValue === -2) {
    rankText = rankText + " 크게";
  }
  if (rankValue > 0) {
    rankText = rankText + " 올라갔다!";
  }
  if (rankValue < 0) {
    rankText = rankText + " 떨어졌다!";
  }
  enqueue({ battle, text: rankText });
};

const getMultiplier = (rank) => {
  if (rank >= 1 && rank <= 6) {
    return 1 + rank * 0.5; // 예: 1일 경우 1.5, 2일 경우 2
  } else if (rank <= -1 && rank >= -6) {
    return 1 / (Math.abs(rank) * 2 + 1); // 예: -1일 경우 2/3, -2일 경우 1/2
  } else if (rank === 0) {
    return 1;
  }
  console.error("능력치 증감 범위 벗어남");
  return 1; // rank가 0 또는 범위를 벗어난 경우
};

const getStatName = (stat) => {
  switch (stat) {
    case "atk":
      return "공격이";
    case "def":
      return "방어가";
    case "catk":
      return "특수 공격이";
    case "cdef":
      return "특수 방어가";
    case "speed":
      return "스피드가";
    default:
      return "알 수 없음"; // 유효하지 않은 값에 대한 기본 반환값
  }
};

const getStatName2 = (stat) => {
  switch (stat) {
    case "atk":
      return "공격은";
    case "def":
      return "방어는";
    case "catk":
      return "특수 공격은";
    case "cdef":
      return "특수 방어는";
    case "speed":
      return "스피드는";
    default:
      return "알 수 없음"; // 유효하지 않은 값에 대한 기본 반환값
  }
};
