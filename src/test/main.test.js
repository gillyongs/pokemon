// npm test -- src/test/main.test.js
import { itemText, aiItemScore } from "../entity/Item";

describe("아이템 탁떨 가중치 테스트", () => {
  it("itemText에 정의된 모든 아이템이 aiItemScore에 가중치가 설정되어 있어야 한다", () => {
    const itemNames = Object.keys(itemText);

    // aiItemScore에 정의되지 않거나 숫자가 아닌 가중치를 가진 아이템 필터링
    const missingItems = itemNames.filter((item) => typeof aiItemScore[item] !== "number");

    // 빈 배열이어야 통과 (실패 시 빠진 아이템 목록이 출력됨)
    expect(missingItems).toEqual([]);
  });
});
