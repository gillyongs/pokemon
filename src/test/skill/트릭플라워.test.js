// npm test -- src/test/skill/트릭플라워.test.js
import { getAccuracy } from "../../function/accuracyCalculate";
import { random } from "../../util/randomCheck";
import { Skill } from "../../entity/Skill/Skill";

describe("트릭플라워 스킬 테스트", () => {
  const trickFlower = new Skill("트릭플라워", "풀", 70, "-", 10, 0, "atk", null, "반드시 급소에 맞으며 명중한다.", [], { mustCritical: true });
  const mockAttacker = { abil: "없음" };
  const mockBt = { field: { weather: { isRainy: false, isSunny: false } } };

  it("트릭플라워는 1000번 사용 시 1000번 명중하는 필중기이다", () => {
    const accurPercent = getAccuracy(mockBt, trickFlower, mockAttacker);
    
    let hitCount = 0;
    for (let i = 0; i < 1000; i++) {
      if (random(accurPercent, true)) {
        hitCount++;
      }
    }

    expect(hitCount).toBe(1000);
  });

  it("트릭플라워는 반드시 급소에 맞는(mustCritical) 특성을 가지고 있다", () => {
    expect(trickFlower.feature.mustCritical).toBe(true);
  });
});
