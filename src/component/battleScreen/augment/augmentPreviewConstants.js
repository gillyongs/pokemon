export const AUGMENT_POKEMON_PREVIEW_MAP = {
  soaring: "플라이곤",
  legendaryTitan: "레지기가스",
  klinklangGear: "기기기어르",
  magikarpJump: "잉어킹",
  blackNight: "무한다이노",
  eternamax: "무한다이노",
  mewtwoStrikesBack: "뮤츠 (증강)",
  veteranPrivilege: "켄타로스 (증강)",
};

export const AUGMENT_GRANT_PREVIEW_MAP = {
  marriedPokemon: {
    modalTitle: "추가 보상 획득 안내",
    headerNotice: "해당 증강 선택시 아래 증강 또는 버프를 추가로 획득합니다.",
    items: ["lifePartner"],
  },
  sacrificeGod: {
    modalTitle: "추가 보상 획득 안내",
    headerNotice: "해당 증강 선택시 아래 증강 또는 버프를 추가로 획득합니다.",
    items: ["soulMinion"],
  },
};

export const getAugmentGrantInfo = (augId) => {
  return AUGMENT_GRANT_PREVIEW_MAP[augId] || null;
};
