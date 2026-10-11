// npm test -- src/test/mega/megaData.test.js
import { getMegaData, getAvailableMegaForms } from "../../entity/Pokemon/MegaData";

describe("MegaData 메가진화 관계 정보 테스트", () => {
  it("메타그로스가 메타그로스나이트를 지니면 올바른 메가진화 정보를 반환해야 한다", () => {
    const data = getMegaData("0376", "메타그로스나이트");
    expect(data).toEqual({
      stone: "메타그로스나이트",
      megaFormId: "0376-m",
      name: "메가메타그로스",
      abil: "단단한발톱",
    });
  });

  it("메가진화 종류가 여러개인 포켓몬(리자몽 X / Y)은 도구(메가스톤)에 따라 각각 올바른 폼 정보를 반환해야 한다", () => {
    const charizardX = getMegaData("0006", "리자몽나이트X");
    expect(charizardX).toEqual({
      stone: "리자몽나이트X",
      megaFormId: "0006-x",
      name: "메가리자몽X",
      abil: "단단한발톱",
    });

    const charizardY = getMegaData("0006", "리자몽나이트Y");
    expect(charizardY).toEqual({
      stone: "리자몽나이트Y",
      megaFormId: "0006-y",
      name: "메가리자몽Y",
      abil: "가뭄",
    });
  });

  it("해당하는 메가스톤을 지니지 않은 경우 null을 반환해야 한다", () => {
    expect(getMegaData("0376", "구애스카프")).toBeNull();
    expect(getMegaData("0006", "생명의구슬")).toBeNull();
    expect(getMegaData("0445", "메타그로스나이트")).toBeNull();
  });

  it("getAvailableMegaForms로 특정 포켓몬의 모든 메가진화 가능한 폼 목록을 조회할 수 있어야 한다", () => {
    const forms = getAvailableMegaForms("0006");
    expect(forms).toHaveLength(2);
    expect(forms.map((f) => f.megaFormId)).toEqual(["0006-x", "0006-y"]);
  });
});
