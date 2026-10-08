const { damageCalculate } = require('./src/util/damageCalculate');

const mockBattle = {
  turn: { atk: "player", def: "npc", atkSN: 1 },
  field: {
    weather: { isSunny: false, isRainy: false, get: () => null },
    terrain: { isElectricField: false, get: () => null },
    player: { noClean: { reflect: false, lightScreen: false } },
    npc: { noClean: { reflect: false, lightScreen: false } },
  },
};

const createMockPokemon = (item, skillType) => ({
  name: "테스트몬",
  names: "테스트몬은(는)",
  type1: "노말",
  type2: null,
  abil: "없음",
  abilObj: {},
  item,
  hp: 100,
  origin: {
    hp: 100,
    skill: {
      1: { name: "테스트기술", type: skillType, stype: "atk", power: 40, feature: {}, skillEffectList: [] },
    },
    stat: { atk: 100, def: 100, catk: 100, cdef: 100 },
    abil: "없음",
  },
  atk: 100,
  def: 100,
  catk: 100,
  cdef: 100,
  level: 50,
  tempStatus: {
    rank: { atk: 0, def: 0, catk: 0, cdef: 0 },
    charge: false,
  },
  ailment: { burn: null },
  turn: {
    useSkill: { name: "테스트기술", type: skillType, stype: "atk", power: 40, feature: {}, skillEffectList: [] },
    critical: false,
  },
  log: { damage1: "", damage2: "", damage3: "" },
});

mockBattle.player = createMockPokemon("신비의물방울", "물");
mockBattle.npc = createMockPokemon("없음", "노말");

const dmg = damageCalculate(mockBattle, null, { randNum: 100 });
console.log("DMG WITH ITEM:", dmg);
console.log("LOG 1:", mockBattle.player.log.damage1);
console.log("LOG 2:", mockBattle.player.log.damage2);

mockBattle.player = createMockPokemon(null, "물");
mockBattle.npc = createMockPokemon("없음", "노말");

const dmg2 = damageCalculate(mockBattle, null, { randNum: 100 });
console.log("DMG WITHOUT ITEM:", dmg2);
console.log("LOG 1:", mockBattle.player.log.damage1);
console.log("LOG 2:", mockBattle.player.log.damage2);
