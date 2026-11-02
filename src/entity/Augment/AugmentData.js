import { josa } from "josa";
import { ALL_POKEMON_TYPES, isTypeAlreadyNullified } from "../../util/typeEffectCalculate";
import sampleList from "../Pokemon/SamplePokemon";
import { generate } from "../Pokemon/PokemonInstance";
import skillList from "../Skill/skillList";

/**
 * 포켓몬의 현재 수치를 반영한 증강 설명 텍스트를 반환합니다.
 * 포켓몬 객체가 없을 경우 기본 설명 문구를 반환합니다.
 */
/**
 * 이 포켓몬의 이름은 보만다 등장 조건:
 * - 포켓몬 이름에 '보만다'가 포함되어 있고
 * - 현재 보유 기술 중 '지진'이 없는 경우
 */
export const isEligibleForNameIsSalamence = (pokemon) => {
  if (!pokemon) return false;
  const name = pokemon.origin?.name || pokemon.name || pokemon.id || "";
  if (!name.includes("보만다")) return false;
  const skills = pokemon.origin?.skill || pokemon.skill;
  if (!skills) return true;
  const hasEarthquake = [1, 2, 3, 4].some((slot) => {
    const sk = skills[slot] || skills[String(slot)];
    return sk?.name === "지진";
  });
  return !hasEarthquake;
};

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

  if (augment.id === "teraBlast") {
    return "현재 기술 중 하나를 원하는 타입의 테라버스트로 교체합니다.";
  }

  if (augment.id === "rabadonsDeathcap") {
    return "특공 + 130\n총 특공이 30% 증가합니다.";
  }

  if (augment.id === "infinityEdge") {
    return "공격력 🗡️ 75\n치명타 확률 💥 25%\n치명타 피해량 ➕💥 30%";
  }

  if (augment.id === "rebellionOrRevolution" || augment.id === "revolution") {
    if (stat && typeof stat.atk === "number" && typeof stat.catk === "number") {
      return `공격(${stat.atk})과 특수공격(${stat.catk}) 중 하나가 2배가 되고 다른 하나가 절반이 됩니다.`;
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

/**
 * 증강이 포켓몬에게 적용된 후의 상태를 설명하는 텍스트 (로그 및 상태 모달용)
 * augment.logDesc가 정의되어 있으면 이를 우선 사용하고, 없으면 getAugmentDesc로 대체합니다.
 */
export const getAugmentLogDesc = (augment, pokemon = null) => {
  if (!augment) return "";

  if (typeof augment.logDesc === "function") {
    return augment.logDesc(pokemon, augment);
  }
  if (typeof augment.logDesc === "string") {
    return augment.logDesc;
  }

  if (augment.id === "teraBlast") {
    const chosen = augment.selectedType || augment._teraBlastType || pokemon?._teraBlastType || pokemon?.origin?._teraBlastType || "노말";
    const prevName = augment.replacedSkillName || augment._replacedSkillName || pokemon?._teraBlastReplacedSkillName || pokemon?.origin?._teraBlastReplacedSkillName;
    if (prevName) {
      return `${josa(`[${prevName}]#{을}`)} [${chosen}] 타입 테라버스트로 변경하였습니다.`;
    }
    return `[${chosen}] 타입 테라버스트로 변경하였습니다.`;
  }

  if (augment.id === "rabadonsDeathcap") {
    return "특공 + 130\n총 특공이 30% 증가합니다.";
  }

  if (augment.id === "infinityEdge") {
    return "공격력 🗡️ 75\n치명타 확률 💥 25%\n치명타 피해량 ➕💥 30%";
  }

  if (augment.id === "infinityEdge") {
    return "공격력 🗡️ 75\n치명타 확률 💥 25%\n치명타 피해량 ➕💥 30%";
  }

  if (augment.id === "rebellionOrRevolution" || augment.id === "revolution") {
    const res = augment.revolutionResult || augment._revolutionResult || pokemon?._revolutionResult || pokemon?.origin?._revolutionResult;
    const stat = pokemon?.origin?.stat || pokemon?.stat;
    if (res === "atk") {
      const atkVal = stat?.atk !== undefined ? `(${stat.atk})` : "";
      const catkVal = stat?.catk !== undefined ? `(${stat.catk})` : "";
      return `공격${atkVal}이 2배, 특수공격${catkVal}이 절반이 되었습니다.`;
    }
    if (res === "catk") {
      const catkVal = stat?.catk !== undefined ? `(${stat.catk})` : "";
      const atkVal = stat?.atk !== undefined ? `(${stat.atk})` : "";
      return `특수공격${catkVal}이 2배, 공격${atkVal}이 절반이 되었습니다.`;
    }
  }

  return getAugmentDesc(augment, pokemon);
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
    desc: "해당 포켓몬을 임의의 포켓몬과 교체합니다.",
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
    id: "nameIsSalamence",
    name: "그리고 쓰는 기술은 지진이 있다",
    cost: 0,
    shiftUp: true,
    imageOptions: { shiftUp: true, offsetY: -5.5, scale: 1.15 },
    desc: "보  만  다  !!\n  지   진",
    isEligible: (pokemon) => isEligibleForNameIsSalamence(pokemon),
    onApply: function (pokemon, battle, options) {
      if (!pokemon?.origin?.skill) return;
      const slot = Number(options?.replaceSlot) || this.replacedSlot || 4;
      this.replacedSlot = slot;
      const earthquake = { ...skillList.search("지진"), skillNumber: slot };
      pokemon.origin.skill[slot] = earthquake;
      if (pokemon.skill) {
        pokemon.skill[slot] = earthquake;
      }
      if (pokemon.pp) {
        pokemon.pp[slot] = earthquake.pp;
      }
      pokemon._salamenceReplacedSlot = slot;
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
    cost: 2,
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
    cost: 1,
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
  {
    id: "nullifyGetto",
    name: "무효~! 겟또다제",
    cost: 5,
    desc: "해당 포켓몬에게 무효 타입을 하나 추가합니다.",
    isEligible: (pokemon) => {
      return ALL_POKEMON_TYPES.some((type) => !isTypeAlreadyNullified(pokemon, type));
    },
    onApply: function (pokemon, battle, options) {
      const chosenType = options?.selectedType || this.selectedType;
      if (!chosenType) return;
      this.selectedType = chosenType;
      pokemon._nullifyType = chosenType;
      pokemon.immuneTypes = pokemon.immuneTypes || [];
      if (!pokemon.immuneTypes.includes(chosenType)) {
        pokemon.immuneTypes.push(chosenType);
      }
      if (pokemon.origin) {
        pokemon.origin._nullifyType = chosenType;
        pokemon.origin.immuneTypes = pokemon.origin.immuneTypes || [];
        if (!pokemon.origin.immuneTypes.includes(chosenType)) {
          pokemon.origin.immuneTypes.push(chosenType);
        }
      }
    },
  },
  {
    id: "teraBlast",
    name: "테라버스트",
    cost: 1,
    desc: "현재 기술 중 하나를 원하는 타입의 테라버스트로 교체합니다.",
    getDesc: () => {
      return "현재 기술 중 하나를 원하는 타입의 테라버스트로 교체합니다.";
    },
    logDesc: (pokemon, augment) => {
      const chosen = augment?.selectedType || augment?._teraBlastType || pokemon?._teraBlastType || pokemon?.origin?._teraBlastType || "노말";
      const prevName = augment?.replacedSkillName || augment?._replacedSkillName || pokemon?._teraBlastReplacedSkillName || pokemon?.origin?._teraBlastReplacedSkillName;
      if (prevName) {
        return `${josa(`[${prevName}]#{을}`)} [${chosen}] 타입 테라버스트로 변경하였습니다.`;
      }
      return `[${chosen}] 타입 테라버스트로 변경하였습니다.`;
    },
    isEligible: (pokemon) => {
      if (!pokemon) return false;
      const skills = pokemon.origin?.skill || pokemon.skill;
      if (!skills) return true;
      return Object.values(skills).some(Boolean);
    },
    onApply: function (pokemon, battle, options) {
      if (!pokemon?.origin?.skill) return;
      const slot = Number(options?.replaceSlot) || this.replacedSlot || 4;
      this.replacedSlot = slot;
      const chosenType = options?.selectedType || this.selectedType || "노말";
      this.selectedType = chosenType;

      const prevSkill = pokemon.origin.skill[slot] || pokemon.skill?.[slot];
      const prevSkillName = options?.replacedSkillName || prevSkill?.name || this.replacedSkillName || "기존 기술";
      this.replacedSkillName = prevSkillName;
      this._replacedSkillName = prevSkillName;
      pokemon._teraBlastReplacedSkillName = prevSkillName;
      if (pokemon.origin) {
        pokemon.origin._teraBlastReplacedSkillName = prevSkillName;
      }

      const baseTera = skillList.search("테라버스트");
      const teraBlast = {
        ...baseTera,
        type: chosenType,
        skillNumber: slot,
      };

      pokemon.origin.skill[slot] = teraBlast;
      if (pokemon.skill) {
        pokemon.skill[slot] = teraBlast;
      }
      if (pokemon.pp) {
        pokemon.pp[slot] = teraBlast.pp;
      }
      pokemon._teraBlastReplacedSlot = slot;
      pokemon._teraBlastType = chosenType;
    },
  },
  {
    id: "rebellionOrRevolution",
    name: "실패하면 반역 성공하면 혁명",
    cost: 3,
    desc: "공격과 특수공격 중 하나가 2배가 되고 다른 하나가 절반이 됩니다.",
    getDesc: (pokemon) => {
      const stat = pokemon?.origin?.stat || pokemon?.stat;
      if (stat && typeof stat.atk === "number" && typeof stat.catk === "number") {
        return `공격(${stat.atk})과 특수공격(${stat.catk}) 중 하나가 2배가 되고 다른 하나가 절반이 됩니다.`;
      }
      return "공격과 특수공격 중 하나가 2배가 되고 다른 하나가 절반이 됩니다.";
    },
    logDesc: (pokemon, augment) => {
      const res = augment?.revolutionResult || augment?._revolutionResult || pokemon?._revolutionResult || pokemon?.origin?._revolutionResult;
      const stat = pokemon?.origin?.stat || pokemon?.stat;
      if (res === "atk") {
        const atkVal = stat?.atk !== undefined ? `(${stat.atk})` : "";
        const catkVal = stat?.catk !== undefined ? `(${stat.catk})` : "";
        return `공격${atkVal}이 2배, 특수공격${catkVal}이 절반이 되었습니다.`;
      }
      if (res === "catk") {
        const catkVal = stat?.catk !== undefined ? `(${stat.catk})` : "";
        const atkVal = stat?.atk !== undefined ? `(${stat.atk})` : "";
        return `특수공격${catkVal}이 2배, 공격${atkVal}이 절반이 되었습니다.`;
      }
      if (stat && typeof stat.atk === "number" && typeof stat.catk === "number") {
        return `공격(${stat.atk})과 특수공격(${stat.catk}) 중 하나가 2배가 되고 다른 하나가 절반이 됩니다.`;
      }
      return "공격과 특수공격 중 하나가 2배가 되고 다른 하나가 절반이 됩니다.";
    },
    onApply: function (pokemon, battle, options) {
      if (!pokemon) return;
      const stat = pokemon.origin?.stat || pokemon.stat;
      if (!stat || typeof stat.atk !== "number" || typeof stat.catk !== "number") return;

      const pick = options?.targetStat || (Math.random() < 0.5 ? "atk" : "catk");
      pokemon._revolutionResult = pick;
      if (pokemon.origin) {
        pokemon.origin._revolutionResult = pick;
      }
      if (this && this !== AUGMENT_LIST.find((a) => a.id === "rebellionOrRevolution")) {
        this.revolutionResult = pick;
        this._revolutionResult = pick;
      }

      if (pick === "atk") {
        stat.atk = Math.round(stat.atk * 2);
        stat.catk = Math.max(1, Math.floor(stat.catk / 2));
      } else {
        stat.catk = Math.round(stat.catk * 2);
        stat.atk = Math.max(1, Math.floor(stat.atk / 2));
      }

      if (pokemon.origin?.stat) {
        pokemon.origin.stat.atk = stat.atk;
        pokemon.origin.stat.catk = stat.catk;
      }
      if (pokemon.stat) {
        pokemon.stat.atk = stat.atk;
        pokemon.stat.catk = stat.catk;
      }
    },
  },
  {
    id: "infinityEdge",
    name: "무한의 대검",
    cost: 7,
    desc: "공격력 🗡️ 75\n치명타 확률 💥 25%\n치명타 피해량 ➕💥 30%",
    getDesc: () => "공격력 🗡️ 75\n치명타 확률 💥 25%\n치명타 피해량 ➕💥 30%",
    logDesc: () => "공격력 🗡️ 75\n치명타 확률 💥 25%\n치명타 피해량 ➕💥 30%",
    onApply: function (pokemon, battle, options) {
      if (!pokemon) return;
      if (pokemon.origin?.stat && typeof pokemon.origin.stat.atk === "number") {
        pokemon.origin.stat.atk += 75;
      }
      if (pokemon.stat && typeof pokemon.stat.atk === "number" && pokemon.stat !== pokemon.origin?.stat) {
        pokemon.stat.atk += 75;
      }
    },
  },
  {
    id: "rabadonsDeathcap",
    name: "라바돈의 죽음모자",
    cost: 7,
    desc: "특공 + 130\n총 특공이 30% 증가합니다.",
    getDesc: () => "특공 + 130\n총 특공이 30% 증가합니다.",
    logDesc: () => "특공 + 130\n총 특공이 30% 증가합니다.",
    onApply: function (pokemon, battle, options) {
      if (!pokemon) return;
      if (pokemon.origin?.stat && typeof pokemon.origin.stat.catk === "number") {
        pokemon.origin.stat.catk = Math.round((pokemon.origin.stat.catk + 130) * 1.3);
      }
      if (pokemon.stat && typeof pokemon.stat.catk === "number" && pokemon.stat !== pokemon.origin?.stat) {
        pokemon.stat.catk = Math.round((pokemon.stat.catk + 130) * 1.3);
      }
    },
  },
  {
    id: "onePunchMan",
    name: "진심 펀치",
    cost: 999,
    desc: "공격기술의 위력이 999배 증가합니다.",
  },
];
