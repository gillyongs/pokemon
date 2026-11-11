import { abilObject, noRandomAbil, changePokemonAbility, changeAbility } from "../Ability";
import { josa } from "josa";
import { getAugmentedStat } from "../../util/damageCalculate";
import sampleList from "../Pokemon/SamplePokemon";
import { generate } from "../Pokemon/PokemonInstance";
import skillList from "../Skill/skillList";
import { SWORD_ENHANCE_TIERS, getSwordEnhanceTier, getSwordEnhanceProb } from "./swordEnhance";

export { SWORD_ENHANCE_TIERS, getSwordEnhanceTier, getSwordEnhanceProb };

// 체력 비율 확인 공통 함수
/**
 * 포켓몬의 현재 체력이 일정 비율 이상인지 확인하는 공통 함수 (예: 체력 50% 이상)
 * @param {Object} pokemon - 검사할 포켓몬 인스턴스
 * @param {number} [ratio=0.5] - 기준 비율 (0.5 또는 50%)
 * @returns {boolean}
 */
export const isHpAtLeast = (pokemon, ratio = 0.5) => {
  if (!pokemon) return false;
  const currentHp = typeof pokemon.hp === "number" ? pokemon.hp : pokemon.origin?.hp;
  const maxHp = pokemon.origin?.hp ?? pokemon.maxHp ?? currentHp;
  if (typeof currentHp !== "number" || typeof maxHp !== "number" || maxHp <= 0) {
    return false;
  }
  const thresholdRatio = ratio > 1 ? ratio / 100 : ratio;
  return currentHp >= maxHp * thresholdRatio;
};

export const hasHpAtLeast = isHpAtLeast;

// 증강 이름 정렬 비교 함수 (" 로 시작하는 항목은 맨 뒤로 배치)
/**
 * 증강 목록을 가나다순으로 정렬하되, 큰따옴표(")로 시작하는 증강은 맨 마지막에 배치하는 비교 함수
 * @param {Object|string} a - 증강 객체 또는 증강 이름
 * @param {Object|string} b - 증강 객체 또는 증강 이름
 * @returns {number}
 */
export const compareAugmentNames = (a, b) => {
  const nameA = typeof a === "string" ? a : a?.name || "";
  const nameB = typeof b === "string" ? b : b?.name || "";
  const aQuote = nameA.startsWith('"') || nameA.startsWith("“");
  const bQuote = nameB.startsWith('"') || nameB.startsWith("“");

  if (aQuote && !bQuote) return 1;
  if (!aQuote && bQuote) return -1;
  return nameA.localeCompare(nameB, "ko");
};

export const AUGMENT_LIST = [
  // 단순 구현 ==========================================================
  {
    id: "noUnfairMiss",
    name: "억까 방지",
    desc: "명중률이 80% 이상인 기술이 절대 빗나가지 않습니다.",
    cost: 1,
    // accuracyCalculate.js에 구현
  },
  {
    id: "mandoocornEndure",
    name: "슬프게 하지 않게 하려고 버텼다!",
    desc: "기절할 공격을 받을 때 10% 확률로 HP 1로 버팁니다.",
    cost: 1,
    // damege.js의 attackDamage에 구현
  },
  {
    id: "gamblingAddict",
    name: "도박 중독",
    desc: "기술 위력이 3배가 되지만 공격 기술이 50% 확률로 실패합니다.",
    cost: 3,
    // damageCalculate.js, skillCheck.js에 구현
  },
  {
    id: "onePunchMan",
    name: "진심 펀치",
    desc: "공격기술의 위력이 999배 증가합니다.",
    cost: 999,
    // damageCalculate.js에 구현
  },
  {
    id: "dragonHunter",
    name: "용 사냥꾼",
    desc: "드래곤 타입을 상대로 모든 능력치가 1.2배 증가합니다.",
    cost: 3,
    isEligible: (pokemon) => {
      const t1 = pokemon?.type1 || pokemon?.origin?.type1;
      const t2 = pokemon?.type2 || pokemon?.origin?.type2;
      return t1 !== "드래곤" && t2 !== "드래곤";
    },
    // speedCheck.js(speedCalculate), damageCalculate.js에 구현
  },

  {
    id: "unboundChoice",
    name: "구애받지않는",
    desc: "기술 고정 효과를 받지 않습니다.",
    cost: 3,
    isEligible: (pokemon) => Boolean((pokemon?.item && pokemon.item.startsWith("구애")) || pokemon?.abil === "무아지경"),
    onApply: (pokemon) => {
      if (pokemon?.tempStatus) {
        pokemon.tempStatus.onlySkill = null;
      }
    },
    // skillUse에서 스킬 고정 안되게, skillButton에서 사용할수 없다 안나오게 구현
  },
  {
    id: "grandmasChiliOil",
    name: "할머니의 고추기름",
    desc: "상대 포켓몬의 화상 데미지가 5배로 증가합니다.",
    cost: 3,
    isEligible: (pokemon) => {
      // 화상 부가효과가 있는 기수를 지닌 경우에만 등장
      if (!pokemon?.origin?.skill) return false;
      const skills = Object.values(pokemon.origin.skill).filter(Boolean);
      return skills.some((sk) => {
        if (!sk) return false;
        return Array.isArray(sk.skillEffectList) && sk.skillEffectList.some((eff) => eff.name === "화상" || eff.name === "트라이어택");
      });
    },
    // ailmentEvent.js에 구현
  },
  {
    id: "thornmail",
    name: "가시갑옷",
    desc: "타격기술을 받을 때 상대방에게 HP의 1/6 데미지를 줍니다.",
    cost: 3,
    // onHit.js에 구현
  },

  {
    id: "infinityEdge",
    name: "무한의 대검",
    desc: "공격력 🗡️ 75\n치명타 확률 💥 25%\n치명타 피해량 ➕💥 30%",
    cost: 5,
    // 공격력 증가 및 치명타 보정은 damageCalculate.js / skillUse.js에 구현
  },
  {
    id: "rabadonsDeathcap",
    name: "라바돈의 죽음모자",
    desc: "특공 + 130\n총 특공이 30% 증가합니다.",
    cost: 5,
    // damageCalculate.js에 구현
  },
  {
    id: "voidStaff",
    name: "공허의 지팡이",
    desc: "특공 + 95\n상대방의 특수방어를 40% 약하게 만듭니다.",
    cost: 5,
    // damageCalculate.js에 구현
  },
  {
    id: "bladeOfTheRuinedKing",
    name: "몰락한 왕의 검",
    desc: "적의 현재 체력의 9% 만큼 추가 데미지를 입힙니다.",
    cost: 5,
    // damageCalculate.js에 구현
  },
  {
    id: "sunfireAegis",
    name: "태양불꽃방패",
    desc: "매 턴 내 HP의 10%만큼 상대에게 데미지를 줍니다.",
    cost: 5,
    // turnEnd.js에 구현
  },
  {
    id: "swordEnhance",
    name: "검 강화하기",
    desc: "검을 강화하여 강화 단계에 따라 공격과 특수공격을 획득합니다.",
    cost: 1,
    onApply: function (pokemon, battle, options) {
      if (!pokemon) return;
      const level = Number(options?.swordLevel ?? 0);
      const failed = Boolean(options?.swordFailed ?? false);
      const bonusAtk = options?.swordBonusAtk !== undefined ? Number(options.swordBonusAtk) : failed ? 0 : 20 + level * 20;
      const sName = options?.swordName || getSwordEnhanceTier(level).name;

      this.swordLevel = level;
      this.swordFailed = failed;
      this.swordBonusAtk = bonusAtk;
      this.swordName = sName;
      // 공격 및 특수공격 증가 보정은 damageCalculate.js에 구현
    },
  },

  {
    id: "nullifyGetto",
    name: "무효~ 초★럭키-다!",
    desc: "해당 포켓몬에게 무효 타입을 하나 추가합니다.",
    cost: 5,
    onApply: function (pokemon, battle, options) {
      this.selectedType = options?.selectedType;
    },
    // typeEffectCalculate.js에 구현
  },

  {
    id: "rebellionOrRevolution",
    name: "실패하면 반역 성공하면 혁명 아닙니까!",
    desc: "공격과 특수공격 중 하나가 2배가 되고 다른 하나가 절반이 됩니다.",
    cost: 7,
    onApply: function (pokemon, battle, options) {
      if (!pokemon) return;
      const pick = options?.targetStat || (Math.random() < 0.5 ? "atk" : "catk");
      this.revolutionResult = pick;
    },
  },

  // 포켓몬 교체 ============================================================

  {
    id: "rouletteWheel",
    name: "돌려 돌려 돌림판",
    desc: "해당 포켓몬을 임의의 포켓몬과 교체합니다.",
    cost: "-",
    isEligible: (pokemon) => isHpAtLeast(pokemon, 0.5),
    onApply: function (pokemon, battle) {
      const allItems = sampleList.items || [];
      const filtered = allItems.filter((item) => item.id !== pokemon.id);
      if (filtered.length === 0) return;
      const picked = filtered[Math.floor(Math.random() * filtered.length)];
      replacePokemon(pokemon, picked.id, battle, { resetAugments: true });
    },
  },
  /*
  {
    id: "swordAndShield",
    name: "오른손엔 방패 왼손엔 검",
    desc: "공격과 방어 중 더 높은 수치로 두 능력치를 통일합니다.",
    cost: 3,
    getDesc: (pokemon) => {
      const stat = pokemon?.origin?.stat;
      if (stat && typeof stat.atk === "number" && typeof stat.def === "number") {
        const higher = Math.max(stat.atk, stat.def);
        return `공격(${stat.atk})과 방어(${stat.def}) 중 더 높은 수치(${higher})로 두 능력치를 통일합니다.`;
      }
      return "공격과 방어 중 더 높은 수치로 두 능력치를 통일합니다.";
    },
    onApply: (pokemon) => {
      if (!pokemon?.origin?.stat) return;
      const stat = pokemon.origin.stat;
      const higher = Math.max(stat.atk, stat.def);
      stat.atk = higher;
      stat.def = higher;
    },
  },
  {
    id: "specialSwordAndShield",
    name: "오른손엔 방패 왼손엔 스태프",
    desc: "특공과 특방 중 더 높은 수치로 두 능력치를 통일합니다.",
    cost: 3,
    getDesc: (pokemon) => {
      const stat = pokemon?.origin?.stat;
      if (stat && typeof stat.catk === "number" && typeof stat.cdef === "number") {
        const higher = Math.max(stat.catk, stat.cdef);
        return `특공(${stat.catk})과 특방(${stat.cdef}) 중 더 높은 수치(${higher})로 두 능력치를 통일합니다.`;
      }
      return "특공과 특방 중 더 높은 수치로 두 능력치를 통일합니다.";
    },
    onApply: (pokemon) => {
      if (!pokemon?.origin?.stat) return;
      const stat = pokemon.origin.stat;
      const higher = Math.max(stat.catk, stat.cdef);
      stat.catk = higher;
      stat.cdef = higher;
    },
  },
  {
    id: "ksante",
    name: "체력 4700 방어력 329 마저201 인 챔피언👤이 저지불가🚫, 쉴드🛡, 벽🧱 넘기는 거 있고요. 에어본🌪 있고, 심지어 쿨타임은 1️⃣초밖에 안되고 마나🧙♂️는 1️⃣5️⃣ 들고 w는 심지어 변신💫하면 쿨 초기화에다가 패시브는 고정피해🗡가 들어가며 그 다음에 방마저🥋 올리면📈 올릴수록📈 스킬 가속⏰이 생기고! q에 스킬가속⏰이 생기고 스킬 속도🚀가 빨라지고📈 그 다음에 공격력🗡 계수가 있어가지고 W가 그 이익-으아아아악😱",
    desc: "방어과 특방 중 더 높은 수치로 두 능력치를 통일합니다.",
    cost: 4,
    shortName: "그 긴거",
    getDesc: (pokemon) => {
      const stat = pokemon?.origin?.stat;
      if (stat && typeof stat.def === "number" && typeof stat.cdef === "number") {
        const higher = Math.max(stat.def, stat.cdef);
        return `방어(${stat.def})과 특방(${stat.cdef}) 중 더 높은 수치(${higher})로 두 능력치를 통일합니다.`;
      }
      return "방어과 특방 중 더 높은 수치로 두 능력치를 통일합니다.";
    },
    onApply: (pokemon) => {
      if (!pokemon?.origin?.stat) return;
      const stat = pokemon.origin.stat;
      const higher = Math.max(stat.def, stat.cdef);
      stat.def = higher;
      stat.cdef = higher;
      if (pokemon.stat && pokemon.stat !== pokemon.origin.stat) {
        pokemon.stat.def = higher;
        pokemon.stat.cdef = higher;
      }
    },
  },
  {
    id: "hhgghgg",
    name: "H.H.G.G.H.G.G",
    desc: "가장 높은 능력치로 모든 능력치가 통일됩니다.",
    cost: 6,
    getDesc: (pokemon) => {
      const stat = pokemon?.origin?.stat;
      if (stat) {
        const values = [stat.atk, stat.def, stat.catk, stat.cdef, stat.speed].filter((v) => typeof v === "number");
        if (values.length > 0) {
          const higher = Math.max(...values);
          return `가장 높은 능력치(${higher})로 모든 능력치가 통일됩니다.`;
        }
      }
      return "가장 높은 능력치로 모든 능력치가 통일됩니다.";
    },
    onApply: (pokemon) => {
      if (!pokemon?.origin?.stat) return;
      const stat = pokemon.origin.stat;
      const values = [stat.atk, stat.def, stat.catk, stat.cdef, stat.speed].filter((v) => typeof v === "number");
      if (values.length === 0) return;
      const higher = Math.max(...values);
      stat.atk = higher;
      stat.def = higher;
      stat.catk = higher;
      stat.cdef = higher;
      stat.speed = higher;
    },
  },
  */

  {
    id: "teraBlast",
    name: "테라버스트",
    desc: "현재 기술 중 하나를 원하는 타입의 테라버스트로 교체합니다.",
    cost: 1,
    onApply: function (pokemon, battle, options) {
      if (!pokemon?.origin?.skill) return;
      const slot = Number(options?.replaceSlot) || 4;
      const chosenType = options?.selectedType || "노말";
      const prevSkill = pokemon.origin.skill[slot] || pokemon.skill?.[slot];
      const prevSkillName = options?.replacedSkillName || prevSkill?.name || "기존 기술";

      this.replacedSlot = slot;
      this.selectedType = chosenType;
      this.replacedSkillName = prevSkillName;

      const baseTera = skillList.search("테라버스트");
      const teraBlast = {
        ...baseTera,
        type: chosenType,
        skillNumber: slot,
      };

      pokemon.origin.skill[slot] = teraBlast;
      if (pokemon.pp) {
        pokemon.pp[slot] = teraBlast.pp;
      }
    },
  },

  // 특정 포켓몬 전용 증강 ==========================================================================
  {
    id: "nameIsSalamence",
    name: "그리고 쓰는 기술은 지진이 있다",
    desc: "보  만  다  !!\n  지   진",
    cost: 0,
    shiftUp: true,
    imageOptions: { shiftUp: true, offsetY: -5.5, scale: 1.15 },
    isEligible: (pokemon) => hasPokemonName(pokemon, "보만다") && !hasSkill(pokemon, "지진"),
    onApply: function (pokemon, battle, options) {
      if (!pokemon?.origin?.skill) return;
      const slot = Number(options?.replaceSlot) || 4;
      this.replacedSlot = slot;
      const earthquake = { ...skillList.search("지진"), skillNumber: slot };
      pokemon.origin.skill[slot] = earthquake;
      if (pokemon.pp) {
        pokemon.pp[slot] = earthquake.pp;
      }
    },
  },
  {
    id: "danceOfGarchomp",
    name: "춤춰라 한카리아스",
    desc: '지니고 있는 기술 중 하나를 "용의춤"으로 변경합니다.',
    cost: 0,
    isEligible: (pokemon) => hasPokemonName(pokemon, "한카리아스") && !hasSkill(pokemon, "용의춤"),
    onApply: function (pokemon, battle, options) {
      if (!pokemon?.origin?.skill) return;
      const slot = Number(options?.replaceSlot) || 4;
      this.replacedSlot = slot;
      const dDance = { ...skillList.search("용의춤"), skillNumber: slot };
      pokemon.origin.skill[slot] = dDance;
      if (pokemon.pp) {
        pokemon.pp[slot] = dDance.pp;
      }
    },
  },
  // "메가" 플라이곤 (메가플라이곤 교체) =========================================
  {
    id: "soaring",
    name: '"메가" 플라이곤',
    desc: "현재 포켓몬을 메가플라이곤과 교체합니다.",
    cost: "-",
    shiftUp: true,
    imageOptions: { shiftUp: true, offsetY: -3.5, scale: 1.15 },
    isEligible: (pokemon, battleOrTeam, team) => isHpAtLeast(pokemon, 0.5) && !hasPokemonNameOnTeam(pokemon, "플라이곤", battleOrTeam || team),
    onApply: function (pokemon, battle) {
      replacePokemon(pokemon, "메가플라이곤", battle, { excludeAugmentId: "soaring" });
    },
  },
  // 전설의 거인 관련 ==========================================================
  {
    id: "legendaryTitan",
    name: "전설의 거인",
    desc: "현재 포켓몬을 레지기가스와 교체합니다. 특성과 관련된 증강을 추가로 획득합니다.",
    cost: "-",
    shiftUp: true,
    imageOptions: { shiftUp: true, offsetY: -5, scale: 1.15 },
    isEligible: (pokemon, battleOrTeam, team) => isHpAtLeast(pokemon, 0.5) && !hasPokemonNameOnTeam(pokemon, "레지기가스", battleOrTeam || team),
    onApply: function (pokemon, battle) {
      replacePokemon(pokemon, "레지기가스", battle, { excludeAugmentId: "legendaryTitan" });
    },
  },
  {
    id: "nimbleMoves",
    name: "민첩한 몸놀림",
    desc: "랜덤한 기술 하나에 우선도 +1을 추가합니다.",
    cost: 7,
    onApply: function (pokemon, battle, options) {
      if (!pokemon?.origin?.skill) return;
      const validSlots = [1, 2, 3, 4].filter((slot) => pokemon.origin.skill[slot]);
      if (validSlots.length === 0) return;

      let targetSlot = options?.targetSlot;
      if (options?.enhancedSkillName) {
        const foundSlot = validSlots.find((s) => pokemon.origin.skill[s]?.name === options.enhancedSkillName);
        if (foundSlot) targetSlot = foundSlot;
      }
      if (!targetSlot || !pokemon.origin.skill[targetSlot]) {
        targetSlot = validSlots[Math.floor(Math.random() * validSlots.length)];
      }

      const targetSkill = pokemon.origin.skill[targetSlot];
      if (!targetSkill) return;

      const currentPrior = typeof targetSkill.prior === "number" ? targetSkill.prior : 0;

      const enhancedSkill = {
        ...targetSkill,
        prior: currentPrior + 1,
        nimbleMoves: true,
      };

      pokemon.origin.skill[targetSlot] = enhancedSkill;
      if (pokemon.skill && pokemon.skill[targetSlot]) {
        pokemon.skill[targetSlot] = enhancedSkill;
      }

      this.targetSlot = targetSlot;
      this.enhancedSkillName = targetSkill.name;
    },
  },
  {
    id: "recovery",
    name: "회복",
    desc: "매턴 최대 HP의 1/16만큼 회복합니다.",
    cost: 5,
  },
  {
    id: "threeSnails",
    name: "달팽이 세마리",
    desc: "공격 후 적에게 추가 고정 데미지를 입힙니다.",
    cost: 5,
  },
  {
    id: "echoOfHero",
    name: "영웅의 메아리",
    desc: "아군 모든 포켓몬의 공격과 특공을 40% 상승시킨다.",
    buf: true,
    isRandom: false,
    isEligible: (pokemon) => !pokemon?.hasAugment?.("echoOfHero"),
    onApply: function (pokemon, battle) {
      if (battle) {
        const team = pokemon.team === "npc" ? [battle.npc, battle.npcBench1, battle.npcBench2] : [battle.player, battle.playerBench1, battle.playerBench2];
        team.filter(Boolean).forEach((p) => {
          p.hasEchoOfHeroBuff = true;
        });
      } else if (pokemon) {
        pokemon.hasEchoOfHeroBuff = true;
      }
    },
  },
  // 무한 다이맥스 (무한다이노 전용) =============================================
  {
    id: "eternamax",
    name: "무한 다이맥스",
    desc: "무한 다이맥스 상태가 됩니다.",
    cost: 10,
    shiftUp: false,
    imageOptions: { shiftUp: false, offsetY: 2.5, scale: 1.02 },
    isEligible: (pokemon) => hasPokemonName(pokemon, "무한다이노") && !pokemon?.hasAugment?.("eternamax"),
    onApply: function (pokemon) {
      applyEternamax(pokemon);
    },
  },
  {
    id: "hugePower",
    name: "천하장사",
    desc: "현재 포켓몬의 특성을 천하장사로 변경합니다.\n물리기술의 위력이 2배가 됩니다.",
    cost: 7,
    isEligible: (pokemon) => pokemon?.abil !== "천하장사",
    onApply: (pokemon) => {
      changePokemonAbility(pokemon, "천하장사");
    },
  },
  {
    id: "fastStarter",
    name: "패스트스타트",
    desc: "현재 포켓몬의 특성을 패스트스타트로 변경합니다.\n전투에 나오고 5턴 뒤 공격과 스피드가 2배가 됩니다.",
    cost: 1,
    shiftUp: true,
    imageOptions: { shiftUp: true, offsetY: -5, scale: 1.15 },
    isEligible: (pokemon) => hasPokemonName(pokemon, "레지기가스"),
    onApply: (pokemon) => {
      changePokemonAbility(pokemon, "패스트스타트");
    },
  },
  {
    id: "randomAbility",
    name: "랜덤 특성",
    desc: "현재 포켓몬의 특성을 랜덤으로 변경합니다.",
    cost: 3,
    onApply: function (pokemon, battle, options) {
      const picked =
        options?.pickedAbility ||
        (() => {
          const pool = Object.keys(abilObject).filter((a) => !noRandomAbil.includes(a) && a !== pokemon.abil);
          return pool[Math.floor(Math.random() * pool.length)];
        })();
      changePokemonAbility(pokemon, picked);
      this.pickedAbility = picked;
    },
  },
];

// 무한 다이맥스 변환 함수
/**
 * 무한다이노를 무한 다이맥스 상태로 변환하는 함수
 * 종족값: 255 / 115 / 250 / 125 / 250 / 130
 * 이미지: 0890-m.webp
 * 체력 종족값 증가 시 현재 체력 % 비율 유지
 * @param {Object} pokemon
 */
export const applyEternamax = (pokemon) => {
  if (!pokemon) return;

  const baseStats = {
    hp: 255,
    atk: 115,
    def: 250,
    catk: 125,
    cdef: 250,
    speed: 130,
  };

  const origin = pokemon.origin || pokemon;
  const evs = origin.evs || { hp: 4, atk: 0, def: 0, catk: 252, cdef: 0, speed: 252 };
  const gacha = origin.gacha || "5V0A";
  const nature = origin.nature || { up: "speed", down: "atk" };

  const gachaStats = {
    "6V": ["hp", "atk", "def", "catk", "cdef", "speed"],
    "5V0S": ["hp", "atk", "def", "catk", "cdef"],
    "5V0A": ["hp", "def", "catk", "cdef", "speed"],
    "4V0A0S": ["hp", "def", "catk", "cdef"],
  };

  // 1. HP 계산
  const evHp = evs.hp ?? 0;
  const ivHp = gachaStats[gacha]?.includes("hp") !== false ? 31 : 0;
  const newMaxHp = Math.floor((baseStats.hp * 2 + Math.floor(evHp / 4) + ivHp) / 2) + 60;

  // 현재 체력 비율 유지 (예: 반피면 50% 유지)
  const oldMaxHp = origin.hp ?? pokemon.hp ?? newMaxHp;
  const oldHp = typeof pokemon.hp === "number" ? pokemon.hp : oldMaxHp;
  const hpRatio = oldMaxHp > 0 ? Math.max(0, Math.min(1, oldHp / oldMaxHp)) : 1;
  const newHp = Math.min(newMaxHp, Math.max(oldHp > 0 ? 1 : 0, Math.round(newMaxHp * hpRatio)));

  origin.hp = newMaxHp;
  pokemon.hp = newHp;

  // 2. 공격/방어/특공/특방/스피드 계산
  const newStats = {};
  ["atk", "def", "catk", "cdef", "speed"].forEach((statKey) => {
    const baseVal = baseStats[statKey];
    const evVal = evs[statKey] ?? 0;
    const hasIv = gachaStats[gacha] ? gachaStats[gacha].includes(statKey) : true;
    const ivVal = hasIv ? 31 : 0;
    let val = Math.floor((baseVal * 2 + Math.floor(evVal / 4) + ivVal) / 2) + 5;
    if (nature?.up === statKey) val = Math.floor(val * 1.1);
    if (nature?.down === statKey) val = Math.floor(val * 0.9);
    newStats[statKey] = val;
  });

  origin.stat = { ...origin.stat, ...newStats };
  if (pokemon.stat) {
    pokemon.stat = { ...pokemon.stat, ...newStats };
  }

  // 3. 이미지 및 ID 변경 (0890-m.webp)
  origin.pokemon_id = "0890-m";
  pokemon.pokemon_id = "0890-m";
  origin.baseStats = baseStats;
  pokemon.isEternamax = true;
};

// 포켓몬 교체 공통 함수
/**
 * 증강 등에서 포켓몬을 다른 포켓몬으로 교체/변경하는 공통 함수
 * @param {Object} pokemon - 교체 대상 기존 포켓몬 인스턴스
 * @param {string|Object} newPokemonOrId - 새로 교체될 포켓몬 ID/이름 또는 인스턴스
 * @param {Object} [battle] - 현재 배틀 객체 (선택)
 * @param {Object} [options] - 옵션 ({ resetAugments?: boolean, excludeAugmentId?: string })
 * @returns {Object} 교체된 포켓몬 인스턴스
 */
export const replacePokemon = (pokemon, newPokemonOrId, battle, options = {}) => {
  if (!pokemon) return null;
  const newPoke = typeof newPokemonOrId === "string" ? generate(newPokemonOrId) : newPokemonOrId;
  if (!newPoke) return pokemon;

  newPoke.team = pokemon.team || "player";
  newPoke.originalIndex = pokemon.originalIndex !== undefined ? pokemon.originalIndex : 0;

  // 증강 처리: resetAugments가 true이면 빈 배열, 아니면 즉발/제외 대상 필터링
  if (options?.resetAugments) {
    newPoke.augments = [];
  } else {
    const excludeId = options?.excludeAugmentId;
    newPoke.augments = (pokemon.augments || []).filter((a) => a && (excludeId ? a.id !== excludeId : true) && a.cost !== "-");
  }

  // 기존 pokemon 객체 참조를 유지하도록 인스턴스 프로토타입 및 속성 복사
  Object.setPrototypeOf(pokemon, Object.getPrototypeOf(newPoke));
  Object.assign(pokemon, newPoke);
  pokemon.augments = newPoke.augments;

  // 배틀 내 슬롯 교체 (단일 인스턴스 참조 유지)
  if (battle) {
    const targetIdx = pokemon.originalIndex;
    if (battle.player === pokemon || (targetIdx !== undefined && battle.player?.originalIndex === targetIdx)) {
      battle.player = pokemon;
    } else if (battle.playerBench1 === pokemon || (targetIdx !== undefined && battle.playerBench1?.originalIndex === targetIdx)) {
      battle.playerBench1 = pokemon;
    } else if (battle.playerBench2 === pokemon || (targetIdx !== undefined && battle.playerBench2?.originalIndex === targetIdx)) {
      battle.playerBench2 = pokemon;
    } else if (battle.npc === pokemon || (targetIdx !== undefined && battle.npc?.originalIndex === targetIdx)) {
      battle.npc = pokemon;
    } else if (battle.npcBench1 === pokemon || (targetIdx !== undefined && battle.npcBench1?.originalIndex === targetIdx)) {
      battle.npcBench1 = pokemon;
    } else if (battle.npcBench2 === pokemon || (targetIdx !== undefined && battle.npcBench2?.originalIndex === targetIdx)) {
      battle.npcBench2 = pokemon;
    }
  }

  return pokemon;
};

export const replacePokemonInBattle = replacePokemon;

// 포켓몬 이름 확인
export const hasPokemonName = (pokemon, keyword) => {
  if (!pokemon || !keyword) return false;
  const name = pokemon.origin?.name || pokemon.name || pokemon.id || "";
  return name.includes(keyword);
};

// 팀 내 특정 포켓몬 존재 여부 확인
export const hasPokemonNameOnTeam = (target, keyword, context = null) => {
  if (!keyword) return false;

  // 1. target이 팀 포켓몬 배열인 경우
  if (Array.isArray(target)) {
    return target.some((p) => p && hasPokemonName(p, keyword));
  }

  // 2. context가 팀 포켓몬 배열인 경우
  if (Array.isArray(context)) {
    return context.some((p) => p && hasPokemonName(p, keyword));
  }

  // 3. context가 배틀 객체인 경우
  const checkBattleMembers = (battleObj, teamSide) => {
    if (!battleObj || typeof battleObj !== "object") return false;
    const isPlayer = teamSide !== "npc";
    const members = isPlayer ? [battleObj.player, battleObj.playerBench1, battleObj.playerBench2] : [battleObj.npc, battleObj.npcBench1, battleObj.npcBench2];
    return members.filter(Boolean).some((p) => hasPokemonName(p, keyword));
  };

  if (context && typeof context === "object") {
    if (context.player || context.npc) {
      const teamSide = target?.team || "player";
      if (checkBattleMembers(context, teamSide)) return true;
    }
  }

  // 4. target 자체가 배틀 객체인 경우
  if (target && typeof target === "object" && (target.player || target.npc)) {
    if (checkBattleMembers(target, "player") || checkBattleMembers(target, "npc")) return true;
  }

  // 5. target._team 또는 target.team이 포켓몬 배열인 경우
  if (Array.isArray(target?._team)) {
    return target._team.some((p) => p && hasPokemonName(p, keyword));
  }
  if (Array.isArray(target?.team)) {
    return target.team.some((p) => p && hasPokemonName(p, keyword));
  }

  // 6. 단일 포켓몬 검사 (fallback)
  if (target) {
    return hasPokemonName(target, keyword);
  }

  return false;
};

// 특정 기술 보유 여부 확인
export const hasSkill = (pokemon, skillName) => {
  if (!pokemon || !skillName) return false;
  const skills = pokemon.origin?.skill || pokemon.skill;
  if (!skills) return false;
  return [1, 2, 3, 4].some((slot) => {
    const sk = skills[slot] || skills[String(slot)];
    return sk?.name === skillName;
  });
};

// 증강 텍스트 생성 단일 통합 함수
export const getAugmentText = (selectedAugment, target, isTextScreen = false, prevPokeName = "", options = null) => {
  if (!selectedAugment) return "";
  const id = selectedAugment.id;
  const names = target ? target.names || josa(`${target.name || "포켓몬"}#{은}`) : "포켓몬은";

  // 특수 증강 목록 체크 (개별 desc 생성)
  let individualDesc = null;

  if (id === "rouletteWheel") {
    const fromName = prevPokeName || target?.name || "포켓몬";
    const toName = target?.name || "";
    individualDesc = josa(`${fromName}#{이} ${toName}#{으로} 교체되었다!`);
  } else if (id === "soaring") {
    const fromName = prevPokeName || "포켓몬";
    individualDesc = josa(`${fromName}#{이} 메가플라이곤으로 교체되었다!`);
  } else if (id === "legendaryTitan") {
    const fromName = prevPokeName || "포켓몬";
    individualDesc = josa(`${fromName}#{이} 레지기가스로 교체되었다!`);
  } else if (id === "nimbleMoves") {
    const nimbleAug = target?.augments?.find((a) => a.id === "nimbleMoves") || selectedAugment;
    const skillName = options?.enhancedSkillName || nimbleAug?.enhancedSkillName;
    if (skillName) {
      individualDesc = `${skillName}의 우선도가 1 증가했다!`;
    }
  } else if (id === "eternamax") {
    individualDesc = josa(`${target?.name || "무한다이노"}#{이} 무한 다이맥스 상태가 되었다!`);
  } else if (id === "swordEnhance") {
    const swordAug = target?.augments?.find((a) => a.id === "swordEnhance") || selectedAugment;
    const hasResult = options?.swordFailed !== undefined || options?.swordBonusAtk !== undefined || swordAug?.swordFailed !== undefined || swordAug?.swordBonusAtk !== undefined;
    if (hasResult) {
      const failed = Boolean(options?.swordFailed ?? swordAug?.swordFailed);
      const level = Number(options?.swordLevel ?? swordAug?.swordLevel ?? 0);
      const bonusAtk = options?.swordBonusAtk !== undefined ? Number(options.swordBonusAtk) : swordAug?.swordBonusAtk !== undefined ? Number(swordAug.swordBonusAtk) : failed ? 0 : 20 + level * 20;
      individualDesc = failed ? "강화에 실패하였다..." : `검 강화 성공하여 공격과 특수공격을 ${bonusAtk} 얻었다!`;
    }
  } else if (id === "randomAbility") {
    const randomAug = target?.augments?.find((a) => a.id === "randomAbility");
    const abilName = options?.pickedAbility || selectedAugment?.pickedAbility || randomAug?.pickedAbility || (randomAug ? target?.abil : "");
    if (abilName) {
      const pokeName = target?.name || "포켓몬";
      individualDesc = `${pokeName}의 특성이 ${josa(`${abilName}#{으로}`)} 바뀌었다!`;
    }
  } else if (id === "rebellionOrRevolution") {
    const revAug = target?.augments?.find((a) => a.id === "rebellionOrRevolution") || selectedAugment;
    const pick = options?.targetStat || revAug?.revolutionResult;
    if (pick === "atk") {
      individualDesc = "공격이 2배, 특수공격이 절반이 되었다!";
    } else if (pick === "catk") {
      individualDesc = "특수공격이 2배, 공격이 절반이 되었다!";
    } else if (isTextScreen) {
      individualDesc = "공격이 2배, 특수공격이 절반이 되었다!";
    }
  } else if (id === "nullifyGetto") {
    const nullType = options?.selectedType || selectedAugment?.selectedType || target?.augments?.find((a) => a.id === "nullifyGetto")?.selectedType || target?._nullifyType || "";
    if (nullType) {
      individualDesc = `${names} ${nullType} 타입 무효 효과를 얻었다!`;
    }
  } else if (id === "teraBlast") {
    const teraAug = target?.augments?.find((a) => a.id === "teraBlast") || selectedAugment;
    const chosenType = options?.selectedType || teraAug?.selectedType || "";
    if (chosenType) {
      individualDesc = `${names} ${chosenType} 타입 테라버스트를 얻었다!`;
    }
  }

  const foundInList = AUGMENT_LIST.find((a) => a.id === id);
  const isBuf = Boolean(selectedAugment?.buf || foundInList?.buf);
  if (isBuf) {
    if (isTextScreen) {
      if (id === "echoOfHero") {
        return `3개의 증강이 공명하여 "영웅의 메아리" 버프를 얻었다!`;
      }
      const displayAugName = selectedAugment?.shortName || selectedAugment?.name || foundInList?.shortName || foundInList?.name || "";
      return `${names} "${displayAugName}" 버프를 얻었다!`;
    }
    const applied = target?.augments?.find((a) => a.id === id);
    return applied?.desc || selectedAugment?.desc || foundInList?.desc || "";
  }

  // 특수 증강인 경우 (individualDesc 가 존재하는 경우)
  if (individualDesc !== null) {
    return isTextScreen ? `[증강] ${individualDesc}` : individualDesc;
  }

  // 일반 증강인 경우
  if (isTextScreen) {
    const displayAugName = selectedAugment.shortName || selectedAugment.name;
    return `[증강] ${names} "${displayAugName}" 효과를 얻었다!`;
  } else {
    const applied = target?.augments?.find((a) => a.id === id);
    return applied?.desc || selectedAugment.desc || "";
  }
};

// 호환성 별칭 함수
export const getAugmentGainText = (selectedAugment, target, prevPokeName = "", options = null) => getAugmentText(selectedAugment, target, true, prevPokeName, options);

export const getAugmentLogDesc = (selectedAugment, target, prevPokeName = "", options = null) => getAugmentText(selectedAugment, target, false, prevPokeName, options);

export const getAugmentDesc = (augment, pokemon = null) => {
  if (!augment) return "";
  const stat = pokemon?.origin?.stat;

  if (augment.id === "swordAndShield") {
    if (stat && typeof stat.atk === "number" && typeof stat.def === "number") {
      return `공격(${stat.atk})과 방어(${stat.def}) 중 더 높은 수치로 두 능력치를 통일합니다.`;
    }
    return "공격과 방어 중 더 높은 수치로 두 능력치를 통일합니다.";
  }

  if (augment.id === "specialSwordAndShield") {
    if (stat && typeof stat.catk === "number" && typeof stat.cdef === "number") {
      return `특공(${stat.catk})과 특방(${stat.cdef}) 중 더 높은 수치로 두 능력치를 통일합니다.`;
    }
    return "특공과 특방 중 더 높은 수치로 두 능력치를 통일합니다.";
  }

  if (augment.id === "ksante") {
    if (stat && typeof stat.def === "number" && typeof stat.cdef === "number") {
      return `방어(${stat.def})과 특방(${stat.cdef}) 중 더 높은 수치로 두 능력치를 통일합니다.`;
    }
    return "방어과 특방 중 더 높은 수치로 두 능력치를 통일합니다.";
  }

  if (augment.id === "hhgghgg") {
    if (stat) {
      const values = [stat.atk, stat.def, stat.catk, stat.cdef, stat.speed].filter((v) => typeof v === "number");
      if (values.length > 0) {
        const higher = Math.max(...values);
        return `가장 높은 능력치(${higher})로 모든 능력치가 통일됩니다.`;
      }
    }
    return "가장 높은 능력치로 모든 능력치가 통일됩니다.";
  }

  if (augment.id === "teraBlast") {
    return "현재 기술 중 하나를 원하는 타입의 테라버스트로 교체합니다.";
  }

  if (augment.id === "rabadonsDeathcap") {
    return "특공 + 130\n총 특공이 30% 증가합니다.";
  }

  if (augment.id === "voidStaff") {
    return "특공 + 95\n상대방의 특수방어를 40% 약하게 만듭니다.";
  }

  if (augment.id === "infinityEdge") {
    return "공격력 🗡️ 75\n치명타 확률 💥 25%\n치명타 피해량 ➕💥 30%";
  }

  if (augment.id === "swordEnhance") {
    return "검을 강화하여 강화 단계에 따라 공격과 특수공격을 증가시킵니다.";
  }

  if (augment.id === "rebellionOrRevolution" || augment.id === "revolution") {
    if (stat && typeof stat.atk === "number" && typeof stat.catk === "number") {
      const atk = getAugmentedStat ? getAugmentedStat(pokemon, "atk") : stat.atk;
      const catk = getAugmentedStat ? getAugmentedStat(pokemon, "catk") : stat.catk;
      return `공격(${atk})과 특수공격(${catk}) 중 하나가 2배가 되고 다른 하나가 절반이 됩니다.`;
    }
    return "공격과 특수공격 중 하나가 2배가 되고 다른 하나가 절반이 됩니다.";
  }

  if (augment.id === "nullifyGetto") {
    const chosen = augment.selectedType || pokemon?._nullifyType;
    if (chosen) {
      return `해당 포켓몬에게 [${chosen}] 무효 타입을 추가했습니다.`;
    }
    return "해당 포켓몬에게 무효 타입을 하나 추가합니다.";
  }

  if (typeof augment.getDesc === "function") {
    return augment.getDesc(pokemon);
  }
  if (typeof augment.desc === "function") {
    return augment.desc(pokemon);
  }
  return augment.desc || "";
};

export { changePokemonAbility, changeAbility };

export const isBuffAugment = (augment) => {
  if (!augment) return false;
  if (typeof augment === "object" && augment.buf) return true;
  const id = typeof augment === "string" ? augment : augment.id;
  const found = AUGMENT_LIST.find((a) => a.id === id);
  return Boolean(found?.buf);
};
