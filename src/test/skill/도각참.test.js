// npm test -- src/test/skill/도각참.test.js
import { getAccuracy } from "../../function/accuracyCalculate";
import { random } from "../../util/randomCheck";
import { Skill } from "../../entity/Skill/Skill";

describe("도각참 명중률 테스트", () => {
  it("도각참을 1000번 써서 1000번 모두 명중한다 (필중기)", () => {
    const dogakcham = new Skill("도각참", "악", 85, "-", 10, 0, "atk", null, "반드시 명중한다.", [], { touch: true });
    const mockAttacker = { abil: "없음" };
    const mockBt = { field: { weather: { isRainy: false, isSunny: false } } };

    const accurPercent = getAccuracy(mockBt, dogakcham, mockAttacker);
    
    let hitCount = 0;
    for (let i = 0; i < 1000; i++) {
      // getAccuracy가 100을 반환하고, random(100, true)는 Math.random() * 100 < 100 이므로 항상 true 반환
      if (random(accurPercent, true)) {
        hitCount++;
      }
    }

    expect(hitCount).toBe(1000);
  });
});
