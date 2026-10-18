// npm test -- src/test/customItemEntry.test.js
import sampleList from "../entity/Pokemon/SamplePokemon";
import { generate } from "../entity/Pokemon/PokemonInstance";
import { createBattle } from "../entity/Battle";
import { itemText } from "../entity/Item";
import { getFavoriteItemsForPokemon, getItemListForPokemon, sortItems } from "../component/ItemSearchModal";

describe("커스텀 아이템 선택 및 엔트리 적용 테스트", () => {
  it("sampleList.getDataById는 문자열 ID와 { id, item } 객체 모두에서 정상적으로 데이터를 반환해야 한다", () => {
    const fromString = sampleList.getDataById("윈디");
    const fromObject = sampleList.getDataById({ id: "윈디", item: "돌격조끼" });

    expect(fromString).not.toBeNull();
    expect(fromObject).not.toBeNull();
    expect(fromString.id).toBe("윈디");
    expect(fromObject.id).toBe("윈디");
  });

  it("PokemonInstance 생성 시 커스텀 아이템이 지정되면 해당 아이템과 설명으로 덮어씌워져야 한다", () => {
    // 기본 아이템: 울퉁불퉁멧
    const defaultWindy = generate("윈디");
    expect(defaultWindy.item).toBe("울퉁불퉁멧");

    // 커스텀 아이템: 돌격조끼
    const customWindy = generate({ id: "윈디", item: "돌격조끼" });
    expect(customWindy.item).toBe("돌격조끼");
    expect(customWindy.itemText).toBe(itemText["돌격조끼"]);
    expect(customWindy.origin.item).toBe("돌격조끼");

    // 커스텀 아이템: 없음
    const noItemWindy = generate({ id: "윈디", item: "없음" });
    expect(noItemWindy.item).toBe("");
    expect(noItemWindy.origin.item).toBe("");
  });

  it("createBattle 호출 시 엔트리에 { id, item } 형태가 주어지면 배틀 인스턴스에 커스텀 아이템이 적용되어야 한다", () => {
    const playerTeam = [
      { id: "윈디", item: "생명의구슬" },
      { id: "마릴리", item: "구애머리띠" },
      "다투곰",
    ];
    const npcTeam = ["망나뇽", "썬더", "파르셀"];

    const battle = createBattle(playerTeam, npcTeam);

    expect(battle.player.item).toBe("생명의구슬");
    expect(battle.player.origin.item).toBe("생명의구슬");
    expect(battle.playerBench1.item).toBe("구애머리띠");
    expect(battle.playerBench2.item).toBe("화염구슬"); // 다투곰 기본 아이템
  });

  describe("아이템 즐겨찾기 및 전용 아이템 정렬 테스트", () => {
    it("자시안은 녹슨검이 1순위로 나오고, 타 포켓몬 전용 아이템은 목록에 없어야 한다", () => {
      const zacian = sampleList.getDataById("자시안");
      const list = getItemListForPokemon(zacian);

      expect(list[0].name).toBe("녹슨검");
      expect(list[0].isExclusive).toBe(true);

      // 녹슨방패나 리자몽나이트X 등은 목록에 없어야 함
      const names = list.map((item) => item.name);
      expect(names).not.toContain("녹슨방패");
      expect(names).not.toContain("리자몽나이트X");
      expect(names).not.toContain("메타그로스나이트");
    });

    it("물리 어태커 포켓몬은 생명의구슬, 구애스카프, 기합의띠, 구애머리띠가 추천 목록에 포함되어야 한다", () => {
      const marill = sampleList.getDataById("마릴리"); // 물리어태커, 물/페어리
      const favorites = getFavoriteItemsForPokemon(marill);

      expect(favorites).toContain("생명의구슬");
      expect(favorites).toContain("구애스카프");
      expect(favorites).toContain("기합의띠");
      expect(favorites).toContain("구애머리띠");
      expect(favorites).toContain("신비의물방울"); // 물타입
    });

    it("막이 포켓몬은 돌격조끼, 먹다남은음식, 자뭉열매, 울퉁불퉁멧이 추천 목록에 포함되어야 한다", () => {
      const lucky = sampleList.getDataById("럭키"); // 특수막이
      const favorites = getFavoriteItemsForPokemon(lucky);

      expect(favorites).toContain("돌격조끼");
      expect(favorites).toContain("먹다남은음식");
      expect(favorites).toContain("자뭉열매");
      expect(favorites).toContain("울퉁불퉁멧");
      expect(favorites).toContain("진화의휘석"); // feature.evo
    });

    it("연속기를 가진 포켓몬은 속임수주사위가 추천 목록에 포함되어야 한다", () => {
      const cloyster = sampleList.getDataById("파르셀"); // 고드름침, 록블라스트
      const favorites = getFavoriteItemsForPokemon(cloyster);

      expect(favorites).toContain("속임수주사위");
    });

    it("물라오스는 펀치글러브가 추천 목록에 포함되어야 한다", () => {
      const urshifu = sampleList.getDataById("물라오스");
      const favorites = getFavoriteItemsForPokemon(urshifu);

      expect(favorites).toContain("펀치글러브");
    });

    it("바위 4배 약점인 포켓몬은 통굽부츠가 추천 목록에 포함되어야 한다", () => {
      const charizard = sampleList.getDataById("메가리자몽Y"); // 불꽃/비행 -> 바위 4배
      const favorites = getFavoriteItemsForPokemon(charizard);

      expect(favorites).toContain("통굽부츠");
    });

    it("아이템 순서는 전용 -> 추천 -> 그 외 순서이고 각 그룹 내에서 글자순(가나다순) 정렬되며 '없음'은 맨 마지막이어야 한다", () => {
      const charizard = sampleList.getDataById("메가리자몽X");
      const list = getItemListForPokemon(charizard);

      // 1. "없음"은 무조건 맨 마지막
      expect(list[list.length - 1].name).toBe("없음");

      // 2. 전용 아이템 추출 및 글자순 검증
      const exclusiveItems = list.filter((it) => it.isExclusive).map((it) => it.name);
      const sortedExclusive = [...exclusiveItems].sort((a, b) => a.localeCompare(b, "ko"));
      expect(exclusiveItems).toEqual(sortedExclusive);
      expect(exclusiveItems).toEqual(["리자몽나이트X", "리자몽나이트Y"]);

      // 3. 추천 아이템 추출 및 글자순 검증
      const favoriteItems = list.filter((it) => it.isFavorite).map((it) => it.name);
      const sortedFavorites = [...favoriteItems].sort((a, b) => a.localeCompare(b, "ko"));
      expect(favoriteItems).toEqual(sortedFavorites);

      // 4. 일반 아이템 추출 및 글자순 검증
      const normalItems = list
        .filter((it) => !it.isExclusive && !it.isFavorite && it.name !== "없음")
        .map((it) => it.name);
      const sortedNormal = [...normalItems].sort((a, b) => a.localeCompare(b, "ko"));
      expect(normalItems).toEqual(sortedNormal);

      // 5. 전용 -> 추천 -> 일반 순서 배치 확인
      const firstExclusiveIdx = list.findIndex((it) => it.isExclusive);
      const firstFavoriteIdx = list.findIndex((it) => it.isFavorite);
      const firstNormalIdx = list.findIndex(
        (it) => !it.isExclusive && !it.isFavorite && it.name !== "없음"
      );
      const noneIdx = list.findIndex((it) => it.name === "없음");

      expect(firstExclusiveIdx).toBeLessThan(firstFavoriteIdx);
      expect(firstFavoriteIdx).toBeLessThan(firstNormalIdx);
      expect(firstNormalIdx).toBeLessThan(noneIdx);
    });

    it("sortItems는 현재 장착 중인 아이템(currentItem)을 무조건 목록의 맨 위(0번째)에 배치해야 한다", () => {
      const charizard = sampleList.getDataById("메가리자몽X");
      const list = getItemListForPokemon(charizard);

      // 일반 아이템 중 하나인 '기합의띠'를 장착 중일 때
      const sortedWithFocus = sortItems(list, "기합의띠");
      expect(sortedWithFocus[0].name).toBe("기합의띠");

      // '없음'을 장착 중일 때도 맨 위에 위치해야 함
      const sortedWithNone = sortItems(list, "없음");
      expect(sortedWithNone[0].name).toBe("없음");

      // 전용 아이템인 '리자몽나이트Y'를 장착 중일 때도 맨 위에 위치해야 함
      const sortedWithMegaY = sortItems(list, "리자몽나이트Y");
      expect(sortedWithMegaY[0].name).toBe("리자몽나이트Y");
    });
  });
});
