import { hasPokemonName, hasPokemonNameOnTeam, AUGMENT_LIST, changePokemonAbility, replacePokemon, replacePokemonInBattle, isHpAtLeast, hasHpAtLeast, compareAugmentNames, applyEternamax, getAugmentText } from "./AugmentData";
import { generate } from "../Pokemon/PokemonInstance";
import { DEDICATED_AUGMENT_POKEMON } from "../../component/battleScreen/augment/AugmentIcon";

describe("hasPokemonNameOnTeam & legendaryTitan eligibility", () => {
  const titan = AUGMENT_LIST.find((a) => a.id === "legendaryTitan");

  test("hasPokemonName correctly identifies pokemon name", () => {
    expect(hasPokemonName({ name: "레지기가스" }, "레지기가스")).toBe(true);
    expect(hasPokemonName({ origin: { name: "레지기가스" } }, "레지기가스")).toBe(true);
    expect(hasPokemonName({ name: "피카츄" }, "레지기가스")).toBe(false);
    expect(hasPokemonName(null, "레지기가스")).toBe(false);
  });

  test("hasPokemonNameOnTeam detects pokemon in target array", () => {
    const team = [{ name: "피카츄" }, { name: "레지기가스" }];
    expect(hasPokemonNameOnTeam(team, "레지기가스")).toBe(true);
    expect(hasPokemonNameOnTeam([{ name: "피카츄" }], "레지기가스")).toBe(false);
  });

  test("hasPokemonNameOnTeam detects pokemon in context team array", () => {
    const pikachu = { name: "피카츄" };
    const team = [pikachu, { name: "레지기가스" }];
    expect(hasPokemonNameOnTeam(pikachu, "레지기가스", team)).toBe(true);

    const teamWithout = [pikachu, { name: "파이리" }];
    expect(hasPokemonNameOnTeam(pikachu, "레지기가스", teamWithout)).toBe(false);
  });

  test("hasPokemonNameOnTeam detects pokemon in battle object", () => {
    const player = { name: "피카츄", team: "player" };
    const battleWithRegiBench = {
      player,
      playerBench1: { name: "레지기가스", team: "player" },
      playerBench2: null,
    };
    expect(hasPokemonNameOnTeam(player, "레지기가스", battleWithRegiBench)).toBe(true);

    const battleWithoutRegi = {
      player,
      playerBench1: { name: "파이리", team: "player" },
      playerBench2: null,
    };
    expect(hasPokemonNameOnTeam(player, "레지기가스", battleWithoutRegi)).toBe(false);
  });

  test("legendaryTitan isEligible condition", () => {
    expect(titan).toBeDefined();

    // 1. 단일 레지기가스인 경우 비적격 (false)
    expect(titan.isEligible({ name: "레지기가스", hp: 100, origin: { hp: 100 } })).toBe(false);

    // 2. 단일 피카츄 (체력 50% 이상)인 경우 적격 (true)
    expect(titan.isEligible({ name: "피카츄", hp: 100, origin: { hp: 100 } })).toBe(true);

    // 3. 체력 50% 미만인 경우 비적격 (false)
    expect(titan.isEligible({ name: "피카츄", hp: 49, origin: { hp: 100 } })).toBe(false);

    // 4. 팀에 레지기가스가 포함되어 있으면 피카츄라도 비적격 (false)
    const teamWithRegi = [{ name: "피카츄", hp: 100, origin: { hp: 100 } }, { name: "레지기가스" }];
    expect(titan.isEligible(teamWithRegi[0], teamWithRegi)).toBe(false);

    // 5. 팀에 레지기가스가 없고 체력 50% 이상이면 적격 (true)
    const teamWithoutRegi = [{ name: "피카츄", hp: 100, origin: { hp: 100 } }, { name: "파이리" }];
    expect(titan.isEligible(teamWithoutRegi[0], teamWithoutRegi)).toBe(true);

    // 6. 배틀 벤치에 레지기가스가 있으면 비적격 (false)
    const battle = {
      player: { name: "피카츄", team: "player", hp: 100, origin: { hp: 100 } },
      playerBench1: { name: "레지기가스", team: "player" },
      playerBench2: null,
    };
    expect(titan.isEligible(battle.player, battle)).toBe(false);
  });
});

describe("changePokemonAbility common function", () => {
  test("correctly changes pokemon ability and abilObj including origin", () => {
    const poke = {
      name: "레지기가스",
      abil: "슬로스타트",
      abilObj: { name: "슬로스타트", text: "5턴 동안 공격과 스피드가 절반이 된다." },
      origin: {
        abil: "슬로스타트",
        abilObj: { name: "슬로스타트", text: "5턴 동안 공격과 스피드가 절반이 된다." },
      },
    };

    const resultObj = changePokemonAbility(poke, "패스트스타트");

    expect(poke.abil).toBe("패스트스타트");
    expect(poke.origin.abil).toBe("패스트스타트");
    expect(poke.abilObj.name).toBe("패스트스타트");
    expect(poke.abilObj.text).toContain("공격과 스피드가 2배");
    expect(poke.origin.abilObj.name).toBe("패스트스타트");
    expect(poke.origin.abilObj.text).toContain("공격과 스피드가 2배");
    expect(resultObj.name).toBe("패스트스타트");
  });

  test("works on PokemonInstance and supports instance method changeAbility", () => {
    const regi = generate("레지기가스");
    expect(regi.abil).toBe("슬로스타트");

    regi.changeAbility("패스트스타트");
    expect(regi.abil).toBe("패스트스타트");
    expect(regi.origin.abil).toBe("패스트스타트");
    expect(regi.abilObj.name).toBe("패스트스타트");
    expect(regi.origin.abilObj.name).toBe("패스트스타트");

    // FastStarter augment onApply
    const fastStarter = AUGMENT_LIST.find((a) => a.id === "fastStarter");
    expect(fastStarter).toBeDefined();

    regi.changeAbility("슬로스타트");
    fastStarter.onApply(regi);
    expect(regi.abil).toBe("패스트스타트");
    expect(regi.origin.abil).toBe("패스트스타트");

    // HugePower augment onApply
    const hugePower = AUGMENT_LIST.find((a) => a.id === "hugePower");
    expect(hugePower).toBeDefined();
    hugePower.onApply(regi);
    expect(regi.abil).toBe("천하장사");
    expect(regi.origin.abil).toBe("천하장사");
    expect(regi.abilObj.name).toBe("천하장사");
  });
});

describe("replacePokemon common function in augments", () => {
  test("replaces pokemon in battle slot and mutates target instance", () => {
    const gyarados = generate("갸라도스");
    gyarados.team = "player";
    gyarados.originalIndex = 0;
    const battle = {
      player: gyarados,
      playerBench1: null,
      playerBench2: null,
    };

    replacePokemon(gyarados, "메가플라이곤", battle);

    expect(gyarados.name).toBe("메가플라이곤");
    expect(battle.player.name).toBe("메가플라이곤");
    expect(battle.player).toBe(gyarados);
  });

  test("rouletteWheel onApply replaces pokemon and resets augments", () => {
    const gyarados = generate("갸라도스");
    gyarados.team = "player";
    gyarados.originalIndex = 0;
    gyarados.augments = [{ id: "thornmail", cost: 3 }];
    const battle = {
      player: gyarados,
      playerBench1: null,
      playerBench2: null,
    };

    const roulette = AUGMENT_LIST.find((a) => a.id === "rouletteWheel");
    roulette.onApply(gyarados, battle);

    expect(gyarados.id).not.toBe("갸라도스");
    expect(gyarados.augments).toEqual([]);
    expect(battle.player.id).toBe(gyarados.id);
  });

  test("legendaryTitan onApply replaces pokemon with 레지기가스", () => {
    const gyarados = generate("갸라도스");
    gyarados.team = "player";
    gyarados.originalIndex = 0;
    gyarados.augments = [{ id: "thornmail", cost: 3 }, { id: "legendaryTitan", cost: "-" }];
    const battle = {
      player: gyarados,
      playerBench1: null,
      playerBench2: null,
    };

    const titan = AUGMENT_LIST.find((a) => a.id === "legendaryTitan");
    titan.onApply(gyarados, battle);

    expect(gyarados.name).toBe("레지기가스");
    expect(battle.player.name).toBe("레지기가스");
    expect(gyarados.augments.some((a) => a.id === "thornmail")).toBe(true);
    expect(gyarados.augments.some((a) => a.id === "legendaryTitan")).toBe(false);
  });

  test("soaring onApply replaces pokemon with 메가플라이곤", () => {
    const gyarados = generate("갸라도스");
    gyarados.team = "player";
    gyarados.originalIndex = 0;
    gyarados.augments = [{ id: "thornmail", cost: 3 }, { id: "soaring", cost: "-" }];
    const battle = {
      player: gyarados,
      playerBench1: null,
      playerBench2: null,
    };

    const soaring = AUGMENT_LIST.find((a) => a.id === "soaring");
    soaring.onApply(gyarados, battle);

    expect(gyarados.name).toBe("메가플라이곤");
    expect(battle.player.name).toBe("메가플라이곤");
    expect(gyarados.augments.some((a) => a.id === "thornmail")).toBe(true);
    expect(gyarados.augments.some((a) => a.id === "soaring")).toBe(false);
  });
});

describe("isHpAtLeast common function", () => {
  test("returns true when current HP is at or above ratio", () => {
    expect(isHpAtLeast({ hp: 50, maxHp: 100 }, 0.5)).toBe(true);
    expect(isHpAtLeast({ hp: 80, maxHp: 100 }, 0.5)).toBe(true);
    expect(isHpAtLeast({ hp: 100, origin: { hp: 100 } }, 0.5)).toBe(true);
  });

  test("returns false when current HP is below ratio", () => {
    expect(isHpAtLeast({ hp: 49, maxHp: 100 }, 0.5)).toBe(false);
    expect(isHpAtLeast({ hp: 0, maxHp: 100 }, 0.5)).toBe(false);
  });

  test("returns false for invalid inputs or dead pokemon", () => {
    expect(isHpAtLeast(null)).toBe(false);
    expect(isHpAtLeast({})).toBe(false);
    expect(isHpAtLeast({ hp: -10, maxHp: 100 })).toBe(false);
  });

  test("rouletteWheel, soaring, and legendaryTitan all require HP >= 50%", () => {
    const roulette = AUGMENT_LIST.find((a) => a.id === "rouletteWheel");
    const soaring = AUGMENT_LIST.find((a) => a.id === "soaring");
    const titan = AUGMENT_LIST.find((a) => a.id === "legendaryTitan");

    const healthyPoke = { name: "피카츄", hp: 100, maxHp: 100 };
    const halfHpPoke = { name: "피카츄", hp: 50, maxHp: 100 };
    const injuredPoke = { name: "피카츄", hp: 49, maxHp: 100 };

    expect(roulette.isEligible(healthyPoke)).toBe(true);
    expect(roulette.isEligible(halfHpPoke)).toBe(true);
    expect(roulette.isEligible(injuredPoke)).toBe(false);

    expect(soaring.isEligible(healthyPoke)).toBe(true);
    expect(soaring.isEligible(halfHpPoke)).toBe(true);
    expect(soaring.isEligible(injuredPoke)).toBe(false);

    expect(titan.isEligible(healthyPoke)).toBe(true);
    expect(titan.isEligible(halfHpPoke)).toBe(true);
    expect(titan.isEligible(injuredPoke)).toBe(false);
  });
});

describe("compareAugmentNames sorting function", () => {
  test("places items starting with quote (\") at the very end of sorted list", () => {
    const list = [
      { name: '"메가" 플라이곤' },
      { name: "가시갑옷" },
      { name: "전설의 거인" },
      { name: "도박 중독" },
      { name: "천하장사" },
    ];

    list.sort(compareAugmentNames);

    const sortedNames = list.map((item) => item.name);
    expect(sortedNames).toEqual([
      "가시갑옷",
      "도박 중독",
      "전설의 거인",
      "천하장사",
      '"메가" 플라이곤',
    ]);
  });

  test("sorts multiple quoted items among themselves alphabetically", () => {
    const list = [
      { name: '"알파" 사파이어' },
      { name: "가시갑옷" },
      { name: '"메가" 플라이곤' },
      { name: "나비춤" },
    ];

    list.sort(compareAugmentNames);

    const sortedNames = list.map((item) => item.name);
    // 가나다라마바사아...: '메'(ㅁ)가 '알'(ㅇ)보다 앞섬
    expect(sortedNames).toEqual([
      "가시갑옷",
      "나비춤",
      '"메가" 플라이곤',
      '"알파" 사파이어',
    ]);
  });
});

describe("eternamax (무한 다이맥스) dedicated augment verification", () => {
  const eternamax = AUGMENT_LIST.find((a) => a.id === "eternamax");

  test("augment properties and eligibility", () => {
    expect(eternamax).toBeDefined();
    expect(eternamax.name).toBe("무한 다이맥스");
    expect(eternamax.cost).toBe(10);
    expect(DEDICATED_AUGMENT_POKEMON.eternamax).toBe("0890-m");

    const eternatus = generate("무한다이노");
    expect(eternamax.isEligible(eternatus)).toBe(true);

    const pikachu = { name: "피카츄" };
    expect(eternamax.isEligible(pikachu)).toBe(false);

    // Cannot take twice
    eternatus.augments = [{ id: "eternamax" }];
    expect(eternamax.isEligible(eternatus)).toBe(false);
  });

  test("applies base stats 255/115/250/125/250/130 and sprite 0890-m.webp at full HP", () => {
    const eternatus = generate("무한다이노");
    expect(eternatus.origin.pokemon_id).toBe("0890");
    expect(eternatus.origin.hp).toBe(216);

    eternatus.applyAugment(eternamax);

    expect(eternatus.origin.pokemon_id).toBe("0890-m");
    expect(eternatus.pokemon_id).toBe("0890-m");
    expect(eternatus.origin.hp).toBe(331);
    expect(eternatus.hp).toBe(331); // 100% HP maintained

    // Check calculated stats
    expect(eternatus.origin.stat.def).toBe(270);
    expect(eternatus.origin.stat.cdef).toBe(270);
    expect(eternatus.origin.stat.catk).toBe(177);
    expect(eternatus.origin.stat.speed).toBe(200);
    expect(eternatus.origin.stat.atk).toBe(108);

    const text = getAugmentText(eternamax, eternatus, true);
    expect(text).toContain("무한다이노가 무한 다이맥스 상태가 되었다!");
  });

  test("maintains current HP percentage ratio when max HP increases (e.g. 50% HP)", () => {
    const eternatus = generate("무한다이노");
    // Set to 50% HP (108 / 216)
    eternatus.hp = 108;

    eternatus.applyAugment(eternamax);

    expect(eternatus.origin.hp).toBe(331);
    // 331 * 0.5 = 165.5 -> round to 166
    expect(eternatus.hp).toBe(166);
    expect(eternatus.hp / eternatus.origin.hp).toBeCloseTo(0.5, 1);
  });
});

describe("nimbleMoves augment and grassy glide priority", () => {
  const nimbleMoves = AUGMENT_LIST.find((a) => a.id === "nimbleMoves");

  test("nimbleMoves exists in AUGMENT_LIST with cost 7", () => {
    expect(nimbleMoves).toBeDefined();
    expect(nimbleMoves.name).toBe("민첩한 몸놀림");
    expect(nimbleMoves.cost).toBe(7);
    expect(nimbleMoves.desc).toBe("랜덤한 기술 하나에 우선도 +1을 추가합니다.");
  });

  test("nimbleMoves adds +1 priority and sets nimbleMoves: true on skill", () => {
    const garchomp = generate("한카리아스");
    // Ensure slot 1 is 지진
    garchomp.origin.skill[1] = { name: "지진", prior: 0, power: 100, type: "땅", stype: "atk" };
    if (garchomp.skill) garchomp.skill[1] = { ...garchomp.origin.skill[1] };

    garchomp.applyAugment(nimbleMoves, null, { targetSlot: 1 });

    expect(garchomp.origin.skill[1].name).toBe("지진");
    expect(garchomp.origin.skill[1].nimbleMoves).toBe(true);
    expect(garchomp.origin.skill[1].prior).toBe(1);

    const text = getAugmentText(nimbleMoves, garchomp, true);
    expect(text).toBe("[증강] 지진의 우선도가 1 증가했다!");

    const desc = getAugmentText(nimbleMoves, garchomp, false);
    expect(desc).toBe("지진의 우선도가 1 증가했다!");
  });

  test("carryover restores the same enhanced skill in next round", () => {
    const garchomp = generate("한카리아스");
    garchomp.origin.skill[2] = { name: "스톤에지", prior: 0, power: 100, type: "바위", stype: "atk" };
    if (garchomp.skill) garchomp.skill[2] = { ...garchomp.origin.skill[2] };

    // Apply first round
    garchomp.applyAugment(nimbleMoves, null, { targetSlot: 2 });
    expect(garchomp.origin.skill[2].nimbleMoves).toBe(true);
    expect(garchomp.origin.skill[2].prior).toBe(1);

    // Simulated new round with carryover options
    const newGarchomp = generate("한카리아스");
    newGarchomp.origin.skill[2] = { name: "스톤에지", prior: 0, power: 100, type: "바위", stype: "atk" };
    if (newGarchomp.skill) newGarchomp.skill[2] = { ...newGarchomp.origin.skill[2] };

    newGarchomp.applyAugment(nimbleMoves, null, {
      targetSlot: garchomp.augments[0].targetSlot,
      enhancedSkillName: garchomp.augments[0].enhancedSkillName,
    });

    expect(newGarchomp.origin.skill[2].name).toBe("스톤에지");
    expect(newGarchomp.origin.skill[2].nimbleMoves).toBe(true);
    expect(newGarchomp.origin.skill[2].prior).toBe(1);
    expect(newGarchomp.augments[0].targetSlot).toBe(2);
  });

  test("priCalculate with Grassy Glide (base 0, +1 on grass field, +1 with nimbleMoves)", () => {
    const { priCalculate } = require("../../util/speedCheck");
    const rillaboom = generate("고릴타");
    const grassyGlide = { name: "그래스슬라이더", prior: 0, type: "풀", stype: "atk" };

    const battleNoGrass = {
      field: { terrain: { isGrassField: false } },
      player: rillaboom,
    };
    const battleGrass = {
      field: { terrain: { isGrassField: true } },
      player: rillaboom,
    };

    // 1. Without augment: 0 out of grass field, 1 in grass field
    expect(priCalculate(battleNoGrass, "player", grassyGlide)).toBe(0);
    expect(priCalculate(battleGrass, "player", grassyGlide)).toBe(1);

    // 2. With nimbleMoves augment (+1 prior, name becomes "그래스슬라이더 +1")
    const enhancedGlide = { name: "그래스슬라이더", nimbleMoves: true, prior: 1, type: "풀", stype: "atk" };
    expect(priCalculate(battleNoGrass, "player", enhancedGlide)).toBe(1);
    expect(priCalculate(battleGrass, "player", enhancedGlide)).toBe(2);
  });
});

describe("recovery augment verification", () => {
  const recovery = AUGMENT_LIST.find((a) => a.id === "recovery");

  test("recovery exists in AUGMENT_LIST with cost 5 and correct desc", () => {
    expect(recovery).toBeDefined();
    expect(recovery.name).toBe("회복");
    expect(recovery.cost).toBe(5);
    expect(recovery.desc).toBe("매턴 최대 HP의 1/16만큼 회복합니다.");
  });

  test("recovers 1/16 of max HP in leftOver when HP is not full", () => {
    const poke = generate("한카리아스");
    poke.applyAugment(recovery);

    const maxHp = poke.origin.hp;
    // Set HP to 50%
    poke.hp = Math.floor(maxHp / 2);
    const startHp = poke.hp;
    const healAmount = Math.floor(maxHp / 16);

    const mockBattle = { player: poke };
    const enqueued = [];
    const mockEnqueue = (item) => enqueued.push(item);

    poke.leftOver(mockBattle, mockEnqueue);

    expect(poke.hp).toBe(startHp + healAmount);
    expect(enqueued.length).toBe(1);
    expect(enqueued[0].text).toContain("조금 회복했다");
  });

  test("does not recover in leftOver when HP is already full", () => {
    const poke = generate("한카리아스");
    poke.applyAugment(recovery);

    const maxHp = poke.origin.hp;
    poke.hp = maxHp;

    const mockBattle = { player: poke };
    const enqueued = [];
    const mockEnqueue = (item) => enqueued.push(item);

    poke.leftOver(mockBattle, mockEnqueue);

    expect(poke.hp).toBe(maxHp);
    expect(enqueued.length).toBe(0);
  });
});

describe("threeSnails (달팽이 세마리) augment verification", () => {
  const threeSnails = AUGMENT_LIST.find((a) => a.id === "threeSnails");
  const skillEffectSearch = require("../Skill/SkillEffect").default;

  test("threeSnails exists in AUGMENT_LIST with cost 5 and correct desc", () => {
    expect(threeSnails).toBeDefined();
    expect(threeSnails.name).toBe("달팽이 세마리");
    expect(threeSnails.cost).toBe(5);
    expect(threeSnails.desc).toBe("공격 후 적에게 추가 고정 데미지를 입힙니다.");
  });

  test("triggers fixed damage 10 (초록), 25 (파란), 40 (빨간) based on roll in 공통 skillEffect", () => {
    const commonEffect = skillEffectSearch("공통");

    const rolls = [
      { randomVal: 0.1, expectedDmg: 10, expectedColor: "초록" },
      { randomVal: 0.5, expectedDmg: 25, expectedColor: "파란" },
      { randomVal: 0.8, expectedDmg: 40, expectedColor: "빨간" },
    ];

    for (const { randomVal, expectedDmg, expectedColor } of rolls) {
      jest.spyOn(Math, "random").mockReturnValue(randomVal);

      const atk = generate("한카리아스");
      atk.applyAugment(threeSnails);
      atk.turn.useSkill = { name: "지진", stype: "atk" };

      const def = generate("고릴타");
      const initialHp = def.hp;

      const enqueued = [];
      const mockEnqueue = (item) => enqueued.push(item);
      const battle = {
        turn: { atk: "player", def: "npc" },
        player: atk,
        npc: def,
      };

      commonEffect(battle, mockEnqueue, { name: "공통" });

      expect(def.hp).toBe(initialHp - expectedDmg);
      const snailLog = enqueued.find((e) => e.text && e.text.includes("[증강 달팽이세마리]"));
      expect(snailLog).toBeDefined();
      expect(snailLog.text).toBe(`[증강 달팽이세마리] ${def.names} ${expectedColor} 달팽이 껍질에 맞았다!`);

      jest.restoreAllMocks();
    }
  });

  test("does not trigger when skill is non-damaging (natk / buf)", () => {
    const commonEffect = skillEffectSearch("공통");
    const atk = generate("한카리아스");
    atk.applyAugment(threeSnails);
    atk.turn.useSkill = { name: "칼춤", stype: "natk" };

    const def = generate("고릴타");
    const initialHp = def.hp;
    const enqueued = [];

    const battle = {
      turn: { atk: "player", def: "npc" },
      player: atk,
      npc: def,
    };

    commonEffect(battle, (item) => enqueued.push(item), { name: "공통" });

    expect(def.hp).toBe(initialHp);
    const snailLog = enqueued.find((e) => e.text && e.text.includes("[증강 달팽이세마리]"));
    expect(snailLog).toBeUndefined();
  });

  test("does not trigger when defender is already fainted", () => {
    const commonEffect = skillEffectSearch("공통");
    const atk = generate("한카리아스");
    atk.applyAugment(threeSnails);
    atk.turn.useSkill = { name: "지진", stype: "atk" };

    const def = generate("고릴타");
    def.hp = 0;
    def.faint = true;
    const enqueued = [];

    const battle = {
      turn: { atk: "player", def: "npc" },
      player: atk,
      npc: def,
    };

    commonEffect(battle, (item) => enqueued.push(item), { name: "공통" });

    const snailLog = enqueued.find((e) => e.text && e.text.includes("[증강 달팽이세마리]"));
    expect(snailLog).toBeUndefined();
  });
});

describe("echoOfHero (영웅의 메아리) hidden 4th augment verification", () => {
  const echoOfHero = AUGMENT_LIST.find((a) => a.id === "echoOfHero");
  const recovery = AUGMENT_LIST.find((a) => a.id === "recovery");
  const nimbleMoves = AUGMENT_LIST.find((a) => a.id === "nimbleMoves");
  const threeSnails = AUGMENT_LIST.find((a) => a.id === "threeSnails");
  const { rollAugments, rollTeamAugments } = require("../../util/augmentRoll");
  const { getAugmentedStat } = require("../../util/damageCalculate");

  test("echoOfHero properties: buf true, isRandom false, correct desc and buff text", () => {
    expect(echoOfHero).toBeDefined();
    expect(echoOfHero.name).toBe("영웅의 메아리");
    expect(echoOfHero.buf).toBe(true);
    expect(echoOfHero.isRandom).toBe(false);
    expect(echoOfHero.desc).toBe("아군 모든 포켓몬의 공격과 특공을 40% 상승시킨다.");
    expect(getAugmentText(echoOfHero)).toBe("아군 모든 포켓몬의 공격과 특공을 40% 상승시킨다.");
    const poke = generate("가이오가");
    expect(getAugmentText(echoOfHero, poke, true)).toBe('3개의 증강이 공명하여 "영웅의 메아리" 버프를 얻었다!');
    // 일반 버프의 기본 텍스트는 [포켓몬]은 "[이름]" 버프를 얻었다!
    const genericBuff = { id: "genericBuff", name: "신비한 축복", buf: true, desc: "테스트" };
    expect(getAugmentText(genericBuff, poke, true)).toBe('가이오가는 "신비한 축복" 버프를 얻었다!');
  });

  test("forces the remaining 3rd beginner augment when holding 2 of 3 beginner augments", () => {
    // Test Case 1: has recovery & nimbleMoves -> threeSnails must appear
    const p1 = generate("한카리아스");
    p1.applyAugment(recovery);
    p1.applyAugment(nimbleMoves);
    for (let i = 0; i < 20; i++) {
      const rolled = rollAugments(p1, 3);
      expect(rolled.some((a) => a.id === "threeSnails")).toBe(true);
    }

    // Test Case 2: has recovery & threeSnails -> nimbleMoves must appear
    const p2 = generate("한카리아스");
    p2.applyAugment(recovery);
    p2.applyAugment(threeSnails);
    for (let i = 0; i < 20; i++) {
      const rolled = rollAugments(p2, 3);
      expect(rolled.some((a) => a.id === "nimbleMoves")).toBe(true);
    }

    // Test Case 3: has nimbleMoves & threeSnails -> recovery must appear
    const p3 = generate("한카리아스");
    p3.applyAugment(nimbleMoves);
    p3.applyAugment(threeSnails);
    for (let i = 0; i < 20; i++) {
      const rolled = rollAugments(p3, 3);
      expect(rolled.some((a) => a.id === "recovery")).toBe(true);
    }

    // Test rollTeamAugments with p1
    const teamChoices = rollTeamAugments([p1]);
    const choices = teamChoices[p1.originalIndex ?? p1.id ?? 0];
    expect(choices.some((a) => a.id === "threeSnails")).toBe(true);
  });

  test("buffs do not count towards 3-limit (normal augment count stays <= 3)", () => {
    const poke = generate("한카리아스");
    // 1. Give buff
    poke.applyAugment(echoOfHero);
    expect(poke.augments.length).toBe(1);
    // Normal count is 0, so rolling augments is still possible
    expect(rollAugments(poke, 3).length).toBe(3);

    // 2. Add 3 normal augments
    poke.applyAugment(recovery);
    poke.applyAugment(nimbleMoves);
    poke.applyAugment(threeSnails);
    // Total augments = 4 (1 buff + 3 normal)
    expect(poke.augments.length).toBe(4);
    expect(poke.augments.filter((a) => !a.buf).length).toBe(3);

    // 3. Trying to add a 4th normal augment should fail
    const normalAug = AUGMENT_LIST.find((a) => !a.buf && a.id !== "recovery" && a.id !== "nimbleMoves" && a.id !== "threeSnails");
    const added = poke.applyAugment(normalAug);
    expect(added).toBe(false);
    expect(poke.augments.length).toBe(4);
  });

  test("never appears in random rollAugments or rollTeamAugments", () => {
    const poke = generate("한카리아스");
    // Roll 100 times, echoOfHero should never be chosen
    for (let i = 0; i < 50; i++) {
      const rolled = rollAugments(poke, 3);
      expect(rolled.some((a) => a.id === "echoOfHero")).toBe(false);
    }

    const teamRolled = rollTeamAugments([poke]);
    const choices = teamRolled[poke.originalIndex ?? poke.id ?? 0] || [];
    expect(choices.some((a) => a.id === "echoOfHero")).toBe(false);
  });

  test("automatically gains echoOfHero as 4th augment when having recovery, nimbleMoves, and threeSnails", () => {
    const poke = generate("한카리아스");
    expect(poke.augments.length).toBe(0);

    poke.applyAugment(recovery);
    expect(poke.augments.length).toBe(1);
    expect(poke.hasAugment("echoOfHero")).toBe(false);

    poke.applyAugment(nimbleMoves);
    expect(poke.augments.length).toBe(2);
    expect(poke.hasAugment("echoOfHero")).toBe(false);

    // Apply 3rd augment (threeSnails) -> triggers synergy!
    poke.applyAugment(threeSnails);

    expect(poke.augments.length).toBe(4);
    expect(poke.hasAugment("recovery")).toBe(true);
    expect(poke.hasAugment("nimbleMoves")).toBe(true);
    expect(poke.hasAugment("threeSnails")).toBe(true);
    expect(poke.hasAugment("echoOfHero")).toBe(true);
  });

  test("boosts attack and sp.atk of all allied pokemon by 40%", () => {
    const p1 = generate("한카리아스"); // base atk: 182, catk: 90
    const p2 = generate("고릴타"); // base atk: 177, catk: 72

    const baseAtk1 = getAugmentedStat(p1, "atk");
    const baseCatk1 = getAugmentedStat(p1, "catk");
    const baseAtk2 = getAugmentedStat(p2, "atk");
    const baseCatk2 = getAugmentedStat(p2, "catk");

    p1.team = "player";
    p2.team = "player";

    const battle = {
      player: p1,
      playerBench1: p2,
      playerBench2: null,
    };

    // Before augment: normal stats
    expect(getAugmentedStat(p1, "atk", battle)).toBe(baseAtk1);
    expect(getAugmentedStat(p2, "atk", battle)).toBe(baseAtk2);

    // Give echoOfHero to p1
    p1.applyAugment(echoOfHero, battle);

    // Both p1 (carrier) and p2 (ally) should have 40% boosted Atk and Sp.Atk!
    const expectedAtk1 = Math.round(baseAtk1 * 1.4);
    const expectedCatk1 = Math.round(baseCatk1 * 1.4);
    const expectedAtk2 = Math.round(baseAtk2 * 1.4);
    const expectedCatk2 = Math.round(baseCatk2 * 1.4);

    expect(getAugmentedStat(p1, "atk", battle)).toBe(expectedAtk1);
    expect(getAugmentedStat(p1, "catk", battle)).toBe(expectedCatk1);
    expect(getAugmentedStat(p2, "atk", battle)).toBe(expectedAtk2);
    expect(getAugmentedStat(p2, "catk", battle)).toBe(expectedCatk2);

    // Def and Speed should NOT be boosted by echoOfHero
    expect(getAugmentedStat(p1, "def", battle)).toBe(p1.origin.stat.def);
    expect(getAugmentedStat(p2, "speed", battle)).toBe(p2.origin.stat.speed);
  });
});
