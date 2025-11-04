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

export const getStatName2 = (stat) => {
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
  return 1;
};
