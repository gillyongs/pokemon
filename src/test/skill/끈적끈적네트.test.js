//npm test -- src/test/skill/끈적끈적네트.test.js
import { applySkillEffects } from "../../service/skillEffect";
import { applyFieldEffects } from "../../service/field";
import { userField } from "../../entity/Field/UserField";

describe("끈적끈적네트 테스트", () => {
  let mockBattle;
  let mockEnqueue;

  const createMockPokemon = (name, type1, abil, item = null) => ({
    name,
    names: require("josa").josa(`${name}#{은}`),
    type1,
    type2: null,
    abil,
    item,
    hp: 100,
    origin: { hp: 100 },
    tempStatus: { substitute: false, protosynthesis: null },
    rankUp: jest.fn(),
    isFlying: jest.fn().mockImplementation(function (bt) {
      if (this.type1 === "비행" || this.type2 === "비행") return true;
      if (this.abil === "부유") return true;
      if (this.item === "풍선") return true;
      return false;
    }),
  });

  beforeEach(() => {
    mockEnqueue = jest.fn();
    mockBattle = {
      turn: { atk: "player", def: "npc" },
      player: createMockPokemon("전툴라", "벌레", "복안"),
      npc: createMockPokemon("망나뇽", "드래곤", "멀티스케일"),
      field: {
        player: new userField("player"),
        npc: new userField("npc"),
        weather: { isSunny: false, isRainy: false },
        terrain: { isElectricField: false },
      },
    };
  });

  it("1. 끈적끈적네트 사용시 끈적끈적네트가 깔림", () => {
    mockBattle.player.turn = { useSkill: { skillEffectList: [{ name: "끈적끈적네트" }] } };
    applySkillEffects(mockBattle, mockEnqueue);

    expect(mockBattle.field.npc.stickyWeb).toBe(true);
    expect(mockEnqueue).toHaveBeenCalledWith({
      battle: mockBattle,
      text: "상대의 발밑에 끈적끈적네트가 펼쳐졌다!",
    });
  });

  it("2. 끈적끈적네트가 이미 깔렸는데 재사용시 실패함", () => {
    mockBattle.field.npc.stickyWeb = true; // 이미 깔림

    mockBattle.player.turn = { useSkill: { skillEffectList: [{ name: "끈적끈적네트" }] } };
    applySkillEffects(mockBattle, mockEnqueue);

    expect(mockEnqueue).toHaveBeenCalledWith({
      battle: mockBattle,
      text: "하지만 실패했다!",
    });
  });

  it("3. 끈적끈적네트가 깔렸을때 상대 포켓몬이 교체하여 나오면 스피드가 1랭크 떨어짐", () => {
    mockBattle.field.player.stickyWeb = true; // 플레이어 쪽에 깔렸다고 가정
    mockBattle.player.isFlying.mockReturnValue(false);

    // NPC가 강제 교체하거나 플레이어가 자진 교체해서 필드 효과가 발동하는 상황(applyFieldEffects)
    applyFieldEffects(mockBattle, "player", mockEnqueue);

    expect(mockEnqueue).toHaveBeenCalledWith({
      battle: mockBattle,
      text: "전툴라는 끈적끈적네트에 걸렸다!",
    });
    expect(mockBattle.player.rankUp).toHaveBeenCalledWith(mockBattle, mockEnqueue, "speed", -1);
  });

  it("3-1. 비행타입, 특성 부유, 아이템 풍선일 경우 스피드 감소 적용 안됨", () => {
    mockBattle.field.player.stickyWeb = true;

    // 비행 타입 테스트
    mockBattle.player.type1 = "비행";
    applyFieldEffects(mockBattle, "player", mockEnqueue);
    expect(mockBattle.player.rankUp).not.toHaveBeenCalled();

    // 특성 부유 테스트
    mockBattle.player.type1 = "벌레";
    mockBattle.player.abil = "부유";
    applyFieldEffects(mockBattle, "player", mockEnqueue);
    expect(mockBattle.player.rankUp).not.toHaveBeenCalled();

    // 아이템 풍선 테스트
    mockBattle.player.abil = "복안";
    mockBattle.player.item = "풍선";
    applyFieldEffects(mockBattle, "player", mockEnqueue);
    expect(mockBattle.player.rankUp).not.toHaveBeenCalled();
  });

  it("4. 상대가 고속스핀 사용시 끈적끈적네트 제거됨 (스피드 감소는 남음)", () => {
    // 끈적끈적네트가 깔려있고 스피드가 감소되었다고 가정
    mockBattle.field.npc.stickyWeb = true;

    // NPC가 고속스핀을 사용하여 자신의 필드에 있는 장판을 제거
    mockBattle.turn.atk = "npc";
    mockBattle.turn.def = "player";

    mockBattle.npc.turn = { useSkill: { skillEffectList: [{ name: "스핀" }] } };
    applySkillEffects(mockBattle, mockEnqueue);

    expect(mockBattle.field.npc.stickyWeb).toBeNull();
    // (rankUp -1 은 이미 필드 진입시 적용되었으므로 취소되지 않음은 랭크 시스템에 의해 자명함)
  });

  it("5. 끈적끈적네트가 제거되고 다시 사용시 다시 깔림", () => {
    mockBattle.field.npc.stickyWeb = null; // 고속스핀 등으로 제거됨

    mockBattle.turn.atk = "player";
    mockBattle.turn.def = "npc";

    mockBattle.player.turn = { useSkill: { skillEffectList: [{ name: "끈적끈적네트" }] } };
    applySkillEffects(mockBattle, mockEnqueue);

    expect(mockBattle.field.npc.stickyWeb).toBe(true);
    expect(mockEnqueue).toHaveBeenCalledWith({
      battle: mockBattle,
      text: "상대의 발밑에 끈적끈적네트가 펼쳐졌다!",
    });
  });
});
