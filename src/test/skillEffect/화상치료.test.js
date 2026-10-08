// npm test -- src/test/skillEffect/화상치료.test.js
import { applySkillEffects } from "../../service/skillEffect";

describe("화상치료 부가효과 테스트", () => {
  let mockBattle;
  let mockEnqueue;

  const createMockPokemon = (name) => ({
    name,
    names: require("josa").josa(`${name}#{은}`),
    status: {
      burn: null,
      poison: null,
      paralysis: null,
      sleep: null,
      freeze: null,
    },
    faint: false,
    turn: { useSkill: { skillEffectList: [] } },
  });

  beforeEach(() => {
    mockEnqueue = jest.fn();
    mockBattle = {
      turn: { atk: "player", def: "npc" },
      player: createMockPokemon("공격몬"),
      npc: createMockPokemon("방어몬"),
    };
  });

  it("1. 화상에 걸린 포켓몬이 화상치료가 있는 기술을 맞으면 화상이 치료된다", () => {
    // 상대(방어몬)에게 화상이 걸려있다고 가정
    mockBattle.npc.status.burn = 1; // 턴수 또는 데미지 틱 등의 값 (null이 아님)
    
    // 공격몬이 화상치료 효과를 가진 기술을 사용
    mockBattle.player.turn.useSkill.skillEffectList = [{ name: "화상치료" }];
    
    applySkillEffects(mockBattle, mockEnqueue);

    // 화상이 지워졌는지 확인
    expect(mockBattle.npc.status.burn).toBeNull();
    // 올바른 치료 텍스트가 출력되었는지 확인
    expect(mockEnqueue).toHaveBeenCalledWith({
      battle: mockBattle,
      text: "방어몬의 화상이 나았다!",
    });
  });

  it("2. 화상이 아닌 다른 상태이상은 치료되지 않는다", () => {
    // 상대(방어몬)에게 맹독(poison)과 마비(paralysis)가 걸려있다고 가정
    mockBattle.npc.status.poison = 2; // 맹독
    mockBattle.npc.status.paralysis = true;

    mockBattle.player.turn.useSkill.skillEffectList = [{ name: "화상치료" }];
    
    applySkillEffects(mockBattle, mockEnqueue);

    // 다른 상태이상들은 지워지지 않고 유지되어야 함
    expect(mockBattle.npc.status.poison).toBe(2);
    expect(mockBattle.npc.status.paralysis).toBe(true);

    // 텍스트 출력도 없어야 함
    expect(mockEnqueue).not.toHaveBeenCalled();
  });

  it("3. 화상이 없는 포켓몬한테 화상치료 기술을 맞췄을 때 별도의 텍스트가 뜨지 않는다", () => {
    // 상대(방어몬) 상태이상이 없음
    expect(mockBattle.npc.status.burn).toBeNull();

    mockBattle.player.turn.useSkill.skillEffectList = [{ name: "화상치료" }];
    
    applySkillEffects(mockBattle, mockEnqueue);

    // 텍스트 출력이 전혀 없어야 함 (화상이 나았다 등의 문구가 뜨지 않음)
    expect(mockEnqueue).not.toHaveBeenCalled();
  });
});
