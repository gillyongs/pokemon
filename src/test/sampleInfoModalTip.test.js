// npm test -- src/test/sampleInfoModalTip.test.js
import React from "react";
import { render, screen } from "@testing-library/react";
import SampleInfoModal from "../component/customScreen/sampleInfo/SampleInfoModal";
import sampleList from "../entity/Pokemon/SamplePokemon";

describe("SampleInfoModal 운용 팁 노출 테스트", () => {
  it("tip이 존재하는 포켓몬은 초기 InfoBox에 해당 tip 내용이 노출된다", () => {
    const zapdos = sampleList.getDataById("썬더 (특수)");
    expect(zapdos.tip).toBeTruthy();

    render(<SampleInfoModal pokemon={zapdos} onClose={jest.fn()} onAdd={jest.fn()} />);

    // InfoBox에 zapdos.tip이 초기값으로 노출되는지 확인
    expect(screen.getByText("[TIP] " + zapdos.tip)).toBeInTheDocument();

    // 별도의 i 버튼은 렌더링되지 않음
    expect(screen.queryByRole("button", { name: "운용 팁 보기" })).toBeNull();
  });

  it("tip이 없는 포켓몬은 초기 InfoBox에 기본 안내 문구가 노출된다", () => {
    const charizardX = sampleList.getDataById("메가리자몽X");
    expect(charizardX.tip).toBeFalsy();

    render(<SampleInfoModal pokemon={charizardX} onClose={jest.fn()} onAdd={jest.fn()} />);

    // 기본 안내 문구 확인
    expect(
      screen.getByText("특성, 아이템, 능력치, 기술배치를 클릭하여 수정할 수 있습니다.")
    ).toBeInTheDocument();

    // 별도의 i 버튼은 렌더링되지 않음
    expect(screen.queryByRole("button", { name: "운용 팁 보기" })).toBeNull();
  });
});
