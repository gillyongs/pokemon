export const typeCheck = (stype, type1, type2) => {
  // 특성을 반영하지 않고 오직 상성만을 본다
  // field.js에서 스텔스록 데미지 계산에 사용
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

export const typeCheckConsole = (pokemon, stype, type1, type2, skillType) => {
  // 스킬창 밑에 뜨는 상성 텍스트
  // 이 스킬이 상대방에게 맞았을때 상성이 뜬다
  // 건조피부, 저수 등 상대방의 특성은 반영하면 안되지만
  // 심안 등 본인의 특성은 반영해서 보여준다
  // skillButton(메인화면), InfoSkillButton(교체화면)에서 호출해서 사용한다

  if (skillType === "natk" || skillType === "buf") {
    return;
  }

  if (typeChart[stype][type1] === 0 || typeChart[stype][type2] === 0) {
    if (pokemon.abil === "심안" && (stype === "격투" || stype === "노말") && (type1 === "고스트" || type2 === "고스트")) {
      // 심안은 공격측 특성이므로 반영해서 보여준다
    } else {
      return "✕ 효과가 없음";
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

export const typeCheckAbil = (battle, stype, type1, type2) => {
  // 배틀에 적용되는 실제 상성
  // 타오르는불꽃은 불꽃 기술 데미지 올라가는거 적용해야하므로 따로 처리

  // damageCalculate에서 호출되며
  // useSkill에서도 상성 텍스트 (효과가 별로인 것 같다...)나 변화기 상성 계산 (전기자석파) 계산에 쓰인다
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

export const typeCheckText = (typeDamage) => {
  // 상성 텍스트 출력
  // skillUse에서 typeCheckAbil 호출하여 상성 계산하고 나온 보정값만 넣는다
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
