import { AUGMENT_LIST } from "../../entity/Augment/AugmentData";
import { generatePokemonInstance } from "../../entity/Pokemon/PokemonInstance";
import { getAugmentedStat } from "../../calc/getStat";
import { attackDamage } from "../../service/damage";
import { turnEnd } from "../../service/turnEnd";
import { createBattle } from "../../entity/Battle";

describe("폭주하는 힘 증강 테스트", () => {
  const rampagingPowerAug = AUGMENT_LIST.find((a) => a.id === "rampagingPower");

  test("증강 기본 스펙 검증", () => {
    expect(rampagingPowerAug).toBeDefined();
    expect(rampagingPowerAug.name).toBe("폭주하는 힘");
    expect(rampagingPowerAug.cost).toBe(1);
    expect(rampagingPowerAug.desc).toBe("적을 쓰러뜨렸을 경우 다음 턴까지 모든 능력치가 1.5배 증가합니다.");
  });

  test("rampagingPower 값이 0 초과일 때 모든 능력치가 1.5배 상승해야 한다", () => {
    const poke = generatePokemonInstance("망나뇽");
    poke.applyAugment("rampagingPower");

    const baseAtk = getAugmentedStat(poke, "atk");
    const baseDef = getAugmentedStat(poke, "def");
    const baseCatk = getAugmentedStat(poke, "catk");
    const baseCdef = getAugmentedStat(poke, "cdef");
    const baseSpeed = getAugmentedStat(poke, "speed");

    // 초기 상태 (rampagingPower = 0): 기본 스탯 유지
    expect(poke.tempStatus.rampagingPower).toBe(0);
    expect(getAugmentedStat(poke, "atk")).toBe(baseAtk);

    // 폭주 상태 (rampagingPower = 2)
    poke.tempStatus.rampagingPower = 2;
    expect(getAugmentedStat(poke, "atk")).toBe(Math.round(baseAtk * 1.5));
    expect(getAugmentedStat(poke, "def")).toBe(Math.round(baseDef * 1.5));
    expect(getAugmentedStat(poke, "catk")).toBe(Math.round(baseCatk * 1.5));
    expect(getAugmentedStat(poke, "cdef")).toBe(Math.round(baseCdef * 1.5));
    expect(getAugmentedStat(poke, "speed")).toBe(Math.round(baseSpeed * 1.5));

    // 다음 턴 폭주 지속 상태 (rampagingPower = 1)
    poke.tempStatus.rampagingPower = 1;
    expect(getAugmentedStat(poke, "atk")).toBe(Math.round(baseAtk * 1.5));
    expect(getAugmentedStat(poke, "speed")).toBe(Math.round(baseSpeed * 1.5));

    // 교체 시 tempStatus 초기화로 폭주 상태 해제
    poke.resetTempStatus();
    expect(poke.tempStatus.rampagingPower).toBe(0);
    expect(getAugmentedStat(poke, "atk")).toBe(baseAtk);
  });

  test("적을 쓰러뜨렸을 때 [증강 폭주하는 힘] 문구 출력 및 rampagingPower 값이 2로 설정되어야 한다", () => {
    const playerPoke = generatePokemonInstance("망나뇽", "player");
    const npcPoke = generatePokemonInstance("망나뇽", "npc");
    playerPoke.applyAugment("rampagingPower");
    playerPoke.turn.useSkill = { feature: {} };

    // 적 체력을 10으로 설정
    npcPoke.hp = 10;

    const fakeBattle = {
      turn: { atk: "player", def: "npc" },
      player: playerPoke,
      npc: npcPoke,
      emit: () => {},
    };

    const enqueued = [];
    const mockEnqueue = (b, text, id) => {
      enqueued.push({ text, id });
    };

    // 100 데미지를 입혀 적을 쓰러뜨림
    attackDamage(fakeBattle, 100, "npc", mockEnqueue);

    expect(npcPoke.faint).toBe(true);
    expect(playerPoke.tempStatus.rampagingPower).toBe(2);
    expect(enqueued.some((item) => item.text && item.text.includes("[증강 폭주하는 힘]") && item.text.includes("폭주하여 모든 능력치가 증가했다!!"))).toBe(true);
  });

  test("turnEnd에서 rampagingPower가 1씩 차감되고 0이 될 때 폭주 종료 메시지가 출력되어야 한다", () => {
    const battle = createBattle(["망나뇽", "망나뇽", "망나뇽"], ["망나뇽", "망나뇽", "망나뇽"]);
    const playerPoke = battle.player;
    playerPoke.applyAugment("rampagingPower");

    // 적을 쓰러뜨려 폭주 활성화 (값 2)
    playerPoke.tempStatus.rampagingPower = 2;

    const enqueued = [];
    const mockEnqueue = (b, text, id) => {
      enqueued.push({ text, id });
    };

    // 1번째 턴 종료 (2 -> 1)
    turnEnd(battle, mockEnqueue);
    expect(playerPoke.tempStatus.rampagingPower).toBe(1);
    expect(enqueued.some((item) => item.text && item.text.includes("폭주가 끝났다!"))).toBe(false);

    // 2번째 턴 종료 (1 -> 0, 폭주 종료)
    turnEnd(battle, mockEnqueue);
    expect(playerPoke.tempStatus.rampagingPower).toBe(0);
    expect(enqueued.some((item) => item.text && item.text.includes("폭주가 끝났다!"))).toBe(true);
  });
});
