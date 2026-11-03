import { abilObject, noRandomAbil, changePokemonAbility, changeAbility } from "../Ability";
import { josa } from "josa";
import { getAugmentedStat } from "../../util/damageCalculate";
import sampleList from "../Pokemon/SamplePokemon";
import { generate } from "../Pokemon/PokemonInstance";
import skillList from "../Skill/skillList";
import { SWORD_ENHANCE_TIERS, getSwordEnhanceTier, getSwordEnhanceProb } from "./swordEnhance";

export { SWORD_ENHANCE_TIERS, getSwordEnhanceTier, getSwordEnhanceProb };

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
    isEligible: (pokemon) => {
      if (!pokemon) return false;
      const currentHp = typeof pokemon.hp === "number" ? pokemon.hp : pokemon.origin?.hp;
      const maxHp = pokemon.origin?.hp ?? pokemon.maxHp ?? currentHp;
      if (typeof currentHp !== "number" || typeof maxHp !== "number" || maxHp <= 0) {
        return false;
      }
      return currentHp >= maxHp / 2;
    },
    onApply: function (pokemon, battle) {
      if (!battle) return;
      const allItems = sampleList.items || [];
      const filtered = allItems.filter((item) => item.id !== pokemon.id);
      if (filtered.length === 0) return;
      const picked = filtered[Math.floor(Math.random() * filtered.length)];
      const newPoke = generate(picked.id);

      newPoke.team = pokemon.team || "player";
      newPoke.originalIndex = pokemon.originalIndex !== undefined ? pokemon.originalIndex : 0;
      newPoke.augments = []; // 돌려 돌려 돌림판 적용 시 증강 초기화

      const targetIdx = pokemon.originalIndex;
      if (battle.player === pokemon || (targetIdx !== undefined && battle.player?.originalIndex === targetIdx)) {
        battle.player = newPoke;
      } else if (battle.playerBench1 === pokemon || (targetIdx !== undefined && battle.playerBench1?.originalIndex === targetIdx)) {
        battle.playerBench1 = newPoke;
      } else if (battle.playerBench2 === pokemon || (targetIdx !== undefined && battle.playerBench2?.originalIndex === targetIdx)) {
        battle.playerBench2 = newPoke;
      }
      Object.setPrototypeOf(pokemon, Object.getPrototypeOf(newPoke));
      Object.assign(pokemon, newPoke);
      pokemon.augments = []; // 교체된 포켓몬의 증강 목록 초기화
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
  // 전설의 거인 관련 ==========================================================
  {
    id: "legendaryTitan",
    name: "전설의 거인",
    desc: "현재 포켓몬을 레지기가스와 교체합니다. 특성과 관련된 증강을 추가로 획득합니다.",
    cost: "-",
    shiftUp: true,
    imageOptions: { shiftUp: true, offsetY: -5, scale: 1.15 },
    isEligible: (pokemon, battleOrTeam, team) => !hasPokemonNameOnTeam(pokemon, "레지기가스", battleOrTeam || team),
    onApply: function (pokemon, battle) {
      const newPoke = generate("레지기가스");
      newPoke.team = pokemon.team || "player";
      newPoke.originalIndex = pokemon.originalIndex !== undefined ? pokemon.originalIndex : 0;
      newPoke.augments = (pokemon.augments || []).filter((a) => a && a.id !== "legendaryTitan" && a.cost !== "-");
      if (battle) {
        const targetIdx = pokemon.originalIndex;
        if (battle.player === pokemon || (targetIdx !== undefined && battle.player?.originalIndex === targetIdx)) {
          battle.player = newPoke;
        } else if (battle.playerBench1 === pokemon || (targetIdx !== undefined && battle.playerBench1?.originalIndex === targetIdx)) {
          battle.playerBench1 = newPoke;
        } else if (battle.playerBench2 === pokemon || (targetIdx !== undefined && battle.playerBench2?.originalIndex === targetIdx)) {
          battle.playerBench2 = newPoke;
        }
      }
      Object.setPrototypeOf(pokemon, Object.getPrototypeOf(newPoke));
      Object.assign(pokemon, newPoke);
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
    const members = isPlayer
      ? [battleObj.player, battleObj.playerBench1, battleObj.playerBench2]
      : [battleObj.npc, battleObj.npcBench1, battleObj.npcBench2];
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
  } else if (id === "legendaryTitan") {
    const fromName = prevPokeName || "포켓몬";
    individualDesc = josa(`${fromName}#{이} 레지기가스로 교체되었다!`);
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
