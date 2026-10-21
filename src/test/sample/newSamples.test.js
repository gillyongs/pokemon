// npm test -- src/test/sample/newSamples.test.js
import sampleList from "../../entity/Pokemon/SamplePokemon";
import { generate } from "../../entity/Pokemon/PokemonInstance";

describe("신규 샘플 포켓몬 생성 및 검증 테스트", () => {
  it("망나뇽 (특수) 샘플이 올바르게 생성되어야 한다", () => {
    const dragonite = generate("망나뇽 (특수)");
    expect(dragonite).not.toBeNull();
    expect(dragonite.origin.pokemon_id).toBe("0149");
    expect(dragonite.origin.role).toBe("특수어태커");
    expect(dragonite.origin.item).toBe("구애안경");
    expect(dragonite.origin.abil).toBe("멀티스케일");
    expect(dragonite.origin.gacha).toBe("5V0A");
    expect(dragonite.origin.evsInput).toBe("CS252");
    expect(dragonite.origin.nature).toEqual({ up: "catk", down: "atk" });

    const skills = [
      dragonite.origin.skill[1].name,
      dragonite.origin.skill[2].name,
      dragonite.origin.skill[3].name,
      dragonite.origin.skill[4].name,
    ];
    expect(skills).toEqual(["폭풍", "용성군", "냉동빔", "화염방사"]);
  });

  it("카푸꼬꼬꼭 (특수) 샘플이 올바르게 생성되어야 한다", () => {
    const koko = generate("카푸꼬꼬꼭 (특수)");
    expect(koko).not.toBeNull();
    expect(koko.origin.pokemon_id).toBe("0785");
    expect(koko.origin.role).toBe("특수어태커");
    expect(koko.origin.item).toBe("생명의구슬");
    expect(koko.origin.abil).toBe("일렉트릭메이커");
    expect(koko.origin.gacha).toBe("5V0A");
    expect(koko.origin.evsInput).toBe("CS252");
    expect(koko.origin.nature).toEqual({ up: "speed", down: "atk" });

    const skills = [
      koko.origin.skill[1].name,
      koko.origin.skill[2].name,
      koko.origin.skill[3].name,
      koko.origin.skill[4].name,
    ];
    expect(skills).toEqual(["10만볼트", "볼트체인지", "매지컬샤인", "풀묶기"]);
  });

  it("썬더 (물리막이) 샘플이 올바르게 생성되어야 한다", () => {
    const zapdos = generate("썬더 (물리막이)");
    expect(zapdos).not.toBeNull();
    expect(zapdos.origin.pokemon_id).toBe("0145");
    expect(zapdos.origin.role).toBe("물리막이");
    expect(zapdos.origin.item).toBe("울퉁불퉁멧");
    expect(zapdos.origin.abil).toBe("정전기");
    expect(zapdos.origin.gacha).toBe("5V0A");
    expect(zapdos.origin.evsInput).toBe("HB252");
    expect(zapdos.origin.nature).toEqual({ up: "def", down: "atk" });

    const skills = [
      zapdos.origin.skill[1].name,
      zapdos.origin.skill[2].name,
      zapdos.origin.skill[3].name,
      zapdos.origin.skill[4].name,
    ];
    expect(skills).toEqual(["볼트체인지", "열풍", "날개쉬기", "전기자석파"]);
  });

  it("대짱이 (기점잡이) 샘플이 올바르게 생성되어야 한다", () => {
    const swampert = generate("대짱이");
    expect(swampert).not.toBeNull();
    expect(swampert.origin.pokemon_id).toBe("0260");
    expect(swampert.origin.role).toBe("기점잡이");
    expect(swampert.origin.item).toBe("자뭉열매");
    expect(swampert.origin.abil).toBe("급류");
    expect(swampert.origin.gacha).toBe("5V0S");
    expect(swampert.origin.evsInput).toBe("HB252");
    expect(swampert.origin.nature).toEqual({ up: "def", down: "speed" });

    const skills = [
      swampert.origin.skill[1].name,
      swampert.origin.skill[2].name,
      swampert.origin.skill[3].name,
      swampert.origin.skill[4].name,
    ];
    expect(skills).toEqual(["하품", "스텔스록", "지진", "퀵턴"]);
  });

  it("게노세크트 (특수어태커) 샘플이 올바르게 생성되어야 한다", () => {
    const genesect = generate("게노세크트");
    expect(genesect).not.toBeNull();
    expect(genesect.origin.pokemon_id).toBe("0649");
    expect(genesect.origin.role).toBe("특수어태커");
    expect(genesect.origin.item).toBe("구애안경");
    expect(genesect.origin.abil).toBe("다운로드");
    expect(genesect.origin.gacha).toBe("5V0A");
    expect(genesect.origin.evsInput).toBe("CS252");
    expect(genesect.origin.nature).toEqual({ up: "speed", down: "atk" });

    const skills = [
      genesect.origin.skill[1].name,
      genesect.origin.skill[2].name,
      genesect.origin.skill[3].name,
      genesect.origin.skill[4].name,
    ];
    expect(skills).toEqual(["철제광선", "화염방사", "10만볼트", "냉동빔"]);
  });

  it("sampleList에서 5개 신규 샘플을 모두 조회할 수 있어야 한다", () => {
    const names = ["망나뇽 (특수)", "카푸꼬꼬꼭 (특수)", "썬더 (물리막이)", "대짱이", "게노세크트"];
    names.forEach((name) => {
      const found = sampleList.getDataById(name);
      expect(found).not.toBeNull();
      expect(found.id).toBe(name);
    });
  });

  describe("게노세크트 다운로드 특성 및 철제광선 배틀 동작 테스트", () => {
    let mockQueue;
    let queueObject;

    beforeEach(() => {
      mockQueue = [];
      queueObject = {
        queue: mockQueue,
        enqueue: jest.fn((item) => mockQueue.push(item)),
        dequeue: jest.fn(() => mockQueue.shift()),
        resetQueue: jest.fn(() => (mockQueue.length = 0)),
        queueCheck: jest.fn(() => true),
      };
    });

    it("상대방의 방어가 특수방어보다 낮으면 공격이 1랭크 상승해야 한다", () => {
      const { default: Battle } = require("../../entity/Battle");
      const { applyAbilityEffects } = require("../../entity/Ability");

      // 럭키: def < cdef
      const player = generate("게노세크트");
      const npc = generate("럭키");
      const b1 = generate("망나뇽 (물리)");
      const b2 = generate("썬더 (특수)");
      const eb1 = generate("파르셀");
      const eb2 = generate("마릴리");

      const battle = new Battle(player, npc, b1, b2, eb1, eb2);
      applyAbilityEffects(battle, "player", queueObject.enqueue);

      expect(battle.player.tempStatus.rank.atk).toBe(1);
      expect(battle.player.tempStatus.rank.catk).toBe(0);
    });

    it("상대방의 방어가 특수방어보다 높거나 같으면 특수공격이 1랭크 상승해야 한다", () => {
      const { default: Battle } = require("../../entity/Battle");
      const { applyAbilityEffects } = require("../../entity/Ability");

      // 쏘콘: def > cdef
      const player = generate("게노세크트");
      const npc = generate("쏘콘");
      const b1 = generate("망나뇽 (물리)");
      const b2 = generate("썬더 (특수)");
      const eb1 = generate("파르셀");
      const eb2 = generate("마릴리");

      const battle = new Battle(player, npc, b1, b2, eb1, eb2);
      applyAbilityEffects(battle, "player", queueObject.enqueue);

      expect(battle.player.tempStatus.rank.catk).toBe(1);
      expect(battle.player.tempStatus.rank.atk).toBe(0);
    });

    it("철제광선 사용 시 최대 HP의 절반만큼 반동 피해를 입어야 한다", () => {
      const { default: Battle } = require("../../entity/Battle");
      const { skillEffectsAfter } = require("../../service/skillEffect");

      const player = generate("게노세크트");
      const npc = generate("럭키");
      const b1 = generate("망나뇽 (물리)");
      const b2 = generate("썬더 (특수)");
      const eb1 = generate("파르셀");
      const eb2 = generate("마릴리");

      const battle = new Battle(player, npc, b1, b2, eb1, eb2);
      battle.turn.atk = "player";
      battle.turn.def = "npc";
      battle.player.turn.useSkill = battle.player.origin.skill[1]; // 철제광선

      const maxHp = battle.player.origin.hp;
      const expectedRecoil = Math.ceil(maxHp / 2);
      const initialHp = battle.player.hp;

      skillEffectsAfter(battle, queueObject.enqueue);

      expect(battle.player.hp).toBe(initialHp - expectedRecoil);
    });
  });
});
