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
  threeBears: {
    modalTitle: "증강 상세 안내",
    headerNotice: "다음 포켓몬 중 1마리와 교체됩니다.",
    items: ["threeBearsHouse"],
    candidates: [
      { sampleName: "다투곰", name: "다투곰", imgId: "0901-a", dexNo: "0901" },
      { sampleName: "달투곰", name: "달투곰", imgId: "0901-b", dexNo: "0901" },
      { sampleName: "악라오스", name: "악라오스", imgId: "0892-a", dexNo: "0892" },
      { sampleName: "물라오스", name: "물라오스", imgId: "0892-b", dexNo: "0892" },
      { sampleName: "툰베어", name: "툰베어", imgId: "0614", dexNo: "0614" },
      { sampleName: "이븐곰", name: "이븐곰", imgId: "0760", dexNo: "0760" },
    ],
  },
};

export const getAugmentGrantInfo = (augId) => {
  return AUGMENT_GRANT_PREVIEW_MAP[augId] || null;
};
