// npm test -- src/test/skillEffect/흡수.test.js
import { applySkillEffects } from "../../service/skillEffect";

describe("흡수 부가효과 테스트", () => {
  let mockBattle;
  let mockEnqueue;

  const createMockPokemon = (name) => ({
    name,
    names: require("josa").josa(`${name}#{은}`),
    hp: 100,
    origin: { hp: 100 },
    turn: {
      useSkill: { skillEffectList: [] },
      recentDamageGive: 0,
    },
    recover: jest.fn(), // 회복 함수 모킹
  });

  beforeEach(() => {
    mockEnqueue = jest.fn();
    mockBattle = {
      turn: { atk: "player", def: "npc" },
      player: createMockPokemon("공격몬"),
      npc: createMockPokemon("방어몬"),
    };
  });

  it("1. 정해진 비율만큼 제대로 체력이 회복 되는지 확인", () => {
    mockBattle.player.hp = 50; // 체력이 닳아있는 상태
    mockBattle.player.turn.recentDamageGive = 100; // 공격으로 100의 데미지를 줬음
    
    // 비율 0.75로 흡수
    mockBattle.player.turn.useSkill.skillEffectList = [{ name: "흡수", ratio: 0.75 }];
    
    applySkillEffects(mockBattle, mockEnqueue);

    // 100의 0.75배인 75만큼 회복을 시도하는지 확인
    expect(mockBattle.player.recover).toHaveBeenCalledWith(
      mockBattle,
      75,
      mockEnqueue,
      expect.stringContaining("방어몬으로부터 체력을 흡수했다!")
    );
  });

  it("2. 데미지가 100인데 상대 체력이 40이면 40의 비율만큼 흡수되는지 확인", () => {
    mockBattle.player.hp = 50; // 체력이 닳아있는 상태
    // 실제 게임에서는 상대 체력 상한으로 recentDamageGive가 보정됨 (damage.js 로직)
    // 따라서 recentDamageGive가 40으로 들어오게 됨
    mockBattle.player.turn.recentDamageGive = 40; 
    
    // 우드혼 같은 0.5비율 스킬
    mockBattle.player.turn.useSkill.skillEffectList = [{ name: "흡수", ratio: 0.5 }];
    
    applySkillEffects(mockBattle, mockEnqueue);

    // 40의 0.5배인 20만큼 회복을 시도하는지 확인
    expect(mockBattle.player.recover).toHaveBeenCalledWith(
      mockBattle,
      20,
      mockEnqueue,
      expect.stringContaining("방어몬으로부터 체력을 흡수했다!")
    );
  });

  it("3. 풀피면 흡수 텍스트가 뜨지 않는지 확인", () => {
    mockBattle.player.hp = 100; // 풀피 상태
    mockBattle.player.origin.hp = 100;
    mockBattle.player.turn.recentDamageGive = 100; // 100의 데미지를 줬음
    
    mockBattle.player.turn.useSkill.skillEffectList = [{ name: "흡수", ratio: 0.5 }];
    
    applySkillEffects(mockBattle, mockEnqueue);

    // 풀피일 경우 recover가 호출되지 않아야 함
    expect(mockBattle.player.recover).not.toHaveBeenCalled();
  });
});
