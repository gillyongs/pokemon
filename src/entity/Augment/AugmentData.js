import { abilObject, noRandomAbil, changePokemonAbility, changeAbility } from "../Ability";
import { josa } from "josa";
import { getAugmentedStat, getHighestStatInfo, STAT_LABELS } from "../../util/getStat";
import { isPokemonAlone } from "../../util/speedCheck";
import { getMultiplier } from "../../function/rankStat";
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

// 역할군 및 능력치 분류 (탱커 / 어태커 / 물리 / 특수)
export const ATTACKER_ROLES = ["물리어태커", "물리딜탱", "특수어태커", "특수딜탱"];
export const TANK_ROLES = ["막이", "물리막이", "특수막이"];
export const EXCLUDED_STAT_TYPE_SKILLS = ["지구던지기", "속임수", "바디프레스"];

export const getPokemonRole = (pokemon) => pokemon?.origin?.role || pokemon?.role || "";
export const getPokemonBaseStats = (pokemon) => pokemon?.origin?.stat || pokemon?.stat || null;
export const getPokemonActiveSkills = (pokemon) => {
  const skills = pokemon?.origin?.skill || pokemon?.skill;
  if (!skills) return [];
  if (Array.isArray(skills)) {
    return skills.slice(0, 4).filter((sk) => sk && sk.name !== "발버둥");
  }
  return [1, 2, 3, 4].map((slot) => skills[slot] || skills[String(slot)]).filter((sk) => sk && sk.name !== "발버둥");
};
export const isAttackerPokemon = (pokemon) => ATTACKER_ROLES.includes(getPokemonRole(pokemon));
export const isTankPokemon = (pokemon) => TANK_ROLES.includes(getPokemonRole(pokemon));
export const isPhysicalPokemon = (pokemon) => {
  const stat = getPokemonBaseStats(pokemon);
  if (!stat || typeof stat.atk !== "number" || typeof stat.catk !== "number") return false;
  if (!(stat.atk > stat.catk)) return false;
  return getPokemonActiveSkills(pokemon).some((sk) => {
    const stype = sk?.name === "테라버스트" && stat.atk > stat.catk ? "atk" : sk?.stype;
    return stype === "atk" && !EXCLUDED_STAT_TYPE_SKILLS.includes(sk?.name);
  });
};
export const isSpecialPokemon = (pokemon) => {
  const stat = getPokemonBaseStats(pokemon);
  if (!stat || typeof stat.atk !== "number" || typeof stat.catk !== "number") return false;
  if (!(stat.catk > stat.atk)) return false;
  return getPokemonActiveSkills(pokemon).some((sk) => {
    return sk?.stype === "catk" && !EXCLUDED_STAT_TYPE_SKILLS.includes(sk?.name);
  });
};

// 상호 배타적 능력치 전환 증강 (하나라도 보유하면 나머지는 등장하지 않음)
export const STAT_SWAP_AUGMENTS = ["swordAndShield", "specialSwordAndShield", "ksante", "hhgghgg"];
const canPickStatSwapAugment = (pokemon) => !STAT_SWAP_AUGMENTS.some((id) => pokemon?.hasAugment?.(id));

// 도박 중독 시 해금 및 확정 등장하는 도박 증강 ID 목록
export const GAMBLE_BONUS_AUGMENT_IDS = ["russianRoulette", "oddEven", "doOrDie", "highRiskHighReturn"];

const getBattleFromContext = (battleOrTeam, teamArg = null) => {
  if (battleOrTeam && typeof battleOrTeam === "object" && !Array.isArray(battleOrTeam) && (battleOrTeam.player || battleOrTeam.npc)) {
    return battleOrTeam;
  }
  if (teamArg && typeof teamArg === "object" && !Array.isArray(teamArg) && (teamArg.player || teamArg.npc)) {
    return teamArg;
  }
  return null;
};

export const hasGamblingAddict = (pokemon, battleOrTeam = null, teamArg = null) => {
  const side = pokemon?.team === "npc" ? "npc" : "player";
  const battle = getBattleFromContext(battleOrTeam, teamArg);
  const battleMembers = battle
    ? side === "npc"
      ? [battle.npc, battle.npcBench1, battle.npcBench2]
      : [battle.player, battle.playerBench1, battle.playerBench2]
    : [];
  const arrayMembers = Array.isArray(teamArg) ? teamArg : Array.isArray(battleOrTeam) ? battleOrTeam : [];
  const candidates = [pokemon, ...battleMembers, ...arrayMembers].filter(Boolean);
  return candidates.some((p) => p.hasAugment?.("gamblingAddict"));
};

export const AUGMENT_LIST = [
  // 단순 구현 ==========================================================
  {
    id: "noUnfairMiss",
    name: "억까 방지",
    desc: "명중률이 80% 이상인 기술이 절대 빗나가지 않습니다.",
    cost: 1,
    weight: 100,
    //명중률이 80~99인 기술이 존재할 때만 등장
    isEligible: (pokemon) => getPokemonActiveSkills(pokemon).some((sk) => typeof sk?.accur === "number" && sk.accur >= 80 && sk.accur <= 99),
    // accuracyCalculate.js에 구현
  },
  {
    id: "mandoocornEndure",
    name: "슬프게 하지 않게 하려고 버텼다!",
    desc: "기절할 공격을 받을 때 10% 확률로 HP 1로 버팁니다.",
    cost: 1,
    weight: 100,
    // damege.js의 attackDamage에 구현
  },
  {
    id: "lifeIsOneShot",
    name: "인생은 한방",
    desc: "기술 위력이 3배가 되지만 공격 기술이 50% 확률로 실패합니다.",
    cost: 3,
    weight: 100,
    // damageCalculate.js, skillCheck.js에 구현
  },
  {
    id: "onePunchMan",
    name: "진심 펀치",
    desc: "공격기술의 위력이 999배 증가합니다.",
    cost: 999,
    weight: 10,
    // damageCalculate.js에 구현
  },
  {
    id: "dragonHunter",
    name: "용 사냥꾼",
    desc: "드래곤 타입을 상대로 모든 능력치가 1.2배 증가합니다.",
    cost: 3,
    weight: 100,
    isEligible: (pokemon) => {
      const t1 = pokemon?.type1 || pokemon?.origin?.type1;
      const t2 = pokemon?.type2 || pokemon?.origin?.type2;
      return t1 !== "드래곤" && t2 !== "드래곤";
    },
    // speedCheck.js(speedCalculate), damageCalculate.js에 구현
  },
  {
    id: "dragonSlayer",
    name: "드래곤 슬레이어",
    desc: "드래곤 타입 포켓몬을 쓰러뜨리면 모든 능력이 1랭크 상승합니다.",
    cost: 3,
    weight: 100,
    isEligible: (pokemon) => {
      const t1 = pokemon?.type1 || pokemon?.origin?.type1;
      const t2 = pokemon?.type2 || pokemon?.origin?.type2;
      return t1 !== "드래곤" && t2 !== "드래곤";
    },
    // damage.js에 구현
  },
  {
    id: "dragonKiller",
    name: "용살자",
    desc: "드래곤 타입에게 1.5배 데미지를 입힙니다.",
    cost: 3,
    weight: 100,
    isEligible: (pokemon) => {
      const t1 = pokemon?.type1 || pokemon?.origin?.type1;
      const t2 = pokemon?.type2 || pokemon?.origin?.type2;
      return t1 !== "드래곤" && t2 !== "드래곤";
    },
    // damageCalculate.js에 구현
  },
  {
    id: "lastWarrior",
    name: "최후의 전사",
    desc: "해당 포켓몬이 마지막에 홀로 남았을 경우 스피드가 60% 증가합니다.",
    cost: 6,
    weight: 100,
    // speedCheck.js(speedCalculate)에 구현
  },
  {
    id: "lastSamurai",
    name: "라스트 사무라이",
    desc: "해당 포켓몬이 마지막에 홀로 남았을 경우 공격과 특수공격이 60% 증가합니다.",
    cost: 5,
    weight: 100,
    // damageCalculate.js에 구현
  },
  {
    id: "lastManStanding",
    name: "라스트 맨 스탠딩",
    desc: "해당 포켓몬이 마지막에 홀로 남았을 경우 방어와 특수방어가 60% 증가합니다.",
    cost: 3,
    weight: 100,
    // damageCalculate.js에 구현
  },

  {
    id: "unboundChoice",
    name: "구애받지않는",
    desc: "기술 고정 효과를 받지 않습니다.",
    cost: 3,
    weight: 300,
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
    weight: 100,
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
    desc: "적에게 공격을 받을 때 상대방에게 최대 HP의 1/8 데미지를 입힙니다.",
    cost: 3,
    weight: (pokemon) => (isTankPokemon(pokemon) ? 200 : 30),
    // onHit.js에 구현
  },

  {
    id: "infinityEdge",
    name: "무한의 대검",
    desc: "공격력 🗡️ 75\n치명타 확률 💥 25%\n치명타 피해량 ➕💥 30%",
    cost: 5,
    weight: (pokemon) => (isTankPokemon(pokemon) ? 30 : 100),
    isEligible: (pokemon) => isPhysicalPokemon(pokemon),
    // 공격력 증가 및 치명타 보정은 damageCalculate.js / skillUse.js에 구현
  },
  {
    id: "rabadonsDeathcap",
    name: "라바돈의 죽음모자",
    desc: "특공 + 130\n총 특공이 30% 증가합니다.",
    cost: 5,
    weight: (pokemon) => (isTankPokemon(pokemon) ? 30 : 100),
    isEligible: (pokemon) => isSpecialPokemon(pokemon),
    // damageCalculate.js에 구현
  },
  {
    id: "voidStaff",
    name: "공허의 지팡이",
    desc: "특공 + 95\n상대방의 특수방어를 40% 약하게 만듭니다.",
    cost: 5,
    weight: (pokemon) => (isTankPokemon(pokemon) ? 30 : 100),
    isEligible: (pokemon) => isSpecialPokemon(pokemon),
    // damageCalculate.js에 구현
  },
  {
    id: "bladeOfTheRuinedKing",
    name: "몰락한 왕의 검",
    desc: "적의 현재 체력의 9% 만큼 추가 데미지를 입힙니다.",
    cost: 5,
    weight: (pokemon) => (isTankPokemon(pokemon) ? 30 : 100),
    isEligible: (pokemon) => isPhysicalPokemon(pokemon),
    // damageCalculate.js에 구현
  },
  {
    id: "sunfireAegis",
    name: "태양불꽃방패",
    desc: "매 턴 내 HP의 10%만큼 상대에게 데미지를 줍니다.",
    cost: 5,
    weight: (pokemon) => (isTankPokemon(pokemon) ? 200 : 30),
    // turnEnd.js에 구현
  },
  {
    id: "swordEnhance",
    name: "검 강화하기",
    desc: "검을 강화하여 강화 단계에 따라 공격과 특수공격을 획득합니다.",
    cost: 1,
    weight: 80,
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
    name: "이 공격 무효일세",
    desc: "해당 포켓몬에게 무효 타입을 하나 추가합니다.",
    cost: 5,
    weight: 100,
    onApply: function (pokemon, battle, options) {
      this.selectedType = options?.selectedType;
    },
    // typeEffectCalculate.js에 구현
  },

  {
    id: "allOrNothing",
    name: "모 아니면 도",
    desc: "공격과 특수공격 중 하나가 2배가 되고 다른 하나가 절반이 됩니다.",
    cost: 7,
    weight: (pokemon) => (isTankPokemon(pokemon) ? 30 : 100),
    onApply: function (pokemon, battle, options) {
      if (!pokemon) return;
      const pick = options?.targetStat || (Math.random() < 0.5 ? "atk" : "catk");
      this.allOrNothingResult = pick;
    },
  },

  // 순풍 ====================================================================
  {
    id: "tailwind",
    name: "순풍",
    desc: "4턴 동안 자신 편의 포켓몬의 스피드를 2배로 올리는 순풍을 전개한다.",
    afterText: "우리 편의 뒤에서 순풍이 불기 시작했다!",
    cost: "-",
    weight: 100,
    isEligible: (pokemon, battle) => {
      const teamSide = pokemon?.team || "player";
      if (battle?.field?.[teamSide]?.noClean?.tailwind) return false;
      if (hasSkill(pokemon, "순풍")) return false;
      return true;
    },
    onApply: function (pokemon, battle) {
      const team = pokemon?.team || "player";
      if (battle?.field?.[team]?.noClean) {
        battle.field[team].noClean.tailwind = 4;
      }
    },
  },
  // 포켓몬 교체 ============================================================
  // 포켓몬과 결혼한 사람이 있었다 (메가가디안, 님피아(딜탱), 메가이어롭, 마스카나 중 1 교체 + 인생의 동반자 획득)
  {
    id: "marriedPokemon",
    name: "포켓몬과 결혼한 사람이 있었다",
    desc: "해당 포켓몬을 임의의 포켓몬과 교체합니다. 인생의 동반자 증강을 추가로 획득합니다.",
    cost: "-",
    weight: 40,
    isEligible: (pokemon) => {
      if (!isHpAtLeast(pokemon, 0.5)) return false;
      const excluded = ["마스카나", "가디안", "이어롭", "님피아"];
      if (excluded.some((name) => hasPokemonName(pokemon, name))) return false;
      return true;
    },
    onApply: function (pokemon, battle) {
      const candidates = ["메가가디안", "님피아 (특수딜탱)", "메가이어롭", "마스카나"];
      const available = candidates.filter((id) => {
        const baseName = id.replace("메가", "").replace(/\s*\(.*?\)/, "");
        return !hasPokemonNameOnTeam(pokemon, baseName, battle);
      });
      const pool = available.length > 0 ? available : candidates;
      const pickedId = pool[Math.floor(Math.random() * pool.length)];
      replacePokemon(pokemon, pickedId, battle, { excludeAugmentId: "marriedPokemon" });

      // 인생의 동반자 증강 추가 획득
      const partnerAug = AUGMENT_LIST.find((a) => a.id === "lifePartner");
      if (partnerAug) {
        if (!pokemon.augments) pokemon.augments = [];
        if (!pokemon.augments.some((a) => a.id === "lifePartner")) {
          const newAug = { ...partnerAug };
          pokemon.augments.push(newAug);
          if (typeof partnerAug.onApply === "function") {
            partnerAug.onApply(pokemon, battle);
          }
        }
      }
    },
  },
  // 인생의 동반자 (모든 능력치 1.1배 증가)
  {
    id: "lifePartner",
    name: "인생의 동반자",
    desc: "모든 능력치가 1.1배 증가합니다.",
    cost: 0,
    isRandom: false,
    weight: "-",
    isEligible: () => false,
    onApply: function (pokemon, battle) {
      if (pokemon && pokemon.origin?.hp) {
        const oldMaxHp = pokemon.origin.hp;
        pokemon.origin.hp = Math.round(pokemon.origin.hp * 1.1);
        const hpGain = pokemon.origin.hp - oldMaxHp;
        pokemon.hp = Math.min(pokemon.origin.hp, (pokemon.hp || oldMaxHp) + hpGain);
      }
    },
  },

  {
    id: "rouletteWheel",
    name: "돌려 돌려 돌림판",
    desc: "해당 포켓몬을 임의의 포켓몬과 교체합니다.",
    cost: "-",
    weight: 100,
    isEligible: (pokemon) => isHpAtLeast(pokemon, 0.5),
    onApply: function (pokemon, battle) {
      const allItems = sampleList.items || [];
      const filtered = allItems.filter((item) => item.id !== pokemon.id);
      if (filtered.length === 0) return;
      const picked = filtered[Math.floor(Math.random() * filtered.length)];
      replacePokemon(pokemon, picked.id, battle, { resetAugments: true });
    },
  },
  {
    id: "swordAndShield",
    name: "오른손엔 방패 왼손엔 검",
    desc: "공격과 방어 중 더 유리한 수치를 사용합니다.",
    cost: 3,
    weight: 100,
    isEligible: (pokemon) => canPickStatSwapAugment(pokemon) && isPhysicalPokemon(pokemon),
    // damageCalculate.js에 구현
  },
  {
    id: "specialSwordAndShield",
    name: "오른손엔 방패 왼손엔 스태프",
    desc: "특공과 특방 중 더 유리한 수치를 사용합니다.",
    cost: 3,
    weight: 100,
    isEligible: (pokemon) => canPickStatSwapAugment(pokemon) && isSpecialPokemon(pokemon),
    // damageCalculate.js에 구현
  },
  {
    id: "ksante",
    name: "체력 4700 방어력 329 마저201 인 챔피언👤이 저지불가🚫, 쉴드🛡, 벽🧱 넘기는 거 있고요. 에어본🌪 있고, 심지어 쿨타임은 1️⃣초밖에 안되고 마나🧙♂️는 1️⃣5️⃣ 들고 w는 심지어 변신💫하면 쿨 초기화에다가 패시브는 고정피해🗡가 들어가며 그 다음에 방마저🥋 올리면📈 올릴수록📈 스킬 가속⏰이 생기고! q에 스킬가속⏰이 생기고 스킬 속도🚀가 빨라지고📈 그 다음에 공격력🗡 계수가 있어가지고 W가 그 이익-으아아아악😱",
    desc: "방어와 특수방어 중 더 유리한 수치를 사용합니다.",
    cost: 5,
    weight: (pokemon) => (isTankPokemon(pokemon) ? 200 : 30),
    shortName: "그 긴거",
    isEligible: canPickStatSwapAugment,
    // damageCalculate.js에 구현
  },
  {
    id: "hhgghgg",
    name: "H.H.G.G.H.G.G",
    desc: "항상 가장 높은 값의 능력치를 사용합니다.",
    cost: 16,
    weight: 20,
    isEligible: canPickStatSwapAugment,
    // damageCalculate.js, speedCheck.js에 구현
  },

  {
    id: "teraBlast",
    name: "테라버스트",
    desc: "현재 기술 중 하나를 원하는 타입의 테라버스트로 교체합니다.",
    cost: 1,
    weight: 100,
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
    name: "보 만 다 지 진 !!",
    desc: '지니고 있는 기술 중 하나를 "지진"으로 변경합니다.',
    cost: 0,
    weight: 300,
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
    weight: 300,
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
  {
    id: "harmfulBird",
    name: "저 새는 해로운 새다",
    desc: "특성 질풍날개가 상시 발동됩니다.",
    cost: 3,
    weight: 500,
    shiftUp: true,
    imageOptions: { shiftUp: true, offsetY: -3.5, offsetX: 2.5, scale: 1.15 },
    isEligible: (pokemon) => hasPokemonName(pokemon, "파이어로"),
  },
  // "메가" 플라이곤 (메가플라이곤 교체) =========================================
  {
    id: "soaring",
    name: '"메가" 플라이곤',
    desc: "현재 포켓몬을 메가플라이곤과 교체합니다.",
    cost: "-",
    weight: 50,
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
    weight: 50,
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
    weight: 100,
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
    weight: 100,
  },
  {
    id: "threeSnails",
    name: "달팽이 세마리",
    desc: "공격 후 적에게 추가 고정 데미지를 입힙니다.",
    cost: 5,
    weight: 100,
  },
  {
    id: "echoOfHero",
    name: "영웅의 메아리",
    desc: "아군 모든 포켓몬의 공격과 특공을 40% 상승시킨다.",
    synergyEffectText: "모든 아군 포켓몬의 공격과 특수공격이 40% 증가한다!",
    buf: true,
    isRandom: false,
    weight: "-",
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
  {
    id: "dragonDie",
    name: "용용 죽겠지",
    desc: "드래곤 타입 포켓몬을 2마리 쓰러뜨릴 때마다 모든 능력치가 0.1배 상승합니다.",
    getDesc: (pokemon) => {
      const aug = pokemon?.augments?.find((a) => a.id === "dragonDie");
      const count = Number(pokemon?.dragonKillCount ?? aug?.dragonKillCount ?? 0);
      return `드래곤 타입 포켓몬을 2마리 쓰러뜨릴 때마다 모든 능력치가 0.1배 상승합니다.\n(현재 쓰러뜨린 드래곤 포켓몬: ${count}마리)`;
    },
    buf: true,
    isRandom: false,
    weight: "-",
    onApply: function (pokemon, battle, options) {
      const count = Number(options?.dragonKillCount ?? pokemon?.dragonKillCount ?? this.dragonKillCount ?? 0);
      if (pokemon) {
        pokemon.dragonKillCount = count;
      }
      this.dragonKillCount = count;
    },
  },
  {
    id: "wujuStyle",
    name: "우주류 검술",
    desc: "공격 후 적에게 30의 추가 고정 데미지를 입힙니다.",
    buf: true,
    isRandom: false,
    weight: "-",
  },
  {
    id: "mejaisSoulstealer",
    name: "메자이의 영혼약탈자",
    desc: "중첩당 20의 특수공격을 얻습니다. 적을 쓰러뜨릴 때마다 중첩을 하나 얻으며 해당 포켓몬이 기절할 때마다 중첩을 하나 잃습니다.",
    getDesc: (pokemon) => {
      const aug = pokemon?.augments?.find((a) => a.id === "mejaisSoulstealer");
      const stack = Number(pokemon?.mejaiStack ?? aug?.mejaiStack ?? 0);
      return `중첩당 20의 특수공격을 얻습니다. 적을 쓰러뜨릴 때마다 중첩을 하나 얻으며 해당 포켓몬이 기절할 때마다 중첩을 하나 잃습니다.\n(현재 중첩: ${stack})`;
    },
    buf: true,
    isRandom: false,
    weight: "-",
    onApply: function (pokemon, battle, options) {
      const stack = Number(options?.mejaiStack ?? pokemon?.mejaiStack ?? this.mejaiStack ?? 0);
      if (pokemon) {
        pokemon.mejaiStack = stack;
      }
      this.mejaiStack = stack;
    },
  },
  {
    id: "gamblingAddict",
    name: "도박 중독",
    desc: "도박과 관련된 증강이 추가로 나오게 됩니다.",
    buf: true,
    isRandom: false,
    weight: "-",
  },
  // 도박 중독 전용 추가 증강 =================================================
  {
    id: "russianRoulette",
    name: "러시안룰렛",
    desc: "현재 필드에 나와있는 두 포켓몬 중 하나가 기절합니다.",
    cost: "-",
    weight: 100,
    isEligible: (pokemon, battleOrTeam, team) => {
      if (!hasGamblingAddict(pokemon, battleOrTeam, team)) return false;
      const battle = getBattleFromContext(battleOrTeam, team);
      if (battle) {
        if (!battle.player || battle.player.faint || battle.player.hp <= 0) return false;
        if (!battle.npc || battle.npc.faint || battle.npc.hp <= 0) return false;
      }
      return true;
    },
    onApply: function (pokemon, battle, options) {
      if (!battle) return;
      const side =
        options?.faintTarget === "player" || options?.faintTarget === "npc"
          ? options.faintTarget
          : Math.random() < 0.5
            ? "player"
            : "npc";
      const faintPoke = side === "npc" ? battle.npc : battle.player;
      if (faintPoke) {
        faintPoke.hp = 0;
        if (!options?.deferFaint) {
          faintPoke.handleFaint?.(battle, options?.enqueue || (() => {}));
        }
      }
      if (options && typeof options === "object") {
        options.resolvedFaintSide = side;
        options.resolvedFaintTarget = faintPoke;
        options.resolvedFaintTargetName = faintPoke?.name || faintPoke?.origin?.name || "";
      }
    },
  },
  {
    id: "oddEven",
    name: "홀짝",
    desc: "랜덤한 수치의 랭크업을 얻습니다.",
    cost: "-",
    weight: 100,
    isEligible: (pokemon, battleOrTeam, team) => hasGamblingAddict(pokemon, battleOrTeam, team),
    onApply: function (pokemon, battle, options) {
      if (!pokemon) return;
      const statPool = ["atk", "catk", "cdef", "def", "speed"];
      const deltaPool = [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6];
      const chosenStat = statPool.includes(options?.statKey)
        ? options.statKey
        : statPool[Math.floor(Math.random() * statPool.length)];
      let chosenDelta = Number(options?.delta);
      if (!deltaPool.includes(chosenDelta)) {
        chosenDelta = deltaPool[Math.floor(Math.random() * deltaPool.length)];
      }
      pokemon.rankUp?.(battle, options?.enqueue || (() => {}), chosenStat, chosenDelta, null, false);
      if (options && typeof options === "object") {
        options.resolvedStat = chosenStat;
        options.resolvedDelta = chosenDelta;
      }
    },
  },
  {
    id: "doOrDie",
    name: "이판사판",
    desc: "10% 확률로 상대 엔트리의 대기중인 포켓몬을 전부 기절시킵니다.",
    cost: "-",
    weight: 100,
    isEligible: (pokemon, battleOrTeam, team) => {
      if (!hasGamblingAddict(pokemon, battleOrTeam, team)) return false;
      const battle = getBattleFromContext(battleOrTeam, team);
      if (!battle) return false;
      if (!pokemon || pokemon.faint || pokemon.hp <= 0) return false;
      if (!isPokemonAlone(pokemon, battle)) return false;
      const isNpcAlive = (p) => Boolean(p && !p.faint && !(p.hp <= 0));
      const npcBenchAlive = [battle.npcBench1, battle.npcBench2].some(isNpcAlive);
      const npcAliveCount = [battle.npc, battle.npcBench1, battle.npcBench2].filter(isNpcAlive).length;
      return npcBenchAlive && npcAliveCount >= 2;
    },
    onApply: function (pokemon, battle, options) {
      const success = typeof options?.doOrDieSuccess === "boolean" ? options.doOrDieSuccess : Math.random() < 0.1;
      const faintedNames = [];
      if (success && battle) {
        const benches = [battle.npcBench1, battle.npcBench2];
        benches.forEach((bp) => {
          if (bp && !bp.faint && !(bp.hp <= 0)) {
            faintedNames.push(bp.name || bp.origin?.name || "");
            bp.hp = 0;
            if (!options?.deferFaint) {
              bp.handleFaint?.(battle, options?.enqueue || (() => {}));
            }
          }
        });
      }
      if (options && typeof options === "object") {
        options.resolvedSuccess = success;
        options.resolvedFaintedBenchNames = faintedNames;
      }
    },
  },
  {
    id: "highRiskHighReturn",
    name: "하이리스크 하이리턴",
    desc: "모든 공격의 데미지가 3배가 되는 버프 또는 절반이 되는 저주를 얻습니다.",
    cost: "-",
    weight: 100,
    isEligible: (pokemon, battleOrTeam, team) =>
      hasGamblingAddict(pokemon, battleOrTeam, team) &&
      !pokemon?.hasAugment?.("highRiskBuff") &&
      !pokemon?.hasAugment?.("highRiskCurse"),
    onApply: function (pokemon, battle, options) {
      if (!pokemon) return;
      const pickedResult =
        options?.highRiskResult === "buff" || options?.highRiskResult === "curse"
          ? options.highRiskResult
          : Math.random() < 0.5
            ? "buff"
            : "curse";
      const grantedId = pickedResult === "buff" ? "highRiskBuff" : "highRiskCurse";
      const grantedAug = AUGMENT_LIST.find((a) => a.id === grantedId);
      if (grantedAug) {
        pokemon.applyAugment(grantedAug, battle, options);
      }
      if (options && typeof options === "object") {
        options.resolvedHighRiskResult = pickedResult;
        options.resolvedGrantedId = grantedId;
        options.resolvedGrantedAug = grantedAug;
      }
    },
  },
  {
    id: "highRiskBuff",
    name: "하이 리턴",
    desc: "모든 공격의 데미지가 3배가 됩니다.",
    buf: true,
    isRandom: false,
    weight: "-",
  },
  {
    id: "highRiskCurse",
    name: "하이 리스크",
    desc: "모든 공격의 데미지가 절반이 됩니다.",
    buf: true,
    curse: true,
    isRandom: false,
    weight: "-",
  },
  // 무한 다이맥스 (무한다이노 전용) =============================================
  {
    id: "eternamax",
    name: "무한 다이맥스",
    desc: "무한 다이맥스 상태가 됩니다.",
    cost: 10,
    weight: 500,
    shiftUp: false,
    imageOptions: { shiftUp: false, offsetY: 2.5, scale: 1.02 },
    isEligible: (pokemon) => hasPokemonName(pokemon, "무한다이노"),
    onApply: function (pokemon) {
      applyEternamax(pokemon);
    },
  },
  {
    id: "hugePower",
    name: "천하장사",
    desc: "현재 포켓몬의 특성을 천하장사로 변경합니다.\n(물리기술의 위력이 2배가 됩니다.)",
    cost: 7,
    weight: 100,
    isEligible: (pokemon) => pokemon?.abil !== "천하장사" && isPhysicalPokemon(pokemon),
    onApply: (pokemon) => {
      changePokemonAbility(pokemon, "천하장사");
    },
  },
  {
    id: "fastStarter",
    name: "패스트스타트",
    desc: "현재 포켓몬의 특성을 패스트스타트로 변경합니다.\n(전투에 나오고 5턴 뒤 공격과 스피드가 2배가 됩니다.)",
    cost: 1,
    weight: 100,
    shiftUp: true,
    imageOptions: { shiftUp: true, offsetY: -5, scale: 1.15 },
    isEligible: (pokemon) => hasPokemonName(pokemon, "레지기가스"),
    onApply: (pokemon) => {
      changePokemonAbility(pokemon, "패스트스타트");
    },
  },
  {
    id: "randomAbility",
    name: "특성 야바위",
    desc: "현재 포켓몬의 특성을 랜덤으로 변경합니다.",
    cost: 1,
    weight: 100,
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

// 3개 증강 공명(시너지) 버프 매핑 테이블
// { [버프 증강 ID]: [조건 증강 ID 목록] }
export const AUGMENT_SYNERGY_MAP = {
  echoOfHero: ["threeSnails", "nimbleMoves", "recovery"], // 영웅의 메아리: [달팽이 세마리, 민첩한 몸놀림, 회복]
  dragonDie: ["dragonSlayer", "dragonHunter", "dragonKiller"], // 용용 죽겠지: [드래곤 슬레이어, 용 사냥꾼, 용살자]
  wujuStyle: ["lastManStanding", "lastSamurai", "lastWarrior"], // 우주류 검술: [라스트 맨 스탠딩, 라스트 사무라이, 최후의 전사]
  mejaisSoulstealer: ["rabadonsDeathcap", "voidStaff", "thornmail"], // 메자이의 영혼약탈자: [라바돈의 죽음모자, 공허의 지팡이, 가시갑옷]
  gamblingAddict: ["lifeIsOneShot", "allOrNothing", "randomAbility"], // 도박 중독: [인생은 한방, 모 아니면 도, 특성 야바위]
};

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

  if (id === "tailwind") {
    if (isTextScreen) {
      const pokeName = target?.name || target?.origin?.name || "포켓몬";
      individualDesc = `${pokeName}의 순풍!`;
    } else {
      return selectedAugment.desc || "4턴 동안 자신 편의 포켓몬의 스피드를 2배로 올리는 순풍을 전개한다.";
    }
  } else if (id === "rouletteWheel" || id === "marriedPokemon") {
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
  } else if (id === "allOrNothing") {
    const revAug = target?.augments?.find((a) => a.id === "allOrNothing") || selectedAugment;
    const pick = options?.targetStat || revAug?.allOrNothingResult || revAug?.revolutionResult;
    if (pick === "atk") {
      individualDesc = "공격이 2배, 특수공격이 절반이 되었다!";
    } else if (pick === "catk") {
      individualDesc = "특수공격이 2배, 공격이 절반이 되었다!";
    } else if (isTextScreen) {
      individualDesc = "공격이 2배, 특수공격이 절반이 되었다!";
    }
  } else if (id === "russianRoulette") {
    const faintedName = options?.resolvedFaintTargetName || options?.faintedPokemonName;
    if (isTextScreen) {
      individualDesc = faintedName ? `러시안룰렛의 총구가 ${josa(`${faintedName}#{를}`)} 향했다!` : "러시안룰렛의 총구가 멈췄다!";
    } else {
      individualDesc = faintedName
        ? `현재 필드에 나와있는 두 포켓몬 중 ${josa(`${faintedName}#{이}`)} 기절했습니다.`
        : selectedAugment.desc || "현재 필드에 나와있는 두 포켓몬 중 하나가 기절합니다.";
    }
  } else if (id === "oddEven") {
    const statKey = options?.resolvedStat || options?.statKey;
    const delta = options?.resolvedDelta ?? options?.delta;
    const statLabel = STAT_LABELS[statKey];
    if (!isTextScreen && statLabel && typeof delta === "number" && !Number.isNaN(delta)) {
      const signed = delta > 0 ? `+${delta}` : `${delta}`;
      individualDesc = `랜덤한 수치의 랭크업을 얻습니다. (${statLabel} ${signed})`;
    }
  } else if (id === "doOrDie") {
    const success = options?.resolvedSuccess ?? options?.doOrDieSuccess;
    if (typeof success === "boolean") {
      if (isTextScreen) {
        individualDesc = success
          ? "이판사판 성공! 상대 엔트리의 대기 중인 포켓몬을 전부 기절시킨다!"
          : "이판사판... 하지만 실패했다!";
      } else {
        individualDesc = success
          ? "이판사판에 성공하여 상대 엔트리의 대기 중인 포켓몬을 전부 기절시켰습니다."
          : "이판사판에 실패하여 아무 일도 일어나지 않았습니다.";
      }
    }
  } else if (id === "highRiskHighReturn") {
    const grantedAug = options?.resolvedGrantedAug || (options?.resolvedGrantedId ? AUGMENT_LIST.find((a) => a.id === options.resolvedGrantedId) : null);
    if (grantedAug) {
      return getAugmentText(grantedAug, target, isTextScreen, prevPokeName, options);
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
  } else if (id === "swordAndShield" && !isTextScreen && options?.showCurrentStats) {
    return getSwordAndShieldDesc(target, options?.battle || null);
  } else if (id === "specialSwordAndShield" && !isTextScreen && options?.showCurrentStats) {
    return getSpecialSwordAndShieldDesc(target, options?.battle || null);
  } else if (id === "ksante" && !isTextScreen && options?.showCurrentStats) {
    return getKsanteDesc(target, options?.battle || null);
  } else if (id === "hhgghgg" && !isTextScreen && options?.showCurrentStats) {
    return getHhgghggDesc(target, options?.battle || null);
  }

  const foundInList = AUGMENT_LIST.find((a) => a.id === id);
  const isCurse = Boolean(selectedAugment?.curse || foundInList?.curse);
  const isBuf = Boolean(selectedAugment?.buf || foundInList?.buf || isCurse);
  if (isBuf) {
    if (isTextScreen) {
      const displayAugName = selectedAugment?.shortName || selectedAugment?.name || foundInList?.shortName || foundInList?.name || "";
      if (AUGMENT_SYNERGY_MAP[id]) {
        return `3개의 증강이 공명하여 "${displayAugName}" 버프를 얻었다!`;
      }
      if (isCurse) {
        return `${names} "${displayAugName}" 저주를 얻었다!`;
      }
      return `${names} "${displayAugName}" 버프를 얻었다!`;
    }
    const applied = target?.augments?.find((a) => a.id === id);
    if (typeof foundInList?.getDesc === "function") {
      return foundInList.getDesc(target);
    }
    if (typeof applied?.getDesc === "function") {
      return applied.getDesc(target);
    }
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

const getSwordAndShieldDesc = (pokemon, battle = null) => {
  const stat = pokemon?.origin?.stat || pokemon?.stat;
  if (stat && typeof stat.atk === "number" && typeof stat.def === "number") {
    const atkRank = Number(pokemon?.tempStatus?.rank?.atk ?? 0);
    const defRank = Number(pokemon?.tempStatus?.rank?.def ?? 0);
    const atkVal = Math.floor(getAugmentedStat(pokemon, "atk", battle) * getMultiplier(atkRank));
    const defVal = Math.floor(getAugmentedStat(pokemon, "def", battle) * getMultiplier(defRank));
    return `공격(${atkVal})과 방어(${defVal}) 중 더 유리한 수치를 사용합니다.`;
  }
  return "공격과 방어 중 더 유리한 수치를 사용합니다.";
};

const getSpecialSwordAndShieldDesc = (pokemon, battle = null) => {
  const stat = pokemon?.origin?.stat || pokemon?.stat;
  if (stat && typeof stat.catk === "number" && typeof stat.cdef === "number") {
    const catkRank = Number(pokemon?.tempStatus?.rank?.catk ?? 0);
    const cdefRank = Number(pokemon?.tempStatus?.rank?.cdef ?? 0);
    const catkVal = Math.floor(getAugmentedStat(pokemon, "catk", battle) * getMultiplier(catkRank));
    const cdefVal = Math.floor(getAugmentedStat(pokemon, "cdef", battle) * getMultiplier(cdefRank));
    return `특공(${catkVal})과 특방(${cdefVal}) 중 더 유리한 수치를 사용합니다.`;
  }
  return "특공과 특방 중 더 유리한 수치를 사용합니다.";
};

const getKsanteDesc = (pokemon, battle = null) => {
  const stat = pokemon?.origin?.stat || pokemon?.stat;
  if (stat && typeof stat.def === "number" && typeof stat.cdef === "number") {
    const defRank = Number(pokemon?.tempStatus?.rank?.def ?? 0);
    const cdefRank = Number(pokemon?.tempStatus?.rank?.cdef ?? 0);
    const defVal = Math.floor(getAugmentedStat(pokemon, "def", battle) * getMultiplier(defRank));
    const cdefVal = Math.floor(getAugmentedStat(pokemon, "cdef", battle) * getMultiplier(cdefRank));
    return `방어(${defVal})와 특수방어(${cdefVal}) 중 더 유리한 수치를 사용합니다.`;
  }
  return "방어와 특수방어 중 더 유리한 수치를 사용합니다.";
};

const getHhgghggDesc = (pokemon, battle = null) => {
  const highest = getHighestStatInfo(pokemon, battle);
  if (highest) {
    return `항상 가장 높은 값의 능력치를 사용합니다. (${highest.label} ${highest.displayValue})`;
  }
  return "항상 가장 높은 값의 능력치를 사용합니다.";
};

export const getAugmentDesc = (augment, pokemon = null, battle = null) => {
  if (!augment) return "";
  const stat = pokemon?.origin?.stat;

  if (augment.id === "swordAndShield") {
    return getSwordAndShieldDesc(pokemon, battle);
  }

  if (augment.id === "specialSwordAndShield") {
    return getSpecialSwordAndShieldDesc(pokemon, battle);
  }

  if (augment.id === "ksante") {
    return getKsanteDesc(pokemon, battle);
  }

  if (augment.id === "hhgghgg") {
    return getHhgghggDesc(pokemon, battle);
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

  if (augment.id === "allOrNothing") {
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

export const isCurseAugment = (augment) => {
  if (!augment) return false;
  if (typeof augment === "object" && augment.curse) return true;
  const id = typeof augment === "string" ? augment : augment.id;
  const found = AUGMENT_LIST.find((a) => a.id === id);
  return Boolean(found?.curse);
};
