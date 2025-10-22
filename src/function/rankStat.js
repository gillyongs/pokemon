export const rank = (battle, enqueue, rankPokemon, rankType, rankValue, text) => {
  // 해당 포켓몬의 랭크 값을 실제로 변화시키는 함수
  let pokemon;
  if (rankPokemon === "npc") {
    pokemon = battle.npc;
  } else if (rankPokemon === "player") {
    pokemon = battle.player;
  } else if (typeof rankPokemon === "object" && rankPokemon !== null) {
    pokemon = rankPokemon; // 이미 포켓몬 객체일 경우 그대로 할당
  }
  let rank = pokemon.tempStatus.rank;
  let rankText = pokemon.name + "의 " + getStatName(rankType); //공격'은' 더 이상 올라갈 수 없다!
  let rankText2 = pokemon.name + "의 " + getStatName2(rankType); //공격'이' 크게 올랐다!

  if (pokemon.abil === "심술꾸러기") {
    rankValue = -rankValue;
  }

  if (rank[rankType] === -6 && rankValue < 0) {
    rankText2 = rankText2 + " 더 이상 떨어질 수 없다!";
    enqueue({ battle, text: rankText2 });
    return;
  } else if (rank[rankType] === 6 && rankValue > 0) {
    rankText2 = rankText2 + " 더 이상 올라갈 수 없다!";
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
  if (text) {
    rankText = text + " " + rankText;
  }
  enqueue({ battle, text: rankText });
};

export const getStatName = (stat) => {
  switch (stat) {
    case "atk":
      return "공격이";
    case "def":
      return "방어가";
    case "catk":
      return "특수공격이";
    case "cdef":
      return "특수방어가";
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
      return "특수공격은";
    case "cdef":
      return "특수방어는";
    case "speed":
      return "스피드는";
    default:
      return "알 수 없음"; // 유효하지 않은 값에 대한 기본 반환값
  }
};

export const getMultiplier = (rank) => {
  // 능력치에 곱해야할 숫자 배율만 리턴하는 함수
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
    return Number(mRank[String(rank)].toFixed(2));
  } else if (rank === 0) {
    return 1;
  }
  console.error("능력치 증감 범위 벗어남");
  return 1; // rank가 0 또는 범위를 벗어난 경우
};

export const maxStatFinder = (pokemon) => {
  // 가장 높은 능력치 종류를 리턴하는 함수
  // 아이템, 특성은 반영되지 않고 기본 능력치와 랭크 변화만 적용된다
  // 고대활성, 비스트부스트에 사용
  const { stat } = pokemon.origin;
  const ranks = pokemon.tempStatus.rank;

  // 각 능력치별 랭크 보정값 반영
  const statWithMultiplier = {
    atk: stat.atk * getMultiplier(ranks.atk),
    catk: stat.catk * getMultiplier(ranks.catk),
    def: stat.def * getMultiplier(ranks.def),
    cdef: stat.cdef * getMultiplier(ranks.cdef),
    speed: stat.speed * getMultiplier(ranks.speed),
  };

  // 가장 큰 값의 key 리턴
  const [maxKey] = Object.entries(statWithMultiplier).reduce((prev, curr) => (curr[1] > prev[1] ? curr : prev));

  return maxKey;
};

export const rankReset = (pokemon) => {
  Object.keys(pokemon.tempStatus.rank).forEach((key) => {
    pokemon.tempStatus.rank[key] = 0;
  });
};
