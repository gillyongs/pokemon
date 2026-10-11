// npm test -- src/test/tradeLegendary.test.js
import { isLegendary } from "../util/randomTeam";
import sampleList from "../entity/Pokemon/SamplePokemon";

describe("트레이드 모드 초전설 트레이드 규칙 테스트", () => {
  it("초전설 포켓몬은 isLegendary 속성이 true이어야 한다", () => {
    const zacian = sampleList.getDataById("자시안");
    const koraidon = sampleList.getDataById("코라이돈");
    const pikachuOrCharizard = sampleList.items.find((p) => p.name === "윈디");

    expect(isLegendary(zacian)).toBe(true);
    expect(isLegendary(koraidon)).toBe(true);
    expect(isLegendary(pikachuOrCharizard)).toBe(false);
  });

  it("트레이드 조건: 초전설은 초전설끼리만, 일반 포켓몬은 일반 포켓몬끼리만 트레이드 가능해야 한다", () => {
    const canTrade = (p1, p2) => isLegendary(p1) === isLegendary(p2);

    const zacian = sampleList.getDataById("자시안"); // 초전설
    const miraidon = sampleList.getDataById("미라이돈"); // 초전설
    const charizard = sampleList.items.find((p) => p.name === "윈디"); // 일반
    const garchomp = sampleList.getDataById("한카리아스"); // 일반

    // 초전설 <-> 초전설: 가능
    expect(canTrade(zacian, miraidon)).toBe(true);

    // 일반 <-> 일반: 가능
    expect(canTrade(charizard, garchomp)).toBe(true);

    // 초전설 <-> 일반: 불가능 (초전설이 2개가 되거나 늘어나는 것 방지)
    expect(canTrade(zacian, charizard)).toBe(false);
    expect(canTrade(charizard, miraidon)).toBe(false);
  });
});
