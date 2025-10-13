export const typeCheck = (stype, type1, type2) => {
  if (typeChart[stype][type1] === 0 || typeChart[stype][type2] === 0) {
    return 0;
  }
  let typeDamage = 1;
  if (typeChart[stype]) {
    if (typeChart[stype][type1]) {
      typeDamage *= typeChart[stype][type1];
    }
    if (typeChart[stype][type2]) {
      typeDamage *= typeChart[stype][type2];
    }
  }

  return typeDamage;
};

export const typeCheckAbil = (battle, stype, type1, type2) => {
  // 특성 등을 반영한 실제 상성적용
  // 저수, 피뢰침 같은 특성은 텍스트엔 무효로 안나오게 해야하므로 함수 따로 사용
  if (typeChart[stype][type1] === 0 || typeChart[stype][type2] === 0) {
    if (battle[battle.turn.atk].abil === "심안" && (stype === "격투" || stype === "노말") && (type1 === "고스트" || type2 === "고스트")) {
      // 그냥 지나가게
    } else {
      return 0;
    }
  }
  let typeDamage = 1;
  if (typeChart[stype]) {
    if (typeChart[stype][type1]) {
      //0이면 통과함 (그래서 앞에서 따로 체크)
      typeDamage *= typeChart[stype][type1];
    }
    if (typeChart[stype][type2]) {
      typeDamage *= typeChart[stype][type2];
    }
  }

  return typeDamage;
};

export const typeCheckConsole = (stype, type1, type2, skillType) => {
  if (skillType === "natk" || skillType === "buf") {
    return;
  }
  const typeDamage = typeCheck(stype, type1, type2);
  if (typeDamage === 1) {
    return "○ 효과가 있음";
  }
  if (typeDamage > 1) {
    return "◎ 효과가 굉장함";
  }
  if (typeDamage === 0) {
    return "✕ 효과가 없음";
  }
  if (typeDamage < 1) {
    return "△ 효과가 별로";
  }
};

export const typeCheckText = (stype, type1, type2) => {
  let typeDamage;
  if (!type1 && !type2) {
    typeDamage = stype;
    //인자를 하나만 받으면 typeDamage로 보고 계산 생략
  } else {
    typeDamage = typeCheck(stype, type1, type2);
  }
  if (typeDamage === 1) {
    return null;
  }
  if (typeDamage > 1) {
    return "효과가 굉장했다!";
  }
  if (typeDamage === 0) {
    return "효과가 없는 것 같다...";
  }
  if (typeDamage < 1) {
    return "효과가 별로인 것 같다...";
  }
};

const typeChart = {
  노말: { 바위: 0.5, 고스트: 0, 강철: 0.5, 기타: 1 },
  불꽃: {
    풀: 2,
    얼음: 2,
    벌레: 2,
    강철: 2,
    불꽃: 0.5,
    물: 0.5,
    바위: 0.5,
    드래곤: 0.5,
    기타: 1,
  },
  물: { 불꽃: 2, 땅: 2, 바위: 2, 물: 0.5, 풀: 0.5, 드래곤: 0.5, 기타: 1 },
  풀: {
    물: 2,
    땅: 2,
    바위: 2,
    불꽃: 0.5,
    풀: 0.5,
    독: 0.5,
    비행: 0.5,
    벌레: 0.5,
    드래곤: 0.5,
    강철: 0.5,
    기타: 1,
  },
  전기: { 물: 2, 비행: 2, 전기: 0.5, 풀: 0.5, 땅: 0, 드래곤: 0.5, 기타: 1 },
  얼음: {
    풀: 2,
    땅: 2,
    비행: 2,
    드래곤: 2,
    불꽃: 0.5,
    물: 0.5,
    강철: 0.5,
    얼음: 0.5,
    기타: 1,
  },
  격투: {
    노말: 2,
    얼음: 2,
    바위: 2,
    악: 2,
    강철: 2,
    독: 0.5,
    비행: 0.5,
    에스퍼: 0.5,
    벌레: 0.5,
    페어리: 0.5,
    고스트: 0,
    기타: 1,
  },
  독: {
    풀: 2,
    페어리: 2,
    독: 0.5,
    땅: 0.5,
    바위: 0.5,
    고스트: 0.5,
    강철: 0,
    기타: 1,
  },
  땅: {
    불꽃: 2,
    전기: 2,
    독: 2,
    바위: 2,
    강철: 2,
    풀: 0.5,
    벌레: 0.5,
    비행: 0,
    기타: 1,
  },
  비행: { 풀: 2, 격투: 2, 벌레: 2, 전기: 0.5, 바위: 0.5, 강철: 0.5, 기타: 1 },
  에스퍼: { 격투: 2, 독: 2, 에스퍼: 0.5, 악: 0, 강철: 0.5, 기타: 1 },
  벌레: {
    풀: 2,
    에스퍼: 2,
    악: 2,
    불꽃: 0.5,
    격투: 0.5,
    독: 0.5,
    비행: 0.5,
    고스트: 0.5,
    강철: 0.5,
    페어리: 0.5,
    기타: 1,
  },
  바위: {
    불꽃: 2,
    얼음: 2,
    벌레: 2,
    비행: 2,
    격투: 0.5,
    땅: 0.5,
    강철: 0.5,
    기타: 1,
  },
  고스트: { 고스트: 2, 에스퍼: 2, 노말: 0, 악: 0.5, 기타: 1 },
  드래곤: { 드래곤: 2, 강철: 0.5, 페어리: 0, 기타: 1 },
  악: { 에스퍼: 2, 고스트: 2, 격투: 0.5, 악: 0.5, 페어리: 0.5, 기타: 1 },
  강철: {
    얼음: 2,
    바위: 2,
    페어리: 2,
    불꽃: 0.5,
    물: 0.5,
    전기: 0.5,
    강철: 0.5,
    기타: 1,
  },
  페어리: {
    격투: 2,
    드래곤: 2,
    악: 2,
    불꽃: 0.5,
    독: 0.5,
    강철: 0.5,
    기타: 1,
  },
};
