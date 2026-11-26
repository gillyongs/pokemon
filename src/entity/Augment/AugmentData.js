import { abilObject, noRandomAbil } from "../Ability";
import { josa } from "josa";
import { getAugmentedStat, getHighestStatInfo, STAT_LABELS } from "../../calc/getStat";
import { getMultiplier } from "../../calc/rankStat";
import sampleList from "../Pokemon/pokemonSampleList";
import { generatePokemonInstance } from "../Pokemon/PokemonInstance";
import skillList from "../Skill/skillList";
import { Skill, isAttackSkill } from "../Skill/Skill";
import { rollSoulDiceStats } from "../../component/battleScreen/augment/select/AugmentSoulDiceView";

export const getReplacementAugmentWeight = (pokemon) => {
  if (pokemon?.hasAugment?.("jinanSangae") || pokemon?.hasAugment?.("rudePureLove")) return 0;
  const count = Array.isArray(pokemon?.augments) ? pokemon.augments.filter((a) => a && (typeof isNormalAugment === "function" ? isNormalAugment(a) : !a.buf && !a.curse && !a.synergy)).length : 0;
  return 500 / (count + 1);
};

// 포켓몬 교체 증강
export const REPLACEMENT_AUGMENT_IDS = ["legendaryTitan", "rouletteWheel", "soaring", "marriedPokemon", "magikarpJump", "klinklangGear", "blackNight", "mewtwoStrikesBack", "veteranPrivilege", "sacrificeGod", "threeBears", "threeThousandYears", "evioliteShuckle", "ninjaAppeared", "geniusOfTransformation"];

export const isReplacementAugment = (augmentOrId) => {
  const id = typeof augmentOrId === "string" ? augmentOrId : augmentOrId?.id;
  return REPLACEMENT_AUGMENT_IDS.includes(id);
};

// 포켓몬 이름 확인
export const hasPokemonName = (pokemon, keyword) => Boolean(pokemon && keyword && pokemon.name.includes(keyword));

// 도박 중독 증강 소유 여부 확인
export const hasGamblingAddict = (team) => {
  if (!Array.isArray(team)) return false;
  return team.some((p) => p && p.hasAugment?.("gamblingAddict"));
};

// 도박 중독 시 해금 및 확정 등장하는 도박 증강 ID 목록
export const GAMBLE_BONUS_AUGMENT_IDS = ["russianRoulette", "oddEven", "highRiskHighReturn"];

/**
 * 현재 필드에 나와 있는 플레이어 포켓몬(battle.player)인지 확인
 * 필드 설치기/즉발 배틀 증강(끈적끈적네트, 순풍, 스텔스록, 위협, 후루베 유라유라, 러시안룰렛, 홀짝 등)이
 * 벤치 포켓몬에게 등장하지 않고 필드 위 포켓몬에게만 등장하도록 제한합니다.
 */
export const isBattlePlayerActive = (pokemon, battle) => {
  if (!battle || !battle.player || !pokemon) return false;
  if (battle.player.faint || battle.player.hp <= 0) return false;
  if (pokemon === battle.player) return true;
  if (pokemon.id && battle.player.id && pokemon.id === battle.player.id) return true;
  if (pokemon.originalIndex !== undefined && battle.player.originalIndex !== undefined && pokemon.originalIndex === battle.player.originalIndex) return true;
  return false;
};

export const SKILL_RENAME_ORIGIN_MAP = {
  바지락조개: "해수스파우팅",
};

/**
 * 기술 이름 변경 후에도 라운드 이월 등 재적용 시 현재 포켓몬이 가진 실제 기술명으로 보정
 */
export const resolveCurrentSkillName = (pokemon, skillName) => {
  if (!pokemon?.skill || !skillName) return skillName;
  const slots = [1, 2, 3, 4];
  if (slots.some((s) => pokemon.skill[s]?.name === skillName)) {
    return skillName;
  }
  const byOriginal = slots.find((s) => pokemon.skill[s]?.originalName === skillName);
  if (byOriginal && pokemon.skill[byOriginal]?.name) {
    return pokemon.skill[byOriginal].name;
  }
  const originName = SKILL_RENAME_ORIGIN_MAP[skillName];
  if (originName) {
    const byMappedOrigin = slots.find((s) => pokemon.skill[s]?.name === originName);
    if (byMappedOrigin && pokemon.skill[byMappedOrigin]?.name) {
      return pokemon.skill[byMappedOrigin].name;
    }
  }
  return skillName;
};

// 기술 이름만 변경하고 강화 증강, 상태 등 유지
export const renamePokemonSkill = (pokemon, oldName, newName) => {
  if (pokemon.skill) {
    [1, 2, 3, 4].forEach((slot) => {
      const sk = pokemon.skill[slot];
      if (sk && sk.name === oldName) {
        pokemon.skill[slot] = {
          ...sk,
          originalName: sk.originalName || oldName,
          name: newName,
        };
      }
    });
  }

  // 1. 포켓몬 인스턴스 직접 참조 스킬명 갱신 (민첩한 몸놀림, 선택과 집중, 제로섬게임)
  if (pokemon.nimbleSkillName === oldName) {
    pokemon.nimbleSkillName = newName;
  }
  if (pokemon.choiceAndFocusSkillName === oldName) {
    pokemon.choiceAndFocusSkillName = newName;
  }
  if (pokemon.zeroSumBuffSkillName === oldName) {
    pokemon.zeroSumBuffSkillName = newName;
  }
  if (pokemon.zeroSumNerfSkillName === oldName) {
    pokemon.zeroSumNerfSkillName = newName;
  }

  // 2. 보유 증강 객체 내부의 스킬명 프로퍼티 갱신
  if (Array.isArray(pokemon.augments)) {
    pokemon.augments.forEach((aug) => {
      if (!aug || typeof aug !== "object") return;
      if (aug.nimbleSkillName === oldName) aug.nimbleSkillName = newName;
      if (aug.chosenSkillName === oldName) aug.chosenSkillName = newName;
      if (aug.choiceAndFocusSkillName === oldName) aug.choiceAndFocusSkillName = newName;
      if (aug.zeroSumBuffSkillName === oldName) aug.zeroSumBuffSkillName = newName;
      if (aug.zeroSumNerfSkillName === oldName) aug.zeroSumNerfSkillName = newName;
      if (aug.replacedSkillName === oldName) aug.replacedSkillName = newName;
    });
  }

  // 3. 배틀 중 임시 상태(구애 고정, 최근 사용 기술, 사슬묶기/봉인 등) 스킬명 갱신
  if (pokemon.tempStatus) {
    if (pokemon.tempStatus.onlySkill === oldName) {
      pokemon.tempStatus.onlySkill = newName;
    }
    if (pokemon.tempStatus.recentSkillUse === oldName) {
      pokemon.tempStatus.recentSkillUse = newName;
    }
    if (pokemon.tempStatus.sameSkillName === oldName) {
      pokemon.tempStatus.sameSkillName = newName;
    }
    if (pokemon.tempStatus.disableSkill === oldName) {
      pokemon.tempStatus.disableSkill = newName;
    }
  }

  // 4. 현재 턴 사용 기술 갱신
  if (pokemon.turn?.useSkill && pokemon.turn.useSkill.name === oldName) {
    pokemon.turn.useSkill = {
      ...pokemon.turn.useSkill,
      originalName: pokemon.turn.useSkill.originalName || oldName,
      name: newName,
    };
  }

  return;
};

export const isNimbleSkill = (pokemon, skill) => {
  if (!pokemon || !skill) return false;
  const nimbleSkillName = pokemon.nimbleSkillName || pokemon.augments?.find((a) => a.id === "nimbleMoves")?.nimbleSkillName;
  return Boolean(pokemon.hasAugment?.("nimbleMoves") && nimbleSkillName && nimbleSkillName === skill.name);
};

export const isChoiceAndFocusSkill = (pokemon, skill) => {
  if (!pokemon || !skill) return false;
  const focusSkillName = pokemon.choiceAndFocusSkillName || pokemon.augments?.find((a) => a.id === "choiceAndFocus")?.chosenSkillName;
  return Boolean(pokemon.hasAugment?.("choiceAndFocus") && focusSkillName && focusSkillName === skill.name);
};

export const isZeroSumBuffSkill = (pokemon, skill) => {
  if (!pokemon || !skill) return false;
  const buffName = pokemon.zeroSumBuffSkillName || pokemon.augments?.find((a) => a.id === "zeroSumGame")?.zeroSumBuffSkillName;
  return Boolean(pokemon.hasAugment?.("zeroSumGame") && buffName && buffName === skill.name);
};

export const isZeroSumNerfSkill = (pokemon, skill) => {
  if (!pokemon || !skill) return false;
  const nerfName = pokemon.zeroSumNerfSkillName || pokemon.augments?.find((a) => a.id === "zeroSumGame")?.zeroSumNerfSkillName;
  return Boolean(pokemon.hasAugment?.("zeroSumGame") && nerfName && nerfName === skill.name);
};

export const hasAnvilStats = (pokemon) => {
  if (!pokemon) return false;
  const stats = pokemon.anvilStats;
  if (!stats) return false;
  return Object.values(stats).some((v) => Number(v) > 0);
};

export const getAnvilStatsStatusDesc = (pokemon) => {
  const stats = pokemon?.anvilStats;
  if (!stats) return "누적되는 추가 능력치를 획득합니다.";
  const labels = {
    atk: "공격",
    catk: "특공",
    def: "방어",
    cdef: "특방",
    speed: "스피드",
  };
  const parts = [];
  ["atk", "def", "catk", "cdef", "speed"].forEach((k) => {
    const val = Number(stats[k] || 0);
    if (val > 0) {
      parts.push(`${labels[k]}: ${val}`);
    }
  });
  if (parts.length > 0) {
    return `누적되는 추가 능력치를 획득합니다.\n${parts.join("  ")}`;
  }
  return "누적되는 추가 능력치를 획득합니다.";
};

export const getArcaneSwordFullName = ({ starCount = 0, hasSoul = false, scrollCount = 0 } = {}) => {
  const starPrefix = starCount > 0 ? `[★${starCount}] ` : "";
  const soulPrefix = hasSoul ? "위대한 엄니의 " : "";
  const scrollSuffix = scrollCount > 0 ? ` (+${scrollCount})` : "";
  return `${starPrefix}${soulPrefix}아케인셰이드 투핸드소드${scrollSuffix}`;
};

export const hasArcaneShadeSword = (pokemon) => Boolean(pokemon?.hasAugment?.("arcaneShadeSword"));

export const getArcaneSwordData = (pokemon = null, source = null, options = null) => {
  const arcaneObj = pokemon?.arcaneSword || pokemon?.agument?.arcaneSword;
  const successes = Number(options?.arcaneSuccessCount ?? source?.arcaneSuccessCount ?? pokemon?.arcaneSuccessCount ?? arcaneObj?.successCount ?? 0);
  const atk = Number(options?.arcaneScrollAtk ?? source?.arcaneScrollAtk ?? pokemon?.arcaneScrollAtk ?? arcaneObj?.scrollAtk ?? 0);
  const catk = Number(options?.arcaneScrollCatk ?? source?.arcaneScrollCatk ?? pokemon?.arcaneScrollCatk ?? arcaneObj?.scrollCatk ?? 0);
  const speed = Number(options?.arcaneScrollSpeed ?? source?.arcaneScrollSpeed ?? pokemon?.arcaneScrollSpeed ?? arcaneObj?.scrollSpeed ?? 0);
  const starCount = Number(options?.arcaneStarCount ?? source?.arcaneStarCount ?? pokemon?.arcaneStarCount ?? arcaneObj?.starCount ?? 0);
  const hasSoul = Boolean(options?.hasGreatTuskSoul ?? source?.hasGreatTuskSoul ?? pokemon?.hasGreatTuskSoul ?? arcaneObj?.hasSoul);
  const failCount = Math.max(0, 10 - successes);
  const starBonus = starCount * 10;
  const swordAug = (pokemon?.augments || []).find((a) => (typeof a === "string" ? a === "arcaneShadeSword" : a?.id === "arcaneShadeSword"));
  const name = options?.arcaneSwordName || source?.arcaneSwordName || swordAug?.arcaneSwordName || pokemon?.arcaneSwordName || arcaneObj?.name || getArcaneSwordFullName({ starCount, hasSoul, scrollCount: successes });

  const cubeLines = options?.cubeLines ?? source?.cubeLines ?? pokemon?.cubeLines ?? null;
  const cubeStats = options?.cubeStats ?? source?.cubeStats ?? pokemon?.cubeStats ?? null;

  return {
    successes,
    atk,
    catk,
    speed,
    scrollAtk: atk,
    scrollCatk: catk,
    scrollSpeed: speed,
    starCount,
    hasSoul,
    failCount,
    starBonus,
    swordAug,
    name,
    cubeLines,
    cubeStats,
  };
};

export const AUGMENT_LIST = [
  // 단순 구현 ==========================================================
  {
    id: "praiseTheSun",
    name: "태양 만세",
    desc: "해당 포켓몬의 최대 HP가 1.5배 증가합니다.\n상대가 화상 데미지를 입었을 경우 해당 수치만큼 체력을 회복합니다.",
    synergy: true,
    isRandom: false,
    weight: "-",
    // hpCalculate.js, turnEnd.js에 구현
  },
  {
    id: "restAndStrike",
    name: "쉬었다 때리기",
    desc: "이번 턴 상대를 공격하지 않았을 경우 다음 턴 공격의 데미지가 1.5배가 됩니다.",
    cost: 1,
    weight: 100,
    // damageCalculate.js, turnEnd.js에 구현
  },
  {
    id: "sunBreathing",
    name: "태양의 호흡",
    desc: "상대에게 중첩하여 화상을 걸 수 있습니다.\n화상은 중첩될수록 데미지가 강해지며\n추가로 적에게 치유 감소 효과를 부여합니다.",
    cost: 2,
    weight: 100,
    isEligible: (pokemon) => canInflictBurn(pokemon),
    // ailment.js, turnEnd.js, PokemonRecover.js에 구현
  },
  {
    id: "superheatedGladius",
    name: "초고열 글라디우스",
    desc: "공격 전 상대에게 화상을 입힙니다.\n화상 상태인 상대에게 추가로 화상을 입힐 시 최대 HP의 10%의 데미지를 입힙니다.",
    synergy: true,
    isRandom: false,
    weight: "-",
    // skillUse.js, ailment.js에 구현
  },
  {
    id: "ekzahar",
    name: "빙결용윤 에크하자르",
    desc: "상대를 중첩하여 얼릴 수 있습니다. 중첩 시 지속 턴이 누적됩니다.",
    synergy: true,
    isRandom: false,
    weight: "-",
  },
  {
    id: "aThousandBlazingSuns",
    name: "타오르는 천 개의 태양",
    desc: "매 턴 필드 위 모든 포켓몬에게 화상을 입힙니다. 화상 상태인 상대에게 입히는 데미지가 1.5배로 증가합니다.",
    cost: 3,
    weight: 100,
    // damageCalculate.js, turnEnd.js에 구현
  },
  {
    id: "sunfireCape",
    name: "태양불꽃망토",
    desc: "피격 시 30% 확률로 적에게 화상을 입힙니다. 불꽃타입 포켓몬일 경우 방어와 특수방어가 추가로 70 증가합니다.",
    cost: 2,
    weight: 100,
    // getStat.js, onHit.js에 구현
  },
  {
    id: "flamingKatana",
    name: "화염의 카타나",
    desc: `공격: +65 특공: +40 스피드: +17\n공격 시 50% 확률로 상대 또는 자신이 화상을 입습니다.`,
    cost: 2,
    weight: 100,
    // getStat.js, SkillEffect.js에 구현
  },
  {
    id: "salamandra",
    name: "사라만도라",
    desc: "공격 시 30% 확률로 적에게 화상을 입힙니다. 불꽃타입 포켓몬일 경우 공격과 특수공격이 추가로 70 증가합니다.",
    cost: 2,
    weight: 100,
    // getStat.js, SkillEffect.js에 구현
  },
  {
    id: "brionac",
    name: "빙룡창 브류나크",
    desc: "공격 시 15% 확률로 적을 얼립니다. 얼음 또는 드래곤 타입 포켓몬일 경우 공격과 특수공격이 추가로 70 증가합니다.",
    cost: 3,
    weight: 100,
    // getStat.js, SkillEffect.js에 구현
  },
  {
    id: "gungnir",
    name: "빙룡창 궁니르",
    desc: "공격 시 50% 확률로 상대 또는 자신이 얼어붙습니다.",
    cost: 3,
    weight: 100,
    // SkillEffect.js에 구현
  },
  {
    id: "trishula",
    name: "빙룡창 트리슈라",
    desc: "공격 시 적에게 서리를 쌓아 스피드를 15% 감소시킵니다. 서리가 3번 쌓이면 얼어붙습니다.",
    cost: 3,
    weight: 100,
    // PokemonInstance.js, speedCheck.js, SkillEffect.js에 구현
  },
  {
    id: "giantSoldierOfStone",
    name: "암석거인",
    desc: "모든 아군 바위타입 포켓몬의 방어와 특수방어가 200 증가합니다.",
    cost: 3,
    weight: (pokemon, battle) => getTypeDefenseAugmentWeight(pokemon, battle, "바위"),
    isEligible: (pokemon, battle, team) => {
      return !pokemon?.hasAugmentOnTeam?.("giantSoldierOfStone", team || battle);
    },
    onApply: function (pokemon, battle) {
      if (battle) {
        syncTeamGiantSoldierOfStoneBuff(battle, pokemon);
      } else if (pokemon) {
        pokemon.hasGiantSoldierOfStoneBuff = true;
      }
    },
    // getStat.js에 구현
  },
  {
    id: "waterOmotics",
    name: "물의 조종자",
    desc: "모든 아군 물타입 포켓몬의 방어와 특수방어가 200 증가합니다.",
    cost: 3,
    weight: (pokemon, battle) => getTypeDefenseAugmentWeight(pokemon, battle, "물"),
    isEligible: (pokemon, battle, team) => {
      return !pokemon?.hasAugmentOnTeam?.("waterOmotics", team || battle);
    },
    onApply: function (pokemon, battle) {
      if (battle) {
        syncTeamWaterOmoticsBuff(battle, pokemon);
      } else if (pokemon) {
        pokemon.hasWaterOmoticsBuff = true;
      }
    },
    // getStat.js에 구현
  },
  {
    id: "holyElfBlessing",
    name: "홀리엘프의 축복",
    desc: "해당 포켓몬의 방어와 특수방어가 200 증가합니다.",
    cost: 3,
    weight: 100,
    // getStat.js에 구현
  },
  {
    id: "millenniumShield",
    name: "천년 방패",
    desc: "모든 아군 포켓몬의 방어와 특수방어가 2배가 됩니다.",
    synergy: true,
    isRandom: false,
    weight: "-",
    onApply: function (pokemon, battle) {
      if (battle) {
        const team = pokemon.team === "npc" ? [battle.npc, battle.npcBench1, battle.npcBench2] : [battle.player, battle.playerBench1, battle.playerBench2];
        team.filter(Boolean).forEach((p) => {
          p.hasMillenniumShieldBuff = true;
        });
      } else if (pokemon) {
        pokemon.hasMillenniumShieldBuff = true;
      }
    },
  },
  {
    id: "fatalStrike",
    name: "치명적인 일격",
    desc: "사용한 기술이 급소에 맞았을 경우, 해당 기술은 계속 급소에 적중합니다.",
    cost: 1,
    weight: 100,
    isEligible: (pokemon) => hasAttackSkill(pokemon),
    // skillUse.js 및 damageCalculate.js에 구현
  },
  {
    id: "focusOne",
    name: "한놈만",
    desc: "맨 처음 공격한 상대에게 1.5배의 데미지를 입힙니다. 그 외에 상대에겐 0.8배의 데미지를 입힙니다.",
    cost: 1,
    weight: 100,
    isEligible: (pokemon) => hasAttackSkill(pokemon),
    statusModalText: function (pokemon) {
      const targetName = pokemon.focusOneTarget;
      if (targetName) {
        return `${this.desc}\n(현재 타깃 대상: ${targetName})`;
      }
      return this.desc;
    },
    // damageCalculate.js 및 skillUse.js에 구현
  },
  {
    id: "metronome",
    name: "메트로놈",
    desc: "똑같은 기술을 연속으로 사용하면 위력이 20%씩 최대 5번 증가합니다. 그만두면 위력이 되돌아갑니다.",
    cost: 1,
    weight: 100,
    isEligible: (pokemon) => hasAttackSkill(pokemon),
    statusModalText: function (pokemon) {
      const count = Number(pokemon?.tempStatus?.sameSkillCount || 0);
      const skillName = pokemon?.tempStatus?.sameSkillName;
      if (skillName && count > 0) {
        return `${this.desc}\n(${skillName} ${count}회 연속 사용중)`;
      }
      return this.desc;
    },
    // damageCalculate.js에 구현
  },
  {
    id: "doubleMetronome",
    name: "더블 메트로놈",
    shortDesc: "기술이 막히거나 실패하여도 메트로놈 효과가 초기화되지 않습니다.",
    desc: "지닌 물건을 메트로놈과 교체합니다.\n추가로 기술이 막히거나 실패하여도 메트로놈 효과가 초기화되지 않습니다.",
    selDesc: function (pokemon) {
      const isHolding = pokemon.item === "메트로놈";
      return isHolding ? this.shortDesc : this.desc;
    },
    logModalText: function (target, prevPokeName, options) {
      const isHolding = target.originalItem === "메트로놈";
      return isHolding ? this.shortDesc : this.desc;
    },
    statusModalText: function (pokemon) {
      const isHolding = pokemon?.originalItem === "메트로놈";
      return isHolding ? this.shortDesc : this.desc;
    },
    cost: 1,
    weight: 100,
    isEligible: (pokemon) => pokemon?.hasAugment?.("metronome") && hasAttackSkill(pokemon),
    onApply: function (pokemon) {
      pokemon.item = "메트로놈";
    },
  },
  {
    id: "tripleMetronome",
    name: "트리플 메트로놈",
    desc: "현재 포켓몬의 특성을 메트로놈으로 변경합니다.\n(똑같은 기술을 연속으로 사용했을 때 위력이 20%씩 최대 5번 증가합니다.)",
    cost: 1,
    weight: 100,
    isEligible: (pokemon) => pokemon?.hasAugment?.("doubleMetronome") && hasAttackSkill(pokemon),
    onApply: function (pokemon) {
      pokemon.changeAbil?.("메트로놈");
    },
  },
  {
    id: "symphonyFor100Metronomes",
    name: "100개의 메트로놈을 위한 교향시",
    desc: "메트로놈의 스택이 초기화되지 않습니다.",
    synergy: true,
    isRandom: false,
    weight: "-",
    statusModalText: function (pokemon) {
      const atkSkills = getAttackSkills(pokemon);
      if (atkSkills.length > 0) {
        const lines = atkSkills.map((sk) => `(${sk.name} ${Number(sk.useCount || 0)}회 사용)`);
        return `${this.desc}\n${lines.join("\n")}`;
      }
      return this.desc;
    },
  },
  {
    id: "noUnfairMiss",
    name: "억까 방지",
    desc: "명중률이 80% 이상인 기술이 절대 빗나가지 않습니다.",
    cost: 1,
    weight: 100,
    //명중률이 80~99인 기술이 존재할 때만 등장
    isEligible: (pokemon) => getPokemonSkills(pokemon).some((sk) => typeof sk?.accur === "number" && sk.accur >= 80 && sk.accur <= 99),
    // accuracyCalculate.js에 구현
  },
  {
    id: "mandoocornEndure",
    name: "슬프게 하지 않게 하려고 버텼다!",
    desc: "기절할 공격을 받을 때 30% 확률로 HP 1로 버팁니다.",
    cost: 2,
    weight: 100,
    // damege.js의 attackDamage에 구현
  },
  {
    id: "butItRefused",
    name: "하지만 버텨냈다.",
    desc: "기절할 공격을 받을 때 한번 HP 1로 버팁니다. 해당 턴 무슨 일이 있어도 기절하지 않습니다.",
    cost: 3,
    weight: 100,
    isEligible: (pokemon) => (pokemon?.item?.name || pokemon?.item) !== "기합의띠",
    // damage.js, PokemonGetDamage.js에 구현
  },
  {
    id: "nothingHappened",
    name: "아무일도 없었다...!",
    desc: "기절할 데미지를 받을 때 한번 HP 1로 버팁니다.",
    cost: 2,
    weight: 100,
    // PokemonGetDamage.js에 구현
  },
  {
    id: "airmanGaTaosenai",
    name: "에어맨이 쓰러지지 않아",
    desc: "기절할 데미지를 받을 때 총 20번 HP 1로 버팁니다.",
    synergy: true,
    isRandom: false,
    weight: "-",
    statusModalText: function (pokemon) {
      const remain = Number(pokemon?.airmanRemainCount ?? this?.airmanRemainCount ?? 20);
      return `${this.desc}\n(남은 횟수 ${remain}회)`;
    },
    getDesc: (pokemon) => {
      const aug = pokemon?.augments?.find((a) => a.id === "airmanGaTaosenai");
      const remain = Number(pokemon?.airmanRemainCount ?? aug?.airmanRemainCount ?? 20);
      return `기절할 데미지를 받을 때 총 20번 HP 1로 버팁니다.\n(남은 횟수 ${remain}회)`;
    },
    onApply: function (pokemon, battle, options) {
      const remain = Number(options?.airmanRemainCount ?? pokemon?.airmanRemainCount ?? this.airmanRemainCount ?? 20);
      if (pokemon) {
        pokemon.airmanRemainCount = remain;
      }
      this.airmanRemainCount = remain;
    },
  },
  {
    id: "letsExplodeTogether",
    name: "함께 폭사하자",
    desc: "상대의 공격으로 기절했을 때, 공격받기 전 남은 HP만큼 상대에게 데미지를 줍니다",
    cost: 2,
    weight: 100,
    isEligible: (pokemon) => !hasSomeAbil(pokemon, "내용물분출") && !hasSomeItem(pokemon, "기합의띠"),
    // damage.js에 구현
  },
  {
    id: "choiceAndFocus",
    name: "선택과 집중",
    desc: "선택한 공격기의 위력이 1.5배가 됩니다.\n다른 기술의 위력은 0.5배로 감소합니다.",
    cost: 2,
    weight: 100,
    isEligible: (pokemon) => !pokemon?.hasAugment?.("choiceAndFocus") && hasAttackSkill(pokemon),
    screenText: function (target, prevPokeName, options) {
      const skillName = options?.chosenSkillName || this?.chosenSkillName || target?.choiceAndFocusSkillName;
      return skillName ? `[증강] ${skillName}의 위력이 증가하였다!` : "[증강] 선택한 기술의 위력이 증가하였다!";
    },
    logModalText: function (target, prevPokeName, options) {
      const skillName = options?.chosenSkillName || this?.chosenSkillName || target?.choiceAndFocusSkillName;
      return skillName ? `${skillName}의 위력이 증가하였다!` : "기술의 위력이 증가하였다!";
    },
    statusModalText: function (pokemon, battle, options) {
      const skillName = options?.chosenSkillName || this?.chosenSkillName || pokemon?.choiceAndFocusSkillName;
      return skillName ? `${skillName}의 위력이 증가하였습니다.\n다른 기술의 위력은 0.5배로 감소합니다.` : "선택한 공격기의 위력이 1.5배가 됩니다.\n다른 기술의 위력은 0.5배로 감소합니다.";
    },
    onApply: function (pokemon, battle, options) {
      if (!pokemon?.skill) return;
      const rawChosenSkillName = options?.chosenSkillName || options?.choiceAndFocusSkillName || options?.replacedSkillName;
      const chosenSkillName = resolveCurrentSkillName(pokemon, rawChosenSkillName);
      let slot = Number(options?.chosenSlot || options?.replaceSlot);
      if (!slot && chosenSkillName) {
        slot = [1, 2, 3, 4].find((s) => pokemon.skill[s]?.name === chosenSkillName);
      }
      if (!slot) {
        slot = [1, 2, 3, 4].find((s) => pokemon.skill[s] && (pokemon.skill[s].stype === "atk" || pokemon.skill[s].stype === "catk"));
      }
      const targetSkill = pokemon.skill[slot];
      const finalSkillName = targetSkill?.name || chosenSkillName || "공격기";
      this.chosenSkillName = finalSkillName;
      this.chosenSlot = slot;
      pokemon.choiceAndFocusSkillName = finalSkillName;
      pokemon.choiceAndFocusSlot = slot;
      if (options && typeof options === "object") {
        options.chosenSkillName = finalSkillName;
        options.chosenSlot = slot;
      }
    },
  },
  {
    id: "zeroSumGame",
    name: "제로섬게임",
    desc: "랜덤한 기술 하나의 위력이 1.5배가 됩니다.\n다른 기술 하나의 위력이 0.5배가 됩니다.",
    cost: 1,
    weight: 100,
    isEligible: (pokemon) => !pokemon?.hasAugment?.("zeroSumGame") && getAttackSkills(pokemon).length >= 2,
    screenText: function (target, prevPokeName, options) {
      const buff = options?.zeroSumBuffSkillName || this?.zeroSumBuffSkillName || target?.zeroSumBuffSkillName;
      const nerf = options?.zeroSumNerfSkillName || this?.zeroSumNerfSkillName || target?.zeroSumNerfSkillName;
      if (buff && nerf) {
        return `[증강] ${buff}의 위력이 1.5배, ${nerf}의 위력이 0.5배가 되었다!`;
      }
      return "[증강] 제로섬게임의 효과가 적용되었다!";
    },
    logModalText: function (target, prevPokeName, options) {
      const buff = options?.zeroSumBuffSkillName || this?.zeroSumBuffSkillName || target?.zeroSumBuffSkillName;
      const nerf = options?.zeroSumNerfSkillName || this?.zeroSumNerfSkillName || target?.zeroSumNerfSkillName;
      if (buff && nerf) {
        return `${buff}의 위력이 1.5배, ${nerf}의 위력이 0.5배가 되었다!`;
      }
      return "랜덤한 기술 하나의 위력이 1.5배, 다른 기술 하나의 위력이 0.5배가 되었다!";
    },
    statusModalText: function (pokemon, battle, options) {
      const buff = options?.zeroSumBuffSkillName || this?.zeroSumBuffSkillName || pokemon?.zeroSumBuffSkillName;
      const nerf = options?.zeroSumNerfSkillName || this?.zeroSumNerfSkillName || pokemon?.zeroSumNerfSkillName;
      if (buff && nerf) {
        return `${buff}의 위력이 1.5배가 됩니다.\n${nerf}의 위력은 0.5배로 감소합니다.`;
      }
      return "랜덤한 기술 하나의 위력이 1.5배가 됩니다.\n다른 기술 하나의 위력이 0.5배가 됩니다.";
    },
    onApply: function (pokemon, battle, options) {
      if (!pokemon?.skill) return;
      let buffSkillName = resolveCurrentSkillName(pokemon, options?.zeroSumBuffSkillName);
      let nerfSkillName = resolveCurrentSkillName(pokemon, options?.zeroSumNerfSkillName);

      if (!buffSkillName || !nerfSkillName) {
        const attackSkills = getAttackSkills(pokemon);
        if (attackSkills.length >= 2) {
          const shuffled = [...attackSkills].sort(() => Math.random() - 0.5);
          buffSkillName = shuffled[0].name;
          nerfSkillName = shuffled[1].name;
        } else if (attackSkills.length === 1) {
          buffSkillName = attackSkills[0].name;
        }
      }

      this.zeroSumBuffSkillName = buffSkillName;
      this.zeroSumNerfSkillName = nerfSkillName;
      pokemon.zeroSumBuffSkillName = buffSkillName;
      pokemon.zeroSumNerfSkillName = nerfSkillName;
      if (options && typeof options === "object") {
        options.zeroSumBuffSkillName = buffSkillName;
        options.zeroSumNerfSkillName = nerfSkillName;
      }
    },
  },
  {
    id: "allInDefense",
    name: "아픈 건 싫으니까 방어력에 올인하려고 합니다.",
    desc: "공격과 특수공격, 스피드가 절반이 됩니다.\n방어와 특수방어가 2배가 됩니다.",
    cost: 2,
    weight: 150,
    isEligible: (pokemon) => isTankPokemon(pokemon),
    // getStat.js에 구현
  },
  {
    id: "limiterRemoval",
    name: "리미터 해제",
    desc: "해당 포켓몬의 공격과 특공, 스피드가 1.5배가 됩니다. 상대를 공격할 때마다 최대 HP 40%의 피해를 입습니다.",
    cost: 3,
    weight: 100,
    // getStat.js, SkillEffect.js에 구현
  },
  {
    id: "rudePureLove",
    name: "무례하긴, 순애야.",
    desc: "모든 능력치가 1.3배 증가하는 영구적인 버프를 얻습니다. 해당 포켓몬은 엔트리에서 교체할 수 없습니다.",
    cost: "-",
    weight: 100,
    isEligible: (pokemon, battle, team) => {
      if (battle?.teamOption !== "트레이드") return false;
      return !pokemon?.hasAugmentOnTeam?.("jinanSangae", team || battle);
    },
    onApply: function (pokemon, battle, options) {
      if (!pokemon) return;
      const buffAug = AUGMENT_LIST.find((a) => a.id === "jinanSangae");
      if (buffAug) {
        if (typeof pokemon.applyAugment === "function") {
          pokemon.applyAugment(buffAug, battle, options);
        } else {
          if (!pokemon.augments) pokemon.augments = [];
          if (!pokemon.augments.some((a) => a.id === "jinanSangae")) {
            pokemon.augments.push({ ...buffAug, buf: true, permanent: true });
          }
        }
      }
      if (options && typeof options === "object") {
        options.resolvedGrantedId = "jinanSangae";
        options.resolvedGrantedAug = buffAug;
      }
    },
  },
  {
    id: "jinanSangae",
    name: "진안상애",
    desc: "모든 능력치가 1.3배 증가합니다.\n해당 포켓몬은 엔트리에서 교체할 수 없습니다.",
    buf: true,
    permanent: true,
    isRandom: false,
    weight: "-",
    isEligible: () => false,
  },
  {
    id: "lifeIsOneShot",
    name: "인생은 한방",
    desc: "공격 기술 위력이 10배로 증가하지만 50% 확률로 실패합니다.",
    cost: 0,
    weight: 100,
    // damageCalculate.js, skillCheck.js에 구현
  },
  {
    id: "onePunchMan",
    name: "진심 펀치",
    desc: "공격 기술의 위력이 999배 증가합니다.",
    cost: 999,
    weight: 10,
    // damageCalculate.js에 구현
  },
  {
    id: "dragonHunter",
    name: "용 사냥꾼",
    desc: "드래곤 타입을 상대로 모든 능력치가 2배 증가합니다.",
    cost: 1,
    weight: 100,
    isEligible: (pokemon) => {
      const t1 = pokemon?.type1;
      const t2 = pokemon?.type2;
      return t1 !== "드래곤" && t2 !== "드래곤";
    },
    // speedCheck.js(speedCalculate), damageCalculate.js에 구현
  },
  {
    id: "dragonSlayer",
    name: "드래곤 슬레이어",
    desc: "드래곤 타입인 포켓몬을 쓰러뜨리면 모든 능력이 1랭크 상승합니다.",
    cost: 1,
    weight: 100,
    isEligible: (pokemon) => {
      const t1 = pokemon?.type1;
      const t2 = pokemon?.type2;
      return t1 !== "드래곤" && t2 !== "드래곤";
    },
    // damage.js에 구현
  },
  {
    id: "dragonKiller",
    name: "용살자",
    desc: "드래곤 타입인 포켓몬에게 2배 데미지를 입힙니다.",
    cost: 1,
    weight: 100,
    isEligible: (pokemon) => {
      const t1 = pokemon?.type1;
      const t2 = pokemon?.type2;
      return t1 !== "드래곤" && t2 !== "드래곤";
    },
    // damageCalculate.js에 구현
  },
  {
    id: "lastWarrior",
    name: "최후의 전사",
    desc: "해당 포켓몬이 마지막에 홀로 남았을 경우 스피드가 2배 증가합니다.",
    cost: 3,
    weight: 100,
    // speedCheck.js(speedCalculate)에 구현
  },
  {
    id: "lastSamurai",
    name: "라스트 사무라이",
    desc: "해당 포켓몬이 마지막에 홀로 남았을 경우 공격과 특수공격이 2배 증가합니다.",
    cost: 2,
    weight: 100,
    // damageCalculate.js에 구현
  },
  {
    id: "lastManStanding",
    name: "라스트 맨 스탠딩",
    desc: "해당 포켓몬이 마지막에 홀로 남았을 경우 방어와 특수방어가 2배 증가합니다.",
    cost: 1,
    weight: 100,
    // damageCalculate.js에 구현
  },
  {
    id: "afterYou",
    name: "뒷일은 부탁합니다.",
    desc: "해당 포켓몬이 기절하여 쓰러졌을 경우, 교체로 나온 다음 포켓몬의 모든 능력이 1랭크 상승합니다.",
    cost: 1,
    weight: 100,
    // switch.js에 구현
  },
  {
    id: "believeInMyself",
    name: "나를 믿는 내가 최강이다!",
    desc: "아군의 남은 포켓몬 수가 상대보다 적을 때, 해당 포켓몬의 모든 능력치가 2배로 증가합니다.",
    cost: 1,
    weight: 100,
    // damageCalculate.js, speedCheck.js에 구현
  },

  {
    id: "unboundChoice",
    name: "구애받지않는",
    desc: "기술 고정 효과를 받지 않습니다.",
    cost: 2,
    weight: 300,
    isEligible: (pokemon) => Boolean((pokemon?.item && pokemon.item.startsWith("구애")) || pokemon?.abil?.name === "무아지경"),
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
    desc: "화상을 입힐 확률이 3배 증가합니다.\n추가로 화상 데미지가 3배 증가합니다.",
    cost: 2,
    weight: 100,
    // 적에게 화상을 입힐 수 있을때만 등장
    isEligible: (pokemon) => canInflictBurn(pokemon),
  },
  {
    id: "thornmail",
    name: "가시갑옷",
    desc: "적에게 공격을 받을 때 상대방에게 최대 HP의 1/8 데미지를 입힙니다.",
    cost: 2,
    weight: (pokemon) => (isTankPokemon(pokemon) ? 200 : 30),
    // onHit.js에 구현
  },

  {
    id: "infinityEdge",
    name: "무한의 대검",
    desc: `급소 확률이 25% 증가합니다.\n공격이 급소에 맞았을때 데미지가 30% 추가로 증가합니다.`,
    cost: 1,
    weight: (pokemon) => (isTankPokemon(pokemon) ? 30 : 100),
    // 치명타 보정은 damageCalculate.js / skillUse.js에 구현
  },
  {
    id: "rabadonsDeathcap",
    name: "라바돈의 죽음모자",
    desc: "특수공격이 30% 증가합니다.",
    cost: 1,
    weight: (pokemon) => (isTankPokemon(pokemon) ? 30 : 100),
    isEligible: (pokemon) => isSpecialPokemon(pokemon),
    // damageCalculate.js에 구현
  },
  {
    id: "voidStaff",
    name: "공허의 지팡이",
    desc: "상대방의 특수방어를 40% 약하게 만듭니다.",
    cost: 1,
    weight: (pokemon) => (isTankPokemon(pokemon) ? 30 : 100),
    isEligible: (pokemon) => isSpecialPokemon(pokemon),
    // damageCalculate.js에 구현
  },
  {
    id: "ludensEcho",
    name: "루덴의 메아리",
    desc: "공격 후 적에게 특수공격의 5%에 해당하는 추가 고정 데미지를 입힙니다.",
    cost: 1,
    weight: (pokemon) => (isTankPokemon(pokemon) ? 30 : 100),
    isEligible: (pokemon) => isSpecialPokemon(pokemon),
    // SkillEffect.js에 구현
  },
  {
    id: "bladeOfTheRuinedKing",
    name: "몰락한 왕의 검",
    desc: "적의 현재 체력의 15% 만큼 추가 데미지를 입힙니다.",
    cost: 1,
    weight: 100,
    // damageCalculate.js에 구현
  },
  {
    id: "collector",
    name: "징수의 총",
    desc: "급소 확률이 25% 증가합니다.\n공격 후 상대 포켓몬의 체력이 5% 이하일 경우 처형합니다.",
    cost: 2,
    weight: (pokemon) => (isTankPokemon(pokemon) ? 30 : 100),
    // damage.js에 구현
  },
  {
    id: "axeOfDespair",
    name: "데몬의 도끼",
    desc: "장착 몬스터의 공격력을 100 올린다.",
    cost: 3,
    weight: (pokemon) => (isTankPokemon(pokemon) ? 30 : 100),
    isEligible: (pokemon) => isPhysicalPokemon(pokemon),
  },
  {
    id: "powerOfKing",
    name: "그 힘이야말로 왕인 까닭이다",
    desc: "해당 포켓몬의 공격과 특수공격을 최대 200만큼 올립니다. 수치 20당 코스트가 1 증가합니다.",
    screenText: function (target, prevPokeName, options) {
      const bonus = Number(options?.kingStatBonus ?? this?.kingStatBonus ?? target?.kingStatBonus ?? 20);
      return `[증강] 공격과 특수공격을 ${bonus} 얻었다!`;
    },
    logModalText: function (target, prevPokeName, options) {
      const bonus = Number(options?.kingStatBonus ?? this?.kingStatBonus ?? target?.kingStatBonus ?? 20);
      const cost = Number(options?.kingCost ?? this?.cost ?? bonus / 20);
      return `공격과 특수공격을 ${bonus} 획득하였습니다.`;
    },
    statusModalText: function (pokemon, battle, options) {
      const bonus = Number(options?.kingStatBonus ?? this?.kingStatBonus ?? pokemon?.kingStatBonus ?? 20);
      const cost = Number(options?.kingCost ?? this?.cost ?? bonus / 20);
      return `공격과 특수공격을 ${bonus} 획득하였습니다.`;
    },
    cost: "?",
    weight: 100,
    onApply: function (pokemon, battle, options) {
      if (!pokemon) return;
      const bonus = Number(options?.kingStatBonus ?? this?.kingStatBonus ?? 20);
      const cost = Number(options?.kingCost ?? this?.cost ?? bonus / 20);
      this.kingStatBonus = bonus;
      this.cost = cost;
      pokemon.kingStatBonus = bonus;
    },
  },
  {
    id: "sunfireAegis",
    name: "태양불꽃방패",
    desc: "매 턴 내 최대 HP의 10%만큼 상대에게 데미지를 입힙니다.",
    cost: 2,
    weight: (pokemon) => (isTankPokemon(pokemon) ? 200 : 30),
    // turnEnd.js에 구현
  },
  {
    id: "warmogsArmor",
    name: "워모그의 갑옷",
    desc: "매 턴 최대 HP의 3%만큼 회복합니다.\n데미지를 입지 않은 경우 2배로 회복합니다.",
    cost: 2,
    weight: (pokemon) => (isTankPokemon(pokemon) ? 200 : 30),
    // turnEnd.js에 구현
  },
  {
    id: "spiritVisage",
    name: "정령의 형상",
    desc: "해당 포켓몬이 받는 모든 회복 효과가 50% 증가합니다.",
    cost: 3,
    weight: (pokemon) => (isTankPokemon(pokemon) ? 200 : 30),
    // PokemonRecover.js에 구현
  },
  {
    id: "swordEnhance",
    name: "검 강화하기",
    desc: "검을 강화하여 강화 단계에 따라 공격과 특수공격을 획득합니다.",
    selDesc: function () {
      return "검을 강화하여 강화 단계에 따라 공격과 특수공격을 획득합니다.";
    },
    screenText: function (target, prevPokeName, options) {
      const failed = Boolean(options?.swordFailed ?? this?.swordFailed ?? target?.swordFailed);
      const level = Number(options?.swordLevel ?? this?.swordLevel ?? target?.swordLevel ?? 0);
      const bonusAtk = options?.swordBonusAtk !== undefined ? Number(options.swordBonusAtk) : this?.swordBonusAtk !== undefined ? Number(this.swordBonusAtk) : target?.swordBonusAtk !== undefined ? Number(target.swordBonusAtk) : failed ? 0 : 20 + level * 20;
      return failed ? "[증강] 강화에 실패하였다..." : `[증강] 검 강화에 성공하여 공격과 특수공격을 ${bonusAtk} 얻었다!`;
    },
    logModalText: function (target, prevPokeName, options) {
      const failed = Boolean(options?.swordFailed ?? this?.swordFailed ?? target?.swordFailed);
      const level = Number(options?.swordLevel ?? this?.swordLevel ?? target?.swordLevel ?? 0);
      const bonusAtk = options?.swordBonusAtk !== undefined ? Number(options.swordBonusAtk) : this?.swordBonusAtk !== undefined ? Number(this.swordBonusAtk) : target?.swordBonusAtk !== undefined ? Number(target.swordBonusAtk) : failed ? 0 : 20 + level * 20;
      return failed ? "강화에 실패하였다..." : `검 강화에 성공하여 공격과 특수공격을 ${bonusAtk} 얻었다!`;
    },
    statusModalText: function (pokemon, battle, options) {
      const failed = Boolean(options?.swordFailed ?? this?.swordFailed ?? pokemon?.swordFailed);
      const level = Number(options?.swordLevel ?? this?.swordLevel ?? pokemon?.swordLevel ?? 0);
      const bonusAtk = options?.swordBonusAtk !== undefined ? Number(options.swordBonusAtk) : this?.swordBonusAtk !== undefined ? Number(this.swordBonusAtk) : pokemon?.swordBonusAtk !== undefined ? Number(pokemon.swordBonusAtk) : failed ? 0 : 20 + level * 20;
      if (failed) return "강화에 실패하였습니다.";
      return `검 강화에 성공하여 공격과 특수공격을 ${bonusAtk} 획득하였습니다.`;
    },
    cost: 1,
    weight: 50,
    onApply: function (pokemon, battle, options) {
      const level = Number(options?.swordLevel ?? 0);
      const failed = Boolean(options?.swordFailed ?? false);
      const bonusAtk = options?.swordBonusAtk !== undefined ? Number(options.swordBonusAtk) : failed ? 0 : 20 + level * 20;
      const sName = options?.swordName;

      this.swordLevel = level;
      this.swordFailed = failed;
      this.swordBonusAtk = bonusAtk;
      this.swordName = sName;
      pokemon.swordLevel = level;
      pokemon.swordFailed = failed;
      pokemon.swordBonusAtk = bonusAtk;
      pokemon.swordName = sName;
    },
  },

  {
    id: "arcaneShadeSword",
    name: "아케인셰이드 투핸드소드",
    cost: 3,
    weight: 100,
    desc: "검을 원하는 주문서로 강화할 수 있습니다.\n이후 추가 강화 증강이 등장합니다.",
    screenText: function (target, prevPokeName, options) {
      const { atk, catk, speed, starBonus, name } = getArcaneSwordData(target, this, options);
      let statText = `공격 +${atk + starBonus}, 특공 +${catk + starBonus}`;
      if (speed > 0) statText += `, 스피드 +${speed}`;
      return `[증강] ${name} 강화 완료!\n(${statText})`;
    },
    logModalText: function (pokemon, battle, options) {
      const { atk, catk, speed, starBonus, name } = getArcaneSwordData(pokemon, this, options);
      let statText = `공격 +${atk + starBonus}, 특공 +${catk + starBonus}`;
      if (speed > 0) statText += `, 스피드 +${speed}`;
      return `${name}로 강화하여 ${statText}을 획득했습니다.`;
    },
    statusModalText: function (pokemon, battle, options) {
      const { atk, catk, speed, starCount, starBonus, hasSoul, cubeLines } = getArcaneSwordData(pokemon, this, options);
      let statText = `공격 +${atk + starBonus} 특공 +${catk + starBonus}`;
      if (speed > 0) statText += ` 스피드 +${speed}`;
      if (hasSoul) statText += `\n공격 +30% 특공 +30%`;
      if (cubeLines && cubeLines.length > 0) {
        statText += `\n[잠재능력]\n` + cubeLines.map((l) => l.text).join("\n");
      }
      return `${statText}`;
    },
    onApply: function (pokemon, battle, options) {
      const { successes, atk, catk, speed, starCount, hasSoul, name, cubeLines, cubeStats } = getArcaneSwordData(pokemon, this, options);

      this.name = name;
      this.shortName = name;
      this.hasGreatTuskSoul = hasSoul;
      this.arcaneStarCount = starCount;
      this.arcaneSuccessCount = successes;
      this.arcaneScrollAtk = atk;
      this.arcaneScrollCatk = catk;
      this.arcaneScrollSpeed = speed;
      this.arcaneSwordName = name;

      pokemon.hasGreatTuskSoul = hasSoul;
      pokemon.arcaneStarCount = starCount;
      pokemon.arcaneSuccessCount = successes;
      pokemon.arcaneScrollAtk = atk;
      pokemon.arcaneScrollCatk = catk;
      pokemon.arcaneScrollSpeed = speed;
      pokemon.arcaneSwordName = name;

      const lines = cubeLines || options?.cubeLines || this.cubeLines || pokemon?.cubeLines;
      const stats = cubeStats || options?.cubeStats || this.cubeStats || pokemon?.cubeStats;
      const hasCube = Boolean(options?.hasRolledCube || this.hasRolledCube || pokemon?.hasRolledCube || (lines && lines.length > 0));

      if (lines && lines.length > 0) {
        this.cubeLines = lines;
        this.cubeStats = stats;
        this.hasRolledCube = true;
        pokemon.cubeLines = lines;
        pokemon.cubeStats = stats;
        pokemon.hasRolledCube = true;
      } else if (hasCube) {
        this.hasRolledCube = true;
        pokemon.hasRolledCube = true;
      }
    },
  },
  {
    id: "greatTuskSoul",
    name: "위대한 엄니의 소울",
    desc: "아케인셰이드 투핸드소드에 공격 +30%, 특수공격 +30% 효과를 부여합니다.",
    cost: "-",
    weight: (pokemon) => (hasArcaneShadeSword(pokemon) && !getArcaneSwordData(pokemon).hasSoul ? 300 : 0),
    isEligible: (pokemon) => hasArcaneShadeSword(pokemon) && !getArcaneSwordData(pokemon).hasSoul,
    screenText: function (target) {
      return `[증강] ${target?.name}의 검에 위대한 엄니의 소울이 깃들었다!`;
    },
    logModalText: function (pokemon) {
      return "검에 위대한 엄니의 소울을 부여하여 공격과 특수공격을 30% 증가시킵니다.";
    },
    onApply: function (pokemon, battle, options) {
      const { swordAug, successes, starCount } = getArcaneSwordData(pokemon, this, options);
      const newName = getArcaneSwordFullName({ starCount, hasSoul: true, scrollCount: successes });

      pokemon.hasGreatTuskSoul = true;
      pokemon.arcaneSwordName = newName;

      if (swordAug && typeof swordAug === "object") {
        swordAug.name = newName;
        swordAug.shortName = newName;
        swordAug.hasGreatTuskSoul = true;
        swordAug.arcaneSwordName = newName;
      }
    },
  },
  {
    id: "starforce",
    name: "스타포스",
    desc: "별의 힘으로 아케인셰이드 투핸드소드를 강화합니다.",
    cost: "-",
    weight: (pokemon) => {
      if (!hasArcaneShadeSword(pokemon)) return 0;
      const { starCount } = getArcaneSwordData(pokemon);
      if (starCount >= 25) return 0;
      return Math.max((10 - starCount) * 20, 0) + 10;
    },
    isEligible: (pokemon) => hasArcaneShadeSword(pokemon) && getArcaneSwordData(pokemon).starCount < 25,
    screenText: function (target, prevPokeName, options) {
      const { starCount } = getArcaneSwordData(target, this, options);
      return `[증강] ${target?.name}의 검이 [★${starCount}]성으로 강화되었다!`;
    },
    logModalText: function (pokemon, battle, options) {
      const { starCount } = getArcaneSwordData(pokemon, this, options);
      return `스타포스 강화를 통해 검을 [★${starCount}]성으로 강화했습니다. (공격 +${starCount * 10}, 특수공격 +${starCount * 10})`;
    },
    onApply: function (pokemon, battle, options) {
      const { swordAug, starCount, name } = getArcaneSwordData(pokemon, this, options);

      pokemon.arcaneStarCount = starCount;
      pokemon.arcaneSwordName = name;

      if (swordAug && typeof swordAug === "object") {
        swordAug.name = name;
        swordAug.shortName = name;
        swordAug.arcaneStarCount = starCount;
        swordAug.arcaneSwordName = name;
      }
    },
  },
  {
    id: "cleanSlateScroll",
    name: "순백의 주문서",
    desc: function (pokemon) {
      if (!pokemon || !hasArcaneShadeSword(pokemon)) {
        return "아케인셰이드 투핸드소드의 주문서 적용 실패로 차감된 업그레이드 가능 횟수를 회복시킵니다. 이후 다시 강화를 진행할 수 있습니다.";
      }
      const { name, failCount } = getArcaneSwordData(pokemon);
      return `${name}의 주문서 적용 실패로 차감된 업그레이드 가능 횟수 ${failCount}회를 회복시킵니다. 이후 다시 강화를 진행할 수 있습니다.`;
    },
    cost: "-",
    weight: (pokemon) => {
      if (!hasArcaneShadeSword(pokemon)) return 0;
      const { failCount } = getArcaneSwordData(pokemon);
      return failCount * 20;
    },
    isEligible: (pokemon) => hasArcaneShadeSword(pokemon) && getArcaneSwordData(pokemon).failCount > 0,
    screenText: function (target, prevPokeName, options) {
      const { atk, catk, speed, starBonus, name } = getArcaneSwordData(target, this, options);
      let statText = `공격 +${atk + starBonus}, 특공 +${catk + starBonus}`;
      if (speed > 0) statText += `, 스피드 +${speed}`;
      return `[증강] ${name} 강화 완료!\n(${statText})`;
    },
    logModalText: function (pokemon, battle, options) {
      const { name } = getArcaneSwordData(pokemon, this, options);
      return `순백의 주문서로 재강화를 진행하여 ${name}을 완성했습니다.`;
    },
    onApply: function (pokemon, battle, options) {
      const { swordAug, successes, atk, catk, speed, name } = getArcaneSwordData(pokemon, this, options);

      pokemon.arcaneSuccessCount = successes;
      pokemon.arcaneScrollAtk = atk;
      pokemon.arcaneScrollCatk = catk;
      pokemon.arcaneScrollSpeed = speed;
      pokemon.arcaneSwordName = name;

      if (swordAug && typeof swordAug === "object") {
        swordAug.name = name;
        swordAug.shortName = name;
        swordAug.arcaneSuccessCount = successes;
        swordAug.arcaneScrollAtk = atk;
        swordAug.arcaneScrollCatk = catk;
        swordAug.arcaneScrollSpeed = speed;
        swordAug.arcaneSwordName = name;
      }
    },
  },
  {
    id: "cube",
    name: "큐브",
    desc: "장비 아이템의 잠재능력을 새롭게 설정시켜주는 신비한 큐브를 10개 획득합니다.",
    cost: "-",
    weight: (pokemon) => {
      if (!hasArcaneShadeSword(pokemon)) return 0;
      const hasLines = pokemon?.cubeLines?.length > 0 || Boolean(pokemon?.hasRolledCube);
      return hasLines ? 30 : 150;
    },
    isEligible: (pokemon) => hasArcaneShadeSword(pokemon),
    screenText: `[증강] 신비한 큐브를 사용하여 검의 잠재능력을 부여하였다!`,
    logModalText: `신비한 큐브를 사용하여 검에 잠재능력을 부여했습니다.`,
    onApply: function (pokemon, battle, options) {
      const { swordAug } = getArcaneSwordData(pokemon, this, options);
      const lines = options?.cubeLines || [];
      const stats = options?.cubeStats || pokemon.cubeStats;

      pokemon.cubeLines = lines;
      pokemon.cubeStats = stats;
      pokemon.hasRolledCube = true;

      if (swordAug && typeof swordAug === "object") {
        swordAug.cubeLines = lines;
        swordAug.cubeStats = stats;
        swordAug.hasRolledCube = true;
      }
    },
  },
  {
    id: "soulDice",
    name: "영혼의 주사위",
    desc: "주사위를 굴려 총 50의 스탯을 얻습니다.\n주사위는 계속 굴릴 수 있습니다.",
    screenText: function () {
      return "[증강] 주사위를 굴려 스탯을 얻었다!";
    },
    logModalText: function (pokemon, battle, options) {
      const stats = options?.soulDiceStats || this?.soulDiceStats || pokemon?.soulDiceStats;
      return `주사위를 굴려 스탯을 얻었습니다.\n(공격:${stats.atk} 방어:${stats.def} 특공:${stats.catk} 특방:${stats.cdef} 스피드:${stats.speed})`;
    },
    statusModalText: function (pokemon, battle, options) {
      const stats = options?.soulDiceStats || this?.soulDiceStats || pokemon?.soulDiceStats;
      return `주사위를 굴려 스탯을 얻었습니다.\n(공격:${stats.atk} 방어:${stats.def} 특공:${stats.catk} 특방:${stats.cdef} 스피드:${stats.speed})`;
    },
    cost: 1,
    weight: 60,
    onApply: function (pokemon, battle, options) {
      const stats = options?.soulDiceStats || rollSoulDiceStats();
      this.soulDiceStats = stats;
      pokemon.soulDiceStats = stats;
    },
  },

  {
    id: "nullifyGetto",
    name: "이 공격 무효일세",
    desc: "해당 포켓몬에게 무효 타입을 하나 추가합니다.",
    screenText: function (target, prevPokeName, options) {
      const nullType = options?.selectedType || this?.selectedType || target?._nullifyType || "";
      const names = target ? target.names("는") : "포켓몬은";
      return `[증강] ${names} ${nullType} 타입 무효 효과를 얻었다!`;
    },
    logModalText: function (target, prevPokeName, options) {
      const nullType = options?.selectedType || this?.selectedType || target?._nullifyType || "";
      const names = target ? target.names("는") : "포켓몬은";
      return `${names} ${nullType} 타입 무효 효과를 얻었다!`;
    },
    statusModalText: function (pokemon) {
      const chosen = this?.selectedType || pokemon?._nullifyType || pokemon?.augments?.find((a) => a.id === "nullifyGetto")?.selectedType;
      return `${chosen} 타입 무효 효과를 획득하였습니다.`;
    },
    cost: 2,
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
    selDesc: function (pokemon, battle) {
      const stat = pokemon?.stat;
      if (stat && typeof stat.atk === "number" && typeof stat.catk === "number") {
        const atkRank = Number(pokemon?.tempStatus?.rank?.atk ?? 0);
        const catkRank = Number(pokemon?.tempStatus?.rank?.catk ?? 0);
        const atkVal = Math.floor(getAugmentedStat(pokemon, "atk", battle) * getMultiplier(atkRank));
        const catkVal = Math.floor(getAugmentedStat(pokemon, "catk", battle) * getMultiplier(catkRank));
        return `공격(${atkVal})과 특수공격(${catkVal}) 중 하나가 2배가 되고 다른 하나가 절반이 됩니다.`;
      }
      return this.desc;
    },
    screenText: function (target, prevPokeName, options) {
      const pick = options?.targetStat || this?.allOrNothingResult;
      return pick === "atk" ? "[증강] 공격이 2배, 특수공격이 절반이 되었다!" : "[증강] 특수공격이 2배, 공격이 절반이 되었다!";
    },
    logModalText: function (target, prevPokeName, options) {
      const pick = options?.targetStat || this?.allOrNothingResult;
      return pick === "atk" ? "공격이 2배, 특수공격이 절반이 되었다!" : "특수공격이 2배, 공격이 절반이 되었다!";
    },
    statusModalText: function (pokemon, battle, options) {
      const pick = options?.targetStat || pokemon?.augments?.find((a) => a.id === "allOrNothing")?.allOrNothingResult || this?.allOrNothingResult;
      const stat = pokemon?.stat;
      if (stat && typeof stat.atk === "number" && typeof stat.catk === "number") {
        const atkRank = Number(pokemon?.tempStatus?.rank?.atk ?? 0);
        const catkRank = Number(pokemon?.tempStatus?.rank?.catk ?? 0);
        const atkVal = Math.floor(getAugmentedStat(pokemon, "atk", battle) * getMultiplier(atkRank));
        const catkVal = Math.floor(getAugmentedStat(pokemon, "catk", battle) * getMultiplier(catkRank));
        if (pick === "atk") {
          return `공격(${atkVal})이 2배가 되고 특수공격(${catkVal})이 절반이 되었습니다.`;
        }
        if (pick === "catk") {
          return `특수공격(${catkVal})이 2배가 되고 공격(${atkVal})이 절반이 되었습니다.`;
        }
      }
      if (pick === "atk") {
        return "공격이 2배가 되고 특수공격이 절반이 되었습니다.";
      }
      if (pick === "catk") {
        return "특수공격이 2배가 되고 공격이 절반이 되었습니다.";
      }
      return this.desc;
    },
    cost: 3,
    weight: (pokemon) => (isTankPokemon(pokemon) ? 30 : 100),
    onApply: function (pokemon, battle, options) {
      if (!pokemon) return;
      const pick = options?.targetStat || (Math.random() < 0.5 ? "atk" : "catk");
      this.allOrNothingResult = pick;
      pokemon.allOrNothingResult = pick;
    },
  },

  // 순풍 ====================================================================
  {
    id: "tailwind",
    name: "순풍",
    desc: "4턴 동안 자신 편의 포켓몬의 스피드를 2배로 올리는 순풍을 전개한다.",
    screenText: function (target) {
      return `[증강] ${target?.name || "포켓몬"}의 순풍!`;
    },
    afterText: "우리 편의 뒤에서 순풍이 불기 시작했다!",
    cost: "-",
    weight: 50,
    isEligible: (pokemon, battle) => {
      if (!isBattlePlayerActive(pokemon, battle)) return false;
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
  // 특성의 역전 =============================================================
  {
    id: "abilityInversion",
    name: "특성의 역전",
    desc: "기본 특성과 메가진화 특성을 교환합니다.",
    screenText: function (target) {
      return `[증강] ${target?.name}의 기본 특성과 메가진화 특성이 뒤바뀌었다!`;
    },
    cost: 1,
    weight: 300,
    // 선파워 리자몽Y와 예리함 엘레이드
    isEligible: (pokemon) => {
      const isCharizardY = (hasPokemonName(pokemon, "리자몽") || pokemon?.sampleName?.includes("리자몽")) && pokemon?.item === "리자몽나이트Y";
      const isGallade = (hasPokemonName(pokemon, "엘레이드") || pokemon?.sampleName?.includes("엘레이드")) && pokemon?.item === "엘레이드나이트";
      return isCharizardY || isGallade;
    },
    onApply: function (pokemon) {
      if (!pokemon || !pokemon.megaData) return;
      const baseAbilName = pokemon.abil.name;
      const megaAbilName = pokemon.megaData.abil;
      pokemon.changeAbil(megaAbilName);
      pokemon.megaAbil = baseAbilName;
    },
  },
  // 위협 ====================================================================
  {
    id: "intimidate",
    name: "위협",
    desc: "상대를 위축시켜 공격을 떨어뜨립니다.",
    screenText: function (target) {
      return `[증강] ${target?.name || "포켓몬"}의 위협!`;
    },
    cost: "-",
    weight: 70,
    isEligible: (pokemon, battle) => {
      if (!isBattlePlayerActive(pokemon, battle)) return false;
      const teamSide = pokemon?.team || "player";
      const oppSide = teamSide === "player" ? "npc" : "player";
      const opponent = battle?.[oppSide];
      if (!opponent || opponent.faint) return false;
      if (!isPhysicalPokemon(opponent)) return false;
      const blockedAbils = ["클리어바디", "하얀연기", "괴력집게", "정신력", "둔감", "마이페이스", "배짱", "미러아머", "오기", "승기", "주눅"];
      const oppAbil = opponent.abil?.name;
      if (blockedAbils.includes(oppAbil)) return false;
      return true;
    },
    onApply: function (pokemon, battle, options) {
      const teamSide = pokemon?.team || "player";
      const oppSide = teamSide === "player" ? "npc" : "player";
      const opponent = battle?.[oppSide];
      if (!opponent || opponent.faint) return;
      const enqueue = options?.enqueue;
      opponent.rankUp(battle, enqueue, "atk", -1, "[증강 위협]", true);
    },
  },
  // 스텔스록 ==================================================================
  {
    id: "stealthRock",
    name: "스텔스록",
    desc: "상대의 주위에 무수한 바위를 띄워 교체되어 나온 상대 포켓몬에게 데미지를 입힙니다.",
    screenText: function (target) {
      return `[증강] ${target?.name || "포켓몬"}의 스텔스록!`;
    },
    afterText: (target) => {
      const team = target?.team || "player";
      return team === "npc" ? "아군의 주변에 뾰족한 바위가 떠다니기 시작했다!" : "상대의 주변에 뾰족한 바위가 떠다니기 시작했다!";
    },
    cost: "-",
    weight: 70,
    isEligible: (pokemon, battle) => {
      if (!isBattlePlayerActive(pokemon, battle)) return false;
      const teamSide = pokemon?.team || "player";
      const oppSide = teamSide === "player" ? "npc" : "player";
      if (battle?.field?.[oppSide]?.sRock) return false;
      if (hasSkill(pokemon, "스텔스록")) return false;
      return true;
    },
    onApply: function (pokemon, battle) {
      const team = pokemon?.team || "player";
      const oppSide = team === "player" ? "npc" : "player";
      if (battle?.field?.[oppSide]) {
        battle.field[oppSide].sRock = true;
      }
    },
  },
  // 끈적끈적네트 ================================================================
  {
    id: "stickyWeb",
    name: "끈적끈적네트",
    desc: "상대의 주위에 끈적끈적한 네트를 쳐 교체되어 나온 상대 포켓몬의 스피드를 1랭크 떨어뜨립니다.",
    screenText: function (target) {
      return `[증강] ${target?.name || "포켓몬"}의 끈적끈적네트!`;
    },
    afterText: (target) => {
      const team = target?.team || "player";
      return team === "npc" ? "아군의 발밑에 끈적끈적한 네트가 펼쳐졌다!" : "상대의 발밑에 끈적끈적한 네트가 펼쳐졌다!";
    },
    cost: "-",
    weight: 70,
    isEligible: (pokemon, battle) => {
      if (!isBattlePlayerActive(pokemon, battle)) return false;
      const teamSide = pokemon?.team || "player";
      const oppSide = teamSide === "player" ? "npc" : "player";
      const b = battle || (typeof window !== "undefined" && window.__battle) || null;
      if (b?.field?.[oppSide]?.stickyWeb) return false;
      if (hasSkill(pokemon, "끈적끈적네트")) return false;
      return true;
    },
    onApply: function (pokemon, battle) {
      const team = pokemon?.team || "player";
      const oppSide = team === "player" ? "npc" : "player";
      const b = battle || (typeof window !== "undefined" && window.__battle) || null;
      if (b?.field?.[oppSide]) {
        b.field[oppSide].stickyWeb = true;
      }
    },
  },
  {
    id: "anvilStat",
    name: "모루 능력치",
    desc: "누적되는 추가 능력치를 획득합니다.",
    selDesc: function () {
      return "누적되는 추가 능력치를 획득합니다.";
    },
    screenText: function (target, prevPokeName, options) {
      const statLabels = { atk: "공격", catk: "특공", def: "방어", cdef: "특방", speed: "스피드" };
      const pickedStat = options?.pickedStat || this?.pickedStat;
      const pickedAmount = options?.pickedAmount || this?.pickedAmount;
      const statLabel = statLabels[pickedStat] || "능력치";
      const pokeName = target?.name || "포켓몬";
      return pickedStat && pickedAmount ? josa(`[증강] 능력치 파편으로 ${pokeName}의 ${statLabel}#{이} ${pickedAmount} 올랐다!`) : `[증강] ${target ? target.names("는") : "포켓몬은"} 모루 능력치를 획득했다!`;
    },
    logModalText: function (target, prevPokeName, options) {
      const statLabels = { atk: "공격", catk: "특공", def: "방어", cdef: "특방", speed: "스피드" };
      const pickedStat = options?.pickedStat || this?.pickedStat;
      const pickedAmount = options?.pickedAmount || this?.pickedAmount;
      const statLabel = statLabels[pickedStat] || "능력치";
      return pickedStat && pickedAmount ? josa(`능력치 파편으로 ${statLabel}#{이} ${pickedAmount} 올랐습니다.`) : "누적되는 추가 능력치를 획득합니다.";
    },
    statusModalText: function (pokemon) {
      return getAnvilStatsStatusDesc(pokemon);
    },
    cost: "-",
    weight: 100,
    isEligible: () => true,
    onApply: function (pokemon, battle, options) {
      if (!pokemon) return;
      if (!pokemon.anvilStats) {
        pokemon.anvilStats = { atk: 0, def: 0, catk: 0, cdef: 0, speed: 0 };
      }

      const STAT_KEYS = ["atk", "catk", "def", "cdef", "speed"];
      const pickedStat = options?.pickedStat || STAT_KEYS[Math.floor(Math.random() * STAT_KEYS.length)];
      const pickedAmount = Number(options?.pickedAmount !== undefined ? options.pickedAmount : Math.floor(Math.random() * 6) + 5);
      pokemon.anvilStats[pickedStat] = (pokemon.anvilStats[pickedStat] || 0) + pickedAmount;

      if (options) {
        options.pickedStat = pickedStat;
        options.pickedAmount = pickedAmount;
      }
      this.pickedStat = pickedStat;
      this.pickedAmount = pickedAmount;
    },
  },
  {
    id: "swordAndShield",
    name: "오른손엔 방패 왼손엔 검",
    desc: function (pokemon, battle) {
      return getStatCompareDesc(pokemon, "atk", "def", battle);
    },
    cost: 2,
    weight: 100,
    isEligible: (pokemon, battle) => canPickStatSwapAugment(pokemon) && isPhysicalPokemon(pokemon) && hasStatRatioDiff(pokemon, "atk", "def", 1.5, battle),
    // damageCalculate.js에 구현
  },
  {
    id: "specialSwordAndShield",
    name: "과거의 영광 (특수)",
    desc: function (pokemon, battle) {
      return getStatCompareDesc(pokemon, "catk", "cdef", battle);
    },
    cost: 2,
    weight: 100,
    isEligible: (pokemon, battle) => canPickStatSwapAugment(pokemon) && isSpecialPokemon(pokemon) && hasStatRatioDiff(pokemon, "catk", "cdef", 1.5, battle),
    // damageCalculate.js에 구현
  },
  {
    id: "lostTechnologyBlizzard",
    name: "과거의 영광 (눈보라)",
    desc: "눈보라의 위력이 120, 명중률이 90이 됩니다. 30% 확률로 적을 얼리며 절대 녹지 않습니다.",
    screenText: function (target) {
      return `[증강] 눈보라가 과거의 위상을 되찾았다!`;
    },
    cost: 3,
    weight: 100,
    isEligible: (pokemon) => hasSkill(pokemon, "눈보라"),
    onApply: function (pokemon, battle, options) {
      if (!pokemon?.skill) return;
      let slot = Number(options?.replaceSlot);
      if (!slot || !pokemon.skill[slot]) {
        for (let s = 1; s <= 4; s++) {
          const sk = pokemon.skill[s];
          if (sk?.name === "눈보라") {
            slot = s;
            break;
          }
        }
      }
      if (!slot) return;
      this.replacedSlot = slot;

      const upgradedBlizzard = new Skill("눈보라", "얼음", 120, 90, 5, 0, "catk", null, "30% 확률로 상대를 얼음 상태로 만든다.", [{ name: "freezeBug", probability: 30 }], {});
      upgradedBlizzard.skillNumber = slot;
      upgradedBlizzard.isLostTechnologyBlizzard = true;

      pokemon.skill[slot] = upgradedBlizzard;
      pokemon.pp[slot] = upgradedBlizzard.pp;
    },
  },
  {
    id: "lostTechnologyPsychic",
    name: "과거의 영광 (에스퍼)",
    desc: "고스트 타입 공격을 무효로 받습니다.\n추가로 강철, 악 타입과 모든 상성 계산이 1배로 적용됩니다.",
    screenText: function (target) {
      return `[증강] 에스퍼타입이 과거의 위상을 되찾았다!`;
    },
    cost: 0,
    weight: 200,
    isEligible: (pokemon) => hasPokemonName(pokemon, "뮤츠"),
  },
  {
    id: "lostTechnologyHyperBeam",
    name: "과거의 영광 (파괴광선)",
    desc: "파괴광선으로 적을 쓰러뜨리면 반동을 받지 않습니다. 공격, 특수공격 중 더 높은 능력치를 사용합니다.",
    screenText: function (target) {
      return `[증강] 파괴광선이 과거의 위상을 되찾았다!`;
    },
    cost: 1,
    weight: 100,
    isEligible: (pokemon) => hasSkill(pokemon, "파괴광선"),
    onApply: function (pokemon, battle, options) {
      if (!pokemon?.skill) return;
      let slot = Number(options?.replaceSlot);
      if (!slot || !pokemon.skill[slot]) {
        for (let s = 1; s <= 4; s++) {
          const sk = pokemon.skill[s];
          if (sk?.name === "파괴광선") {
            slot = s;
            break;
          }
        }
      }
      if (!slot) {
        for (let s = 1; s <= 4; s++) {
          if (pokemon.skill[s]?.type === "노말") {
            slot = s;
            break;
          }
        }
      }
      if (!slot) return;
      this.replacedSlot = slot;

      const baseAtk = pokemon?.stat?.atk || 0;
      const baseCatk = pokemon?.stat?.catk || 0;
      const initialStype = baseAtk > baseCatk ? "atk" : "catk";
      const upgradedHyperBeam = new Skill("파괴광선", "노말", 150, 90, 5, 0, initialStype, null, "빛의 광선으로 상대를 공격한다. 적을 쓰러뜨리면 반동을 받지 않는다. 공격, 특수공격 중 더 높은 능력치를 사용한다.", [{ name: "반동휴식" }], {});
      upgradedHyperBeam.skillNumber = slot;

      pokemon.skill[slot] = upgradedHyperBeam;
      pokemon.pp[slot] = upgradedHyperBeam.pp;
    },
  },
  {
    id: "ksante",
    name: "체력 4700 방어력 329 마저201 인 챔피언👤이 저지불가🚫, 쉴드🛡, 벽🧱 넘기는 거 있고요. 에어본🌪 있고, 심지어 쿨타임은 1️⃣초밖에 안되고 마나🧙♂️는 1️⃣5️⃣ 들고 w는 심지어 변신💫하면 쿨 초기화에다가 패시브는 고정피해🗡가 들어가며 그 다음에 방마저🥋 올리면📈 올릴수록📈 스킬 가속⏰이 생기고! q에 스킬가속⏰이 생기고 스킬 속도🚀가 빨라지고📈 그 다음에 공격력🗡 계수가 있어가지고 W가 그 이익-으아아아악😱",
    desc: function (pokemon, battle) {
      return getStatCompareDesc(pokemon, "def", "cdef", battle);
    },
    cost: 3,
    weight: (pokemon) => (isTankPokemon(pokemon) ? 200 : 30),
    shortName: "그 긴거",
    isEligible: (pokemon, battle) => canPickStatSwapAugment(pokemon) && hasStatRatioDiff(pokemon, "def", "cdef", 1.5, battle),
    // damageCalculate.js에 구현
  },
  {
    id: "hhgghgg",
    name: "H.H.G.G.H.G.G",
    desc: function (pokemon, battle) {
      const highest = getHighestStatInfo(pokemon, battle);
      if (highest) {
        return `항상 가장 높은 값의 능력치를 사용합니다. (${highest.label} ${highest.displayValue})`;
      }
      return "항상 가장 높은 값의 능력치를 사용합니다.";
    },
    cost: 10,
    weight: 20,
    isEligible: canPickStatSwapAugment,
    // damageCalculate.js, speedCheck.js에 구현
  },

  {
    id: "teraBlast",
    name: "테라버스트",
    desc: "현재 기술 중 하나를 원하는 타입의 테라버스트로 교체합니다.",
    selDesc: function () {
      return "현재 기술 중 하나를 원하는 타입의 테라버스트로 교체합니다.";
    },
    screenText: function (target, prevPokeName, options) {
      const augOnPoke = target?.augments?.find((a) => a.id === "teraBlast");
      const chosenType = options?.selectedType || this?.selectedType || augOnPoke?.selectedType || "노말";
      const prevSkillName = options?.replacedSkillName || this?.replacedSkillName || augOnPoke?.replacedSkillName || "기존 기술";
      const names = target?.names ? target.names("는") : "포켓몬은";
      return josa(`[증강] ${names} ${prevSkillName}#{을} ${chosenType}타입 테라버스트와 교체했다!`);
    },
    logModalText: function (target, prevPokeName, options) {
      const augOnPoke = target?.augments?.find((a) => a.id === "teraBlast");
      const chosenType = options?.selectedType || this?.selectedType || augOnPoke?.selectedType || "노말";
      const prevSkillName = options?.replacedSkillName || this?.replacedSkillName || augOnPoke?.replacedSkillName || "기존 기술";
      const names = target?.names ? target.names("는") : "포켓몬은";
      return josa(`${names} ${prevSkillName}#{을} ${chosenType}타입 테라버스트와 교체했다!`);
    },
    statusModalText: function (pokemon, battle, options) {
      const augOnPoke = pokemon?.augments?.find((a) => a.id === "teraBlast");
      const chosenType = options?.selectedType || this?.selectedType || augOnPoke?.selectedType || "노말";
      const prevSkillName = options?.replacedSkillName || this?.replacedSkillName || augOnPoke?.replacedSkillName;
      if (prevSkillName) {
        return josa(`${prevSkillName}#{을} ${chosenType}타입 테라버스트와 교체했습니다.`);
      }
      return this.desc;
    },
    cost: 1,
    weight: 100,
    onApply: function (pokemon, battle, options) {
      if (!pokemon?.skill) return;
      const slot = Number(options?.replaceSlot) || 4;
      const chosenType = options?.selectedType || "노말";
      const prevSkill = pokemon.skill[slot];
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

      pokemon.skill[slot] = teraBlast;
      if (pokemon.pp) {
        pokemon.pp[slot] = teraBlast.pp;
      }
    },
  },

  {
    id: "sanctuary",
    name: "생츄어리",
    desc: "현재 기술 중 하나를 생츄어리와 교체합니다. 생츄어리는 적의 체력을 1로 만들지만 다음턴 움직일 수 없습니다.",
    screenText: function (target, prevPokeName, options) {
      const prevSkillName = options?.replacedSkillName || this?.replacedSkillName || "기존 기술";
      const names = target?.names ? target.names("는") : "포켓몬은";
      return josa(`[증강] ${names} ${prevSkillName}#{을} 생츄어리와 교체했다!`);
    },
    logModalText: function (target, prevPokeName, options) {
      const prevSkillName = options?.replacedSkillName || this?.replacedSkillName || "기존 기술";
      const names = target?.names ? target.names("는") : "포켓몬은";
      return josa(`${names} ${prevSkillName}#{을} 생츄어리와 교체했다!`);
    },
    statusModalText: function (pokemon, battle, options) {
      const prevSkillName = options?.replacedSkillName || this?.replacedSkillName;
      if (prevSkillName) {
        return josa(`${prevSkillName}#{을} 생츄어리와 교체했습니다.`);
      }
      return this.desc;
    },
    cost: 1,
    weight: 100,
    isEligible: (pokemon) => !hasSkill(pokemon, "생츄어리"),
    onApply: function (pokemon, battle, options) {
      if (!pokemon?.skill) return;
      const slot = Number(options?.replaceSlot) || 4;
      const prevSkill = pokemon.skill[slot];
      const prevSkillName = options?.replacedSkillName || prevSkill?.name || "기존 기술";

      this.replacedSlot = slot;
      this.replacedSkillName = prevSkillName;

      const baseSanctuary = skillList.search("생츄어리");
      const sanctuarySkill = {
        ...baseSanctuary,
        skillNumber: slot,
      };

      pokemon.skill[slot] = sanctuarySkill;
      if (pokemon.pp) {
        pokemon.pp[slot] = sanctuarySkill.pp;
      }
    },
  },

  // 포켓몬 교체 증강 ==============================================================================

  {
    id: "rouletteWheel",
    name: "돌려 돌려 돌림판",
    desc: "해당 포켓몬을 임의의 포켓몬과 교체합니다.",
    screenText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      const toName = target?.name || "";
      return josa(`[증강] ${fromName}#{이} ${toName}#{으로} 교체되었다!`);
    },
    logModalText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      const toName = target?.name || "";
      return josa(`${fromName}#{이} ${toName}#{으로} 교체되었다!`);
    },
    cost: "-",
    weight: (pokemon) => getReplacementAugmentWeight(pokemon),
    // 가중치 기본 200, 증강이 많을수록 감소 (200 / 1+n)
    isEligible: (pokemon) => isHpAtLeast(pokemon, 0.5),
    onApply: function (pokemon, battle) {
      const allItems = sampleList.items || [];
      const currentSampleName = pokemon.sampleName || pokemon.id;
      const team = battle ? [battle.player, battle.playerBench1, battle.playerBench2].filter(Boolean) : [];
      const filtered = allItems.filter((item) => {
        const name = item.sampleName || item.id;
        if (name === currentSampleName) return false;
        return !hasPokemonOnTeam(team, item.dexNo);
      });
      const pool = filtered.length > 0 ? filtered : allItems.filter((item) => (item.sampleName || item.id) !== currentSampleName);
      if (pool.length === 0) return;
      const picked = pool[Math.floor(Math.random() * pool.length)];
      replacePokemon(pokemon, picked.sampleName || picked.id, battle, { resetAugments: true });
    },
  },

  {
    id: "marriedPokemon",
    name: "포켓몬과 결혼한 사람이 있었다",
    desc: "해당 포켓몬을 임의의 포켓몬과 교체합니다. 모든 능력치가 1.1배 증가하는 증강을 추가로 얻습니다.",
    screenText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      const toName = target?.name || "";
      return josa(`[증강] ${fromName}#{이} ${toName}#{으로} 교체되었다!`);
    },
    logModalText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      const toName = target?.name || "";
      return josa(`${fromName}#{이} ${toName}#{으로} 교체되었다!`);
    },
    // 메가가디안, 님피아(딜탱), 메가이어롭, 마스카나 중 1 교체 + 인생의 동반자 획득
    cost: "-",
    weight: (pokemon) => getReplacementAugmentWeight(pokemon),
    isEligible: (pokemon) => {
      if (!isHpAtLeast(pokemon, 0.5)) return false;
      const excludedDex = ["0908", "0282", "0428", "0700"]; // 마스카나, 가디안, 이어롭, 님피아
      if (excludedDex.includes(pokemon.dexNo)) return false;
      return true;
    },
    onApply: function (pokemon, battle) {
      const candidates = ["메가가디안", "님피아 (특수딜탱)", "메가이어롭", "마스카나"];
      const team = battle ? [battle.player, battle.playerBench1, battle.playerBench2].filter(Boolean) : [];
      const available = candidates.filter((id) => {
        const sample = sampleList.getDataBySampleName(id);
        return !hasPokemonOnTeam(team, sample?.dexNo);
      });
      const pool = available.length > 0 ? available : candidates;
      const pickedId = pool[Math.floor(Math.random() * pool.length)];
      replacePokemon(pokemon, pickedId, battle, { resetAugments: true });

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
  },

  // 신을 제물로 (초전설 전용 교체 증강)
  {
    id: "sacrificeGod",
    name: "신을 제물로",
    desc: "해당 포켓몬을 임의의 포켓몬과 교체합니다. 모든 능력치가 1.5배 증가하는 영구적인 버프를 추가로 획득합니다.",
    screenText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      const toName = target?.name || "";
      return josa(`[증강] ${fromName}#{이} ${toName}#{으로} 교체되었다!`);
    },
    logModalText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      const toName = target?.name || "";
      return josa(`${fromName}#{이} ${toName}#{으로} 교체되었다!`);
    },
    cost: "-",
    weight: (pokemon) => getReplacementAugmentWeight(pokemon),
    isEligible: (pokemon) => {
      if (!isHpAtLeast(pokemon, 0.5)) return false;
      const isLeg = Boolean(pokemon?.feature?.legendary || pokemon?.legendary);
      return isLeg;
    },
    onApply: function (pokemon, battle) {
      const allItems = sampleList.items || [];
      const currentSampleName = pokemon.sampleName || pokemon.id;
      const team = battle ? [battle.player, battle.playerBench1, battle.playerBench2].filter(Boolean) : [];
      const filtered = allItems.filter((item) => {
        const isLeg = Boolean(item?.feature?.legendary || item?.legendary);
        if (isLeg) return false;
        const name = item.sampleName || item.id;
        if (name === currentSampleName) return false;
        return !hasPokemonOnTeam(team, item.dexNo);
      });
      const pool = filtered.length > 0 ? filtered : allItems.filter((item) => !Boolean(item?.feature?.legendary || item?.legendary) && (item.sampleName || item.id) !== currentSampleName);
      if (pool.length === 0) return;
      const picked = pool[Math.floor(Math.random() * pool.length)];
      replacePokemon(pokemon, picked.sampleName || picked.id, battle, { resetAugments: true });

      // 영혼의 심복 버프 추가 획득
      const minionAug = AUGMENT_LIST.find((a) => a.id === "soulMinion");
      if (minionAug) {
        if (typeof pokemon.applyAugment === "function") {
          pokemon.applyAugment(minionAug, battle);
        } else {
          if (!pokemon.augments) pokemon.augments = [];
          pokemon.augments.push({ ...minionAug, buf: true });
          if (typeof minionAug.onApply === "function") minionAug.onApply(pokemon, battle);
        }
      }
    },
  },
  // 곰은 사람을 찢어 (포켓몬 교체 증강)
  {
    id: "threeBears",
    name: "곰은 사람을 찢어",
    desc: "현재 포켓몬을 곰 포켓몬 중 한마리와 교체합니다. 곰 포켓몬의 수에 따라 능력치가 증가하는 증강을 추가로 획득합니다.",
    screenText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      const toName = target?.name || "";
      return josa(`[증강] ${fromName}#{이} ${toName}#{으로} 교체되었다!`);
    },
    logModalText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      const toName = target?.name || "";
      return josa(`${fromName}#{이} ${toName}#{으로} 교체되었다!`);
    },
    cost: "-",
    weight: (pokemon, battle) => {
      const side = pokemon?.team === "npc" ? "npc" : "player";
      const team = battle ? (side === "npc" ? [battle.npc, battle.npcBench1, battle.npcBench2] : [battle.player, battle.playerBench1, battle.playerBench2]).filter(Boolean) : [];
      const bearCount = team.filter(isBearPokemon).length;
      if (bearCount === 1) return 300;
      if (bearCount >= 2) return 500;
      return 100;
    },
    isEligible: (pokemon) => isHpAtLeast(pokemon, 0.5) && !isBearPokemon(pokemon),
    onApply: function (pokemon, battle) {
      const candidates = [
        { sampleName: "다투곰", dexNo: "0901" },
        { sampleName: "달투곰", dexNo: "0901" },
        { sampleName: "악라오스", dexNo: "0892" },
        { sampleName: "물라오스", dexNo: "0892" },
        { sampleName: "툰베어", dexNo: "0614" },
        { sampleName: "이븐곰", dexNo: "0760" },
      ];
      const side = pokemon?.team === "npc" ? "npc" : "player";
      const team = battle ? (side === "npc" ? [battle.npc, battle.npcBench1, battle.npcBench2] : [battle.player, battle.playerBench1, battle.playerBench2]).filter(Boolean) : [];
      const otherTeammates = team.filter((p) => p !== pokemon);
      const available = candidates.filter((c) => !hasPokemonOnTeam(otherTeammates, c.dexNo));
      const pool = available.length > 0 ? available : candidates;
      const picked = pool[Math.floor(Math.random() * pool.length)];

      replacePokemon(pokemon, picked.sampleName, battle, { resetAugments: true });

      // 해당 증강으로 얻은 곰 포켓몬한테 '곰 세마리가 한 집에 있어' 증강 추가
      const houseAug = AUGMENT_LIST.find((a) => a.id === "threeBearsHouse");
      if (houseAug) {
        if (!pokemon.augments) pokemon.augments = [];
        if (!pokemon.augments.some((a) => (typeof a === "string" ? a === "threeBearsHouse" : a?.id === "threeBearsHouse"))) {
          const newAug = { ...houseAug };
          pokemon.augments.push(newAug);
          if (typeof houseAug.onApply === "function") {
            houseAug.onApply(pokemon, battle);
          }
        }
      }

      syncTeamBearBuffs(battle);
    },
  },
  // 곰 세마리가 한 집에 있어 (일반 증강: 팀의 곰 포켓몬 수에 따라 모든 능력치 1.1 / 1.3 / 1.5배)
  {
    id: "threeBearsHouse",
    name: "곰 세마리가 한 집에 있어",
    desc: "팀의 곰 포켓몬 수에 따라 모든 능력치가 증가합니다.",
    screenText: function (target) {
      return `[증강] ${target ? target.names("는") : "포켓몬은"} 팀의 곰 포켓몬 수에 따라 모든 능력치가 증가했다!`;
    },
    statusModalText: function (pokemon, battle) {
      const b = battle || (typeof window !== "undefined" && window.__battle) || null;
      const side = pokemon?.team === "npc" ? "npc" : "player";
      const team = b ? (side === "npc" ? [b.npc, b.npcBench1, b.npcBench2] : [b.player, b.playerBench1, b.playerBench2]).filter(Boolean) : [];
      const count = team.length > 0 ? Math.min(3, Math.max(1, team.filter(isBearPokemon).length)) : this?.bearCount || 1;
      const multMap = { 1: "1.1", 2: "1.3", 3: "1.5" };
      const mult = multMap[count] || (this?.mult ? String(this.mult) : "1.1");
      return `팀에 곰 포켓몬이 ${count}마리 있어 능력치가 ${mult}배 상승합니다.`;
    },
    getDesc: (pokemon, battle, options = null) => {
      if (options?.showCurrentStats) {
        const b = battle || (typeof window !== "undefined" && window.__battle) || null;
        const side = pokemon?.team === "npc" ? "npc" : "player";
        const team = b ? (side === "npc" ? [b.npc, b.npcBench1, b.npcBench2] : [b.player, b.playerBench1, b.playerBench2]).filter(Boolean) : [];
        const count = team.length > 0 ? Math.min(3, Math.max(1, team.filter(isBearPokemon).length)) : 1;
        const multMap = { 1: "1.1", 2: "1.3", 3: "1.5" };
        const mult = multMap[count] || "1.1";
        return `팀에 곰 포켓몬이 ${count}마리 있어 능력치가 ${mult}배 상승합니다.`;
      }
      return "팀의 곰 포켓몬 수에 따라 모든 능력치가 증가합니다.";
    },
    cost: 0,
    weight: (pokemon, battle) => {
      const side = pokemon?.team === "npc" ? "npc" : "player";
      const team = battle ? (side === "npc" ? [battle.npc, battle.npcBench1, battle.npcBench2] : [battle.player, battle.playerBench1, battle.playerBench2]).filter(Boolean) : [];
      const bearCount = team.filter(isBearPokemon).length;
      if (bearCount <= 1) return 100;
      if (bearCount === 2) return 300;
      return 500;
    },
    isEligible: (pokemon) => {
      if (!isBearPokemon(pokemon)) return false;
      const augs = pokemon?.augments || [];
      if (pokemon?.hasAugment?.("threeBearsHouse") || augs.some((a) => (typeof a === "string" ? a === "threeBearsHouse" : a?.id === "threeBearsHouse"))) {
        return false;
      }
      return true;
    },
    onApply: function (pokemon, battle) {
      if (!pokemon) return;
      const side = pokemon?.team === "npc" ? "npc" : "player";
      const team = battle ? (side === "npc" ? [battle.npc, battle.npcBench1, battle.npcBench2] : [battle.player, battle.playerBench1, battle.playerBench2]).filter(Boolean) : [];
      const bearCount = team.filter(isBearPokemon).length || 1;
      const mult = bearCount >= 3 ? 1.5 : bearCount === 2 ? 1.3 : 1.1;

      const houseAug = (pokemon.augments || []).find((a) => (typeof a === "string" ? a === "threeBearsHouse" : a?.id === "threeBearsHouse"));
      if (houseAug && typeof houseAug === "object") {
        houseAug.bearCount = bearCount;
        houseAug.mult = mult;
      }

      syncTeamBearBuffs(battle);
    },
  },
  // 영혼의 심복 (모든 능력치 1.5배 증가 버프)
  {
    id: "soulMinion",
    name: "영혼의 심복",
    desc: "모든 능력치가 1.5배 증가합니다.",
    buf: true,
    permanent: true,
    isRandom: false,
    weight: "-",
    isEligible: () => false,
  },

  {
    id: "soaring",
    name: '"메가" 플라이곤',
    desc: "현재 포켓몬을 메가진화가 가능한 플라이곤과 교체합니다.",
    screenText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      return josa(`[증강] ${fromName}#{이} 플라이곤으로 교체되었다!`);
    },
    logModalText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      return josa(`${fromName}#{이} 플라이곤으로 교체되었다!`);
    },
    cost: "-",
    weight: (pokemon) => getReplacementAugmentWeight(pokemon),
    shiftUp: true,
    imageOptions: { shiftUp: true, offsetY: -3.5, scale: 1.15 },
    isEligible: (pokemon, battle, team) => isHpAtLeast(pokemon, 0.5) && !hasPokemonOnTeam(team, "0330"),
    onApply: function (pokemon, battle) {
      replacePokemon(pokemon, "플라이곤", battle, { resetAugments: true });
    },
  },
  {
    id: "legendaryTitan",
    name: "전설의 거인",
    desc: `현재 포켓몬을 레지기가스와 교체합니다.\n특성과 관련된 증강을 추가로 획득합니다.`,
    screenText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      return josa(`[증강] ${fromName}#{이} 레지기가스로 교체되었다!`);
    },
    logModalText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      return josa(`${fromName}#{이} 레지기가스로 교체되었다!`);
    },
    cost: "-",
    weight: (pokemon) => getReplacementAugmentWeight(pokemon),
    shiftUp: true,
    imageOptions: { shiftUp: true, offsetY: -5, scale: 1.15 },
    isEligible: (pokemon, battle, team) => isHpAtLeast(pokemon, 0.5) && !hasPokemonOnTeam(team, "0486"),
    onApply: function (pokemon, battle) {
      replacePokemon(pokemon, "레지기가스", battle, { resetAugments: true });
    },
  },
  {
    id: "magikarpJump",
    name: "튀어올라라! 잉어킹",
    desc: "현재 포켓몬을 조금 많이 특별한 잉어킹과 교체합니다.",
    screenText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      return josa(`[증강] ${fromName}#{이} 잉어킹으로 교체되었다!`);
    },
    logModalText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      return josa(`${fromName}#{이} 잉어킹으로 교체되었다!`);
    },
    cost: "-",
    weight: (pokemon) => getReplacementAugmentWeight(pokemon),
    shiftUp: true,
    imageOptions: { shiftUp: true, offsetY: -4.5, scale: 1.35 },
    isEligible: (pokemon, battle, team) => isHpAtLeast(pokemon, 0.5) && !hasPokemonOnTeam(team, "0129"),
    onApply: function (pokemon, battle) {
      replacePokemon(pokemon, "잉어킹", battle, { resetAugments: true });
    },
  },
  {
    id: "klinklangGear",
    name: "기기기기기기기기기기어르",
    desc: "현재 포켓몬을 조금 특별한 기기기어르와 교체합니다.",
    screenText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      return josa(`[증강] ${fromName}#{이} 기기기어르로 교체되었다!`);
    },
    logModalText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      return josa(`${fromName}#{이} 기기기어르로 교체되었다!`);
    },
    cost: "-",
    weight: (pokemon) => getReplacementAugmentWeight(pokemon),
    shiftUp: true,
    imageOptions: { shiftUp: true, offsetY: -3.5, scale: 1.15 },
    isEligible: (pokemon, battle, team) => isHpAtLeast(pokemon, 0.5) && !hasPokemonOnTeam(team, "0601"),
    onApply: function (pokemon, battle) {
      const newPoke = replacePokemon(pokemon, "기기기어르", battle, { resetAugments: true });
      if (newPoke) {
        newPoke.gearStack = 0;
        newPoke.img_id = null;
      }
    },
  },
  {
    id: "blackNight",
    name: "가라르의 미래를 지키기 위해 지금부터 블랙 나이트를 일으킬 거란다!",
    shortName: "블랙 나이트",
    desc: "현재 포켓몬을 무한다이노와 교체합니다.\n무한다이맥스 증강을 추가로 획득합니다.",
    screenText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      return josa(`[증강] ${fromName}#{이} 무한다이노로 교체되었다!`);
    },
    logModalText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      return josa(`${fromName}#{이} 무한다이노로 교체되었다!`);
    },
    cost: "-",
    weight: (pokemon) => getReplacementAugmentWeight(pokemon),
    shiftUp: false,
    imageOptions: { shiftUp: false, offsetY: 2.5, scale: 1.02 },
    isEligible: (pokemon, battle, team) => isHpAtLeast(pokemon, 0.5) && !hasPokemonOnTeam(team, "0890"),
    onApply: function (pokemon, battle, options) {
      const newPoke = replacePokemon(pokemon, "무한다이노", battle, { resetAugments: true });
      const eternamaxAug = AUGMENT_LIST.find((a) => a.id === "eternamax");
      if (eternamaxAug && newPoke) {
        newPoke.applyAugment(eternamaxAug, battle, options);
      }
    },
  },

  {
    id: "mewtwoStrikesBack",
    name: "뮤츠의 역습",
    desc: `현재 포켓몬을 조금 옛날의 뮤츠와 교체합니다. 특정 증강 3개를 추가로 얻습니다.`,
    screenText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      return josa(`[증강] ${fromName}#{이} 뮤츠로 교체되었다!`);
    },
    logModalText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      return josa(`${fromName}#{이} 뮤츠로 교체되었다!`);
    },
    cost: "-",
    weight: (pokemon) => getReplacementAugmentWeight(pokemon),
    shiftUp: true,
    imageOptions: { shiftUp: true, offsetY: -3.5, scale: 1.15 },
    isEligible: (pokemon, battle, team) => isHpAtLeast(pokemon, 0.5) && !hasPokemonOnTeam(team, "0150"),
    onApply: function (pokemon, battle, options) {
      const newPoke = replacePokemon(pokemon, "뮤츠 (1세대)", battle, { resetAugments: true });
      if (newPoke) {
        newPoke.img_id = "0150-a";
        const grantIds = ["specialSwordAndShield", "lostTechnologyBlizzard", "lostTechnologyPsychic"];
        const grantOptions = { ...options, replaceSlot: undefined };
        grantIds.forEach((augId) => {
          const targetAug = AUGMENT_LIST.find((a) => a.id === augId);
          if (targetAug) {
            newPoke.applyAugment(targetAug, battle, grantOptions);
          }
        });
        newPoke.checkAugmentSynergies?.(battle);
      }
    },
  },
  {
    id: "veteranPrivilege",
    name: "전관예우",
    desc: `현재 포켓몬을 조금 옛날의 켄타로스와 교체합니다. 특정 증강 3개를 추가로 얻습니다.`,
    screenText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      return josa(`[증강] ${fromName}#{이} 켄타로스로 교체되었다!`);
    },
    logModalText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      return josa(`${fromName}#{이} 켄타로스로 교체되었다!`);
    },
    cost: "-",
    weight: (pokemon) => getReplacementAugmentWeight(pokemon),
    shiftUp: true,
    imageOptions: { shiftUp: true, offsetY: -3.5, scale: 1.15 },
    isEligible: (pokemon, battle, team) => isHpAtLeast(pokemon, 0.5) && !hasPokemonOnTeam(team, "0128"),
    onApply: function (pokemon, battle, options) {
      const newPoke = replacePokemon(pokemon, "켄타로스 (1세대)", battle, { resetAugments: true });
      if (newPoke) {
        newPoke.img_id = "0128-a";
        const grantIds = ["specialSwordAndShield", "lostTechnologyBlizzard", "lostTechnologyHyperBeam"];
        const grantOptions = { ...options, replaceSlot: undefined };
        grantIds.forEach((augId) => {
          const targetAug = AUGMENT_LIST.find((a) => a.id === augId);
          if (targetAug) {
            newPoke.applyAugment(targetAug, battle, grantOptions);
          }
        });
        newPoke.checkAugmentSynergies?.(battle);
      }
    },
  },

  {
    id: "threeThousandYears",
    name: "3000년 만이구나...",
    desc: "현재 포켓몬을 영원의 꽃 플라엣테와 교체합니다.\n지닌 물건을 선택할 수 있습니다.",
    screenText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      return josa(`[증강] ${fromName}#{이} 영원의 꽃 플라엣테로 교체되었다!`);
    },
    logModalText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      return josa(`${fromName}#{이} 영원의 꽃 플라엣테로 교체되었다!`);
    },
    cost: "-",
    weight: (pokemon) => getReplacementAugmentWeight(pokemon),
    shiftUp: true,
    imageOptions: { shiftUp: true, offsetY: -3.5, scale: 1.15 },
    isEligible: (pokemon, battle, team) => isHpAtLeast(pokemon, 0.5) && !hasPokemonOnTeam(team, "0670"),
    onApply: function (pokemon, battle, options) {
      const candidateNames = ["플라엣테", "메가플라엣테", "휘석 플라엣테"];
      const picked = options?.selectedSampleName || candidateNames[Math.floor(Math.random() * candidateNames.length)];
      const newPoke = replacePokemon(pokemon, picked, battle, { resetAugments: true });
      if (newPoke && (picked === "휘석 플라엣테" || options?.grantEviolite)) {
        const evioliteAug = AUGMENT_LIST.find((a) => a.id === "eviolite");
        if (evioliteAug) {
          const grantOptions = { ...options, replaceSlot: undefined };
          newPoke.applyAugment(evioliteAug, battle, grantOptions);
        }
      }
    },
  },
  {
    id: "eviolite",
    isEligible: () => false,
    name: "진화의 휘석",
    desc: "지닌 물건을 진화의 휘석과 교체합니다.\n해당 포켓몬이 진화의 휘석 효과를 받습니다.",
    cost: 0,
    isRandom: false,
    weight: "-",
    onApply: function (pokemon) {
      if (pokemon) {
        pokemon.item = "진화의휘석";
      }
    },
  },

  // 특정 포켓몬 전용 증강 =============================================================================
  {
    id: "evioliteShuckle",
    name: "휘석 단단지",
    desc: "현재 포켓몬을 단단지와 교체합니다.\n진화의 휘석 증강을 추가로 획득합니다.",
    screenText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      return josa(`[증강] ${fromName}#{이} 단단지로 교체되었다!`);
    },
    logModalText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      return josa(`${fromName}#{이} 단단지로 교체되었다!`);
    },
    cost: "-",
    weight: (pokemon) => getReplacementAugmentWeight(pokemon),
    shiftUp: true,
    imageOptions: { shiftUp: true, offsetY: -3.5, scale: 1.15 },
    isEligible: (pokemon, battle, team) => Boolean(pokemon?.isFirst) && isHpAtLeast(pokemon, 0.5) && !hasPokemonOnTeam(team, "0213"),
    onApply: function (pokemon, battle, options) {
      const newPoke = replacePokemon(pokemon, "단단지", battle, { resetAugments: true });
      if (newPoke) {
        const evioliteAug = AUGMENT_LIST.find((a) => a.id === "eviolite");
        if (evioliteAug) {
          const grantOptions = { ...options, replaceSlot: undefined };
          newPoke.applyAugment(evioliteAug, battle, grantOptions);
        }
      }
    },
  },
  // =================================================================================================
  {
    id: "ninjaAppeared",
    name: "그런데 그때 닌자가 나타났다",
    desc: "현재 포켓몬을 개굴닌자와 교체합니다.\n지닌 물건을 선택할 수 있습니다.",
    screenText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      return josa(`[증강] ${fromName}#{이} 개굴닌자로 교체되었다!`);
    },
    logModalText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      return josa(`${fromName}#{이} 개굴닌자로 교체되었다!`);
    },
    cost: "-",
    weight: (pokemon) => getReplacementAugmentWeight(pokemon),
    shiftUp: true,
    imageOptions: { shiftUp: true, offsetY: -3.5, scale: 1.15 },
    isEligible: (pokemon, battle, team) => isHpAtLeast(pokemon, 0.5) && !hasPokemonOnTeam(team, "0658"),
    onApply: function (pokemon, battle, options) {
      const candidateNames = ["개굴닌자", "메가개굴닌자", "지우개굴닌자"];
      const picked = options?.selectedSampleName || candidateNames[Math.floor(Math.random() * candidateNames.length)];
      replacePokemon(pokemon, picked, battle, { resetAugments: true });
    },
  },
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
      if (!pokemon?.skill) return;
      const slot = Number(options?.replaceSlot) || 4;
      this.replacedSlot = slot;
      const earthquake = { ...skillList.search("지진"), skillNumber: slot };
      pokemon.skill[slot] = earthquake;
      pokemon.pp[slot] = earthquake.pp;
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
      if (!pokemon?.skill) return;
      const slot = Number(options?.replaceSlot) || 4;
      this.replacedSlot = slot;
      const dDance = { ...skillList.search("용의춤"), skillNumber: slot };
      pokemon.skill[slot] = dDance;
      pokemon.pp[slot] = dDance.pp;
    },
  },
  {
    id: "harmfulBird",
    name: "저 새는 해로운 새다",
    desc: "특성 질풍날개의 HP 조건이 삭제됩니다.",
    cost: 3,
    weight: 500,
    shiftUp: true,
    imageOptions: { shiftUp: true, offsetY: -3.5, offsetX: 2.5, scale: 1.15 },
    isEligible: (pokemon) => hasPokemonName(pokemon, "파이어로") && pokemon?.abil?.name === "질풍날개",
  },
  {
    id: "nimbleMoves",
    name: "민첩한 몸놀림",
    desc: "랜덤한 기술 하나에 우선도 +1을 추가합니다.",
    selDesc: function () {
      return "랜덤한 기술 하나에 우선도 +1을 추가합니다.";
    },
    screenText: function (target, prevPokeName, options) {
      const skillName = options?.nimbleSkillName || this?.nimbleSkillName || target?.nimbleSkillName;
      return skillName ? `[증강] ${skillName}의 우선도가 1 증가했다!` : "[증강] 랜덤한 기술 하나의 우선도가 1 증가했다!";
    },
    logModalText: function (target, prevPokeName, options) {
      const skillName = options?.nimbleSkillName || this?.nimbleSkillName || target?.nimbleSkillName;
      return skillName ? `${skillName}의 우선도가 1 증가했다!` : "랜덤한 기술 하나의 우선도가 1 증가했다!";
    },
    statusModalText: function (pokemon, battle, options) {
      const skillName = options?.nimbleSkillName || this?.nimbleSkillName || pokemon?.nimbleSkillName;
      return skillName ? `${skillName}의 우선도가 1 증가했습니다.` : "랜덤한 기술 하나의 우선도가 1 증가합니다.";
    },
    cost: 4,
    weight: 100,
    onApply: function (pokemon, battle, options) {
      if (!pokemon?.skill) return;
      const validSlots = [1, 2, 3, 4].filter((slot) => pokemon.skill[slot]);
      if (validSlots.length === 0) return;

      const skillName = resolveCurrentSkillName(pokemon, options?.nimbleSkillName);
      let targetSkill = null;
      if (skillName) {
        const foundSlot = validSlots.find((s) => pokemon.skill[s]?.name === skillName);
        if (foundSlot) targetSkill = pokemon.skill[foundSlot];
      }
      if (!targetSkill) {
        const randomSlot = validSlots[Math.floor(Math.random() * validSlots.length)];
        targetSkill = pokemon.skill[randomSlot];
      }
      if (!targetSkill) return;

      pokemon.nimbleSkillName = targetSkill.name;
      this.nimbleSkillName = targetSkill.name;
    },
  },
  {
    id: "recovery",
    name: "회복",
    desc: "매 턴 최대 HP의 1/16만큼 회복합니다.",
    cost: 1,
    weight: 100,
  },
  {
    id: "luckyRecovery",
    name: "운 좋은 회복",
    desc: "상대 포켓몬을 공격한 턴 30% 확률로 최대 HP의 30%를 회복합니다.",
    cost: 1,
    weight: 100,
  },
  {
    id: "rampagingPower",
    name: "폭주하는 힘",
    desc: "적을 쓰러뜨렸을 경우 다음 턴까지 모든 능력치가 1.5배 증가합니다.",
    cost: 1,
    weight: 100,
  },
  {
    id: "armorBreak",
    name: "방어구 부수기",
    desc: "적을 공격하여 데미지를 줄때마다 적의 방어와 특수방어를 5% 깎습니다.\n최대 15번 중첩됩니다.",
    cost: 1,
    weight: 100,
  },
  {
    id: "powerStrike",
    name: "파워 스트라이크",
    desc: "공격 후 적에게 입힌 데미지의 10%에 해당하는 추가 고정 데미지를 입힙니다.",
    cost: 2,
    weight: 100,
  },
  {
    id: "hyperBody",
    name: "하이퍼 바디",
    desc: "파티 전원의 Max HP가 60% 증가합니다.",
    cost: 3,
    weight: 100,
    isEligible: (pokemon, battle, team) => {
      return !pokemon?.hasAugmentOnTeam?.("hyperBody", team || battle);
    },
    onApply: function (pokemon, battle) {
      if (battle) {
        syncTeamHyperBodyBuff(battle, pokemon);
      } else if (pokemon) {
        pokemon.hasHyperBodyBuff = true;
      }
    },
  },
  {
    id: "ironWall",
    name: "아이언 월",
    desc: "해당 포켓몬의 최대 HP가 100% 증가합니다.",
    cost: 2,
    weight: 100,
  },
  {
    id: "dragonRoar",
    name: "드래곤 로어",
    desc: "HP가 절반 이상일때 스피드가 2배 증가합니다.\n필요스킬 : 파워 스트라이크, 아이언 월 1레벨 이상",
    cost: 3,
    weight: 100,
    isEligible: (pokemon, battle, team) => {
      if (pokemon.hasAugment?.("dragonRoar")) return false;
      const hasPowerStrike = pokemon.hasAugment?.("powerStrike");
      const hasIronWall = pokemon.hasAugment?.("ironWall");
      return Boolean(hasPowerStrike && hasIronWall);
    },
  },
  {
    id: "haste",
    name: "헤이스트",
    desc: "파티 전원의 스피드가 40 증가합니다.",
    cost: 5,
    weight: 100,
    isEligible: (pokemon, battle, team) => {
      return !pokemon?.hasAugmentOnTeam?.("haste", team || battle);
    },
    onApply: function (pokemon, battle) {
      if (battle) {
        syncTeamHasteBuff(battle, pokemon);
      } else if (pokemon) {
        pokemon.hasHasteBuff = true;
      }
    },
  },
  {
    id: "sharpEyes",
    name: "샤프 아이즈",
    desc: "파티 전원의 급소 확률이 15%, 급소 데미지가 40% 증가합니다.",
    cost: 2,
    weight: 100,
    isEligible: (pokemon, battle, team) => {
      return !pokemon?.hasAugmentOnTeam?.("sharpEyes", team || battle);
    },
    onApply: function (pokemon, battle) {
      if (battle) {
        syncTeamSharpEyesBuff(battle, pokemon);
      } else if (pokemon) {
        pokemon.hasSharpEyesBuff = true;
      }
    },
  },
  {
    id: "threeSnails",
    name: "달팽이 세마리",
    desc: "공격 후 적에게 달팽이 껍질을 던져 추가 고정 데미지를 입힙니다.",
    cost: 2,
    weight: 100,
  },
  {
    id: "readyToDie",
    name: "레디 투 다이",
    desc: "해당 포켓몬을 향한 모든 기술이 필중이 됩니다. 피격 데미지가 40% 증가하지만 공격 데미지가 2배로 증가합니다.",
    cost: 3,
    weight: 100,
  },
  {
    id: "mapleWarrior",
    name: "메이플 용사",
    desc: "파티 전원의 모든 능력치가 15% 증가합니다.",
    synergy: true,
    isRandom: false,
    weight: "-",
    onApply: function (pokemon, battle) {
      if (battle) {
        const team = pokemon.team === "npc" ? [battle.npc, battle.npcBench1, battle.npcBench2] : [battle.player, battle.playerBench1, battle.playerBench2];
        team.filter(Boolean).forEach((p) => {
          p.hasMapleWarriorBuff = true;
        });
      } else if (pokemon) {
        pokemon.hasMapleWarriorBuff = true;
      }
    },
  },
  {
    id: "berserk",
    name: "버서크",
    desc: "HP가 절반 이하일때 적에게 입히는 데미지가 2배로 증가합니다.",
    synergy: true,
    isRandom: false,
    weight: "-",
  },
  {
    id: "echoOfHero",
    name: "영웅의 메아리",
    desc: "아군 모든 포켓몬의 공격과 특공을 40% 상승시킨다.",
    synergy: true,
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
    statusModalText: function (pokemon) {
      const count = Number(pokemon?.dragonKillCount ?? this?.dragonKillCount ?? 0);
      return `${this.desc}\n(현재 드래곤 처치: ${count}마리)`;
    },
    getDesc: (pokemon) => {
      const aug = pokemon?.augments?.find((a) => a.id === "dragonDie");
      const count = Number(pokemon?.dragonKillCount ?? aug?.dragonKillCount ?? 0);
      return `드래곤 타입 포켓몬을 2마리 쓰러뜨릴 때마다 모든 능력치가 0.1배 상승합니다.\n(현재 쓰러뜨린 드래곤 포켓몬: ${count}마리)`;
    },
    synergy: true,
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
    synergy: true,
    isRandom: false,
    weight: "-",
  },
  {
    id: "mejaisSoulstealer",
    name: "메자이의 영혼약탈자",
    desc: "중첩당 20의 특수공격을 얻습니다. 적을 쓰러뜨릴 때마다 중첩을 하나 얻으며 해당 포켓몬이 기절할 때마다 중첩을 하나 잃습니다.",
    statusModalText: function (pokemon) {
      const stack = Number(pokemon?.mejaiStack ?? this?.mejaiStack ?? 0);
      return `${this.desc}\n(현재 스택: ${stack} / 특수공격 +${stack * 20})`;
    },
    getDesc: (pokemon) => {
      const aug = pokemon?.augments?.find((a) => a.id === "mejaisSoulstealer");
      const stack = Number(pokemon?.mejaiStack ?? aug?.mejaiStack ?? 0);
      return `중첩당 20의 특수공격을 얻습니다. 적을 쓰러뜨릴 때마다 중첩을 하나 얻으며 해당 포켓몬이 기절할 때마다 중첩을 하나 잃습니다.\n(현재 중첩: ${stack})`;
    },
    synergy: true,
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
    id: "practiceMakesCritical",
    name: "연습이 치명타를 낳는다",
    desc: "공격 시 스택이 쌓이고 스택 당 급소 확률이 1% 증가합니다.",
    statusModalText: function (pokemon) {
      const stack = Number(pokemon?.practiceCritStack ?? this?.practiceCritStack ?? 0);
      return `${this.desc}\n(현재 스택: ${stack} / 급소율 +${stack}%)`;
    },
    getDesc: (pokemon) => {
      const aug = pokemon?.augments?.find((a) => a.id === "practiceMakesCritical");
      const stack = Number(pokemon?.practiceCritStack ?? aug?.practiceCritStack ?? 0);
      return `공격 시 스택이 쌓이고 스택 당 급소 확률이 1% 증가합니다.\n(현재 중첩: ${stack} / 급소 확률 +${stack}%)`;
    },
    synergy: true,
    isRandom: false,
    weight: "-",
    onApply: function (pokemon, battle, options) {
      const stack = Number(options?.practiceCritStack ?? pokemon?.practiceCritStack ?? this.practiceCritStack ?? 0);
      if (pokemon) {
        pokemon.practiceCritStack = stack;
      }
      this.practiceCritStack = stack;
    },
  },
  {
    id: "giantAbsorption",
    name: "거인의 흡수",
    desc: "매 턴 상대에게 내 최대 HP의 3%만큼 데미지를 주고 해당 수치의 절반만큼 추가 HP를 얻습니다.",
    statusModalText: function (pokemon) {
      const bonusHp = Number(pokemon?.giantBonusHp ?? this?.giantBonusHp ?? 0);
      return `${this.desc}\n(현재 추가 HP: +${bonusHp})`;
    },
    getDesc: (pokemon) => {
      const aug = pokemon?.augments?.find((a) => a.id === "giantAbsorption");
      const bonusHp = Number(pokemon?.giantBonusHp ?? aug?.giantBonusHp ?? 0);
      return `매 턴 상대에게 내 최대 HP의 3%만큼 데미지를 주고 해당 수치의 절반만큼 추가 HP를 얻습니다.\n(현재 추가 HP: +${bonusHp})`;
    },
    synergy: true,
    isRandom: false,
    weight: "-",
    onApply: function (pokemon, battle, options) {
      const bonusHp = Number(options?.giantBonusHp ?? pokemon?.giantBonusHp ?? this.giantBonusHp ?? 0);
      if (pokemon) {
        const hadPrevApplied = Number(pokemon._appliedGiantBonusHp ?? 0) > 0;
        const prevMaxHp = pokemon.maxHp;
        pokemon.giantBonusHp = bonusHp;
        this.giantBonusHp = bonusHp;
        const existingAug = pokemon.augments?.find((a) => a.id === "giantAbsorption");
        if (existingAug) {
          existingAug.giantBonusHp = bonusHp;
        }
        const newMaxHp = pokemon.maxHp;
        if (options?.isCarryover && !hadPrevApplied && bonusHp > 0 && pokemon.hp === prevMaxHp) {
          pokemon.hp = newMaxHp;
        }
        pokemon._appliedGiantBonusHp = bonusHp;
      } else {
        this.giantBonusHp = bonusHp;
      }
    },
  },
  {
    id: "lostTechnologyCritical",
    name: "과거의 영광 (급소)",
    desc: "과거의 급소 확률 공식을 사용합니다.\n급소 확률이 스피드 종족값에 비례합니다.",
    screenText: function (target) {
      const names = target ? target.names("는") : "포켓몬은";
      return `[증강] ${names} 과거의 급소 확률 공식을 되찾았다!`;
    },
    synergy: true,
    isRandom: false,
    weight: "-",
  },
  {
    id: "gamblingAddict",
    name: "도박 중독",
    desc: "도박과 관련된 증강이 추가로 나오게 됩니다.",
    synergy: true,
    isRandom: false,
    weight: "-",
  },
  // 도박 중독 전용 추가 증강 =================================================
  {
    id: "russianRoulette",
    name: "러시안룰렛",
    desc: "현재 필드에 나와있는 두 포켓몬 중 하나가 기절합니다.",
    screenText: function (target, prevPokeName, options) {
      const faintedName = options?.resolvedFaintTargetName || options?.faintedPokemonName;
      return faintedName ? josa(`[증강] 러시안룰렛의 총구는 ${faintedName}#{를} 향했다!`) : "[증강] 러시안룰렛의 총구가 멈췄다!";
    },
    logModalText: function (target, prevPokeName, options) {
      const faintedName = options?.resolvedFaintTargetName || options?.faintedPokemonName;
      return faintedName ? josa(`필드의 두 포켓몬 중 ${faintedName}#{이} 기절했습니다.`) : this.desc;
    },
    statusModalText: function (pokemon, battle, options) {
      const faintedName = options?.resolvedFaintTargetName || options?.faintedPokemonName;
      return faintedName ? josa(`필드의 두 포켓몬 중 ${faintedName}#{이} 기절했습니다.`) : this.desc;
    },
    cost: "-",
    weight: 100,
    isEligible: (pokemon, battle, team) => {
      if (!hasGamblingAddict(team)) return false;
      if (!isBattlePlayerActive(pokemon, battle)) return false;
      if (!battle.npc || battle.npc.faint || battle.npc.hp <= 0) return false;
      return true;
    },
    onApply: function (pokemon, battle, options) {
      if (!battle) return;
      const side = options?.faintTarget === "player" || options?.faintTarget === "npc" ? options.faintTarget : Math.random() < 0.5 ? "player" : "npc";
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
        options.resolvedFaintTargetName = faintPoke?.name || "";
      }
    },
  },
  {
    id: "oddEven",
    name: "홀짝",
    desc: "랜덤한 수치의 랭크업을 얻습니다.",
    logModalText: function (target, prevPokeName, options) {
      const statKey = options?.resolvedStat || options?.statKey;
      const delta = options?.resolvedDelta ?? options?.delta;
      const statLabel = STAT_LABELS[statKey];
      if (statLabel && typeof delta === "number" && !Number.isNaN(delta)) {
        const signed = delta > 0 ? `+${delta}` : `${delta}`;
        return `랜덤한 수치의 랭크업을 얻습니다. (${statLabel} ${signed})`;
      }
      return this.desc;
    },
    statusModalText: function (pokemon, battle, options) {
      const statKey = options?.resolvedStat || options?.statKey;
      const delta = options?.resolvedDelta ?? options?.delta;
      const statLabel = STAT_LABELS[statKey];
      if (statLabel && typeof delta === "number" && !Number.isNaN(delta)) {
        const signed = delta > 0 ? `+${delta}` : `${delta}`;
        return `랜덤한 수치의 랭크업을 얻습니다. (${statLabel} ${signed})`;
      }
      return this.desc;
    },
    cost: "-",
    weight: 100,
    isEligible: (pokemon, battle, team) => {
      if (!hasGamblingAddict(team)) return false;
      if (!isBattlePlayerActive(pokemon, battle)) return false;
      return true;
    },
    onApply: function (pokemon, battle, options) {
      if (!pokemon) return;
      const statPool = ["atk", "catk", "cdef", "def", "speed"];
      const deltaPool = [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6];
      const chosenStat = statPool.includes(options?.statKey) ? options.statKey : statPool[Math.floor(Math.random() * statPool.length)];
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
    id: "highRiskHighReturn",
    name: "하이리스크 하이리턴",
    desc: "모든 공격의 데미지가 3배가 되는 버프 또는 절반이 되는 디버프를 얻습니다.",
    screenText: function (target, prevPokeName, options) {
      const res = options?.resolvedHighRiskResult || options?.highRiskResult;
      const names = target ? target.names("는") : "포켓몬은";
      if (res === "buff") return `[증강] ${names} "하이 리턴" 버프를 얻었다!`;
      if (res === "curse") return `[증강] ${names} "하이 리스크" 디버프를 얻었다!`;
      return `[증강] ${names} "하이리스크 하이리턴" 효과를 얻었다!`;
    },
    logModalText: function (target, prevPokeName, options) {
      const res = options?.resolvedHighRiskResult || options?.highRiskResult;
      if (res === "buff") return "모든 공격의 데미지가 3배가 됩니다.";
      if (res === "curse") return "모든 공격의 데미지가 절반이 됩니다.";
      return this.desc;
    },
    statusModalText: function (pokemon, battle, options) {
      const res = options?.resolvedHighRiskResult || options?.highRiskResult;
      if (res === "buff") return "모든 공격의 데미지가 3배가 됩니다.";
      if (res === "curse") return "모든 공격의 데미지가 절반이 됩니다.";
      return this.desc;
    },
    cost: "-",
    weight: 100,
    isEligible: (pokemon, battle, team) => hasGamblingAddict(team) && !pokemon.hasAugment?.("highRiskBuff") && !pokemon.hasAugment?.("highRiskCurse"),
    onApply: function (pokemon, battle, options) {
      if (!pokemon) return;
      const pickedResult = options?.highRiskResult === "buff" || options?.highRiskResult === "curse" ? options.highRiskResult : Math.random() < 0.5 ? "buff" : "curse";
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
    desc: "모든 공격의 데미지가 3배가 됩니다. (현재 라운드 한정)",
    buf: true,
    isRandom: false,
    weight: "-",
  },
  {
    id: "highRiskCurse",
    name: "하이 리스크",
    desc: "모든 공격의 데미지가 절반이 됩니다.",
    curse: true,
    isRandom: false,
    weight: "-",
  },
  // 무한 다이맥스 (무한다이노 전용) =============================================
  {
    id: "eternamax",
    name: "무한 다이맥스",
    desc: "무한 다이맥스 상태가 됩니다.",
    screenText: function (target) {
      return josa(`[증강] ${target?.name || "무한다이노"}#{이} 무한다이맥스 상태가 되었다!`);
    },
    logModalText: function (target) {
      return josa(`${target?.name || "무한다이노"}#{이} 무한다이맥스 상태가 되었다!`);
    },
    cost: 5,
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
    cost: 3,
    weight: 100,
    isEligible: (pokemon) => pokemon?.abil?.name !== "천하장사" && isPhysicalPokemon(pokemon),
    onApply: (pokemon) => {
      pokemon.changeAbil("천하장사");
    },
  },
  {
    id: "fastStarter",
    name: "패스트스타트",
    desc: "현재 포켓몬의 특성을 패스트스타트로 변경합니다.\n(전투에 나오고 5턴 뒤 공격과 스피드가 2배가 됩니다.)",
    cost: "-",
    buf: true,
    permanent: true,
    isRandom: false,
    weight: "-",
    shiftUp: true,
    imageOptions: { shiftUp: true, offsetY: -5, scale: 1.15 },
    isEligible: (pokemon) => hasPokemonName(pokemon, "레지기가스") && (pokemon?.abil?.name || pokemon?.abil) === "슬로스타트",
    onApply: (pokemon) => {
      pokemon.changeAbil("패스트스타트");
    },
  },
  {
    id: "randomAbility",
    name: "특성 야바위",
    desc: "현재 포켓몬의 특성을 랜덤으로 변경합니다.",
    selDesc: function () {
      return "현재 포켓몬의 특성을 무작위 특성으로 변경합니다.";
    },
    screenText: function (target, prevPokeName, options) {
      const abilName = options?.pickedAbility || this?.pickedAbility || target?.pickedAbility || target?.abil?.name || target?.abil;
      const pokeName = target?.name || "포켓몬";
      return abilName ? josa(`[증강] ${pokeName}의 특성이 ${abilName}#{으로} 바뀌었다!`) : `[증강] ${pokeName}의 특성이 바뀌었다!`;
    },
    logModalText: function (target, prevPokeName, options) {
      const abilName = options?.pickedAbility || this?.pickedAbility || target?.pickedAbility || target?.abil?.name || target?.abil;
      const pokeName = target?.name || "포켓몬";
      return abilName ? josa(`${pokeName}의 특성이 ${abilName}#{으로} 바뀌었다!`) : "현재 포켓몬의 특성을 무작위 특성으로 변경합니다.";
    },
    statusModalText: function (pokemon) {
      const abilName = this?.pickedAbility || pokemon?.pickedAbility || pokemon?.abil?.name || pokemon?.abil;
      return abilName ? `특성이 ${abilName}으로 변경되었습니다.` : "현재 포켓몬의 특성을 무작위 특성으로 변경합니다.";
    },
    cost: 0,
    weight: 100,
    onApply: function (pokemon, battle, options) {
      const picked =
        options?.pickedAbility ||
        (() => {
          const pool = Object.keys(abilObject).filter((a) => !noRandomAbil.includes(a) && a !== (pokemon?.abil?.name || pokemon?.abil));
          return pool[Math.floor(Math.random() * pool.length)];
        })();
      pokemon.changeAbil(picked);
      this.pickedAbility = picked;
    },
  },
  {
    id: "revivePiece",
    name: "기력의 조각",
    desc: "기절한 포켓몬의 HP를 절반 회복하고 부활시킵니다.",
    screenText: function (target) {
      return `[증강] ${target?.name || "포켓몬"}에게 기력의 조각을 사용했다!`;
    },
    logModalText: function (target) {
      return josa(`${target?.name || "포켓몬"}#{이} HP를 절반 회복하고 부활했습니다.`);
    },
    statusModalText: function (pokemon) {
      return josa(`${pokemon?.name || "포켓몬"}#{이} HP를 절반 회복하고 부활했습니다.`);
    },
    cost: "-",
    weight: 70,
    isEligible: (pokemon) => Boolean(pokemon && (pokemon.faint || pokemon.hp <= 0)),
    onApply: function (pokemon, battle, options) {
      pokemon.handleResurrection(battle, 0.5, options?.enqueue, options);
    },
  },
  {
    id: "maxRevive",
    name: "기력의 덩어리",
    desc: "기절한 포켓몬의 HP를 전부 회복하고 부활시킵니다.",
    screenText: function (target) {
      return `[증강] ${target?.name || "포켓몬"}에게 기력의 덩어리를 사용했다!`;
    },
    logModalText: function (target) {
      return josa(`${target?.name || "포켓몬"}#{이} HP를 최대로 회복하고 부활했습니다.`);
    },
    statusModalText: function (pokemon) {
      return josa(`${pokemon?.name || "포켓몬"}#{이} HP를 최대로 회복하고 부활했습니다.`);
    },
    cost: "-",
    weight: 50,
    isEligible: (pokemon) => Boolean(pokemon && (pokemon.faint || pokemon.hp <= 0)),
    onApply: function (pokemon, battle, options) {
      pokemon.handleResurrection(battle, 1.0, options?.enqueue, options);
    },
  },
  {
    id: "fullRestore",
    name: "회복약",
    desc: "해당 포켓몬의 HP를 모두 회복하고 모든 상태이상을 치료합니다.",
    screenText: function (target) {
      return josa(`[증강] ${target?.name || "포켓몬"}#{은} 회복약으로 건강해졌다!`);
    },
    logModalText: function (target) {
      return josa(`${target?.name || "포켓몬"}#{이} 체력과 상태이상을 모두 회복했습니다.`);
    },
    statusModalText: function (pokemon) {
      return josa(`${pokemon?.name || "포켓몬"}#{이} 체력과 상태이상을 모두 회복했습니다.`);
    },
    cost: "-",
    weight: 100,
    isEligible: (pokemon) => {
      if (!pokemon || pokemon.faint || pokemon.hp <= 0) return false;
      const maxHp = pokemon.maxHp;
      const isLowHp = pokemon.hp <= maxHp * 0.5;
      const hasAilment = Boolean(pokemon.ailment && Object.values(pokemon.ailment).some((v) => v !== null));
      return isLowHp || hasAilment;
    },
    onApply: function (pokemon) {
      if (!pokemon) return;
      pokemon.hp = pokemon.maxHp;
      pokemon.resetAilment();
      pokemon.tempStatus.confuse = null;
    },
  },
  // 돌진 (즉발형 버프 - 라운드 종료시까지 공격력 +70, 이월되지 않음)
  {
    id: "rush",
    name: "돌진",
    desc: "몬스터의 공격력을 라운드 종료시까지 70 올린다.",
    cost: "-",
    buf: true,
    noCarryover: true,
    weight: 100,
    isEligible: (pokemon) => isPhysicalPokemon(pokemon) && !pokemon?.hasAugment?.("rush"),
  },
  // 커져라! (즉발형 버프 - 이번 라운드 동안 체력 1.5배 증가, 이월되지 않음)
  {
    id: "growUp",
    name: "커져라!",
    desc: "이번 라운드 동안 해당 포켓몬의 체력이 1.5배 증가합니다.",
    cost: "-",
    buf: true,
    noCarryover: true,
    weight: 100,
    isEligible: (pokemon) => !pokemon?.hasAugment?.("growUp") && pokemon?.hp >= pokemon?.maxHp,
    onApply: (pokemon) => {
      if (pokemon && typeof pokemon.hp === "number") {
        pokemon.hp = Math.min(pokemon.maxHp, Math.round(pokemon.hp * 1.5));
      }
    },
  },
  {
    id: "pokemonQuiz",
    name: "포켓몬 퀴즈",
    desc: "퀴즈를 맞출 경우 모든 능력치가 1.3배 증가하는 영구적인 버프를 얻습니다.",
    cost: "-",
    weight: 100,
    isEligible: (pokemon) => {
      if (!pokemon) return false;
      const hasExpertOrQuiz =
        typeof pokemon.hasAugment === "function"
          ? pokemon.hasAugment("pokemonQuizExpert") || pokemon.hasAugment("pokemonQuiz")
          : (pokemon.augments || []).some((a) => {
              const id = typeof a === "string" ? a : a?.id;
              return id === "pokemonQuizExpert" || id === "pokemonQuiz";
            });
      return !hasExpertOrQuiz;
    },
    screenText: function (target, prevPokeName, options) {
      const targetName = typeof target?.names === "function" ? target.names("는") : `${target?.name || "포켓몬"}은`;
      if (options?.isCorrect) {
        return ["정답!", `[증강] ${targetName} 퀴즈를 맞추고 영구 버프를 획득하였다!`];
      }
      return ["오답!", `[증강] ${targetName} 퀴즈를 틀려 아무런 효과도 얻지 못했다...`];
    },
    logModalText: function (target, prevPokeName, options) {
      if (options?.isCorrect) {
        return `퀴즈를 맞추고 모든 능력치가 1.3배 증가하는 영구 버프를 획득했습니다.`;
      }
      return `퀴즈를 맞추지 못해 버프를 획득하지 못했습니다.`;
    },

    onApply: function (pokemon, battle, options) {
      if (options?.isCorrect) {
        pokemon.applyAugment("pokemonQuizExpert", battle);
      }
    },
  },
  // 포켓몬 퀴즈 정답 시 부여되는 영구 버프
  {
    id: "pokemonQuizExpert",
    name: "포켓몬을 잘 아는",
    desc: "모든 능력치가 1.3배 증가합니다.",
    buf: true,
    permanent: true,
    isRandom: false,
    weight: "-",
  },
  // 후루베 유라유라 (즉발형 증강 - 현재 배틀중인 두 포켓몬 동시 기절)
  {
    id: "furubeYurayura",
    name: "후루베 유라유라",
    desc: "현재 배틀중인 두 포켓몬이 기절합니다.",
    screenText: function (target) {
      return "후루베... 유라유라..!";
    },
    cost: "-",
    weight: 30,
    isEligible: (pokemon, battle, team) => {
      if (!isBattlePlayerActive(pokemon, battle)) return false;
      if (!battle.npc || battle.npc.faint || battle.npc.hp <= 0) return false;
      if (pokemon?.hasAugment?.("butItRefused")) return false;
      if (pokemon?.hasAugmentOnTeam?.("butItRefused", team || battle)) return false;
      if (battle?.player?.hasAugment?.("butItRefused")) return false;
      return true;
    },
    onApply: function (pokemon, battle, options) {
      if (!battle) return;
      if (battle.npc) {
        battle.npc.hp = 0;
        if (!options?.deferFaint) {
          battle.npc.handleFaint?.(battle, options?.enqueue || (() => {}));
        }
      }
      if (battle.player) {
        battle.player.hp = 0;
        if (!options?.deferFaint) {
          battle.player.handleFaint?.(battle, options?.enqueue || (() => {}));
        }
      }
    },
  },
  // 마음의물방울 (라티아스/라티오스 전용 증강)
  {
    id: "soulDew",
    name: "마음의물방울",
    desc: "지닌 물건을 마음의물방울로 교체합니다.\n라티아스나 라티오스가 지니게 하면 특공과 특방이 1.5배 상승합니다.",
    shortDesc: "라티아스나 라티오스가 지니게 하면 특공과 특방이 1.5배 상승합니다.",
    selDesc: function (pokemon) {
      const isHolding = pokemon?.item === "마음의물방울";
      const header = isHolding ? "마음의물방울이 옛날의 영광을 되찾습니다." : "지닌 물건을 마음의물방울로 교체합니다.";
      return `${header}\n${this.shortDesc}`;
    },
    logModalText: function (target, prevPokeName, options) {
      const isHolding = target.originalItem === "마음의물방울";
      return isHolding ? this.shortDesc : this.desc;
    },
    statusModalText: function (pokemon) {
      const isHolding = pokemon.originalItem === "마음의물방울";
      return isHolding ? this.shortDesc : this.desc;
    },
    cost: 0,
    weight: 200,
    isEligible: (pokemon) => {
      return Boolean(pokemon.name.includes("라티오스") || pokemon.name.includes("라티아스"));
    },
    onApply: function (pokemon, battle, options) {
      pokemon.item = "마음의물방울";
    },
  },
  // 7세대의 악마 (따라큐 전용 증강)
  {
    id: "devilOfGen7",
    name: "7세대의 악마",
    screenText: "[증강] 특성 탈이 체력을 소모하지 않게 되었다!",
    desc: "특성 탈이 체력을 소모하지 않습니다.\n추가로 지닌 물건을 기합의 띠와 교체합니다.",
    shortDesc: "특성 탈이 체력을 소모하지 않습니다.",
    selDesc: function (pokemon) {
      const isHolding = pokemon?.item === "기합의띠";
      return isHolding ? this.shortDesc : this.desc;
    },
    logModalText: function (target, prevPokeName, options) {
      const isHolding = target.originalItem === "기합의띠";
      return isHolding ? this.shortDesc : this.desc;
    },
    statusModalText: function (pokemon) {
      const isHolding = pokemon.originalItem === "기합의띠";
      return isHolding ? this.shortDesc : this.desc;
    },
    cost: 1,
    weight: 300,
    shiftUp: true,
    imageOptions: { shiftUp: true, offsetY: -6, offsetX: 2, scale: 1.15 },
    isEligible: (pokemon) => hasPokemonName(pokemon, "따라큐"),
    onApply: function (pokemon, battle, options) {
      pokemon.item = "기합의띠";
    },
  },
  // 리베로
  {
    id: "libero",
    name: "리베로",
    desc: "특성 리베로가 매 공격마다 발동됩니다.",
    cost: 0,
    weight: 200,
    shiftUp: true,
    imageOptions: { shiftUp: true, offsetY: -3.5, scale: 1.15 },
    isEligible: (pokemon) => hasCurrentAndOriginalAbil(pokemon, "리베로") && !pokemon?.hasAugment?.("libero"),
    onApply: (pokemon) => {
      if (pokemon?.abil?.name === "리베로") {
        pokemon.abil.used = false;
        pokemon.abil.text = "자신이 사용한 기술과 같은 타입으로 변화한다.";
      }
      if (pokemon?.originalAbil?.name === "리베로") {
        pokemon.originalAbil.used = false;
        pokemon.originalAbil.text = "자신이 사용한 기술과 같은 타입으로 변화한다.";
      }
    },
  },
  // 변환자재
  {
    id: "protean",
    name: "변환자재",
    desc: "특성 변환자재가 매 공격마다 발동됩니다.",
    cost: 0,
    weight: 200,
    shiftUp: true,
    imageOptions: { shiftUp: true, offsetY: -3.5, scale: 1.15 },
    isEligible: (pokemon) => hasCurrentAndOriginalAbil(pokemon, "변환자재") && !pokemon?.hasAugment?.("protean"),
    onApply: (pokemon) => {
      if (pokemon?.abil?.name === "변환자재") {
        pokemon.abil.used = false;
        pokemon.abil.text = "자신이 사용한 기술과 같은 타입으로 변화한다.";
      }
      if (pokemon?.originalAbil?.name === "변환자재") {
        pokemon.originalAbil.used = false;
        pokemon.originalAbil.text = "자신이 사용한 기술과 같은 타입으로 변화한다.";
      }
    },
  },
  // 불요의 검
  {
    id: "intrepidSword",
    name: "불요의 검",
    desc: "해당 포켓몬이 필드에 등장할 때마다 불요의 검 특성이 발동됩니다.",
    cost: 0,
    weight: 200,
    shiftUp: true,
    imageOptions: { shiftUp: true, offsetY: -3.5, scale: 1.15 },
    isEligible: (pokemon) => hasCurrentAndOriginalAbil(pokemon, "불요의검") && !pokemon?.hasAugment?.("intrepidSword"),
    onApply: (pokemon) => {
      if (pokemon?.abil) {
        pokemon.abil.usedOnce = false;
        if (pokemon.abil.name === "불요의검") pokemon.abil.text = "등장했을 때 공격이 1랭크 올라간다.";
      }
      if (pokemon?.originalAbil) {
        pokemon.originalAbil.usedOnce = false;
        if (pokemon.originalAbil.name === "불요의검") pokemon.originalAbil.text = "등장했을 때 공격이 1랭크 올라간다.";
      }
    },
  },
  // 불굴의 방패
  {
    id: "dauntlessShield",
    name: "불굴의 방패",
    desc: "해당 포켓몬이 필드에 등장할 때마다 불굴의 방패 특성이 발동됩니다.",
    cost: 0,
    weight: 200,
    shiftUp: true,
    imageOptions: { shiftUp: true, offsetY: -3.5, scale: 1.15 },
    isEligible: (pokemon) => hasCurrentAndOriginalAbil(pokemon, "불굴의방패") && !pokemon?.hasAugment?.("dauntlessShield"),
    onApply: (pokemon) => {
      if (pokemon?.abil) {
        pokemon.abil.usedOnce = false;
        if (pokemon.abil.name === "불굴의방패") pokemon.abil.text = "등장했을 때 방어가 1랭크 올라간다.";
      }
      if (pokemon?.originalAbil) {
        pokemon.originalAbil.usedOnce = false;
        if (pokemon.originalAbil.name === "불굴의방패") pokemon.originalAbil.text = "등장했을 때 방어가 1랭크 올라간다.";
      }
    },
  },
  // 바지락조개 (해수스파우팅 보유 포켓몬 전용 증강)
  {
    id: "manilaClam",
    name: "바지락조개",
    desc: "해수스파우팅의 위력이 100 이하로 떨어지지 않습니다.",
    cost: 1,
    weight: 200,
    shiftUp: true,
    imageOptions: { shiftUp: true, offsetY: -3.5, scale: 1.15 },
    isEligible: (pokemon) => hasSkill(pokemon, "해수스파우팅") || hasSkill(pokemon, "바지락조개"),
    onApply: function (pokemon) {
      renamePokemonSkill(pokemon, "해수스파우팅", "바지락조개");
    },
    // damageCalculate.js에 구현
  },
  // 변신의 천재
  {
    id: "geniusOfTransformation",
    name: "변환자재",
    desc: "현재 포켓몬을 변환자재 포켓몬 중 하나와 교체합니다.\n변환자재가 매 공격마다 발동되는 증강을 추가로 획득합니다.",
    screenText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      const toName = target?.name || "";
      return josa(`[증강] ${fromName}#{이} ${toName}#{으로} 교체되었다!`);
    },
    logModalText: function (target, prevPokeName) {
      const fromName = prevPokeName || "포켓몬";
      const toName = target?.name || "";
      return josa(`${fromName}#{이} ${toName}#{으로} 교체되었다!`);
    },
    cost: "-",
    weight: (pokemon) => getReplacementAugmentWeight(pokemon),
    isEligible: (pokemon, battle, team) => {
      if (!isHpAtLeast(pokemon, 0.5)) return false;
      const proteanDexes = ["0815", "0908", "0658"];
      if (proteanDexes.includes(pokemon?.dexNo)) return false;
      const allOwned = proteanDexes.every((dex) => hasPokemonOnTeam(team, dex));
      if (allOwned) return false;
      return true;
    },
    onApply: function (pokemon, battle, options) {
      const candidates = ["에이스번", "마스카나", "개굴닌자"];
      const team = battle ? [battle.player, battle.playerBench1, battle.playerBench2].filter(Boolean) : [];
      const available = candidates.filter((name) => {
        const sample = sampleList.getDataBySampleName(name);
        return !hasPokemonOnTeam(team, sample?.dexNo);
      });
      const pool = available.length > 0 ? available : candidates;
      const pickedName = pool[Math.floor(Math.random() * pool.length)];

      const newPoke = replacePokemon(pokemon, pickedName, battle, { resetAugments: true });
      if (newPoke) {
        const grantAugId = newPoke.abil?.name === "리베로" || newPoke.originalAbil?.name === "리베로" ? "libero" : "protean";
        const grantAug = AUGMENT_LIST.find((a) => a.id === grantAugId);
        if (grantAug) {
          const grantOptions = { ...options, replaceSlot: undefined };
          newPoke.applyAugment(grantAug, battle, grantOptions);
        }
      }
    },
  },
];

// 3개 증강 공명(시너지) 버프 매핑 테이블
// { [버프 증강 ID]: [조건 증강 ID 목록] }
const SYNERGY_ACTIVATION_THRESHOLD = {
  lostTechnologyCritical: 3, // 과거의 영광 증강 배열 중 3개 이상 보유 시 활성화
  echoOfHero: 3, // 초보자 시너지 증강 4개 중 3개 이상 보유 시 활성화
  giantAbsorption: 3, // 가시갑옷, 워모그의 갑옷, 태양불꽃방패, 정령의 형상, 태양불꽃망토 5개 중 3개 이상 보유 시 활성화
  praiseTheSun: 3, // 태양불꽃망토, 태양불꽃방패, 타오르는 천 개의 태양, 태양의 호흡 4개 중 3개 이상 보유 시 활성화
  ekzahar: 3,
};

export const getSynergyThreshold = (synergyId, requiredIds = []) => {
  if (SYNERGY_ACTIVATION_THRESHOLD[synergyId] !== undefined) {
    return SYNERGY_ACTIVATION_THRESHOLD[synergyId];
  }
  return Array.isArray(requiredIds) ? requiredIds.length : 3;
};

export const AUGMENT_SYNERGY_MAP = {
  praiseTheSun: ["sunfireCape", "sunfireAegis", "aThousandBlazingSuns", "sunBreathing"], // 태양 만세: [태양불꽃망토, 태양불꽃방패, 타오르는 천 개의 태양, 태양의 호흡]
  berserk: ["powerStrike", "ironWall", "dragonRoar"], // 버서크: [파워 스트라이크, 아이언 월, 드래곤 로어]
  mapleWarrior: ["sharpEyes", "haste", "hyperBody"], // 메이플 용사: [샤프 아이즈, 헤이스트, 하이퍼 바디]
  echoOfHero: ["threeSnails", "nimbleMoves", "recovery", "soulDice"], // 영웅의 메아리: [달팽이 세마리, 민첩한 몸놀림, 회복, 영혼의 주사위]
  dragonDie: ["dragonSlayer", "dragonHunter", "dragonKiller"], // 용용 죽겠지: [드래곤 슬레이어, 용 사냥꾼, 용살자]
  wujuStyle: ["lastManStanding", "lastSamurai", "lastWarrior"], // 우주류 검술: [라스트 맨 스탠딩, 라스트 사무라이, 최후의 전사]
  mejaisSoulstealer: ["rabadonsDeathcap", "voidStaff", "ludensEcho"], // 메자이의 영혼약탈자: [라바돈의 죽음모자, 공허의 지팡이, 루덴의 메아리]
  practiceMakesCritical: ["infinityEdge", "bladeOfTheRuinedKing", "collector"], // 연습이 치명타를 낳는다: [무한의 대검, 몰락한 왕의 검, 징수의 총]
  gamblingAddict: ["lifeIsOneShot", "allOrNothing", "randomAbility"], // 도박 중독: [인생은 한방, 모 아니면 도, 특성 야바위]
  giantAbsorption: ["thornmail", "warmogsArmor", "sunfireAegis", "spiritVisage", "sunfireCape"], // 거인의 흡수: [가시갑옷, 워모그의 갑옷, 태양불꽃방패, 정령의 형상, 태양불꽃망토]
  lostTechnologyCritical: ["specialSwordAndShield", "lostTechnologyBlizzard", "lostTechnologyPsychic", "lostTechnologyHyperBeam"], // 과거의 영광 (급소)
  symphonyFor100Metronomes: ["metronome", "doubleMetronome", "tripleMetronome"], // 100개의 메트로놈을 위한 교향시
  airmanGaTaosenai: ["mandoocornEndure", "butItRefused", "nothingHappened"], // 에어맨이 쓰러지지 않아: [슬프게 하지 않게 하려고 버텼다!, 하지만 버텨냈다., 아무일도 없었다...!]
  millenniumShield: ["holyElfBlessing", "giantSoldierOfStone", "waterOmotics"], // 천년 방패: [홀리엘프의 축복, 암석거인, 물의 조종자]
  superheatedGladius: ["salamandra", "flamingKatana", "aThousandBlazingSuns"], // 초고열 글라디우스: [사라만도라, 화염의 카타나, 타오르는 천 개의 태양]
  ekzahar: ["brionac", "gungnir", "trishula"], // 빙결용윤 에크하자르: 빙룡창 3종
};

const SYNERGY_INFO_MAP = {
  praiseTheSun: {
    emoji: "☀️",
    theme: "태양 만세",
    title: "태양 만세",
    desc: "해당 포켓몬의 최대 HP가 1.5배 증가합니다.\n상대가 화상 데미지를 입었을 경우 해당 수치만큼 체력을 회복합니다.",
  },
  superheatedGladius: {
    emoji: "🔥",
    theme: "초고열 글라디우스",
    title: "초고열 글라디우스",
    desc: "공격 시 상대에게 화상을 입힌 후 공격합니다.\n이미 화상 상태인 상대에게 추가로 화상을 입힐 시 최대 HP의 10%의 데미지를 줍니다.",
  },
  ekzahar: {
    emoji: "❄️",
    theme: "빙결용윤",
    title: "빙결용윤 에크하자르",
    desc: "상대를 중첩하여 얼릴 수 있습니다. 중첩 시 얼음 지속 턴이 길어집니다.",
  },
  millenniumShield: {
    emoji: "🛡️",
    theme: "천년 방패",
    title: "천년 방패",
    desc: "모든 아군 포켓몬의 방어와 특수방어가 2배가 됩니다.",
  },
  airmanGaTaosenai: {
    emoji: "💨",
    theme: "에어맨",
    title: "에어맨이 쓰러지지 않아",
    desc: "기절할 데미지를 받을 때 총 20번 HP 1로 버팁니다.",
  },
  symphonyFor100Metronomes: {
    emoji: "🎼",
    theme: "메트로놈 교향곡",
    title: "100개의 메트로놈을 위한 교향시",
    desc: "메트로놈의 스택이 초기화되지 않습니다.",
  },
  berserk: {
    emoji: "🔥",
    theme: "버서크",
    title: "버서크",
    desc: "현재 HP가 절반 이하일때 적에게 입히는 데미지가 2배로 증가합니다.",
  },
  mapleWarrior: {
    emoji: "🍁",
    theme: "메이플 용사",
    title: "메이플 용사",
    desc: "파티 전원의 모든 능력치가 15% 증가합니다.",
  },
  echoOfHero: {
    emoji: "🍁",
    theme: "모험가 초보자",
    title: "영웅의 메아리",
    desc: "모든 아군 포켓몬의 공격과 특수공격이 40% 증가합니다.",
  },
  dragonDie: {
    emoji: "🐲",
    theme: "드래곤 슬레이어",
    title: "용용 죽겠지",
    desc: "드래곤 타입 포켓몬을 2마리 쓰러뜨릴 때마다 모든 능력치가 0.1배 상승합니다.",
  },
  wujuStyle: {
    emoji: "⚔️",
    theme: "우주류 검술",
    title: "우주류 검술",
    desc: "공격 후 적에게 30의 추가 고정 데미지를 입힙니다.",
  },
  mejaisSoulstealer: {
    emoji: "🪄",
    theme: "마법 공명",
    title: "메자이의 영혼약탈자",
    desc: "중첩당 20의 특수공격을 얻습니다. 적을 쓰러뜨릴 때마다 중첩을 얻습니다.",
  },
  practiceMakesCritical: {
    emoji: "🎯",
    theme: "치명타 숙련",
    title: "연습이 치명타를 낳는다",
    desc: "공격 시 스택이 쌓이고 스택당 급소 확률이 1% 증가합니다.",
  },
  gamblingAddict: {
    emoji: "🎲",
    theme: "도박 본능",
    title: "도박 중독",
    desc: "도박과 관련된 증강이 추가로 등장하게 됩니다.",
  },
  giantAbsorption: {
    emoji: "🛡️",
    theme: "거인의 요새",
    title: "거인의 흡수",
    desc: "매 턴 상대에게 내 최대 HP의 3%만큼 데미지를 주고 해당 수치의 절반만큼 추가 HP를 얻습니다.",
  },
  lostTechnologyCritical: {
    theme: "과거의 영광",
    title: "과거의 영광 (급소)",
    desc: "과거의 급소 확률 공식을 사용합니다. 스피드 종족값이 높을수록 급소에 맞을 확률이 높아집니다.",
  },
};

/**
 * 주어진 증강 ID가 속한 시너지 정보를 반환 (시너지 버프 본인이거나 3대 조건 증강 중 하나인 경우)
 * @param {string} augId
 */
export const getAugmentSynergyInfo = (augId) => {
  if (!augId) return null;
  const matches = [];
  for (const [buffId, requiredIds] of Object.entries(AUGMENT_SYNERGY_MAP)) {
    if (buffId === augId || requiredIds.includes(augId)) {
      const buffAugment = AUGMENT_LIST.find((a) => a.id === buffId);
      const requiredAugments = requiredIds.map((id) => AUGMENT_LIST.find((a) => a.id === id)).filter(Boolean);
      const meta = SYNERGY_INFO_MAP[buffId] || {
        emoji: "✨",
        theme: "시너지",
        title: buffAugment?.name || "시너지",
        desc: buffAugment?.desc || "",
      };
      const threshold = getSynergyThreshold(buffId, requiredIds);
      matches.push({
        buffId,
        buffAugment,
        requiredIds,
        requiredAugments,
        threshold,
        emoji: meta.emoji,
        theme: meta.theme,
        title: meta.title,
        desc: meta.desc,
        isBuffItself: buffId === augId,
      });
    }
  }
  if (matches.length === 0) return null;
  return {
    ...matches[0],
    synergies: matches,
  };
};

// 동시에 2개 이상 등장하지 않는 상호 배타적 증강 그룹 목록 (배열 안의 배열 형태)
const MUTUALLY_EXCLUSIVE_AUGMENT_GROUPS = [
  // 1. 부활 물건: 기력의 조각과 기력의 덩어리는 동시에 나오지 않음
  ["revivePiece", "maxRevive"],

  // 2. 포켓몬 교체/변환 증강: 동시에 2개 이상 나오지 않음
  ["klinklangGear", "legendaryTitan", "marriedPokemon", "rouletteWheel", "soaring", "magikarpJump", "blackNight", "mewtwoStrikesBack", "veteranPrivilege", "sacrificeGod", "threeBears", "threeThousandYears", "evioliteShuckle", "ninjaAppeared", "geniusOfTransformation"],

  // 3. 능력치 전환 증강: 동시에 2개 이상 나오지 않음
  ["swordAndShield", "specialSwordAndShield", "ksante", "hhgghgg"],
];

// O(1) 배타 조회를 위한 맵: { [augId]: Set([배타_증강_ID들]) }
export const MUTUALLY_EXCLUSIVE_MAP = MUTUALLY_EXCLUSIVE_AUGMENT_GROUPS.reduce((acc, group) => {
  group.forEach((id) => {
    if (!acc[id]) acc[id] = new Set();
    group.forEach((otherId) => {
      if (id !== otherId) acc[id].add(otherId);
    });
  });
  return acc;
}, {});

// 무한 다이맥스 변환 함수
/**
 * 무한다이노를 무한 다이맥스 상태로 변환하는 함수
 * 종족값: 255 / 115 / 250 / 125 / 250 / 130
 * 이미지: 0890-m.webp
 * 체력 종족값 증가 시 현재 체력 % 비율 유지
 * @param {Object} pokemon
 */
const applyEternamax = (pokemon) => {
  if (!pokemon) return;

  const baseStats = {
    hp: 255,
    atk: 115,
    def: 250,
    catk: 125,
    cdef: 250,
    speed: 130,
  };

  const o = pokemon.o || pokemon;
  const evs = o.evs || { hp: 4, atk: 0, def: 0, catk: 252, cdef: 0, speed: 252 };
  const nature = o.nature || { up: "speed", down: "atk" };

  // 1. HP 계산
  const evHp = evs.hp ?? 0;
  const ivHp = 31;
  const newMaxHp = Math.floor((baseStats.hp * 2 + Math.floor(evHp / 4) + ivHp) / 2) + 60;

  // 현재 체력 비율 유지 (예: 반피면 50% 유지)
  const oldMaxHp = pokemon.maxHp || o.hp || pokemon.hp || newMaxHp;
  const oldHp = typeof pokemon.hp === "number" ? pokemon.hp : oldMaxHp;
  o.hp = newMaxHp;
  const effectiveNewMaxHp = pokemon.maxHp || newMaxHp;
  const hpRatio = oldMaxHp > 0 ? Math.max(0, Math.min(1, oldHp / oldMaxHp)) : 1;
  const newHp = Math.min(effectiveNewMaxHp, Math.max(oldHp > 0 ? 1 : 0, Math.round(effectiveNewMaxHp * hpRatio)));

  pokemon.hp = newHp;

  // 2. 공격/방어/특공/특방/스피드 계산
  const newStats = {};
  ["atk", "def", "catk", "cdef", "speed"].forEach((statKey) => {
    const baseVal = baseStats[statKey];
    const evVal = evs[statKey] ?? 0;
    const ivVal = 31;
    let val = Math.floor((baseVal * 2 + Math.floor(evVal / 4) + ivVal) / 2) + 5;
    if (nature?.up === statKey) val = Math.floor(val * 1.1);
    if (nature?.down === statKey) val = Math.floor(val * 0.9);
    newStats[statKey] = val;
  });

  o.stat = { ...o.stat, ...newStats };

  // 3. 이미지 및 ID 변경 (0890-m.webp)
  o.uniqueKey = "0890-m";
  o.dexNo = "0890";
  o.baseStats = baseStats;
  pokemon.isEternamax = true;
};

// 곰 포켓몬 관련 상수 및 판정 함수
export const BEAR_POKEMON_NAMES = ["다투곰", "달투곰", "악라오스", "물라오스", "툰베어", "이븐곰"];
export const BEAR_DEX_NOS = ["0614", "0760", "0892", "0901"];

const isBearPokemon = (pokemon) => {
  if (!pokemon) return false;
  const rawDex = pokemon.dexNo || (pokemon.uniqueKey ? String(pokemon.uniqueKey).split("-")[0] : null) || (pokemon.id ? String(pokemon.id).split("-")[0] : null);
  const cleanDex = rawDex ? String(rawDex).split("-")[0] : "";
  if (cleanDex && BEAR_DEX_NOS.includes(cleanDex)) return true;
  const name = pokemon.name || pokemon.sampleName || pokemon.id || "";
  return BEAR_POKEMON_NAMES.some((bName) => name && name.includes(bName));
};

// 팀 내 곰 포켓몬 수에 따른 곰 증강("곰 세마리가 한 집에 있어") 동기화 함수
export const syncTeamBearBuffs = (battle) => {
  if (!battle) return;
  ["player", "npc"].forEach((side) => {
    const team = (side === "npc" ? [battle.npc, battle.npcBench1, battle.npcBench2] : [battle.player, battle.playerBench1, battle.playerBench2]).filter(Boolean);

    const bearCount = team.filter(isBearPokemon).length;
    const mult = bearCount >= 3 ? 1.5 : bearCount === 2 ? 1.3 : 1.1;

    team.forEach((pokemon) => {
      // 보유 중인 '곰 세마리가 한 집에 있어' 증강만 업데이트
      const houseAug = (pokemon.augments || []).find((a) => {
        const id = typeof a === "string" ? a : a?.id;
        return id === "threeBearsHouse";
      });
      if (!houseAug) return;

      if (typeof houseAug === "object") {
        houseAug.id = "threeBearsHouse";
        houseAug.name = "곰 세마리가 한 집에 있어";
        houseAug.bearCount = bearCount;
        houseAug.mult = mult;
      }
    });
  });
};

// 팀 내 영웅의 메아리(hasEchoOfHeroBuff) 플래그 동기화 함수
export const syncTeamEchoOfHeroBuff = (battle, fallbackPokemon = null) => {
  if (!battle) {
    if (fallbackPokemon && !fallbackPokemon.hasAugment?.("echoOfHero")) {
      delete fallbackPokemon.hasEchoOfHeroBuff;
    }
    return;
  }
  ["player", "npc"].forEach((side) => {
    const members = (side === "npc" ? [battle.npc, battle.npcBench1, battle.npcBench2] : [battle.player, battle.playerBench1, battle.playerBench2]).filter(Boolean);
    if (members.length === 0) return;
    const hasHolder = members.some((p) => p?.hasAugment?.("echoOfHero"));
    members.forEach((p) => {
      if (hasHolder) {
        p.hasEchoOfHeroBuff = true;
      } else {
        delete p.hasEchoOfHeroBuff;
      }
    });
  });
};

// 팀 내 메이플 용사(hasMapleWarriorBuff) 플래그 동기화 함수
export const syncTeamMapleWarriorBuff = (battle, fallbackPokemon = null) => {
  if (!battle) {
    if (fallbackPokemon && !fallbackPokemon.hasAugment?.("mapleWarrior")) {
      delete fallbackPokemon.hasMapleWarriorBuff;
    }
    return;
  }
  ["player", "npc"].forEach((side) => {
    const members = (side === "npc" ? [battle.npc, battle.npcBench1, battle.npcBench2] : [battle.player, battle.playerBench1, battle.playerBench2]).filter(Boolean);
    if (members.length === 0) return;
    const hasHolder = members.some((p) => p?.hasAugment?.("mapleWarrior"));
    members.forEach((p) => {
      if (hasHolder) {
        p.hasMapleWarriorBuff = true;
      } else {
        delete p.hasMapleWarriorBuff;
      }
    });
  });
};

// 팀 내 하이퍼바디(hasHyperBodyBuff) 플래그 동기화 함수
export const syncTeamHyperBodyBuff = (battle, fallbackPokemon = null) => {
  if (!battle) {
    if (fallbackPokemon && !fallbackPokemon.hasAugment?.("hyperBody")) {
      delete fallbackPokemon.hasHyperBodyBuff;
    }
    return;
  }
  ["player", "npc"].forEach((side) => {
    const members = (side === "npc" ? [battle.npc, battle.npcBench1, battle.npcBench2] : [battle.player, battle.playerBench1, battle.playerBench2]).filter(Boolean);
    if (members.length === 0) return;
    const hasHolder = members.some((p) => p?.hasAugment?.("hyperBody"));
    members.forEach((p) => {
      if (hasHolder) {
        p.hasHyperBodyBuff = true;
      } else {
        delete p.hasHyperBodyBuff;
      }
    });
  });
};

// 팀 내 헤이스트(hasHasteBuff) 플래그 동기화 함수
export const syncTeamHasteBuff = (battle, fallbackPokemon = null) => {
  if (!battle) {
    if (fallbackPokemon && !fallbackPokemon.hasAugment?.("haste")) {
      delete fallbackPokemon.hasHasteBuff;
    }
    return;
  }
  ["player", "npc"].forEach((side) => {
    const members = (side === "npc" ? [battle.npc, battle.npcBench1, battle.npcBench2] : [battle.player, battle.playerBench1, battle.playerBench2]).filter(Boolean);
    if (members.length === 0) return;
    const hasHolder = members.some((p) => p?.hasAugment?.("haste"));
    members.forEach((p) => {
      if (hasHolder) {
        p.hasHasteBuff = true;
      } else {
        delete p.hasHasteBuff;
      }
    });
  });
};

// 팀 내 샤프아이즈(hasSharpEyesBuff) 플래그 동기화 함수
export const syncTeamSharpEyesBuff = (battle, fallbackPokemon = null) => {
  if (!battle) {
    if (fallbackPokemon && !fallbackPokemon.hasAugment?.("sharpEyes")) {
      delete fallbackPokemon.hasSharpEyesBuff;
    }
    return;
  }
  ["player", "npc"].forEach((side) => {
    const members = (side === "npc" ? [battle.npc, battle.npcBench1, battle.npcBench2] : [battle.player, battle.playerBench1, battle.playerBench2]).filter(Boolean);
    if (members.length === 0) return;
    const hasHolder = members.some((p) => p?.hasAugment?.("sharpEyes"));
    members.forEach((p) => {
      if (hasHolder) {
        p.hasSharpEyesBuff = true;
      } else {
        delete p.hasSharpEyesBuff;
      }
    });
  });
};

// 팀 내 물의 조종자(hasWaterOmoticsBuff) 플래그 동기화 함수
export const syncTeamWaterOmoticsBuff = (battle, fallbackPokemon = null) => {
  if (!battle) {
    if (fallbackPokemon && !fallbackPokemon.hasAugment?.("waterOmotics")) {
      delete fallbackPokemon.hasWaterOmoticsBuff;
    }
    return;
  }
  ["player", "npc"].forEach((side) => {
    const members = (side === "npc" ? [battle.npc, battle.npcBench1, battle.npcBench2] : [battle.player, battle.playerBench1, battle.playerBench2]).filter(Boolean);
    if (members.length === 0) return;
    const hasHolder = members.some((p) => p?.hasAugment?.("waterOmotics"));
    members.forEach((p) => {
      if (hasHolder) {
        p.hasWaterOmoticsBuff = true;
      } else {
        delete p.hasWaterOmoticsBuff;
      }
    });
  });
};

// 팀 내 암석거인(hasGiantSoldierOfStoneBuff) 플래그 동기화 함수
export const syncTeamGiantSoldierOfStoneBuff = (battle, fallbackPokemon = null) => {
  if (!battle) {
    if (fallbackPokemon && !fallbackPokemon.hasAugment?.("giantSoldierOfStone")) {
      delete fallbackPokemon.hasGiantSoldierOfStoneBuff;
    }
    return;
  }
  ["player", "npc"].forEach((side) => {
    const members = (side === "npc" ? [battle.npc, battle.npcBench1, battle.npcBench2] : [battle.player, battle.playerBench1, battle.playerBench2]).filter(Boolean);
    if (members.length === 0) return;
    const hasHolder = members.some((p) => p?.hasAugment?.("giantSoldierOfStone"));
    members.forEach((p) => {
      if (hasHolder) {
        p.hasGiantSoldierOfStoneBuff = true;
      } else {
        delete p.hasGiantSoldierOfStoneBuff;
      }
    });
  });
};

// 팀 내 천년 방패(hasMillenniumShieldBuff) 플래그 동기화 함수
export const syncTeamMillenniumShieldBuff = (battle, fallbackPokemon = null) => {
  if (!battle) {
    if (fallbackPokemon && !fallbackPokemon.hasAugment?.("millenniumShield")) {
      delete fallbackPokemon.hasMillenniumShieldBuff;
    }
    return;
  }
  ["player", "npc"].forEach((side) => {
    const members = (side === "npc" ? [battle.npc, battle.npcBench1, battle.npcBench2] : [battle.player, battle.playerBench1, battle.playerBench2]).filter(Boolean);
    if (members.length === 0) return;
    const hasHolder = members.some((p) => p?.hasAugment?.("millenniumShield"));
    members.forEach((p) => {
      if (hasHolder) {
        p.hasMillenniumShieldBuff = true;
      } else {
        delete p.hasMillenniumShieldBuff;
      }
    });
  });
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
const replacePokemon = (pokemon, newPokemonOrId, battle, options = {}) => {
  if (!pokemon) return null;
  const newPoke = typeof newPokemonOrId === "string" ? generatePokemonInstance(newPokemonOrId, pokemon.team || "player") : newPokemonOrId;
  if (!newPoke) return pokemon;
  newPoke.originalIndex = pokemon.originalIndex !== undefined ? pokemon.originalIndex : 0;
  newPoke.isFirst = Boolean(pokemon.isFirst);

  // 포켓몬 교체 시 기본적으로 해당 포켓몬의 증강, 버프, 저주를 전부 초기화 (resetAugments === false 인 경우만 유지)
  const shouldResetAugments = options?.resetAugments !== false;
  if (shouldResetAugments) {
    newPoke.augments = [];
  } else {
    const excludeId = options?.excludeAugmentId;
    newPoke.augments = (pokemon.augments || []).filter((a) => a && (excludeId ? a.id !== excludeId : true) && a.cost !== "-");
  }

  // 이전 포켓몬에 남아 있던 동적 속성(hasEchoOfHeroBuff, isEternamax, _nullifyType 등)까지 모두 제거
  Object.keys(pokemon).forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(newPoke, key)) {
      delete pokemon[key];
    }
  });

  // 기존 pokemon 객체 참조를 유지하도록 인스턴스 프로토타입 및 속성 복사
  Object.setPrototypeOf(pokemon, Object.getPrototypeOf(newPoke));
  Object.assign(pokemon, newPoke);
  pokemon.augments = newPoke.augments;
  pokemon.img_id = newPoke.img_id || null;
  pokemon.isMega = false;
  delete pokemon.isEternamax;

  // 배틀 내 슬롯 교체 (단일 인스턴스 참조 유지)
  if (battle) {
    const targetIdx = pokemon.originalIndex;
    const isNpc = pokemon.team === "npc";
    if (!isNpc) {
      if (battle.player === pokemon || (targetIdx !== undefined && battle.player?.originalIndex === targetIdx)) {
        battle.player = pokemon;
      } else if (battle.playerBench1 === pokemon || (targetIdx !== undefined && battle.playerBench1?.originalIndex === targetIdx)) {
        battle.playerBench1 = pokemon;
      } else if (battle.playerBench2 === pokemon || (targetIdx !== undefined && battle.playerBench2?.originalIndex === targetIdx)) {
        battle.playerBench2 = pokemon;
      }
    } else {
      if (battle.npc === pokemon || (targetIdx !== undefined && battle.npc?.originalIndex === targetIdx)) {
        battle.npc = pokemon;
      } else if (battle.npcBench1 === pokemon || (targetIdx !== undefined && battle.npcBench1?.originalIndex === targetIdx)) {
        battle.npcBench1 = pokemon;
      } else if (battle.npcBench2 === pokemon || (targetIdx !== undefined && battle.npcBench2?.originalIndex === targetIdx)) {
        battle.npcBench2 = pokemon;
      }
    }
  }

  // 교체된 포켓몬이 영웅의 메아리/메이플 용사/하이퍼바디/헤이스트/샤프아이즈 보유자였던 경우 팀 잔여 버프 플래그 정리
  syncTeamEchoOfHeroBuff(battle, pokemon);
  syncTeamMapleWarriorBuff(battle, pokemon);
  syncTeamHyperBodyBuff(battle, pokemon);
  syncTeamHasteBuff(battle, pokemon);
  syncTeamSharpEyesBuff(battle, pokemon);
  syncTeamWaterOmoticsBuff(battle, pokemon);
  syncTeamGiantSoldierOfStoneBuff(battle, pokemon);
  syncTeamMillenniumShieldBuff(battle, pokemon);
  syncTeamBearBuffs(battle);

  return pokemon;
};

// 특정 기술 보유 여부 확인
const hasSkill = (pokemon, skillName) => {
  if (!pokemon || !skillName) return false;
  const skills = pokemon.skill;
  if (!skills) return false;
  return [1, 2, 3, 4].some((slot) => {
    const sk = skills[slot] || skills[String(slot)];
    return sk?.name === skillName;
  });
};

// ====================================================================================
// 4대 텍스트 시스템: selDesc / screenText / logModalText / statusModalText
// ====================================================================================

// 증강 선택창에서 출력되는 설명 텍스트
export const getAugmentSelDesc = (augment, pokemon = null, battle = null) => {
  if (typeof augment.selDesc === "function") return augment.selDesc(pokemon, battle);
  if (augment.selDesc) return augment.selDesc;
  if (typeof augment.desc === "function") return augment.desc(pokemon);
  return augment.desc || "";
};

// 텍스트창에 출력되는 증강 획득 텍스트
export const getAugmentScreenText = (augment, target = null, prevPokeName = "", options = null) => {
  if (typeof augment.screenText === "function") return augment.screenText(target, prevPokeName, options);
  if (augment.screenText) return augment.screenText;

  // 공통 로직
  const names = target ? target.names("는") : "포켓몬은";
  const rawName = stripEmoji(augment.shortName || augment.name || "");
  if (isSynergyAugment(augment)) return `3개의 증강이 공명하여 "${rawName}" 시너지가 활성화되었다!`;
  if (isPermanentCurse(augment)) return `[증강] ${names} "${rawName}" 영구 디버프를 얻었다!`;
  if (isCurseAugment(augment)) return `[증강] ${names} "${rawName}" 디버프를 얻었다!`;
  if (isPermanentBuff(augment)) return `[증강] ${names} "${rawName}" 영구 버프를 얻었다!`;
  if (isBuffAugment(augment)) return `[증강] ${names} "${rawName}" 버프를 얻었다!`;
  return `[증강] ${names} "${rawName}" 효과를 얻었다!`;
};

// 로그 모달에서 출력되는 증강 텍스트
export const getAugmentLogModalText = (augment, target = null, prevPokeName = "", options = null) => {
  if (typeof augment.logModalText === "function") return augment.logModalText(target, prevPokeName, options);
  if (augment.logModalText) return augment.logModalText;
  if (typeof augment.desc === "function") return augment.desc(target);
  return augment.desc || "";
};

// 증강 현황, 유지 모달에서 출력되는 증강 텍스트
export const getAugmentStatusModalText = (augment, pokemon = null, battle = null, options = null) => {
  if (typeof augment.statusModalText === "function") return augment.statusModalText(pokemon, battle, options);
  if (augment.statusModalText) return augment.statusModalText;
  if (typeof augment.desc === "function") return augment.desc(pokemon);
  return augment.desc || "";
};

// 증강 original desc, 주로 preview 모달에서 출력
export const getAugmentDesc = (augment, pokemon = null, battle = null) => {
  if (typeof augment.desc === "function") return augment.desc(pokemon);
  return augment.desc || "";
};

export const isSynergyAugment = (augment) => {
  if (typeof augment === "object" && augment.synergy) return true;
  const id = typeof augment === "string" ? augment : augment.id;
  if (id && AUGMENT_SYNERGY_MAP && Boolean(AUGMENT_SYNERGY_MAP[id])) return true;
  const found = AUGMENT_LIST.find((a) => a.id === id);
  return Boolean(found?.synergy || (id && AUGMENT_SYNERGY_MAP && Boolean(AUGMENT_SYNERGY_MAP[id])));
};

export const isSynergyComponentAugment = (augment) => {
  if (!augment) return false;
  const id = typeof augment === "string" ? augment : augment.id;
  if (!id) return false;
  if (isSynergyAugment(augment)) return false;
  if (!AUGMENT_SYNERGY_MAP) return false;
  for (const requiredIds of Object.values(AUGMENT_SYNERGY_MAP)) {
    if (Array.isArray(requiredIds) && requiredIds.includes(id)) return true;
  }
  return false;
};

export const isCurseAugment = (augment) => {
  if (typeof augment === "object" && augment.curse) return true;
  const id = typeof augment === "string" ? augment : augment.id;
  const found = AUGMENT_LIST.find((a) => a.id === id);
  return Boolean(found?.curse);
};

export const isBuffAugment = (augment) => {
  if (isCurseAugment(augment)) return false;
  if (isSynergyAugment(augment)) return false;
  if (typeof augment === "object" && augment.buf) return true;
  const id = typeof augment === "string" ? augment : augment.id;
  const found = AUGMENT_LIST.find((a) => a.id === id);
  return Boolean(found?.buf);
};

export const isPermanentBuff = (augment) => {
  if (!augment) return false;
  if (!isBuffAugment(augment)) return false;
  if (typeof augment === "object" && augment.permanent) return true;
  const id = typeof augment === "string" ? augment : augment.id;
  const found = AUGMENT_LIST.find((a) => a.id === id);
  return Boolean(found?.permanent);
};

export const isPermanentCurse = (augment) => {
  if (!augment) return false;
  if (!isCurseAugment(augment)) return false;
  if (typeof augment === "object" && augment.permanent) return true;
  const id = typeof augment === "string" ? augment : augment.id;
  const found = AUGMENT_LIST.find((a) => a.id === id);
  return Boolean(found?.permanent);
};

export const isNormalAugment = (augment) => {
  return !isCurseAugment(augment) && !isBuffAugment(augment) && !isSynergyAugment(augment);
};

export const stripEmoji = (str) => {
  if (typeof str !== "string") return str;
  return str.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, "").trim();
};

// ==============================================================================
// 내부 전용 유틸리티 및 헬퍼 함수 (Principle 6: 파일 최하단 배치 및 non-export)
// ==============================================================================

function isHpAtLeast(pokemon, ratio = 0.5) {
  return pokemon.hp >= pokemon.maxHp * ratio;
}

// 현재 특성과 원본 특성(originalAbil)이 모두 지정한 특성인지 확인
function hasCurrentAndOriginalAbil(pokemon, abilName) {
  if (!pokemon || !abilName) return false;
  const curAbil = pokemon.abil.name;
  const origAbil = pokemon.originalAbil.name;
  return curAbil === abilName && origAbil === abilName;
}

// 현재, 원본, 또는 메가진화 후 특성 중 하나라도 해당 특성인지 확인
function hasSomeAbil(pokemon, abilName) {
  if (pokemon.abil.name === abilName) return true;
  if (pokemon.originalAbil.name === abilName) return true;
  if (pokemon.megaData?.abil === abilName) return true;

  return false;
}

// 지닌 물건이 기합의띠인지 확인 (현재 또는 원본)
function hasSomeItem(pokemon, itemName) {
  return pokemon.item === itemName || pokemon.originalItem === itemName;
}

function hasPokemonOnTeam(team, dexNo) {
  if (!Array.isArray(team) || !dexNo) return false;
  return team.some((p) => p && p.dexNo === dexNo);
}

function getPokemonSkills(pokemon) {
  const skills = pokemon?.skill;
  if (!skills) return [];
  return [1, 2, 3, 4].map((slot) => skills[slot]).filter((sk) => sk && sk.name !== "발버둥");
}

export { isAttackSkill };

export function hasAttackSkill(pokemon) {
  return getPokemonSkills(pokemon).some(isAttackSkill);
}

export function getAttackSkills(pokemon) {
  return getPokemonSkills(pokemon).filter(isAttackSkill);
}

// 막이 포켓몬 여부, pokemon.role로 확인
function isTankPokemon(pokemon) {
  const TANK_ROLES = ["막이", "물리막이", "특수막이"];
  return TANK_ROLES.includes(pokemon.role);
}

const EXCLUDED_STAT_TYPE_SKILLS = ["지구던지기", "속임수", "바디프레스"];

// 물리 포켓몬 여부, 공격이 더 높고 물리 공격기가 있는 경우
function isPhysicalPokemon(pokemon) {
  const stat = pokemon.stat;
  if (stat.atk < stat.catk) return false;
  return getPokemonSkills(pokemon).some((sk) => {
    const stype = sk?.name === "테라버스트" && stat.atk > stat.catk ? "atk" : sk?.stype;
    return stype === "atk" && !EXCLUDED_STAT_TYPE_SKILLS.includes(sk?.name);
  });
}

// 특수 포켓몬 여부, 특공이 더 높고 특수 공격기가 있는 경우
function isSpecialPokemon(pokemon) {
  const stat = pokemon.stat;
  if (stat.catk < stat.atk) return false;
  return getPokemonSkills(pokemon).some((sk) => {
    return sk?.stype === "catk" && !EXCLUDED_STAT_TYPE_SKILLS.includes(sk?.name);
  });
}

// 능륵쳐 일치화 증강이 이미 있으면 안나옴
function canPickStatSwapAugment(pokemon) {
  const STAT_SWAP_AUGMENTS = ["swordAndShield", "specialSwordAndShield", "ksante", "hhgghgg"];
  return !STAT_SWAP_AUGMENTS.some((id) => pokemon.hasAugment?.(id));
}

// 오른손엔방패 왼손엔검, 특수, 그 긴거 : 두 스탯이 1.5배 이상 차이날때만 등장
function hasStatRatioDiff(pokemon, statKey1, statKey2, ratio = 1.5, battle = null) {
  const val1 = getAugmentedStat(pokemon, statKey1, battle);
  const val2 = getAugmentedStat(pokemon, statKey2, battle);
  if (!val1 || !val2 || val1 <= 0 || val2 <= 0) return false;
  const max = Math.max(val1, val2);
  const min = Math.min(val1, val2);
  return max >= min * ratio - 1e-9;
}

// 오른손엔방패 왼손엔검, 특수, 그 긴거 텍스트
const getStatCompareDesc = (pokemon, stat1, stat2, battle = null, label1 = null, label2 = null) => {
  const defaultLabels = {
    atk: "공격",
    def: "방어",
    catk: "특공",
    cdef: stat1 === "def" ? "특수방어" : "특방",
    speed: "스피드",
  };
  const name1 = label1 || defaultLabels[stat1] || stat1;
  const name2 = label2 || defaultLabels[stat2] || stat2;
  const stat = pokemon?.stat;
  if (stat && typeof stat[stat1] === "number" && typeof stat[stat2] === "number") {
    const rank1 = Number(pokemon?.tempStatus?.rank?.[stat1] ?? 0);
    const rank2 = Number(pokemon?.tempStatus?.rank?.[stat2] ?? 0);
    const val1 = Math.floor(getAugmentedStat(pokemon, stat1, battle) * getMultiplier(rank1));
    const val2 = Math.floor(getAugmentedStat(pokemon, stat2, battle) * getMultiplier(rank2));
    return josa(`항상 ${name1}(${val1})#{와} ${name2}(${val2}) 중 더 유리한 수치를 사용합니다.`);
  }
  return josa(`항상 ${name1}#{와} ${name2} 중 더 유리한 수치를 사용합니다.`);
};

// 물의 조종자 / 암석거인 등장 가중치 계산
function getTypeDefenseAugmentWeight(pokemon, battle, targetType) {
  let w = 0;
  if (pokemon?.type1 === targetType || pokemon?.type2 === targetType) {
    w += 100;
  }
  const side = pokemon?.team === "npc" ? "npc" : "player";
  const team = battle ? (side === "npc" ? [battle.npc, battle.npcBench1, battle.npcBench2] : [battle.player, battle.playerBench1, battle.playerBench2]).filter(Boolean) : [];
  const otherTypeCount = team.filter((p) => p !== pokemon && (p.type1 === targetType || p.type2 === targetType)).length;
  w += otherTypeCount * 50;
  if (pokemon?.hasAugment?.("holyElfBlessing")) {
    w += 50;
  }
  return w;
}

// 적에게 화상을 입힐 수 있는 상태인지 확인 (할머니의 고추기름, 태양의 호흡)
function canInflictBurn(pokemon) {
  if (pokemon.abil?.name === "불꽃몸") return true;
  const burnAugments = ["salamandra", "flamingKatana", "sunfireCape", "aThousandBlazingSuns"];
  if (burnAugments.some((augment) => pokemon.hasAugment?.(augment))) {
    return true;
  }
  const skills = Object.values(pokemon.skill).filter(Boolean);
  return skills.some((sk) => {
    if (!sk) return false;
    return Array.isArray(sk.skillEffectList) && sk.skillEffectList.some((eff) => eff.name === "화상" || eff.name === "트라이어택");
  });
}
