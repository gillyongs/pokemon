/**
 * 포켓몬 메가진화 관계 데이터
 * 키: 기본 포켓몬 ID (pokemon_id)
 * 값: 메가진화 정보 배열 (리자몽, 뮤츠 등 여러 메가진화가 존재하는 포켓몬 지원)
 */
export const megaDataList = {
  // 메타그로스
  "0376": [
    {
      stone: "메타그로스나이트",
      megaFormId: "0376-m",
      name: "메가메타그로스",
      abil: "단단한발톱",
    },
  ],
  // 리자몽 (X / Y)
  "0006": [
    {
      stone: "리자몽나이트X",
      megaFormId: "0006-x",
      name: "메가리자몽X",
      abil: "단단한발톱",
    },
    {
      stone: "리자몽나이트Y",
      megaFormId: "0006-y",
      name: "메가리자몽Y",
      abil: "가뭄",
    },
  ],
  // 뮤츠 (X / Y)
  "0150": [
    {
      stone: "뮤츠나이트X",
      megaFormId: "0150-x",
      name: "메가뮤츠X",
      abil: "불굴의마음",
    },
    {
      stone: "뮤츠나이트Y",
      megaFormId: "0150-y",
      name: "메가뮤츠Y",
      abil: "불면",
    },
  ],
};

/**
 * 포켓몬 ID와 지닌 도구(메가스톤)를 기반으로 해당하는 메가진화 정보를 반환합니다.
 */
export const getMegaData = (pokemonId, item) => {
  const list = megaDataList[pokemonId];
  if (!list || !item) return null;
  return list.find((entry) => entry.stone === item) || null;
};

/**
 * 특정 포켓몬이 메가진화 가능한 폼 목록을 반환합니다.
 */
export const getAvailableMegaForms = (pokemonId) => {
  return megaDataList[pokemonId] || [];
};
