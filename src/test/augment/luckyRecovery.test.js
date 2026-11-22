import { AUGMENT_LIST } from "../../entity/Augment/AugmentData";
import { generatePokemonInstance } from "../../entity/Pokemon/PokemonInstance";
import skillEffectSearch from "../../entity/Skill/SkillEffect";

describe("운 좋은 회복 증강 테스트", () => {
  const luckyRecoveryAug = AUGMENT_LIST.find((a) => a.id === "luckyRecovery");

  test("증강 기본 스펙 검증", () => {
    expect(luckyRecoveryAug).toBeDefined();
    expect(luckyRecoveryAug.name).toBe("운 좋은 회복");
    expect(luckyRecoveryAug.cost).toBe(1);
    expect(luckyRecoveryAug.desc).toBe("상대 포켓몬을 공격시 30% 확률로 최대 HP의 30%를 회복합니다.");
  });

  test("상대 포켓몬 공격 시 30% 확률로 최대 HP의 30%를 회복해야 한다", () => {
    const atkPokemon = generatePokemonInstance("망나뇽");
    const defPokemon = generatePokemonInstance("망나뇽");

    atkPokemon.applyAugment("luckyRecovery");
    expect(atkPokemon.hasAugment("luckyRecovery")).toBe(true);

    // HP를 절반으로 깎음
    atkPokemon.hp = Math.floor(atkPokemon.maxHp * 0.5);
    const initialHp = atkPokemon.hp;

    const commonEffect = skillEffectSearch("공통");
    expect(typeof commonEffect).toBe("function");

    const enqueuedMessages = [];
    const mockEnqueue = (b, text, id) => {
      enqueuedMessages.push({ text, id });
    };

    const fakeBattle = {
      turn: { atk: "player", def: "npc" },
      player: atkPokemon,
      npc: defPokemon,
    };

    atkPokemon.turn = {
      useSkill: { stype: "atk", name: "역린" },
    };

    // Math.random을 모킹하여 0.2 (30% 미만 -> 성공)
    const originalRandom = Math.random;
    Math.random = () => 0.2;

    try {
      commonEffect(fakeBattle, mockEnqueue, {});

      const expectedRecover = Math.floor(atkPokemon.maxHp * 0.3);
      expect(atkPokemon.hp).toBe(initialHp + expectedRecover);
      expect(enqueuedMessages.length).toBeGreaterThan(0);
      expect(enqueuedMessages.some((m) => m.text.includes("[증강 운 좋은 회복]"))).toBe(true);
    } finally {
      Math.random = originalRandom;
    }
  });

  test("30% 확률에 들지 못하면(random >= 0.3) 회복되지 않아야 한다", () => {
    const atkPokemon = generatePokemonInstance("망나뇽");
    const defPokemon = generatePokemonInstance("망나뇽");

    atkPokemon.applyAugment("luckyRecovery");
    atkPokemon.hp = Math.floor(atkPokemon.maxHp * 0.5);
    const initialHp = atkPokemon.hp;

    const commonEffect = skillEffectSearch("공통");
    const enqueuedMessages = [];
    const mockEnqueue = (b, text, id) => {
      enqueuedMessages.push({ text, id });
    };

    const fakeBattle = {
      turn: { atk: "player", def: "npc" },
      player: atkPokemon,
      npc: defPokemon,
    };

    atkPokemon.turn = {
      useSkill: { stype: "atk", name: "역린" },
    };

    // Math.random이 0.5 (30% 이상 -> 실패)
    const originalRandom = Math.random;
    Math.random = () => 0.5;

    try {
      commonEffect(fakeBattle, mockEnqueue, {});
      expect(atkPokemon.hp).toBe(initialHp);
      expect(enqueuedMessages.some((m) => m.text && m.text.includes("[증강 운 좋은 회복]"))).toBe(false);
    } finally {
      Math.random = originalRandom;
    }
  });

  test("공격 기술(atk/catk)이 아닌 변화기(natk/buf) 사용 시에는 회복되지 않아야 한다", () => {
    const atkPokemon = generatePokemonInstance("망나뇽");
    const defPokemon = generatePokemonInstance("망나뇽");

    atkPokemon.applyAugment("luckyRecovery");
    atkPokemon.hp = Math.floor(atkPokemon.maxHp * 0.5);
    const initialHp = atkPokemon.hp;

    const commonEffect = skillEffectSearch("공통");
    const enqueuedMessages = [];
    const mockEnqueue = (b, text, id) => {
      enqueuedMessages.push({ text, id });
    };

    const fakeBattle = {
      turn: { atk: "player", def: "npc" },
      player: atkPokemon,
      npc: defPokemon,
    };

    atkPokemon.turn = {
      useSkill: { stype: "buf", name: "용의춤" },
    };

    const originalRandom = Math.random;
    Math.random = () => 0.1;

    try {
      commonEffect(fakeBattle, mockEnqueue, {});
      expect(atkPokemon.hp).toBe(initialHp);
      expect(enqueuedMessages.some((m) => m.text && m.text.includes("[증강 운 좋은 회복]"))).toBe(false);
    } finally {
      Math.random = originalRandom;
    }
  });

  test("이미 풀피인 경우 불필요한 회복 메시지 없이 정상 유지되어야 한다", () => {
    const atkPokemon = generatePokemonInstance("망나뇽");
    const defPokemon = generatePokemonInstance("망나뇽");

    atkPokemon.applyAugment("luckyRecovery");
    atkPokemon.hp = atkPokemon.maxHp;

    const commonEffect = skillEffectSearch("공통");
    const enqueuedMessages = [];
    const mockEnqueue = (b, text, id) => {
      enqueuedMessages.push({ text, id });
    };

    const fakeBattle = {
      turn: { atk: "player", def: "npc" },
      player: atkPokemon,
      npc: defPokemon,
    };

    atkPokemon.turn = {
      useSkill: { stype: "atk", name: "역린" },
    };

    const originalRandom = Math.random;
    Math.random = () => 0.1;

    try {
      commonEffect(fakeBattle, mockEnqueue, {});
      expect(atkPokemon.hp).toBe(atkPokemon.maxHp);
      expect(enqueuedMessages.some((m) => m.text && m.text.includes("[증강 운 좋은 회복]"))).toBe(false);
    } finally {
      Math.random = originalRandom;
    }
  });
});
