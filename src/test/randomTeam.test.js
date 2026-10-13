// npm test -- src/test/randomTeam.test.js
import { getRandomTeam, fillRandomTeam, getRandomPokemonForSlot, isSupporter, isTanker, isAttacker, isLegendary, isMega } from "../util/randomTeam";
import sampleList from "../entity/Pokemon/SamplePokemon";

describe("랜덤 포켓몬 팀 생성 규칙 테스트", () => {
  it("규칙 1: 초전설 포켓몬 및 메가진화 포켓몬은 각각 최대 한마리까지만 가능해야 하고, 도감번호가 같은 포켓몬은 중복되지 않아야 한다", () => {
    for (let iter = 0; iter < 100; iter++) {
      const team = getRandomTeam(3);
      expect(team).toHaveLength(3);

      const pokemons = team.map((id) => sampleList.getDataById(id));
      const legendaryCount = pokemons.filter(isLegendary).length;
      expect(legendaryCount).toBeLessThanOrEqual(1);

      const megaCount = pokemons.filter(isMega).length;
      expect(megaCount).toBeLessThanOrEqual(1);

      const nos = pokemons.map((p) => p.no);
      const uniqueNos = new Set(nos);
      expect(uniqueNos.size).toBe(3);
    }
  });

  it("규칙 2: 선봉장 역할군 포켓몬은 첫번째 칸(index 0)에만 가능해야 한다", () => {
    for (let iter = 0; iter < 100; iter++) {
      const team = getRandomTeam(3);
      const pokemons = team.map((id) => sampleList.getDataById(id));

      // 2번째, 3번째 포켓몬은 선봉장가 아니어야 함
      expect(isSupporter(pokemons[1])).toBe(false);
      expect(isSupporter(pokemons[2])).toBe(false);
    }
  });

  it("규칙 3: 선봉장와 탱커는 합쳐서 2마리 이하가 되어야 하며 어태커는 최소 1마리 이상이어야 한다", () => {
    for (let iter = 0; iter < 100; iter++) {
      const team = getRandomTeam(3);
      const pokemons = team.map((id) => sampleList.getDataById(id));

      const supOrTankerCount = pokemons.filter((p) => isSupporter(p) || isTanker(p)).length;
      const attackerCount = pokemons.filter(isAttacker).length;

      expect(supOrTankerCount).toBeLessThanOrEqual(2);
      expect(attackerCount).toBeGreaterThanOrEqual(1);
    }
  });

  it("CustomScreen 빈 슬롯 채우기(fillRandomTeam): 기존 팀원이 있어도 규칙이 적용되어야 한다", () => {
    // 1) 0번에 선봉장가 있는 경우
    const supporterSample = sampleList.items.find(isSupporter);
    expect(supporterSample).toBeDefined();

    const filled1 = fillRandomTeam([supporterSample.id, null, null], 3);
    const p1 = filled1.map((id) => sampleList.getDataById(id));
    expect(isSupporter(p1[1])).toBe(false);
    expect(isSupporter(p1[2])).toBe(false);
    expect(p1.filter(isAttacker).length).toBeGreaterThanOrEqual(1);
    expect(new Set(p1.map((p) => p.no)).size).toBe(3);

    // 2) 0번과 1번에 탱커가 이미 있는 경우 -> 2번은 무조건 어태커여야 함
    const tankerSamples = sampleList.items.filter(isTanker);
    expect(tankerSamples.length).toBeGreaterThanOrEqual(2);

    for (let iter = 0; iter < 20; iter++) {
      const filled2 = fillRandomTeam([tankerSamples[0].id, tankerSamples[1].id, null], 3);
      const lastPoke = sampleList.getDataById(filled2[2]);
      expect(isAttacker(lastPoke)).toBe(true);
      expect(new Set(filled2.map((id) => sampleList.getDataById(id).no)).size).toBe(3);
    }

    // 3) 이미 초전설이 1마리 있는 경우 -> 남은 슬롯에는 초전설이 들어갈 수 없음
    const legendarySample = sampleList.items.find(isLegendary);
    expect(legendarySample).toBeDefined();

    for (let iter = 0; iter < 20; iter++) {
      const filled3 = fillRandomTeam([null, legendarySample.id, null], 3);
      const p3 = filled3.map((id) => sampleList.getDataById(id));
      expect(p3.filter(isLegendary).length).toBe(1);
      expect(new Set(p3.map((p) => p.no)).size).toBe(3);
    }

    // 4) 이미 메가진화 포켓몬이 1마리 있는 경우 -> 남은 슬롯에는 메가진화 포켓몬이 들어갈 수 없음
    const megaSample = sampleList.items.find(isMega);
    expect(megaSample).toBeDefined();

    for (let iter = 0; iter < 20; iter++) {
      const filled4 = fillRandomTeam([megaSample.id, null, null], 3);
      const p4 = filled4.map((id) => sampleList.getDataById(id));
      expect(p4.filter(isMega).length).toBe(1);
      expect(new Set(p4.map((p) => p.no)).size).toBe(3);
    }
  });

  it("CustomScreen 특정 슬롯 랜덤 뽑기(getRandomPokemonForSlot): 슬롯 인덱스에 따라 선봉장 배치가 제어되어야 한다", () => {
    for (let iter = 0; iter < 50; iter++) {
      // 1번이나 2번 슬롯을 뽑을 때는 절대 선봉장가 나오면 안 됨
      const slot1Pick = getRandomPokemonForSlot([null, null, null], 1);
      expect(isSupporter(sampleList.getDataById(slot1Pick))).toBe(false);

      const slot2Pick = getRandomPokemonForSlot([null, null, null], 2);
      expect(isSupporter(sampleList.getDataById(slot2Pick))).toBe(false);
    }
  });

  it("확률 규칙 테스트: 첫 열 선봉장 30%, 팀 내 초전설 10%, 팀 내 메가진화 20%, 선봉장+탱커 2마리 15%", () => {
    const iterations = 1000;
    let slot0SupporterCount = 0;
    let teamWithLegendaryCount = 0;
    let teamWithMegaCount = 0;
    let teamWithTwoSupTankCount = 0;

    for (let i = 0; i < iterations; i++) {
      const team = getRandomTeam(3);
      const pokemons = team.map((id) => sampleList.getDataById(id));

      if (isSupporter(pokemons[0])) {
        slot0SupporterCount++;
      }
      if (pokemons.some(isLegendary)) {
        teamWithLegendaryCount++;
      }
      if (pokemons.some(isMega)) {
        teamWithMegaCount++;
      }

      const supTankCount = pokemons.filter((p) => isSupporter(p) || isTanker(p)).length;
      if (supTankCount === 2) {
        teamWithTwoSupTankCount++;
      }
    }

    const slot0SupporterRate = slot0SupporterCount / iterations;
    const legendaryRate = teamWithLegendaryCount / iterations;
    const megaRate = teamWithMegaCount / iterations;
    const twoSupTankRate = teamWithTwoSupTankCount / iterations;

    // 기대값: 선봉장 0.30, 초전설 0.10, 메가 0.20, 선봉장+탱커 2마리 0.15
    expect(slot0SupporterRate).toBeGreaterThanOrEqual(0.23);
    expect(slot0SupporterRate).toBeLessThanOrEqual(0.37);

    expect(legendaryRate).toBeGreaterThanOrEqual(0.06);
    expect(legendaryRate).toBeLessThanOrEqual(0.15);

    expect(megaRate).toBeGreaterThanOrEqual(0.14);
    expect(megaRate).toBeLessThanOrEqual(0.26);

    expect(twoSupTankRate).toBeGreaterThanOrEqual(0.1);
    expect(twoSupTankRate).toBeLessThanOrEqual(0.2);
  });

  it("타입 중복 최소화 규칙 테스트: 가능한 경우 기존 포켓몬과 타입이 겹치지 않아야 한다", () => {
    // 1) 단일 슬롯 추첨 시: 기존 포켓몬(리자몽X: 불꽃/드래곤)의 타입과 겹치지 않는 포켓몬이 우선 선택되어야 한다
    const charizardX = sampleList.getDataById("메가리자몽X");
    expect(charizardX).toBeDefined();

    for (let i = 0; i < 30; i++) {
      const pickedId = getRandomPokemonForSlot([charizardX.id, null, null], 1);
      const picked = sampleList.getDataById(pickedId);
      const charizardTypes = [charizardX.type1, charizardX.type2].filter(Boolean);
      expect(charizardTypes.includes(picked.type1)).toBe(false);
      if (picked.type2) {
        expect(charizardTypes.includes(picked.type2)).toBe(false);
      }
    }

    // 2) 전체 팀 생성 시: 타입 중복이 없는 팀의 비율이 매우 높아야 한다 (> 85%)
    let nonOverlappingTeams = 0;
    const teamTests = 100;
    for (let i = 0; i < teamTests; i++) {
      const team = getRandomTeam(3);
      const pokemons = team.map((id) => sampleList.getDataById(id));
      const allTypes = pokemons.flatMap((p) => [p.type1, p.type2].filter(Boolean));
      const uniqueTypes = new Set(allTypes);
      if (allTypes.length === uniqueTypes.size) {
        nonOverlappingTeams++;
      }
    }
    expect(nonOverlappingTeams).toBeGreaterThanOrEqual(85);
  });
});
