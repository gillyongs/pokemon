import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { itemText } from "../entity/Item";
import { typeCheck } from "../util/typeEffectCalculate";

const EXCLUSIVE_ITEMS = {
  녹슨검: (p) => p?.id === "자시안" || p?.name === "자시안",
  녹슨방패: (p) => p?.id === "자마젠타" || p?.name === "자마젠타",
  리자몽나이트X: (p) =>
    ["리자몽", "메가리자몽X", "메가리자몽Y"].includes(p?.id) ||
    ["리자몽", "메가리자몽X", "메가리자몽Y"].includes(p?.name),
  리자몽나이트Y: (p) =>
    ["리자몽", "메가리자몽X", "메가리자몽Y"].includes(p?.id) ||
    ["리자몽", "메가리자몽X", "메가리자몽Y"].includes(p?.name),
  메타그로스나이트: (p) => p?.id?.includes("메타그로스") || p?.name?.includes("메타그로스"),
  보만다나이트: (p) => p?.id?.includes("보만다") || p?.name?.includes("보만다"),
  입치트나이트: (p) => p?.id?.includes("입치트") || p?.name?.includes("입치트"),
  아쿠스타나이트: (p) => p?.id?.includes("아쿠스타") || p?.name?.includes("아쿠스타"),
  대짱이나이트: (p) => p?.id?.includes("대짱이") || p?.name?.includes("대짱이"),
  마기라스나이트: (p) => p?.id?.includes("마기라스") || p?.name?.includes("마기라스"),
};

export const getFavoriteItemsForPokemon = (pokemon) => {
  if (!pokemon) return [];

  const favorites = [];
  const add = (item) => {
    if (itemText[item] && !favorites.includes(item)) {
      favorites.push(item);
    }
  };

  // 1. 역할군 (Role)
  const role = pokemon.role;
  const isAttacker = role === "물리어태커" || role === "특수어태커" || role === "어태커" || role === "물리딜탱" || role === "특수딜탱";
  const isTanker = role === "물리막이" || role === "특수막이" || role === "막이" || role === "물리딜탱" || role === "특수딜탱";

  // 어태커인 경우 -> 생명의구슬, 구애스카프, 기합의띠
  if (isAttacker) {
    add("생명의구슬");
    add("구애스카프");
    add("기합의띠");
  }

  // 물리 어태커 / 물리 딜탱 -> 구애머리띠
  if (role === "물리어태커" || role === "물리딜탱") {
    add("구애머리띠");
  }

  // 특수 어태커 / 특수 딜탱 -> 구애스카프, 구애안경
  if (role === "특수어태커" || role === "특수딜탱") {
    add("구애스카프");
    add("구애안경");
  }

  // 막이 / 딜탱인 경우 -> 돌격조끼, 먹다남은음식, 자뭉열매, 울퉁불퉁멧
  if (isTanker) {
    add("돌격조끼");
    add("먹다남은음식");
    add("자뭉열매");
    add("울퉁불퉁멧");
  }

  // 악타입 -> 검은안경
  const types = [pokemon.type1, pokemon.type2, pokemon.megaData?.type1, pokemon.megaData?.type2].filter(Boolean);
  if (types.includes("악")) {
    add("검은안경");
  }

  // 물타입 -> 신비의물방울
  if (types.includes("물")) {
    add("신비의물방울");
  }

  // Pokemon.origin.feature?.evo가 true인 경우 -> 진화의휘석
  if (pokemon.feature?.evo || pokemon.origin?.feature?.evo) {
    add("진화의휘석");
  }

  // 바위 4배 약점 -> 통굽부츠
  const isRock4x =
    typeCheck("바위", pokemon.type1, pokemon.type2) === 4 ||
    (pokemon.megaData && typeCheck("바위", pokemon.megaData.type1, pokemon.megaData.type2) === 4);
  if (isRock4x) {
    add("통굽부츠");
  }

  // 땅 4배 약점 -> 풍선
  const isGround4x =
    typeCheck("땅", pokemon.type1, pokemon.type2) === 4 ||
    (pokemon.megaData && typeCheck("땅", pokemon.megaData.type1, pokemon.megaData.type2) === 4);
  if (isGround4x) {
    add("풍선");
  }

  // 특성 관련
  const abilities = [pokemon.abil, pokemon.megaData?.abil].filter(Boolean);
  // 특성이 곡예인 경우 -> 하양허브
  if (abilities.includes("곡예")) {
    add("하양허브");
  }
  // 특성이 근성인 경우 -> 화염구슬
  if (abilities.includes("근성")) {
    add("화염구슬");
  }
  // 특성이 고대활성인 경우 -> 부스트에너지
  if (abilities.includes("고대활성")) {
    add("부스트에너지");
  }
  // 특성이 가뭄인 경우 -> 뜨거운 바위
  if (abilities.includes("가뭄")) {
    add("뜨거운바위");
  }
  // 특성이 잔비인 경우 -> 축축한 바위
  if (abilities.includes("잔비")) {
    add("축축한바위");
  }

  // 현재 기술에 리플렉터/빛의장막이 있는 경우 -> 빛의점토
  const skillNames = [1, 2, 3, 4].map((num) => pokemon.skill?.[num]?.name).filter(Boolean);
  if (skillNames.includes("리플렉터") || skillNames.includes("빛의장막")) {
    add("빛의점토");
  }

  // 연속기가 있는 경우 -> 속임수주사위
  const hasContinuousSkill = [1, 2, 3, 4].some((num) => {
    const sk = pokemon.skill?.[num];
    return (
      !!sk?.feature?.serial ||
      ["고드름침", "록블라스트", "씨기관총", "스케일샷", "트리플다이브", "트리플악셀"].includes(sk?.name)
    );
  });
  if (hasContinuousSkill) {
    add("속임수주사위");
  }

  // 물라오스 -> 펀치글러브
  if (pokemon.id === "물라오스" || pokemon.name === "물라오스") {
    add("펀치글러브");
  }

  return favorites;
};

export const getItemListForPokemon = (pokemon) => {
  // 1. 전용 아이템 (해당 포켓몬인 경우 가장 위에, 그 외엔 나오지 않음)
  const exclusiveForThis = [];
  const excludedFromAll = new Set();

  for (const [itemName, matcher] of Object.entries(EXCLUSIVE_ITEMS)) {
    if (matcher(pokemon)) {
      exclusiveForThis.push(itemName);
    } else {
      excludedFromAll.add(itemName);
    }
  }

  // 2. 즐겨찾기 아이템 (전용 아이템 및 "없음" 제외)
  const rawFavorites = getFavoriteItemsForPokemon(pokemon);
  const favoriteItems = rawFavorites.filter(
    (f) => !exclusiveForThis.includes(f) && f !== "없음"
  );

  // 3. 일반 아이템 (전용 아이템, 추천 아이템, "없음" 제외)
  const allItemNames = Object.keys(itemText);
  const normalItems = allItemNames.filter(
    (name) =>
      !excludedFromAll.has(name) &&
      !exclusiveForThis.includes(name) &&
      !favoriteItems.includes(name) &&
      name !== "없음"
  );

  // 각 그룹 내에서 글자순(가나다순) 정렬
  exclusiveForThis.sort((a, b) => a.localeCompare(b, "ko"));
  favoriteItems.sort((a, b) => a.localeCompare(b, "ko"));
  normalItems.sort((a, b) => a.localeCompare(b, "ko"));

  // 조합: 전용 -> 추천 -> 그 외 -> "없음" (무조건 맨 마지막)
  const orderedNames = [
    ...exclusiveForThis,
    ...favoriteItems,
    ...normalItems,
    "없음",
  ];

  return orderedNames.map((name) => ({
    name,
    desc: itemText[name] || (name === "없음" ? "도구를 지니지 않는다." : ""),
    isExclusive: exclusiveForThis.includes(name),
    isFavorite: favoriteItems.includes(name),
  }));
};

export const sortItems = (list, currentItem) => {
  if (!currentItem) return list;
  const current = list.filter((item) => item.name === currentItem);
  const others = list.filter((item) => item.name !== currentItem);
  return [...current, ...others];
};

const ItemSearchModal = ({ pokemon, currentItem, onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const baseItems = useMemo(() => {
    const list = getItemListForPokemon(pokemon);
    return sortItems(list, currentItem);
  }, [pokemon, currentItem]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return baseItems;
    // 검색은 아이템 이름만
    const matched = baseItems.filter((item) =>
      item.name.toLowerCase().includes(term)
    );
    return sortItems(matched, currentItem);
  }, [searchTerm, baseItems, currentItem]);

  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose} aria-label="닫기">
          ✕
        </CloseButton>

        <HeaderArea>
          <Title>
            아이템 선택 <CountText>({filteredItems.length}종)</CountText>
          </Title>
          <SearchInput
            type="text"
            placeholder="아이템 이름 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </HeaderArea>

        <ListArea>
          <Grid>
            {filteredItems.map((item) => {
              const isSelected = item.name === currentItem;
              return (
                <ItemCard
                  key={item.name}
                  $isSelected={isSelected}
                  $isExclusive={item.isExclusive}
                  $isFavorite={item.isFavorite}
                  onClick={() => {
                    onSelect(item.name);
                    onClose();
                  }}
                >
                  <ItemImageWrapper>
                    <ItemImage
                      src={
                        item.name === "없음"
                          ? "/pokemon/img/item/null.webp"
                          : `/pokemon/img/item/${item.name}.webp`
                      }
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = "/pokemon/img/item/null.webp";
                      }}
                    />
                  </ItemImageWrapper>
                  <InfoCol>
                    <NameRow>
                      <ItemName>{item.name}</ItemName>
                      {item.isExclusive && <Badge $type="exclusive">전용</Badge>}
                      {item.isFavorite && <Badge $type="favorite">추천</Badge>}
                    </NameRow>
                    <ItemDesc>{item.desc}</ItemDesc>
                  </InfoCol>
                </ItemCard>
              );
            })}
          </Grid>
        </ListArea>
      </ModalBox>
    </ModalOverlay>
  );
};

export default ItemSearchModal;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1300;
  backdrop-filter: blur(2px);
`;

const ModalBox = styled.div`
  position: relative;
  background: white;
  border-radius: 14px;
  padding: 20px;
  width: 92vw;
  max-width: 680px;
  max-height: 82vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  color: #333;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  background: transparent;
  border: none;
  font-size: 1.3rem;
  line-height: 1;
  color: #888;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  z-index: 10;

  &:hover {
    color: #111;
    background-color: #f0f0f0;
  }
`;

const HeaderArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
  padding-right: 28px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  color: #222;
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

const CountText = styled.span`
  font-size: 0.9rem;
  color: #888;
  font-weight: normal;
`;

const SearchInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    border-color: #4caf50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  }
`;

const ListArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
  margin-top: 4px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 10px;
  padding: 4px 2px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const ItemCard = styled.div`
  background-color: ${(props) => (props.$isSelected ? "#f2f9f3" : "#ffffff")};
  border: 2px solid
    ${(props) =>
      props.$isSelected
        ? "#4caf50"
        : props.$isExclusive
        ? "#9c27b0"
        : props.$isFavorite
        ? "#ff9800"
        : "#e2e8f0"};
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-color: #4caf50;
  }
`;

const ItemImageWrapper = styled.div`
  width: 44px;
  height: 44px;
  background-color: #f7f7f7;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #eee;
`;

const ItemImage = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
`;

const InfoCol = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  text-align: left;
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ItemName = styled.div`
  font-weight: bold;
  font-size: 0.95rem;
  color: #222;
`;

const Badge = styled.span`
  font-size: 0.7rem;
  font-weight: bold;
  padding: 1px 6px;
  border-radius: 4px;
  background-color: ${(props) =>
    props.$type === "exclusive" ? "rgba(156, 39, 176, 0.12)" : "rgba(255, 152, 0, 0.15)"};
  color: ${(props) => (props.$type === "exclusive" ? "#9c27b0" : "#e65100")};
  border: 1px solid
    ${(props) =>
      props.$type === "exclusive" ? "rgba(156, 39, 176, 0.3)" : "rgba(255, 152, 0, 0.3)"};
`;

const ItemDesc = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-top: 2px;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;
