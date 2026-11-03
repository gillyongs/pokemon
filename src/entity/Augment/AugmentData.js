import { josa } from "josa";
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
    desc: "타격기술을 받을 때 상대방에게 체력의 1/6 데미지를 줍니다.",
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
    id: "swordEnhance",
    name: "검 강화하기",
    desc: "검을 강화하여 강화 단계에 따라 공격과 특수공격을 증가시킵니다.",
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
      this.desc = failed || bonusAtk === 0 ? "강화에 실패하였다..." : `[+${level} ${sName}] 강화 성공! 공격과 특수공격이 ${bonusAtk} 증가했다!`;
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
      if (this.selectedType) {
        this.desc = `해당 포켓몬에게 [${this.selectedType}] 무효 타입을 추가했습니다.`;
      }
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
      this.desc = pick === "atk" ? "공격이 2배, 특수공격이 절반이 되었습니다." : "특수공격이 2배, 공격이 절반이 되었습니다.";
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
      this.desc = `${josa(`[${prevSkillName}]#{을}`)} [${chosenType}] 타입 테라버스트로 변경하였습니다.`;

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
    cost: 1,
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
];

// 포켓몬 이름 확인
export const hasPokemonName = (pokemon, keyword) => {
  if (!pokemon || !keyword) return false;
  const name = pokemon.origin?.name || pokemon.name || pokemon.id || "";
  return name.includes(keyword);
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
