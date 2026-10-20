// npm test -- src/test/customAbilEntry.test.js
import sampleList from "../entity/Pokemon/SamplePokemon";
import { generate } from "../entity/Pokemon/PokemonInstance";
import { createBattle } from "../entity/Battle";
import { abilObject } from "../entity/Ability";
import { getAbilityListForPokemon, sortAbilities } from "../component/customScreen/sampleInfo/AbilSearchModal";

describe("커스텀 특성 선택 및 엔트리 적용 테스트", () => {
  it("포켓몬의 변경 가능한 특성 목록을 가져오고 구현 여부(isImplemented)를 올바르게 판별해야 한다", () => {
    const charizard = sampleList.getDataById("메가리자몽X");
    const abilityList = getAbilityListForPokemon(charizard);

    // 리자몽 특성: ["맹화", "선파워"]
    const names = abilityList.map((a) => a.name);
    expect(names).toContain("맹화");
    expect(names).toContain("선파워");

    const maenghwa = abilityList.find((a) => a.name === "맹화");
    const sunpower = abilityList.find((a) => a.name === "선파워");

    // 맹화는 Ability.js에 구현되어 있으므로 isImplemented: true
    expect(maenghwa.isImplemented).toBe(true);
    expect(maenghwa.desc).toBe(abilObject["맹화"].text);

    // 선파워는 미구현이므로 isImplemented: false
    expect(sunpower.isImplemented).toBe(false);
    expect(sunpower.desc).toBe("아직 미구현된 특성입니다.");
  });

  it("단일 특성 포켓몬(가이오가)은 해당 특성만 목록에 반환되어야 한다", () => {
    const kyogre = sampleList.getDataById("가이오가");
    const list = getAbilityListForPokemon(kyogre);

    expect(list.length).toBe(1);
    expect(list[0].name).toBe("잔비");
    expect(list[0].isImplemented).toBe(true);
  });

  it("PokemonInstance 생성 시 커스텀 특성이 지정되면 origin 및 인스턴스의 특성이 덮어씌워져야 한다", () => {
    // 마기라스 기본 특성: 모래날림
    const defaultTyranitar = generate("마기라스");
    expect(defaultTyranitar.abil).toBe("모래날림");

    // 커스텀 특성 적용: 긴장감
    const customTyranitar = generate({ id: "마기라스", abil: "긴장감" });
    expect(customTyranitar.abil).toBe("긴장감");
    expect(customTyranitar.origin.abil).toBe("긴장감");
    expect(customTyranitar.abilObj.name).toBe("긴장감");
  });

  it("createBattle 호출 시 엔트리에 { id, item, abil } 형태가 주어지면 배틀 인스턴스에 커스텀 특성과 도구가 모두 적용되어야 한다", () => {
    const playerTeam = [
      { id: "메가리자몽X", item: "구애머리띠", abil: "맹화" },
      { id: "폴리곤2", abil: "다운로드" },
      "다투곰",
    ];
    const npcTeam = ["망나뇽", "썬더", "파르셀"];

    const battle = createBattle(playerTeam, npcTeam);

    expect(battle.player.item).toBe("구애머리띠");
    expect(battle.player.abil).toBe("맹화");

    expect(battle.playerBench1.abil).toBe("다운로드");
    expect(battle.playerBench1.origin.abil).toBe("다운로드");

    expect(battle.playerBench2.abil).toBe("근성"); // 다투곰 기본 특성
  });

  it("특성 정렬 시 현재 선택된 특성이 가장 위로 오고, 구현 -> 미구현 순서, 동일 구현 여부 내에서는 글자순이어야 한다", () => {
    const mockList = [
      { name: "하이드로펌프특성", isImplemented: false },
      { name: "가뭄", isImplemented: true },
      { name: "가속", isImplemented: true },
      { name: "괴짜", isImplemented: false },
      { name: "맹화", isImplemented: true },
    ];

    // 1. 현재 선택된 특성이 없을 때: 구현(글자순) -> 미구현(글자순)
    const sorted1 = sortAbilities(mockList, "");
    expect(sorted1.map((a) => a.name)).toEqual([
      "가뭄", "가속", "맹화", "괴짜", "하이드로펌프특성"
    ]);

    // 2. 현재 선택된 특성이 '맹화'일 때: 맹화가 가장 위로 오고, 나머지 구현(가뭄, 가속) -> 미구현(괴짜, 하이드로펌프특성)
    const sorted2 = sortAbilities(mockList, "맹화");
    expect(sorted2.map((a) => a.name)).toEqual([
      "맹화", "가뭄", "가속", "괴짜", "하이드로펌프특성"
    ]);

    // 3. 현재 선택된 특성이 미구현 특성인 '괴짜'일 때: 괴짜가 가장 위로 오고, 그 다음 구현(가뭄, 가속, 맹화) -> 미구현(하이드로펌프특성)
    const sorted3 = sortAbilities(mockList, "괴짜");
    expect(sorted3.map((a) => a.name)).toEqual([
      "괴짜", "가뭄", "가속", "맹화", "하이드로펌프특성"
    ]);
  });
});
