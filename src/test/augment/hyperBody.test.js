import { AUGMENT_LIST } from "../../entity/Augment/AugmentData";
import { generatePokemonInstance } from "../../entity/Pokemon/PokemonInstance";
import { createBattle } from "../../entity/Battle";

describe("하이퍼바디 증강 테스트", () => {
  const hyperBodyAug = AUGMENT_LIST.find((a) => a.id === "hyperBody");

  test("증강 기본 스펙 검증", () => {
    expect(hyperBodyAug).toBeDefined();
    expect(hyperBodyAug.name).toBe("하이퍼바디");
    expect(hyperBodyAug.cost).toBe(1);
    expect(hyperBodyAug.desc).toBe("파티 전원의 Max HP가 60% 증가합니다.");
  });

  test("단일 포켓몬에게 적용 시 Max HP는 60% 증가하고 현재 HP는 증가하지 않아야 한다", () => {
    const poke = generatePokemonInstance("망나뇽");
    const baseHp = poke.baseHp;
    poke.hp = 100; // 현재 체력을 임의 값으로 설정

    poke.applyAugment("hyperBody");

    expect(poke.maxHp).toBe(Math.round(baseHp * 1.6));
    expect(poke.hp).toBe(100); // 현재 체력은 증가하지 않음
  });

  test("배틀에서 파티원에게 적용 시 아군 전원의 Max HP가 60% 증가하고 현재 체력은 유지되어야 한다", () => {
    const battle = createBattle(["망나뇽", "망나뇽", "망나뇽"], ["망나뇽", "망나뇽", "망나뇽"]);

    const p0BaseHp = battle.player.baseHp;
    const p1BaseHp = battle.playerBench1.baseHp;
    const p2BaseHp = battle.playerBench2.baseHp;
    const npcBaseHp = battle.npc.baseHp;

    battle.player.hp = 50;
    battle.playerBench1.hp = 80;
    battle.playerBench2.hp = 70;

    // 플레이어 선봉에게 하이퍼바디 적용
    battle.player.applyAugment("hyperBody", battle);

    // 파티 전원 Max HP 60% 증가 확인
    expect(battle.player.maxHp).toBe(Math.round(p0BaseHp * 1.6));
    expect(battle.playerBench1.maxHp).toBe(Math.round(p1BaseHp * 1.6));
    expect(battle.playerBench2.maxHp).toBe(Math.round(p2BaseHp * 1.6));

    // 현재 체력은 증가하지 않음 확인
    expect(battle.player.hp).toBe(50);
    expect(battle.playerBench1.hp).toBe(80);
    expect(battle.playerBench2.hp).toBe(70);

    // 상대팀은 영향받지 않음 확인
    expect(battle.npc.maxHp).toBe(npcBaseHp);
  });

  test("파티 내 이미 하이퍼바디 보유자가 있는 경우 중복 등장하지 않아야 한다 (isEligible)", () => {
    const battle = createBattle(["망나뇽", "망나뇽", "망나뇽"], ["망나뇽", "망나뇽", "망나뇽"]);
    expect(hyperBodyAug.isEligible(battle.player, battle, [battle.player, battle.playerBench1, battle.playerBench2])).toBe(true);

    battle.player.applyAugment("hyperBody", battle);

    // 적용 후 벤치 포켓몬에게 롤링될 수 없음
    expect(hyperBodyAug.isEligible(battle.playerBench1, battle, [battle.player, battle.playerBench1, battle.playerBench2])).toBe(false);
  });
});
