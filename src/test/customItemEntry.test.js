// npm test -- src/test/customItemEntry.test.js
import sampleList from "../entity/Pokemon/SamplePokemon";
import { generate } from "../entity/Pokemon/PokemonInstance";
import { createBattle } from "../entity/Battle";
import { itemText } from "../entity/Item";
import { getFavoriteItemsForPokemon, getItemListForPokemon, sortItems } from "../component/customScreen/sampleInfo/ItemSearchModal";
import { isNameMatch, isValidTeamArray, filterSamplePokemons, isWallPokemon } from "../util/customEntryUtil";

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

    it("연속기를 가진 포켓몬은 속임수주사위가 추천 목록에 포함되지만, 특성이 스킬링크이면 제외되어야 한다", () => {
      const kyurem = sampleList.getDataById("블랙큐레무"); // 테라볼티지, 고드름침/스케일샷
      const favorites = getFavoriteItemsForPokemon(kyurem);
      expect(favorites).toContain("속임수주사위");

      const cloyster = sampleList.getDataById("파르셀"); // 스킬링크
      const cloysterItems = getItemListForPokemon(cloyster).map((i) => i.name);
      expect(cloysterItems).not.toContain("속임수주사위");

      const rotom = sampleList.getDataById("히트로토무"); // 부유, 땅 4배
      const rotomItems = getItemListForPokemon(rotom).map((i) => i.name);
      expect(rotomItems).not.toContain("풍선");
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

  describe("이름 검색 괄호 무시 및 도감번호 중복 방지 테스트", () => {
    it("isNameMatch는 괄호 안의 문자열로는 검색되지 않고, 괄호 밖의 본래 이름으로만 검색되어야 한다", () => {
      const regielekiSpecial = sampleList.getDataById("레지에레키 (특수)");
      const regielekiWall = sampleList.getDataById("레지에레키 (벽깔이)");

      // 괄호 밖 이름 검색: 성공
      expect(isNameMatch("레지", regielekiSpecial)).toBe(true);
      expect(isNameMatch("레지에레키", regielekiSpecial)).toBe(true);
      expect(isNameMatch("레지", regielekiWall)).toBe(true);
      expect(isNameMatch("레지에레키", regielekiWall)).toBe(true);

      // 괄호 안 문자열 검색: 제외되어 검색되지 않아야 함
      expect(isNameMatch("특수", regielekiSpecial)).toBe(false);
      expect(isNameMatch("특", regielekiSpecial)).toBe(false);
      expect(isNameMatch("벽깔이", regielekiWall)).toBe(false);
      expect(isNameMatch("벽", regielekiWall)).toBe(false);
    });

    it("isValidTeamArray는 같은 도감번호(no)를 가진 포켓몬이 팀에 2마리 이상 포함되어 있으면 false를 반환해야 한다", () => {
      // 레지에레키 (벽깔이)와 레지에레키 (특수)는 동일 도감번호 0894 -> 중복 불허
      const duplicateDexTeam = ["레지에레키 (벽깔이)", "레지에레키 (특수)", "칠색조"];
      expect(isValidTeamArray(duplicateDexTeam)).toBe(false);

      // 커스텀 객체 형태일 때도 동일 도감번호 중복 불허
      const duplicateObjectTeam = [
        { id: "레지에레키 (벽깔이)", item: "빛의점토" },
        { id: "레지에레키 (특수)", item: "구애안경" },
        "칠색조",
      ];
      expect(isValidTeamArray(duplicateObjectTeam)).toBe(false);

      // 서로 다른 도감번호는 정상 통과
      const validTeam = ["레지에레키 (특수)", "칠색조", "에이스번"];
      expect(isValidTeamArray(validTeam)).toBe(true);
    });

    it("기타 필터의 벽깔이(isWallFilter) 적용 시 리플렉터/빛의장막/오로라베일 스킬을 가진 포켓몬만 필터링되어야 한다", () => {
      const regielekiWall = sampleList.getDataById("레지에레키 (벽깔이)");
      const regielekiSpecial = sampleList.getDataById("레지에레키 (특수)");
      const grimmsnarl = sampleList.getDataById("오롱털");
      const koko = sampleList.getDataById("카푸꼬꼬꼭");
      const hooh = sampleList.getDataById("칠색조");

      expect(isWallPokemon(regielekiWall)).toBe(true);
      expect(isWallPokemon(grimmsnarl)).toBe(true);
      expect(isWallPokemon(koko)).toBe(true);
      expect(isWallPokemon(regielekiSpecial)).toBe(false);
      expect(isWallPokemon(hooh)).toBe(false);

      const filtered = filterSamplePokemons(sampleList.items, {
        searchTerm: "",
        activeTypes: [],
        activeLogic: "OR",
        activeRoles: [],
        isMegaFilter: false,
        isLegendaryFilter: false,
        isIntimidateFilter: false,
        isWeatherFilter: false,
        isWallFilter: true,
      });

      const filteredIds = filtered.map((p) => p.id);
      expect(filteredIds).toContain("레지에레키 (벽깔이)");
      expect(filteredIds).toContain("오롱털");
      expect(filteredIds).toContain("카푸꼬꼬꼭");
      expect(filteredIds).not.toContain("레지에레키 (특수)");
      expect(filteredIds).not.toContain("칠색조");
    });
  });
});

