// npm test -- src/test/abil/정신력.test.js
import { applySkillEffects } from "../../service/skillEffect";

describe("정신력 특성 및 풀죽음 테스트", () => {
  let mockBattle;
  let mockEnqueue;

  const createMockPokemon = (name, abil) => ({
    name,
    names: require("josa").josa(`${name}#{은}`),
    abil,
    abilObj: { feature: abil === "틀깨기" ? { tgg: true } : {} },
    turn: {
      useSkill: { skillEffectList: [] },
      fullDeath: false,
    },
  });

  beforeEach(() => {
    mockEnqueue = jest.fn();
    mockBattle = {
      turn: { atk: "player", def: "npc" },
      player: createMockPokemon("공격몬", "없음"),
      npc: createMockPokemon("방어몬", "정신력"),
    };
  });

  it("1. 상대방의 특성이 '정신력'일 때 풀죽음에 걸리지 않는다", () => {
    mockBattle.player.turn.useSkill.skillEffectList = [{ name: "풀죽음", probability: 100 }];
    
    applySkillEffects(mockBattle, mockEnqueue);

    // 풀죽음(fullDeath)이 false로 유지되어야 함
    expect(mockBattle.npc.turn.fullDeath).toBe(false);
  });

  it("2. 공격자의 특성이 '틀깨기'이면 상대방이 '정신력'이어도 풀죽음에 걸릴 수 있다", () => {
    mockBattle.player.abilObj.feature.tgg = true; // 틀깨기 특성
    mockBattle.player.turn.useSkill.skillEffectList = [{ name: "풀죽음", probability: 100 }];
    
    applySkillEffects(mockBattle, mockEnqueue);

    // 틀깨기 효과로 인해 정신력이 무시되어 풀죽음에 걸려야 함
    expect(mockBattle.npc.turn.fullDeath).toBe(true);
  });

  it("3. 방어자의 특성이 정신력이 아닐 때는 100% 확률로 풀죽음에 걸린다", () => {
    mockBattle.npc.abil = "없음";
    mockBattle.player.turn.useSkill.skillEffectList = [{ name: "풀죽음", probability: 100 }];
    
    applySkillEffects(mockBattle, mockEnqueue);

    expect(mockBattle.npc.turn.fullDeath).toBe(true);
  });

  it("4. 상대방이 '위협' 특성일 때 '정신력' 특성인 포켓몬은 공격력이 떨어지지 않는다", () => {
    const { applyAbilityEffects } = require("../../entity/Ability");
    
    // 공격자(위협)가 교체 등으로 나와서 특성이 발동하는 상황 시뮬레이션
    mockBattle.player.abil = "위협";
    mockBattle.npc.abil = "정신력";
    // npc(방어자)의 rankUp 모킹
    mockBattle.npc.rankUp = jest.fn();
    mockBattle.npc.tempStatus = { substitute: false };

    applyAbilityEffects(mockBattle, "player", mockEnqueue);

    // 위협에 의한 rankUp(공격 -1) 함수가 호출되지 않아야 함
    expect(mockBattle.npc.rankUp).not.toHaveBeenCalled();

    // 정신력에 의해 방어되었다는 텍스트가 출력되어야 함
    expect(mockEnqueue).toHaveBeenCalledWith({
      battle: mockBattle,
      text: "[특성 정신력] 방어몬의 공격은 떨어지지 않는다!",
    });
  });
});
