// npm test -- src/test/filterModal.test.js
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FilterModal from "../component/customScreen/FilterModal";

describe("FilterModal UI 및 필터 동작 테스트", () => {
  it("OR/AND 버튼이 타입 영역에 위치하고 토글이 정상 동작해야 한다", () => {
    const onApply = jest.fn();
    const onClose = jest.fn();

    render(
      <FilterModal
        isOpen={true}
        onClose={onClose}
        onApply={onApply}
        selectedTypes={[]}
        selectedRoles={[]}
        isMegaFilter={false}
        isLegendaryFilter={false}
        isIntimidateFilter={false}
        isWeatherFilter={false}
        isWallFilter={false}
        logic="OR"
      />
    );

    // OR, AND 버튼 확인
    const orOption = screen.getByText("OR");
    const andOption = screen.getByText("AND");
    expect(orOption).toBeInTheDocument();
    expect(andOption).toBeInTheDocument();

    // 초기 OR 상태에서 클릭 시 AND로 토글
    fireEvent.click(orOption);

    // 검색 버튼 클릭 시 logic이 AND로 전달되어야 함
    const searchButton = screen.getByText("검색");
    fireEvent.click(searchButton);

    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({
        logic: "AND",
      })
    );
  });

  it("기타 영역에만 초기화 버튼이 존재하고 타입/역할군에는 초기화 버튼이 없어야 한다", () => {
    const { container } = render(
      <FilterModal
        isOpen={true}
        onClose={jest.fn()}
        onApply={jest.fn()}
        selectedTypes={["전기"]}
        selectedRoles={["특수어태커"]}
        isMegaFilter={true}
        isLegendaryFilter={false}
        isIntimidateFilter={false}
        isWeatherFilter={false}
        isWallFilter={false}
        logic="OR"
      />
    );

    // SVG(초기화 아이콘)가 있는 버튼 개수 확인 (기타 영역 1개만 존재해야 함)
    const resetButtons = container.querySelectorAll("button svg");
    expect(resetButtons.length).toBe(1);
  });
});
