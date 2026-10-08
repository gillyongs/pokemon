// npm test -- src/test/abil/복안.test.js
import { afterSkillCheck } from "../../service/skillCheck";
import { randomTwoFive, randomTriple } from "../../service/skillUse";

describe("복안 특성 및 명중률/연속기 테스트", () => {
  let mockBattle;
  let mockEnqueue;

  beforeEach(() => {
    mockEnqueue = jest.fn();
    mockBattle = {
      turn: { atk: "player", def: "npc" },
      player: {
        name: "버터플",
        names: "버터플은",
        abil: "복안",
        abilObj: {},
        turn: { useSkill: {}, jumpKickFail: false },
        item: null,
      },
      npc: {
        name: "상대",
        names: "상대는",
        abil: "없음",
        faint: false,
        tempStatus: { flashFire: false },
        turn: { protect: false },
      },
      field: { weather: { isSunny: false, isRainy: false } },
    };
  });

  it("1. 일격기(oneShot)는 복안이 적용되지 않아 명중률 30% 그대로 적용 (10000번 중 3000번 언저리 명중)", () => {
    let hitCount = 0;
    mockBattle.player.turn.useSkill = {
      name: "가위자르기",
      accur: 30,
      stype: "atk",
      feature: { oneShot: true },
    };

    for (let i = 0; i < 10000; i++) {
      const isHit = afterSkillCheck(mockBattle, mockEnqueue);
      if (isHit) hitCount++;
    }

    console.log(`일격기(명중 30) 10000번 중 명중 횟수: ${hitCount}`);
    
    // 30% 명중이므로 3000번 근처 (2700 ~ 3300)
    expect(hitCount).toBeGreaterThan(2700);
    expect(hitCount).toBeLessThan(3300);
  });

  it("2. 2~5회 연속기의 첫 명중 여부는 복안이 적용되고, 타수 확률은 35, 35, 15, 15% 임", () => {
    let missCount = 0;
    let hitCount = 0;
    let hits = { 2: 0, 3: 0, 4: 0, 5: 0 };
    
    // 명중률 70인 2~5회 연속기 (복안 적용 시 70 * 1.3 = 91%)
    mockBattle.player.turn.useSkill = {
      name: "락블라스트",
      accur: 70,
      stype: "atk",
      feature: { serial: true, twoFive: true },
    };

    for (let i = 0; i < 10000; i++) {
      const isHit = afterSkillCheck(mockBattle, mockEnqueue);
      if (!isHit) {
        missCount++;
      } else {
        hitCount++;
        const numHits = randomTwoFive(mockBattle, null);
        hits[numHits]++;
      }
    }

    console.log(`2~5회 연속기(명중 70) 10000번 중 빗나간 횟수: ${missCount}`);
    console.log(`명중 시 타수 분포 (2,3,4,5): ${hits[2]}, ${hits[3]}, ${hits[4]}, ${hits[5]}`);
    
    // 빗나간 횟수는 복안이 적용되어 9% (대략 900번 근처, 여유있게 700~1100)
    expect(missCount).toBeGreaterThan(700);
    expect(missCount).toBeLessThan(1100);

    // 타수 확률 검증 (35%, 35%, 15%, 15%)
    // hitCount에 비례해서 체크
    const expectedTwo = hitCount * 0.35;
    const expectedThree = hitCount * 0.35;
    const expectedFour = hitCount * 0.15;
    const expectedFive = hitCount * 0.15;

    // 대략적인 범위 검증 (±3% 오차 허용)
    const margin = hitCount * 0.03; 
    expect(hits[2]).toBeGreaterThan(expectedTwo - margin);
    expect(hits[2]).toBeLessThan(expectedTwo + margin);
    
    expect(hits[3]).toBeGreaterThan(expectedThree - margin);
    expect(hits[3]).toBeLessThan(expectedThree + margin);
    
    expect(hits[4]).toBeGreaterThan(expectedFour - margin);
    expect(hits[4]).toBeLessThan(expectedFour + margin);
    
    expect(hits[5]).toBeGreaterThan(expectedFive - margin);
    expect(hits[5]).toBeLessThan(expectedFive + margin);
  });

  it("3. 3회 연속기(트리플악셀 등)의 매 타수 명중 판정에 복안(1.3배)이 적용됨", () => {
    // randomTriple 함수가 1, 2, 3회 중 몇 회 명중했는지 리턴함
    let totalHits = { 1: 0, 2: 0, 3: 0 };
    
    for (let i = 0; i < 10000; i++) {
      // 명중률 70인 3회 연속기. 
      // (1타 명중은 이미 afterSkillCheck에서 통과했다고 가정하므로 randomTriple은 2타부터 체크)
      const numHits = randomTriple(mockBattle, null, 70);
      totalHits[numHits]++;
    }

    console.log(`3회 연속기(명중 70) 10000번 타수 분포 (1,2,3): ${totalHits[1]}, ${totalHits[2]}, ${totalHits[3]}`);
    
    // 복안 적용 시 91% 확률로 명중
    // 2타째에서 빗나갈 확률: 9% (numHits = 1) -> 10000 * 0.09 = 900번
    // 3타째에서 빗나갈 확률: 91% * 9% (numHits = 2) -> 10000 * 0.91 * 0.09 = 819번
    // 끝까지 다 맞을 확률: 91% * 91% (numHits = 3) -> 10000 * 0.91 * 0.91 = 8281번
    
    // 오차 범위 넉넉히 검증 (±250)
    expect(totalHits[1]).toBeGreaterThan(650);
    expect(totalHits[1]).toBeLessThan(1150);

    expect(totalHits[2]).toBeGreaterThan(600);
    expect(totalHits[2]).toBeLessThan(1050);

    expect(totalHits[3]).toBeGreaterThan(8000);
    expect(totalHits[3]).toBeLessThan(8600);
  });
});
