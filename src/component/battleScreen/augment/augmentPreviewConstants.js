export const AUGMENT_POKEMON_PREVIEW_MAP = {
  soaring: "플라이곤",
  legendaryTitan: "레지기가스",
  klinklangGear: "기기기어르",
  magikarpJump: "잉어킹",
  blackNight: "무한다이노",
  eternamax: "무한다이노",
  mewtwoStrikesBack: "뮤츠 (증강)",
  veteranPrivilege: "켄타로스 (증강)",
  evioliteShuckle: "단단지",
};

export const AUGMENT_GRANT_PREVIEW_MAP = {
  marriedPokemon: {
    modalTitle: "증강 상세 안내",
    headerNotice: "다음 포켓몬 중 1마리와 교체됩니다.",
    items: ["lifePartner"],
    candidates: [
      { sampleName: "메가가디안", name: "메가가디안", imgId: "0282-m", dexNo: "0282" },
      { sampleName: "님피아 (특수딜탱)", name: "님피아", imgId: "0700", dexNo: "0700" },
      { sampleName: "메가이어롭", name: "메가이어롭", imgId: "0428-m", dexNo: "0428" },
      { sampleName: "마스카나", name: "마스카나", imgId: "0908", dexNo: "0908" },
    ],
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
  threeThousandYears: {
    modalTitle: "증강 상세 안내",
    headerNotice: "다음 플라엣테 중 1마리와 교체합니다.",
    candidates: [
      { sampleName: "플라엣테", name: "스카프 플라엣테", imgId: "0670", dexNo: "0670" },
      { sampleName: "메가플라엣테", name: "메가플라엣테", imgId: "0670-m", dexNo: "0670" },
      { sampleName: "휘석 플라엣테", name: "휘석 플라엣테", imgId: "0670", dexNo: "0670" },
    ],
  },
  ninjaAppeared: {
    modalTitle: "증강 상세 안내",
    headerNotice: "다음 개굴닌자 중 1마리와 교체합니다.",
    candidates: [
      { sampleName: "개굴닌자", name: "개굴닌자", imgId: "0658", dexNo: "0658" },
      { sampleName: "메가개굴닌자", name: "메가개굴닌자", imgId: "0658-m", dexNo: "0658" },
      { sampleName: "지우개굴닌자", name: "지우개굴닌자", imgId: "0658-a", dexNo: "0658" },
    ],
  },
  geniusOfTransformation: {
    modalTitle: "증강 상세 안내",
    headerNotice: "다음 변환자재 포켓몬 중 1마리와 무작위로 교체됩니다.",
    items: ["protean"],
    candidates: [
      { sampleName: "에이스번", name: "에이스번", imgId: "0815", dexNo: "0815" },
      { sampleName: "마스카나", name: "마스카나", imgId: "0908", dexNo: "0908" },
      { sampleName: "개굴닌자", name: "개굴닌자", imgId: "0658", dexNo: "0658" },
    ],
  },
};

export const getAugmentGrantInfo = (augId) => {
  return AUGMENT_GRANT_PREVIEW_MAP[augId] || null;
};
