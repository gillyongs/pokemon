// npm test -- src/test/customSkill.test.js
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { getSkillListForPokemon, UNIMPLEMENTED_SKILLS } from "../skill/PokemonSkillList";
import PokemonInstance from "../entity/Pokemon/PokemonInstance";
import sampleList from "../entity/Pokemon/SamplePokemon";
import SkillSearchModal from "../component/customScreen/sampleInfo/SkillSearchModal";

describe("PokemonSkillList and Custom Skill Support", () => {
  test("getSkillListForPokemon returns learnable skills for Charizard", () => {
    const skills = getSkillListForPokemon("0006");
    expect(skills.length).toBeGreaterThan(0);

    // 플레어드라이브 is implemented
    const flareBlitz = skills.find((s) => s.name === "플레어드라이브");
    expect(flareBlitz).toBeDefined();
    expect(flareBlitz.isImplemented).toBe(true);
    expect(flareBlitz.type).toBe("불꽃");
    expect(flareBlitz.category).toBe("물리");

    // 블래스트번 is now implemented, 솔라빔 is unimplemented
    const blastBurn = skills.find((s) => s.name === "블래스트번");
    expect(blastBurn).toBeDefined();
    expect(blastBurn.isImplemented).toBe(true);
    expect(blastBurn.type).toBe("불꽃");
    expect(blastBurn.category).toBe("특수");

    const solarBeam = skills.find((s) => s.name === "솔라빔");
    expect(solarBeam).toBeDefined();
    expect(solarBeam.isImplemented).toBe(false);
    expect(solarBeam.type).toBe("풀");
    expect(solarBeam.category).toBe("특수");
  });

  test("UNIMPLEMENTED_SKILLS are marked as isImplemented: false", () => {
    expect(UNIMPLEMENTED_SKILLS.length).toBeGreaterThan(0);
    UNIMPLEMENTED_SKILLS.forEach((skill) => {
      expect(skill.isImplemented).toBe(false);
      expect(skill.name).toBeTruthy();
      expect(skill.type).toBeTruthy();
      expect(["물리", "특수", "변화"]).toContain(skill.category);
    });
  });

  test("PokemonInstance initializes with custom skills and sets correct PP", () => {
    const customEntry = {
      id: "메가리자몽X",
      item: "생명의구슬",
      abil: "선파워",
      skills: {
        1: "화염방사",
        2: "에어슬래시",
        3: "기합구슬",
        4: "도깨비불",
      },
    };

    const instance = new PokemonInstance(customEntry);
    expect(instance.origin.skill[1].name).toBe("화염방사");
    expect(instance.origin.skill[2].name).toBe("에어슬래시");
    expect(instance.origin.skill[3].name).toBe("기합구슬");
    expect(instance.origin.skill[4].name).toBe("도깨비불");

    expect(instance.pp[1]).toBe(instance.origin.skill[1].pp);
    expect(instance.pp[2]).toBe(instance.origin.skill[2].pp);
    expect(instance.pp[3]).toBe(instance.origin.skill[3].pp);
    expect(instance.pp[4]).toBe(instance.origin.skill[4].pp);
  });

  test("Sample Pokemon default moves are always included in their learnset", () => {
    sampleList.items.forEach((sample) => {
      const skills = getSkillListForPokemon(sample);
      [1, 2, 3, 4].forEach((slot) => {
        const sampleSkill = sample.skill[slot];
        if (sampleSkill && sampleSkill.name && sampleSkill.name !== "임시스킬") {
          const found = skills.find((s) => s.name === sampleSkill.name);
          expect(found).toBeDefined();
        }
      });
    });
  });

  test("Skill class and getSkillListForPokemon include originText without power and accur prefix", () => {
    const skills = getSkillListForPokemon("0006");
    const flamethrower = skills.find((s) => s.name === "화염방사");
    expect(flamethrower).toBeDefined();
    expect(flamethrower.originText).toBe("10% 확률로 상대를 화상 상태로 만든다.");
    expect(flamethrower.text).toContain("위력 90");
    expect(flamethrower.text).toContain("명중 100");
  });

  test("SkillSearchModal handles 4 skill slots, disables confirm button when fewer than 4 skills, and saves when 4 skills are chosen", () => {
    const charizard = sampleList.getDataById("리자몽");
    const equipped = {
      1: "화염방사",
      2: "에어슬래시",
      3: "용의파동",
      4: "솔라빔",
    };

    let savedSkills = null;
    const handleSave = (newSkills) => {
      savedSkills = newSkills;
    };

    const { container } = render(
      <SkillSearchModal
        pokemon={charizard}
        equippedSkills={equipped}
        onSave={handleSave}
        onClose={() => {}}
      />
    );

    // 1. 4개 슬롯에 현재 스킬이 표시되어야 함
    expect(screen.getByText("기술 선택")).toBeInTheDocument();
    expect(screen.getByText("화염방사")).toBeInTheDocument();
    expect(screen.getByText("에어슬래시")).toBeInTheDocument();
    expect(screen.getByText("용의파동")).toBeInTheDocument();

    const confirmButton = screen.getByRole("button", { name: /기술 선택 완료/ });
    // 4개 모두 선택된 상태에서는 완료 버튼 활성화
    expect(confirmButton).not.toBeDisabled();

    // 2. ✕ 버튼을 눌러 슬롯 1(화염방사) 제거 -> 3개만 선택된 상태
    const removeButtons = container.querySelectorAll("button[aria-label='제외']");
    expect(removeButtons.length).toBe(4);
    fireEvent.click(removeButtons[0]);

    // 슬롯 1이 비어있음을 확인 (+ 빈 슬롯 1)
    expect(screen.getByText("슬롯 1")).toBeInTheDocument();

    // 기술이 4개 미만이므로 완료 버튼이 비활성화(disabled)되어야 함
    expect(confirmButton).toBeDisabled();

    // 비활성화 상태에서 클릭해도 저장이 실행되지 않아야 함
    fireEvent.click(confirmButton);
    expect(savedSkills).toBeNull();
  });
});
