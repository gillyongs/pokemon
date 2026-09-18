import { applyAbilityEffects } from "./Ability";

describe("applyAbilityEffects", () => {
  let mockBattle;
  let mockEnqueue;

  const createMockPokemon = (name, abil, item = null) => ({
    name,
    names: name,
    abil,
    item,
    tempStatus: { substitute: false, protosynthesis: null },
    rankUp: jest.fn(),
    handleProtosynthesis: jest.fn(),
  });

  beforeEach(() => {
    mockEnqueue = jest.fn();
    mockBattle = {
      player: createMockPokemon("내포켓몬", "위협"),
      npc: createMockPokemon("상대포켓몬", "천진"),
      common: {
        player: { teamKrReverse: "상대" },
        npc: { teamKrReverse: "우리" },
      },
      field: {
        weather: {
          isSunny: false,
          setWeatherOnBattle: jest.fn(),
        },
        terrain: {
          isElectricField: false,
          setTerrainOnBattle: jest.fn(),
        },
      },
    };
  });

  it("should trigger '위협' (Intimidate) and drop opponent's attack", () => {
    mockBattle.player.abil = "위협";
    
    applyAbilityEffects(mockBattle, "player", mockEnqueue, false);
    
    // player의 rankUp이 아니라 npc의 rankUp이 호출되어야 함 (위협은 상대 공 하락)
    expect(mockBattle.npc.rankUp).toHaveBeenCalledWith(
      mockBattle,
      mockEnqueue,
      "atk",
      -1,
      "[특성 위협]"
    );
  });

  it("should trigger '불요의검' (Intrepid Sword) and raise own attack if holding Rusted Sword", () => {
    mockBattle.player.abil = "불요의검";
    mockBattle.player.item = "녹슨검";
    
    applyAbilityEffects(mockBattle, "player", mockEnqueue, false);
    
    expect(mockBattle.player.rankUp).toHaveBeenCalledWith(
      mockBattle,
      mockEnqueue,
      "atk",
      1,
      "[특성 불요의검]"
    );
  });

  it("should output text for aura abilities like '다크오라' (Dark Aura)", () => {
    mockBattle.player.abil = "다크오라";
    
    applyAbilityEffects(mockBattle, "player", mockEnqueue, false);
    
    expect(mockEnqueue).toHaveBeenCalledWith({
      battle: mockBattle,
      text: "[특성 다크오라] 내포켓몬 다크오라를 발산하고 있다!",
    });
  });

  it("should change weather for '가뭄' (Drought)", () => {
    mockBattle.player.abil = "가뭄";
    
    applyAbilityEffects(mockBattle, "player", mockEnqueue, false);
    
    expect(mockBattle.field.weather.setWeatherOnBattle).toHaveBeenCalledWith(
      mockBattle,
      mockEnqueue,
      mockBattle.player,
      "쾌청",
      "[특성 가뭄] 내포켓몬 주변의 햇살이 강해졌다!"
    );
  });
  
  it("should trigger '트레이스' (Trace) to copy opponent's ability", () => {
    mockBattle.player.abil = "트레이스";
    mockBattle.player.abilObj = { text: "트레이스" };
    mockBattle.npc.abil = "위협";
    mockBattle.npc.abilObj = { text: "위협" };
    
    applyAbilityEffects(mockBattle, "player", mockEnqueue, false);
    
    expect(mockBattle.player.abil).toBe("위협");
    expect(mockEnqueue).toHaveBeenCalledWith({
      battle: mockBattle,
      text: "[특성 트레이스] 내포켓몬 상대포켓몬의 위협를 트레이스했다!",
    });
    // It should recursively call and apply Intimidate
    expect(mockBattle.npc.rankUp).toHaveBeenCalled();
  });
});
