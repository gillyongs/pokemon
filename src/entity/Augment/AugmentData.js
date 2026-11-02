import sampleList from "../Pokemon/SamplePokemon";
import { generate } from "../Pokemon/PokemonInstance";
import skillList from "../Skill/skillList";

/**
 * 포켓몬의 현재 수치를 반영한 증강 설명 텍스트를 반환합니다.
 * 포켓몬 객체가 없을 경우 기본 설명 문구를 반환합니다.
 */
/**
 * 춤춰라 한카리아스 등장 조건:
 * - 포켓몬 이름에 '한카리아스'가 포함되어 있고
 * - 현재 보유 기술 중 '용의춤'이 없는 경우
 */
export const isEligibleForDanceGarchomp = (pokemon) => {
  if (!pokemon) return false;
  const name = pokemon.origin?.name || pokemon.name || pokemon.id || "";
  if (!name.includes("한카리아스")) return false;
  const skills = pokemon.origin?.skill || pokemon.skill;
  if (!skills) return true;
  const hasDragonDance = [1, 2, 3, 4].some((slot) => {
    const sk = skills[slot] || skills[String(slot)];
    return sk?.name === "용의춤";
  });
  return !hasDragonDance;
};

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
      const higher = Math.max(stat.catk, stat.cdef);
      return `특공(${stat.catk})과 특방(${stat.cdef}) 중 더 높은 수치로 두 능력치를 통일합니다.`;
    }
    return "특공과 특방 중 더 높은 수치로 두 능력치를 통일합니다.";
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

  if (typeof augment.getDesc === "function") {
    return augment.getDesc(pokemon);
  }
  if (typeof augment.desc === "function") {
    return augment.desc(pokemon);
  }
  return augment.desc || "";
};

/**
 * 돌려 돌려 돌림판 등장 조건:
 * - 포켓몬의 현재 체력이 최대 체력의 절반(반피) 이상인 경우에만 등장
 */
export const isEligibleForRouletteWheel = (pokemon) => {
  if (!pokemon) return false;
  const currentHp = typeof pokemon.hp === "number" ? pokemon.hp : pokemon.origin?.hp;
  const maxHp = pokemon.origin?.hp ?? pokemon.maxHp ?? currentHp;
  if (typeof currentHp !== "number" || typeof maxHp !== "number" || maxHp <= 0) {
    return false;
  }
  return currentHp >= maxHp / 2;
};

export function hasBurnSkillEffect(pokemon) {
  if (!pokemon?.origin?.skill) return false;
  const skills = Object.values(pokemon.origin.skill).filter(Boolean);
  return skills.some((sk) => {
    if (!sk) return false;
    return Array.isArray(sk.skillEffectList) && sk.skillEffectList.some((eff) => eff.name === "화상" || eff.name === "트라이어택");
  });
}

export const AUGMENT_LIST = [
  {
    id: "noUnfairMiss",
    name: "억까 방지",
    cost: 1,
    desc: "명중률이 80% 이상인 기술이 절대 빗나가지 않습니다.",
    // accuracyCalculate.js에 구현
  },
  {
    id: "mandoocornEndure",
    name: "슬프게 하지 않게 하려고 버텼다",
    cost: 2,
    desc: "기절할 공격을 받을 때 10% 확률로 HP 1로 버팁니다.",
    // damege.js에 구현
  },
  {
    id: "gamblingAddict",
    name: "도박 중독",
    cost: 3,
    desc: "기술 위력이 3배가 되지만 공격 기술이 50% 확률로 실패합니다.",
    // damageCalculate.js, skillCheck.js에 구현
  },
  {
    id: "rouletteWheel",
    name: "돌려 돌려 돌림판",
    cost: "-",
    desc: "현재 포켓몬을 임의의 포켓몬과 교체합니다.",
    isEligible: (pokemon) => isEligibleForRouletteWheel(pokemon),
    onApply: (pokemon, battle) => {
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
  {
    id: "swordAndShield",
    name: "오른손엔 방패 왼손엔 검",
    cost: 2,
    desc: "공격과 방어 중 더 높은 수치로 두 능력치를 통일합니다.",
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
    cost: 2,
    desc: "특공과 특방 중 더 높은 수치로 두 능력치를 통일합니다.",
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
    id: "hhgghgg",
    name: "H.H.G.G.H.G.G",
    cost: 6,
    desc: "가장 높은 능력치로 모든 능력치가 통일됩니다.",
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
  {
    id: "danceOfGarchomp",
    name: "춤춰라 한카리아스",
    cost: 1,
    desc: '지니고 있는 기술 중 하나를 "용의춤"으로 변경합니다.',
    isEligible: (pokemon) => isEligibleForDanceGarchomp(pokemon),
    onApply: function (pokemon, battle, options) {
      if (!pokemon?.origin?.skill) return;
      const slot = Number(options?.replaceSlot) || this.replacedSlot || 4;
      this.replacedSlot = slot;
      const dDance = { ...skillList.search("용의춤"), skillNumber: slot };
      pokemon.origin.skill[slot] = dDance;
      if (pokemon.pp) {
        pokemon.pp[slot] = dDance.pp;
      }
      pokemon._danceReplacedSlot = slot;
    },
  },
  {
    id: "unboundChoice",
    name: "구애받지않는",
    cost: 4,
    desc: "구애 시리즈의 기술 고정 효과를 받지 않습니다.",
    isEligible: (pokemon) => Boolean(pokemon?.item && pokemon.item.startsWith("구애")),
    onApply: (pokemon) => {
      if (pokemon?.tempStatus && pokemon.abil !== "무아지경") {
        pokemon.tempStatus.onlySkill = null;
      }
    },
  },
  {
    id: "grandmasChiliOil",
    name: "할머니의 고추기름",
    cost: 3,
    desc: "상대 포켓몬의 화상 데미지가 5배로 증가합니다.",
    isEligible: (pokemon) => hasBurnSkillEffect(pokemon),
    // ailmentEvent.js에 구현
  },
  {
    id: "thornmail",
    name: "가시갑옷",
    cost: 3,
    desc: "타격기술을 받을 때 상대방에게 체력의 1/6 데미지를 줍니다.",
    // onHit.js에 구현
  },
];
