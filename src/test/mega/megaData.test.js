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

  it("PokemonData의 모든 포켓몬은 no와 id를 올바르게 가지고 있어야 한다", () => {
    const pokemonRepository = require("../../entity/Pokemon/PokemonData").default;
    const items = pokemonRepository.items;
    
    // 리자몽 계열
    const charizard = pokemonRepository.getDataById("0006");
    expect(charizard.no).toBe("0006");
    expect(charizard.id).toBe("0006");

    const megaCharizardX = pokemonRepository.getDataById("0006-x");
    expect(megaCharizardX.no).toBe("0006");
    expect(megaCharizardX.id).toBe("0006-x");

    const megaCharizardY = pokemonRepository.getDataById("0006-y");
    expect(megaCharizardY.no).toBe("0006");
    expect(megaCharizardY.id).toBe("0006-y");

    // 메타그로스 계열
    const metagross = pokemonRepository.getDataById("0376");
    expect(metagross.no).toBe("0376");
    expect(metagross.id).toBe("0376");

    const megaMetagross = pokemonRepository.getDataById("0376-m");
    expect(megaMetagross.no).toBe("0376");
    expect(megaMetagross.id).toBe("0376-m");

    // 일반 포켓몬들은 no === id
    items.forEach((p) => {
      expect(typeof p.no).toBe("string");
      expect(typeof p.id).toBe("string");
      if (!p.id.includes("-")) {
        expect(p.no).toBe(p.id);
      }
    });
  });

  it("초전설 포켓몬은 feature: { legendary: true } 속성을 가지고 있어야 한다", () => {
    const pokemonRepository = require("../../entity/Pokemon/PokemonData").default;
    const sampleList = require("../../entity/Pokemon/SamplePokemon").default;

    const legendaryIds = ["0250", "0382", "0646-a", "0716", "0717", "0888", "0889", "0890", "0898-a", "0898-b", "1007", "1008"];

    legendaryIds.forEach((id) => {
      const p = pokemonRepository.getDataById(id);
      expect(p).not.toBeNull();
      expect(p.feature?.legendary).toBe(true);
    });

    // 일반 포켓몬 및 준전설은 legendary가 아님
    const nonLegendaryIds = ["0006", "0445", "0376", "0145", "0645", "0892-a", "1002"];
    nonLegendaryIds.forEach((id) => {
      const p = pokemonRepository.getDataById(id);
      expect(p.feature?.legendary).toBeFalsy();
    });

    // sampleList에도 정상 반영되는지 확인
    const zacianSample = sampleList.getDataById("자시안");
    expect(zacianSample.feature?.legendary).toBe(true);

    const garchompSample = sampleList.getDataById("한카리아스");
    expect(garchompSample.feature?.legendary).toBeFalsy();
  });
});

