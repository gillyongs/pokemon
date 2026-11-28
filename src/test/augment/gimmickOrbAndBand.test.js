import { createBattle } from "../../entity/Battle";
import { AUGMENT_LIST } from "../../entity/Augment/AugmentData";
import { isTeraAble } from "../../entity/Skill/Terastal";
import { isDynamaxAble } from "../../entity/Skill/DymaxMove";
import { battleStart } from "../../service/battleStart";

const findAug = (id) => AUGMENT_LIST.find((a) => a.id === id);

const createQueueStub = () => {
  const items = [];
  return {
    resetQueue: () => {
      items.length = 0;
    },
    enqueue: (battle, text, id, opt = {}) => {
      items.push({ battle, text, id, ...opt });
    },
    items,
  };
};

test("terastalOrb and dynamaxBand replace held item and defer activation until battleStart trigger", () => {
  const battle = createBattle(["갸라도스", "팬텀", "럭키"], ["윈디", "파르셀", "나인테일"]);
  const player = battle.player;

  const teraOrbAug = findAug("terastalOrb");
  expect(teraOrbAug.isEligible(player, battle, [battle.player, battle.playerBench1, battle.playerBench2])).toBe(true);

  player.applyAugment(teraOrbAug, battle, { selectedType: "페어리" });
  expect(player.item).toBe("테라스탈오브");
  expect(player.teraType).toBe("페어리");
  expect(player.isTera).toBe(false);
  expect(battle.system.teraUsed.player).toBe(false);
  expect(isTeraAble(player, battle)).toBe(true);

  // 트리거 활성화 후 공격 시 테라스탈 발동
  battle.system.teraTrigger.player = true;
  const q = createQueueStub();
  battleStart(battle, 1, 1, q);

  expect(battle.player.isTera).toBe(true);
  expect(battle.player.type1).toBe("페어리");
  expect(battle.player.type2).toBeNull();
  expect(battle.system.teraUsed.player).toBe(true);
  expect(isTeraAble(battle.player, battle)).toBe(false);
});

test("dynamaxBand activates 3-turn Dynamax on battleStart and is strictly once per battle", () => {
  const battle = createBattle(["갸라도스", "팬텀", "럭키"], ["윈디", "파르셀", "나인테일"]);
  const player = battle.player;
  const bandAug = findAug("dynamaxBand");

  expect(bandAug.isEligible(player, battle, [battle.player, battle.playerBench1, battle.playerBench2])).toBe(true);
  player.applyAugment(bandAug, battle);
  expect(player.item).toBe("다이버섯");
  expect(player.tempStatus.dynamax).toBeNull();
  expect(isDynamaxAble(player, battle)).toBe(true);

  battle.system.dynamaxTrigger.player = true;
  const q = createQueueStub();
  battleStart(battle, 1, 1, q);

  expect(battle.player.tempStatus.dynamax).toBe(2); // 시작 시 3턴 부여 후 첫 턴 turnEnd에서 1턴 차감 -> 2턴 남음
  expect(battle.system.dynamaxUsed.player).toBe(true);
  expect(isDynamaxAble(battle.player, battle)).toBe(false);
  expect(isDynamaxAble(battle.playerBench1, battle)).toBe(false);
});

test("blocks Mega/Z-Crystal/Z-Move/Max-Move Pokemon and blocks reverse/duplicate round gimmick augments while allowing cross-gimmick teammates", () => {
  const battle = createBattle(["메가리자몽X", "갸라도스", "팬텀"], ["윈디", "파르셀", "나인테일"]);
  const team = [battle.player, battle.playerBench1, battle.playerBench2];

  const megaCharizard = battle.player; // 리자몽나이트X + megaData
  const gyarados = battle.playerBench1;

  const terastalOrb = findAug("terastalOrb");
  const dynamaxBand = findAug("dynamaxBand");
  const terastal = findAug("terastal");
  const dynamax = findAug("dynamax");

  // 1. 메가진화 가능한 포켓몬은 테라스탈/다이맥스 계통 증강 전부 비활성화
  expect(terastalOrb.isEligible(megaCharizard, battle, team)).toBe(false);
  expect(dynamaxBand.isEligible(megaCharizard, battle, team)).toBe(false);
  expect(terastal.isEligible(megaCharizard, battle, team)).toBe(false);
  expect(dynamax.isEligible(megaCharizard, battle, team)).toBe(false);

  // 2. Z크리스탈 소지 포켓몬도 전부 비활성화
  gyarados.item = "물Z";
  expect(terastalOrb.isEligible(gyarados, battle, team)).toBe(false);
  expect(dynamaxBand.isEligible(gyarados, battle, team)).toBe(false);
  gyarados.item = "울퉁불퉁멧";

  // 3. Z기술 / 다이기술 증강 보유 포켓몬도 전부 비활성화
  const zAug = findAug("hydroVortex");
  expect(zAug.isEligible(gyarados, battle, team)).toBe(true);
  gyarados.applyAugment(zAug, battle, { replaceSlot: 1 });
  expect(terastalOrb.isEligible(gyarados, battle, team)).toBe(false);
  expect(dynamaxBand.isEligible(gyarados, battle, team)).toBe(false);

  // 4. 동료가 다이맥스밴드를 얻으면 같은 라운드에서 다이맥스/다이맥스밴드 차단, 다른 동료는 테라스탈오브/테라스탈 가능
  const battle2 = createBattle(["팬텀", "갸라도스", "럭키"], ["윈디", "파르셀", "나인테일"]);
  const team2 = [battle2.player, battle2.playerBench1, battle2.playerBench2];
  battle2.playerBench1.applyAugment(dynamaxBand, battle2);

  expect(dynamaxBand.isEligible(battle2.player, battle2, team2)).toBe(false);
  expect(dynamax.isEligible(battle2.player, battle2, team2)).toBe(false);
  expect(terastalOrb.isEligible(battle2.player, battle2, team2)).toBe(true);
  expect(terastal.isEligible(battle2.player, battle2, team2)).toBe(true);

  // 반대로 즉발 테라스탈을 얻으면 테라스탈오브/테라스탈 모두 차단
  battle2.player.applyAugment(terastal, battle2, { selectedType: "고스트", skipSkillReplace: true });
  expect(terastalOrb.isEligible(battle2.playerBench2, battle2, team2)).toBe(false);
  expect(terastal.isEligible(battle2.playerBench2, battle2, team2)).toBe(false);
});

test("Pokemon holding terastalOrb or dynamaxBand cannot receive Z-move or Max-move augments", () => {
  const battle = createBattle(["갸라도스", "팬텀", "럭키"], ["윈디", "파르셀", "나인테일"]);
  const team = [battle.player, battle.playerBench1, battle.playerBench2];
  const maxGeyser = findAug("maxGeyser");
  const hydroVortex = findAug("hydroVortex");
  const maxPhantasm = findAug("maxPhantasm");
  const neverEndingNightmare = findAug("neverEndingNightmare");

  battle.player.applyAugment(findAug("terastalOrb"), battle, { selectedType: "물" });
  expect(battle.player.isGimmik).toBe(true);
  expect(maxGeyser.isEligible(battle.player, battle, team)).toBe(false);
  expect(hydroVortex.isEligible(battle.player, battle, team)).toBe(false);

  battle.playerBench1.applyAugment(findAug("dynamaxBand"), battle);
  expect(battle.playerBench1.isGimmik).toBe(true);
  expect(maxPhantasm.isEligible(battle.playerBench1, battle, team)).toBe(false);
  expect(neverEndingNightmare.isEligible(battle.playerBench1, battle, team)).toBe(false);
});
