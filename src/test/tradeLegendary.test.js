// npm test -- src/test/tradeLegendary.test.js
jest.mock("josa", () => ({ josa: (str) => str }), { virtual: true });

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

  it("팀에 이미 초전설이 있는 경우: 초전설은 초전설끼리만, 일반은 일반끼리만 교환 가능해야 한다", () => {
    const zacian = sampleList.getDataById("자시안"); // 초전설
    const miraidon = sampleList.getDataById("미라이돈"); // 초전설
    const arcanine = sampleList.items.find((p) => p.name === "윈디"); // 일반
    const garchomp = sampleList.getDataById("한카리아스"); // 일반
    const marill = sampleList.getDataById("마릴리"); // 일반

    const playerTeamWithLegendary = [zacian, arcanine, marill];
    const hasPlayerLegendary = playerTeamWithLegendary.some((p) => isLegendary(p));
    const canTrade = (p1, p2) => !hasPlayerLegendary || isLegendary(p1) === isLegendary(p2);

    // 초전설 <-> 초전설: 가능
    expect(canTrade(zacian, miraidon)).toBe(true);

    // 일반 <-> 일반: 가능
    expect(canTrade(arcanine, garchomp)).toBe(true);

    // 초전설 <-> 일반: 불가능 (초전설이 2마리가 되는 것 방지)
    expect(canTrade(arcanine, miraidon)).toBe(false);
    expect(canTrade(zacian, garchomp)).toBe(false);
  });

  it("팀에 초전설이 없는 경우: 일반 포켓몬과 초전설 포켓몬도 교환 가능해야 한다", () => {
    const miraidon = sampleList.getDataById("미라이돈"); // 초전설
    const arcanine = sampleList.items.find((p) => p.name === "윈디"); // 일반
    const garchomp = sampleList.getDataById("한카리아스"); // 일반
    const marill = sampleList.getDataById("마릴리"); // 일반

    const playerTeamWithoutLegendary = [arcanine, garchomp, marill];
    const hasPlayerLegendary = playerTeamWithoutLegendary.some((p) => isLegendary(p));
    const canTrade = (p1, p2) => !hasPlayerLegendary || isLegendary(p1) === isLegendary(p2);

    // 일반 <-> 초전설: 가능 (교환 후 팀 내 초전설 1마리)
    expect(canTrade(arcanine, miraidon)).toBe(true);

    // 일반 <-> 일반: 가능
    expect(canTrade(arcanine, garchomp)).toBe(true);
  });
});
