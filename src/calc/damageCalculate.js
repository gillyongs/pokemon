import { typeCheckOnBattle } from "./typeEffectCalculate";
import { getMultiplier } from "./rankStat";
import { noNullItem } from "../entity/Item";
import { isAilmentCheck } from "../service/ailment";
import { speedCheck, speedCalculate } from "./speedCheck";
import { skillTypeCalculate } from "./skillTypeCalculate";
import { consoleLog } from "../util/consoleLog";
import { getAugmentedStat } from "./getStat";

// 3. atk랑 catk중 더 높은 값 구하는 공통함수 (테라버스트, 파괴광선 등)
export const getHigherAtkStat = (atkVal, catkVal) => {
  return atkVal > catkVal ? "atk" : "catk";
};

export const getPokemonCombatStats = (pokemon, battle, noRank = false) => {
  const rankMult = (statKey) => (noRank ? 1 : getMultiplier(pokemon?.tempStatus?.rank?.[statKey] ?? 0));
  const stats = {
    atk: getAugmentedStat(pokemon, "atk", battle) * rankMult("atk"),
    catk: getAugmentedStat(pokemon, "catk", battle) * rankMult("catk"),
    def: getAugmentedStat(pokemon, "def", battle) * rankMult("def"),
    cdef: getAugmentedStat(pokemon, "cdef", battle) * rankMult("cdef"),
  };
  return applyStatSwapAugments(stats, pokemon);
};
export const damageCalculate = (battle, obj, ai) => {
  // 데미지를 "계산"만 해서 주는 함수
  // battle 객체 내부의 값을 바꾸지 않는다 (log 제외)
  // => 지닌 아이템, 특성이 바뀌는 기합의띠, 탈은 damage 함수에서 처리한다
  //랭크업 등 스탯 반영
  const attackPokemon = battle[battle.turn.atk];
  const defensePokemon = battle[battle.turn.def];

  const skillNumber = battle.turn.atkSN;
  const originSkill = attackPokemon.skill[skillNumber]; // 시전 스킬
  const calculatedType = skillTypeCalculate(battle, originSkill, attackPokemon);
  let skill = originSkill && originSkill.type !== calculatedType ? { ...originSkill, type: calculatedType } : originSkill;

  const atkAbil = attackPokemon.abil?.name;
  const defAbil = defensePokemon.abil?.name;

  const isMustCritical = Boolean(skill?.feature?.mustCritical);
  const isCritical = ai ? isMustCritical : Boolean(attackPokemon.turn.critical);
  // NPC 데미지 계산시엔 확정급소가 아니면 급소 보정을 하지 않는다 (난수 제거)

  const noTggAtk = !attackPokemon.abil?.feature?.tgg;

  if (ai) {
    const typeDamage = typeCheckOnBattle(battle, skill, attackPokemon, defensePokemon); // 상성 보정
    if (typeDamage === 0) return 0; // 고스트포켓몬에게 지구던지기를 쓰는 경우
    if (skill.feature.oneShot && defAbil === "옹골참") return 0; // 특성이 옹골참인 상대에게 일격기를 쓰는 경우
    if (skill.name === "절대영도" && (defensePokemon.type1 === "얼음" || defensePokemon.type2 === "얼음")) return 0; // 얼음타입 포켓몬에게 절대영도를 쓰는 경우
    if (skill.type === "불꽃" && defAbil === "타오르는불꽃") return 0;
  }

  // 데미지가 고정인 스킬들 ===============================================================================================

  if (skill.feature.oneShot) {
    //일격기
    return defensePokemon.maxHp;
  }
  if (skill.name === "카타스트로피" || skill.name === "자연의분노") {
    // 현재 체력의 절반을 깎는 스킬
    return defensePokemon.hp / 2;
  }
  if (skill.name === "지구던지기") {
    if (ai && (battle.player.type1 === "고스트" || battle.player.type2 === "고스트")) return 0;
    return 50;
  }
  if (skill.name === "죽기살기") {
    if (ai && (defensePokemon.type1 === "고스트" || defensePokemon.type2 === "고스트")) return 0;
    const diff = defensePokemon.hp - attackPokemon.hp;
    return diff > 0 ? diff : 0;
  }
  if (skill.name === "목숨걸기") {
    if (ai && (battle.player.type1 === "고스트" || battle.player.type2 === "고스트")) return 0;
    return attackPokemon.hp;
  }
  if (skill.feature.counter) {
    // 미러코트, 카운터, 메탈버스트
    // 성공 실패 조건은 skillRequirement에서 관리
    const mult = skill.feature.counterMult || 2;
    return Math.floor(attackPokemon.turn.recentDamageGet * mult);
  }

  // 스탯 ================================================================================================================

  // 1. 공격자 / 방어자 스탯 선언 (getAugmentedStat * getMultiplier)
  const atkCombat = getPokemonCombatStats(attackPokemon, battle, false);
  let { atk, catk, def } = atkCombat;

  const defCombat = getPokemonCombatStats(defensePokemon, battle, false);
  let { atk: defAtk, def: defDef, cdef: defCdef } = defCombat;

  const noRankAtkCombat = getPokemonCombatStats(attackPokemon, battle, true);
  let { atk: noRankAtk, catk: noRankCatk, def: noRankDef } = noRankAtkCombat;

  const noRankDefCombat = getPokemonCombatStats(defensePokemon, battle, true);
  let { atk: noRankDefAtk, def: noRankDefDef, cdef: noRankDefCdef } = noRankDefCombat;

  // 2. 오른손엔 방패, 과거의 영광(특수), 그 긴거는 getPokemonCombatStats(applyStatSwapAugments)에서 우선 처리됨
  // (atk와 def 중 높은 값으로 덮어 씌움, catk와 cdef 중 높은 값으로 덮어 씌움 등)

  // 3. atk랑 catk중 더 높은 값 구하는 공통함수를 파서 테라버스트랑 파괴광선에서 사용
  const isAdaptiveSkill = skill?.name === "테라버스트" || (attackPokemon?.hasAugment?.("lostTechnologyHyperBeam") && skill?.name === "파괴광선");

  if (isAdaptiveSkill) {
    skill = { ...skill, stype: getHigherAtkStat(atk, catk) };
  }

  // 공격/방어에 반영할 스탯 및 수치 결정
  let attackStat = skill.stype;
  let defenseStat = "";
  let atkStat = 0;
  let defStat = 0;

  if (skill.stype === "atk") {
    defenseStat = "def";
    atkStat = atk;
    defStat = defDef;
  } else if (skill.stype === "catk") {
    defenseStat = "cdef";
    atkStat = catk;
    defStat = defCdef;
    if (skill.name === "사이코쇼크" || skill.name === "사이코브레이크") {
      defenseStat = "def";
      defStat = defDef;
    }
  }

  if (skill.name === "바디프레스") {
    attackStat = "def";
    atkStat = def;
    defenseStat = "def";
    defStat = defDef;
  }

  // 랭크업 및 천진, 급소, 성스러운칼 처리
  if (defAbil === "천진" && noTggAtk) {
    atkStat = attackStat === "def" ? noRankDef : attackStat === "catk" ? noRankCatk : noRankAtk;
  }
  const curNoRankAtk = attackStat === "def" ? noRankDef : attackStat === "catk" ? noRankCatk : noRankAtk;
  if (isCritical && atkStat < curNoRankAtk) {
    atkStat = curNoRankAtk;
  }

  const hasSacredSword = skill.skillEffectList?.some((effect) => effect.name === "천진");
  if (atkAbil === "천진" || hasSacredSword) {
    defStat = defenseStat === "cdef" ? noRankDefCdef : noRankDefDef;
  }
  const curNoRankDef = defenseStat === "cdef" ? noRankDefCdef : noRankDefDef;
  if (isCritical && defStat > curNoRankDef) {
    defStat = curNoRankDef;
  }

  atkStat = Math.floor(atkStat);
  defStat = Math.floor(defStat);

  // 4. 기술이 속임수면 마지막에 그냥 상대 atk 값으로 덮어 씌운다
  if (skill.name === "속임수") {
    attackStat = "atk";
    defenseStat = "def";
    defStat = defDef;
    atkStat = defAbil === "천진" ? Math.floor(noRankDefAtk) : Math.floor(defAtk);
  }
  // 스탯 보정 ======================================================================================================
  let atkStr = atkStat + "(" + attackStat + ")";
  let defStr = defStat + "(" + defenseStat + ")";

  // 공격 (atk) ===================================
  if (skill.stype === "atk") {
    // 바디프레스나 속임수는 '물리기'면 구애머리띠나 화상이 적용된다.
    if (attackPokemon.item === "구애머리띠") {
      atkStat *= 1.5;
      atkStr += " * 1.5 (구애머리띠)";
    }

    const isStatus = Object.values(attackPokemon.ailment).some((v) => v !== null);
    if (atkAbil === "근성" && isStatus) {
      atkStat *= 1.5;
      atkStr += " * 1.5 (근성)";
    }
    if (atkAbil === "천하장사") {
      atkStat *= 2;
      atkStr += " * 2 (천하장사)";
    }
    if (atkAbil === "패스트스타트" && (attackPokemon.tempStatus?.turnsOnField ?? 0) >= 5) {
      atkStat *= 2;
      atkStr += " * 2 (패스트스타트)";
    }
    if (atkAbil === "슬로스타트" && (attackPokemon.tempStatus?.turnsOnField ?? 0) < 5) {
      atkStat *= 0.5;
      atkStr += " * 0.5 (슬로스타트)";
    }
    if (atkAbil === "무아지경") {
      atkStat *= 1.5;
      atkStr += " * 1.5 (무아지경)";
    }

    if (attackPokemon.tempStatus.protosynthesis === "atk") {
      atkStat *= 1.3;
      atkStr += " * 1.3 (고대활성)";
    }

    if (attackPokemon.tempStatus.quarkDrive === "atk") {
      atkStat *= 1.3;
      atkStr += " * 1.3 (쿼크차지)";
    }

    if (attackPokemon.ailment.burn !== null && attackStat === "atk" && atkAbil !== "근성") {
      // 화상 상태이면 공격력 절반
      atkStat *= 0.5;
      atkStr += " * 0.5 (화상)";
    }

    const defNoCleanAtk = battle.field[battle.turn.def].noClean;
    if (defNoCleanAtk.reflect || defNoCleanAtk.auroraVeil) {
      // 리플렉터와 오로라베일은 중첩되지 않는다
      const wallName = defNoCleanAtk.reflect ? "리플렉터" : "오로라베일";
      if (skill.feature?.wallBreaker || atkAbil === "틈새포착") {
        atkStr += ` * 1 (${wallName} 무효)`;
      } else {
        atkStat *= 0.5;
        atkStr += ` * 0.5 (${wallName})`;
      }
    }

    if (defAbil === "재앙의목간" && atkAbil !== "재앙의목간") {
      if (noTggAtk) {
        // 공격, 특공을 떨구는 목간, 그릇만 틀깨기가 적용된다.
        // (틀깨기는 상태 특성에 영향을 받지 않고 '공격'할 수 있는 특성이다)
        atkStat *= 0.75;
        atkStr += " * 0.75 (재앙의목간)";
      }
    }
    if (atkAbil === "진홍빛고동" && battle.isSunny) {
      atkStat *= 1.3;
      atkStr += " * 1.3 (진홍빛고동)";
    }
  }

  // 특공 (catk) ===================================
  if (skill.stype === "catk") {
    if (atkAbil === "선파워" && battle.isSunny) {
      atkStat *= 1.5;
      atkStr += " * 1.5 (선파워)";
    }
    if (attackPokemon.item === "구애안경") {
      atkStat *= 1.5;
      atkStr += " * 1.5 (구애안경)";
    }
    if (attackPokemon.item === "마음의물방울" && attackPokemon.hasAugment?.("soulDew") && (attackPokemon.name.includes("라티오스") || attackPokemon.name.includes("라티아스"))) {
      atkStat *= 1.5;
      atkStr += " * 1.5 (마음의물방울)";
    }
    if (defAbil === "재앙의그릇" && atkAbil !== "재앙의그릇") {
      if (noTggAtk) {
        atkStat *= 0.75;
        atkStr += " * 0.75 (재앙의그릇)";
      }
    }

    const defNoCleanCatk = battle.field[battle.turn.def].noClean;
    if (defNoCleanCatk.lightScreen || defNoCleanCatk.auroraVeil) {
      // 사이코쇼크는 특수기이므로 빛의장막 영향을 받는다
      // 빛의장막과 오로라베일은 중첩되지 않는다
      const wallName = defNoCleanCatk.lightScreen ? "빛의장막" : "오로라베일";
      if (skill.feature?.wallBreaker || atkAbil === "틈새포착") {
        atkStr += ` * 1 (${wallName} 무효)`;
      } else {
        atkStat *= 0.5;
        atkStr += ` * 0.5 (${wallName})`;
      }
    }

    if (attackPokemon.tempStatus.protosynthesis === "catk") {
      atkStat *= 1.3;
      atkStr += " * 1.3 (고대활성)";
    }
    if (attackPokemon.tempStatus.quarkDrive === "catk") {
      atkStat *= 1.3;
      atkStr += " * 1.3 (쿼크차지)";
    }
    if (atkAbil === "하드론엔진" && battle.field.terrain.isElectricField) {
      atkStat *= 1.3;
      atkStr += " * 1.3 (하드론엔진)";
    }
  }

  // 방어 (def) ===================================
  if (defenseStat === "def") {
    if (defensePokemon.tempStatus.protosynthesis === "def") {
      defStat *= 1.3;
      defStr += " * 1.3 (고대활성)";
    }
    if (defensePokemon.tempStatus.quarkDrive === "def") {
      defStat *= 1.3;
      defStr += " * 1.3 (쿼크차지)";
    }
    if (atkAbil === "재앙의검" && defAbil !== "재앙의검") {
      defStat *= 0.75;
      defStr += " * 0.75 (재앙의검)";
    }
    if (defensePokemon.item === "진화의휘석" && (defensePokemon.feature?.evo || defensePokemon.hasAugment?.("eviolite"))) {
      defStat *= 1.5;
      defStr += " * 1.5 (진화의휘석)";
    }
    if (battle.isSnow && (defensePokemon.type1 === "얼음" || defensePokemon.type2 === "얼음")) {
      defStat *= 1.5;
      defStr += " * 1.5 (설경+얼음)";
    }
  }

  // 특방 (cdef) ===================================
  if (defenseStat === "cdef") {
    if (defensePokemon.item === "돌격조끼") {
      defStat *= 1.5;
      defStr += " * 1.5 (돌격조끼)";
    }
    if (defensePokemon.item === "마음의물방울" && defensePokemon.hasAugment?.("soulDew") && (defensePokemon.name.includes("라티오스") || defensePokemon.name.includes("라티아스"))) {
      defStat *= 1.5;
      defStr += " * 1.5 (마음의물방울)";
    }
    if (defensePokemon.tempStatus.protosynthesis === "cdef") {
      defStat *= 1.3;
      defStr += " * 1.3 (고대활성)";
    }
    if (defensePokemon.tempStatus.quarkDrive === "cdef") {
      defStat *= 1.3;
      defStr += " * 1.3 (쿼크차지)";
    }
    if (atkAbil === "재앙의구슬" && defAbil !== "재앙의구슬") {
      defStat *= 0.75;
      defStr += " * 0.75 (재앙의구슬)";
    }
    if (defensePokemon.item === "진화의휘석" && (defensePokemon.feature?.evo || defensePokemon.hasAugment?.("eviolite") || defensePokemon.hasAugment?.("진화의 휘석"))) {
      defStat *= 1.5;
      defStr += " * 1.5 (진화의휘석)";
    }
    if (battle.isSandstorm && (defensePokemon.type1 === "바위" || defensePokemon.type2 === "바위")) {
      defStat *= 1.5;
      defStr += " * 1.5 (모래바람+바위)";
    }
    const hasVoidStaff = attackPokemon?.hasAugment?.("voidStaff");
    if (hasVoidStaff) {
      defStat *= 0.6;
      defStr += " * 0.6 (공허의 지팡이 마관)";
    }
  }

  // 용 사냥꾼: 드래곤 타입을 상대로 모든 능력치가 1.5배 증가
  const isDefDragon = defensePokemon?.type1 === "드래곤" || defensePokemon?.type2 === "드래곤";
  if (attackPokemon?.hasAugment?.("dragonHunter") && isDefDragon) {
    atkStat *= 1.5;
    atkStr += " * 1.5 (용 사냥꾼)";
  }

  const isAtkDragon = attackPokemon?.type1 === "드래곤" || attackPokemon?.type2 === "드래곤";
  if (defensePokemon?.hasAugment?.("dragonHunter") && isAtkDragon) {
    defStat *= 1.5;
    defStr += " * 1.5 (용 사냥꾼)";
  }

  // 용용 죽겠지: 드래곤 타입 포켓몬을 2마리 쓰러뜨릴 때마다 모든 능력치가 0.1배 상승
  if (attackPokemon?.hasAugment?.("dragonDie")) {
    const atkDragonKills = Number(attackPokemon.dragonKillCount ?? attackPokemon.augments?.find((a) => a.id === "dragonDie")?.dragonKillCount ?? 0);
    const atkStacks = Math.floor(atkDragonKills / 2);
    if (atkStacks > 0) {
      const atkMult = Number((1 + atkStacks * 0.1).toFixed(2));
      atkStat *= atkMult;
      atkStr += ` * ${atkMult} (용용 죽겠지)`;
    }
  }

  if (defensePokemon?.hasAugment?.("dragonDie")) {
    const defDragonKills = Number(defensePokemon.dragonKillCount ?? defensePokemon.augments?.find((a) => a.id === "dragonDie")?.dragonKillCount ?? 0);
    const defStacks = Math.floor(defDragonKills / 2);
    if (defStacks > 0) {
      const defMult = Number((1 + defStacks * 0.1).toFixed(2));
      defStat *= defMult;
      defStr += ` * ${defMult} (용용 죽겠지)`;
    }
  }

  // 인생의 동반자: 모든 능력치가 1.1배 증가
  if (attackPokemon?.hasAugment?.("lifePartner")) {
    atkStat *= 1.1;
    atkStr += " * 1.1 (인생의 동반자)";
  }
  if (defensePokemon?.hasAugment?.("lifePartner")) {
    defStat *= 1.1;
    defStr += " * 1.1 (인생의 동반자)";
  }

  // 라스트 사무라이: 해당 포켓몬이 마지막에 홀로 남았을 경우 공격과 특수공격이 60% 증가
  if (battle && attackPokemon?.hasAugment?.("lastSamurai") && (skill.stype === "atk" || skill.stype === "catk")) {
    const side = attackPokemon?.team === "npc" ? "npc" : "player";
    if (battle.isLastPokemon?.(side)) {
      atkStat *= 1.6;
      atkStr += " * 1.6 (라스트 사무라이)";
    }
  }

  // 라스트 맨 스탠딩: 해당 포켓몬이 마지막에 홀로 남았을 경우 방어와 특수방어가 60% 증가
  if (battle && defensePokemon?.hasAugment?.("lastManStanding") && (defenseStat === "def" || defenseStat === "cdef")) {
    const side = defensePokemon?.team === "npc" ? "npc" : "player";
    if (battle.isLastPokemon?.(side)) {
      defStat *= 1.6;
      defStr += " * 1.6 (라스트 맨 스탠딩)";
    }
  }

  // 위력 ======================================================================================================

  let power = powerCalculate(battle, skill, obj, ai);
  // 위력이 바뀌는 기술은 여기서 처리
  // ex) 해수스파우팅, 탁쳐서 떨구기

  // 고정공식 ======================================================================================================

  let damage = (22 * power * atkStat) / 50 / defStat; //고정 공식
  attackPokemon.log.damage1 = "22 * " + power + "(위력) * [" + atkStr + "] / 50 / [" + defStr + "]";

  // 날씨 ==========================================================

  if (battle.isRainy) {
    if (skill.type === "물") {
      damage *= 1.5;
      attackPokemon.log.damage1 += " * 1.5 (비+물)";
    }
    if (skill.type === "불꽃") {
      damage *= 0.5;
      attackPokemon.log.damage1 += " * 0.5 (비+불꽃)";
    }
  }
  if (battle.isSunny) {
    if (skill.type === "불꽃") {
      damage *= 1.5;
      attackPokemon.log.damage1 += " * 1.5 (쾌청+불)";
    }
    if (skill.type === "물") {
      if (skill.name === "하이드로스팀") {
        damage *= 1.5;
        attackPokemon.log.damage1 += " * 1.5 (쾌청+하이드로스팀)";
      } else {
        damage *= 0.5;
        attackPokemon.log.damage1 += " * 0.5 (쾌청+물)";
      }
    }
  }

  // 필드 ==========================================================

  const field = battle.field.terrain.get();
  if (field !== null) {
    if (!attackPokemon.isFlying(battle)) {
      if (field === "그래스필드" && skill.type === "풀") {
        damage *= 1.3;
        attackPokemon.log.damage1 += " * 1.3 (그래스필드+풀)";
      }
      if (field === "일렉트릭필드" && skill.type === "전기") {
        damage *= 1.3;
        attackPokemon.log.damage1 += " * 1.3 (일렉트릭필드+전기)";
      }
    }

    if (field === "그래스필드" && skill.name === "지진") {
      damage *= 0.5; //비행여부 상관없이 적용됨
      attackPokemon.log.damage1 += " * 0.5 (그래스필드+지진)";
    }

    const isDefFlying = defensePokemon.isFlying(battle);
    if (field === "미스트필드" && skill.type === "드래곤" && !isDefFlying) {
      damage *= 0.5;
      attackPokemon.log.damage1 += " * 0.5 (미스트필드+드래곤)";
    }
  }

  // 아이템 ==========================================================

  if (skill.feature?.punch && attackPokemon.item === "펀치글러브") {
    damage *= 1.1;
    attackPokemon.log.damage1 += " * 1.1 (펀치글러브)";
  }

  if (skill.type === "물" && attackPokemon.item === "신비의물방울") {
    damage *= 1.2;
    attackPokemon.log.damage1 += " * 1.2 (신비의물방울)";
  }

  if (skill.type === "얼음" && attackPokemon.item === "녹지않는얼음") {
    damage *= 1.2;
    attackPokemon.log.damage1 += " * 1.2 (녹지않는얼음)";
  }

  if (defensePokemon?.tempStatus?.glaiveRush) {
    damage *= 2;
    attackPokemon.log.damage1 += " * 2 (대검돌격 디메리트)";
  }

  if (skill.type === "악" && attackPokemon.item === "검은안경") {
    damage *= 1.2;
    attackPokemon.log.damage1 += " * 1.2 (검은안경)";
  }

  if (skill.type === "강철" && attackPokemon.item === "금속코트") {
    damage *= 1.2;
    attackPokemon.log.damage1 += " * 1.2 (금속코트)";
  }

  if (skill.type === "페어리" && attackPokemon.item === "요정의깃털") {
    damage *= 1.2;
    attackPokemon.log.damage1 += " * 1.2 (요정의깃털)";
  }

  if (attackPokemon.item === "마음의물방울" && (skill.type === "에스퍼" || skill.type === "드래곤") && !attackPokemon.hasAugment?.("soulDew") && (attackPokemon.name.includes("라티오스") || attackPokemon.name.includes("라티아스"))) {
    damage *= 1.2;
    attackPokemon.log.damage1 += " * 1.2 (마음의물방울)";
  }

  // 특성 ===========================================================================================

  if (defAbil === "멀티스케일" && defensePokemon.hp === defensePokemon.maxHp) {
    if (noTggAtk) {
      damage *= 0.5;
      attackPokemon.log.damage1 += " * 0.5 (멀티스케일)";
    }
    // 멀티스케일은 공격 데미지에만 적용된다
    // 혼란 자해 데미지에 적용 안되다함 (위키피셜)
    // 생구에 멀스 적용 안됨
    // 고정 데미지 기술(일격기, 카운터, 지구던지기, 카타스트로피)도 적용 안 됨
  }

  // 복슬복슬: 직접 공격 기술(접촉기) 피격 시 데미지 절반, 불꽃 타입 기술 피격 시 데미지 2배
  if (defAbil === "복슬복슬" && noTggAtk) {
    if (skill.feature?.touch) {
      damage *= 0.5;
      attackPokemon.log.damage1 += " * 0.5 (복슬복슬 접촉)";
    }
    if (skill.type === "불꽃") {
      damage *= 2;
      attackPokemon.log.damage1 += " * 2 (복슬복슬 불꽃)";
    }
  }

  if ((atkAbil === "페어리오라" || defAbil === "페어리오라") && skill.type === "페어리") {
    // 틀깨기 적용 안됨
    damage = (damage * 4) / 3;
    attackPokemon.log.damage1 += " * 4/3 (페어리오라)";
  }

  if ((atkAbil === "다크오라" || defAbil === "다크오라") && skill.type === "악") {
    damage = (damage * 4) / 3;
    attackPokemon.log.damage1 += " * 4/3 (다크오라)";
  }

  if (atkAbil === "이판사판" && skill.feature?.rebound) {
    damage *= 1.2;
    attackPokemon.log.damage1 += " * 1.2 (이판사판)";
  }

  if (atkAbil === "옹골찬턱" && skill.feature?.bite) {
    damage *= 1.5;
    attackPokemon.log.damage1 += " * 1.5 (옹골찬턱)";
  }

  if (atkAbil === "용의턱" && skill.type === "드래곤") {
    damage *= 1.5;
    attackPokemon.log.damage1 += " * 1.5 (용의턱)";
  }

  if (attackPokemon.tempStatus.changeElectronic && skill.type === "전기") {
    damage *= 2;
    attackPokemon.log.damage1 += " * 2 (전기로바꾸기)";
  }

  if (atkAbil === "트랜지스터" && skill.type === "전기") {
    damage *= 1.3;
    attackPokemon.log.damage1 += " * 1.3 (트랜지스터)";
  }

  if (atkAbil === "예리함" && skill.feature?.slice) {
    damage *= 1.5;
    attackPokemon.log.damage1 += " * 1.5 (예리함)";
  }

  if (atkAbil === "단단한발톱" && skill.feature?.touch) {
    damage *= 1.3;
    attackPokemon.log.damage1 += " * 1.3 (단단한발톱)";
  }

  if (atkAbil === "철주먹" && skill.feature?.punch) {
    damage *= 1.2;
    attackPokemon.log.damage1 += " * 1.2 (철주먹)";
  }

  if (atkAbil === "테크니션" && power <= 60 && power > 0) {
    damage *= 1.5;
    attackPokemon.log.damage1 += " * 1.5 (테크니션)";
  }

  if (atkAbil === "총대장") {
    // 총대장은 능력치가 아니라 기술 데미지를 올려주는게 맞음
    // 대도각참이 속임수 쓰면 상대방 공격력에 자신 총대장 보정을 적용 공격
    // 반대로 상대가 속임수를 쓸땐 대도각참의 총대장으로 올라간 능력치가 반영되지 않음
    let faintedCount = 0;
    const isPlayer = battle.turn.atk.includes("player");
    if (isPlayer) {
      if (battle.playerBench1.hp <= 0) faintedCount++;
      if (battle.playerBench2.hp <= 0) faintedCount++;
    } else {
      if (battle.npcBench1.hp <= 0) faintedCount++;
      if (battle.npcBench2.hp <= 0) faintedCount++;
    }
    if (faintedCount > 0) {
      const multiplier = 1 + faintedCount * 0.1;
      damage *= multiplier;
      attackPokemon.log.damage1 += ` * ${multiplier} (총대장)`;
    }
  }

  if (skill.type === "불꽃" && attackPokemon.tempStatus.flashFire) {
    damage *= 1.5;
    attackPokemon.log.damage1 += " * 1.5 (타오르는불꽃)";
  }

  const atkMaxHp = attackPokemon.maxHp;
  if (atkAbil === "급류" && attackPokemon.hp <= atkMaxHp / 3 && skill.type === "물") {
    damage *= 1.5;
    attackPokemon.log.damage1 += " * 1.5 (급류)";
  }

  if (atkAbil === "벌레의알림" && attackPokemon.hp <= atkMaxHp / 3 && skill.type === "벌레") {
    damage *= 1.5;
    attackPokemon.log.damage1 += " * 1.5 (벌레의알림)";
  }

  if (atkAbil === "맹화" && attackPokemon.hp <= atkMaxHp / 3 && skill.type === "불꽃") {
    damage *= 1.5;
    attackPokemon.log.damage1 += " * 1.5 (맹화)";
  }
  if (atkAbil === "심록" && attackPokemon.hp <= atkMaxHp / 3 && skill.type === "풀") {
    damage *= 1.5;
    attackPokemon.log.damage1 += " * 1.5 (심록)";
  }

  if (atkAbil === "수포" && skill.type === "물") {
    damage *= 2;
    attackPokemon.log.damage1 += " * 2 (수포)";
  }

  if (defAbil === "수포" && skill.type === "불꽃") {
    if (noTggAtk) {
      damage *= 0.5;
      attackPokemon.log.damage1 += " * 0.5 (수포 방어)";
    }
  }

  if (atkAbil === "모래의힘" && battle.isSandstorm && ["바위", "땅", "강철"].includes(skill.type)) {
    damage *= 1.3;
    attackPokemon.log.damage1 += " * 1.3 (모래의힘)";
  }

  // 원본이 노말타입인 기술만 데미지 보정이 들어간다
  const originSkillType = originSkill?.originType || originSkill?.type;
  if (atkAbil === "스카이스킨" && skill.type === "비행" && originSkillType === "노말") {
    damage *= 1.2;
    attackPokemon.log.damage1 += " * 1.2 (스카이스킨)";
  }

  if (atkAbil === "페어리스킨" && skill.type === "페어리" && originSkillType === "노말") {
    damage *= 1.2;
    attackPokemon.log.damage1 += " * 1.2 (페어리스킨)";
  }

  // 증강 ==============================================================

  // 인생은 한방 증강: 위력 10배 증가
  if (attackPokemon?.hasAugment?.("lifeIsOneShot") && (skill.stype === "atk" || skill.stype === "catk")) {
    damage *= 10;
    attackPokemon.log.damage1 += " * 10 (인생은 한방)";
  }

  // 원펀맨 증강: 공격기술의 위력 999배 증가
  if (attackPokemon?.hasAugment?.("onePunchMan") && (skill.stype === "atk" || skill.stype === "catk")) {
    damage *= 999;
    attackPokemon.log.damage1 += " * 999 (진심펀치)";
  }

  // 용살자 증강: 드래곤 타입에게 1.5배 데미지
  if (attackPokemon?.hasAugment?.("dragonKiller") && isDefDragon && (skill.stype === "atk" || skill.stype === "catk")) {
    damage *= 1.5;
    attackPokemon.log.damage1 += " * 1.5 (용살자)";
  }

  // 하이리스크 하이리턴 (버프: 3배, 저주: 0.5배)
  if (attackPokemon?.hasAugment?.("highRiskBuff") && (skill.stype === "atk" || skill.stype === "catk")) {
    damage *= 3;
    attackPokemon.log.damage1 += " * 3 (하이 리턴)";
  }

  if (attackPokemon?.hasAugment?.("highRiskCurse") && (skill.stype === "atk" || skill.stype === "catk")) {
    damage *= 0.5;
    attackPokemon.log.damage1 += " * 0.5 (하이 리스크)";
  }

  // ======================================================================  [고정 공식] ========================================
  // ===========================================================================================================================
  // ===========================================================================================================================

  damage = Math.floor(damage);
  attackPokemon.log.damage1 += " = " + damage;
  damage += 2; // 고정 공식 (데미지 계산식의 유일한 덧셈)
  attackPokemon.log.damage2 = damage;

  // 자속보정 ===============================================================
  if (skill.name !== "발버둥" && (skill.type === attackPokemon.type1 || skill.type === attackPokemon.type2)) {
    if (atkAbil === "적응력") {
      damage *= 2;
      attackPokemon.log.damage2 += " * 2 (자속보정+적응력)";
    } else {
      damage *= 1.5;
      attackPokemon.log.damage2 += " * 1.5 (자속보정)";
    }
  }

  // 상성보정 ================================================================
  const typeDamage = typeCheckOnBattle(battle, skill, attackPokemon, defensePokemon); // 상성 보정
  damage *= typeDamage;
  attackPokemon.log.damage2 += " * " + typeDamage + "(상성보정)";

  if (atkAbil === "색안경" && typeDamage < 1 && typeDamage > 0) {
    damage *= 2;
    attackPokemon.log.damage2 += " * 2 (색안경)";
  }

  const noBerryAbil = ["혼연일체(흑)", "혼연일체(백)", "긴장감"];
  if (defensePokemon.item === "슈케열매" && skill.type === "땅" && typeDamage > 1 && !noBerryAbil.includes(atkAbil)) {
    damage *= 0.5;
    attackPokemon.log.damage2 += " * 0.5 (슈케열매)";
  }

  if (skill.feature?.weakBonus) {
    // 약점인 기술이 추가 데미지를 준다
    if (typeDamage > 1) {
      damage = (damage * 4) / 3;
      attackPokemon.log.damage2 += ` * 4/3 (${skill.name} 약점추가보정)`;
    }
  }

  // 생명의 구슬 ================================================================

  if (attackPokemon.item === "생명의구슬") {
    damage *= 1.3;
    attackPokemon.log.damage2 += " * 1.3 (생구)";
  }

  // 급소 =============================================================================
  if (isCritical) {
    const hasIE = attackPokemon?.hasAugment?.("infinityEdge");
    if (hasIE) {
      damage *= 1.5 * 1.3;
      attackPokemon.log.damage2 += " * 1.5 (급소) * 1.3 (무한의 대검)";
    } else {
      damage *= 1.5;
      attackPokemon.log.damage2 += " * 1.5 (급소)";
    }
  }

  // 랜덤값 ======================================================================================================

  let randomNum = getRandomNumber(); // 랜덤값
  if (ai && ai.randNum) randomNum = ai.randNum;
  damage = (damage * randomNum) / 100;
  attackPokemon.log.damage2 += " * " + randomNum + "(랜덤값) / 100 = " + Math.floor(damage);

  let finalDamage = Math.floor(damage);

  // [증강] 몰락한 왕의 검: 적의 현재 체력의 15% 만큼 추가 데미지
  const hasBotRK = attackPokemon?.hasAugment?.("bladeOfTheRuinedKing");
  if (hasBotRK && finalDamage > 0) {
    const curDefHp = defensePokemon.hp;
    const botrkBonus = Math.floor(curDefHp * 0.15);
    finalDamage += botrkBonus;
    if (attackPokemon?.log) {
      attackPokemon.log.damage2 += ` + ${botrkBonus} (몰왕) = ${finalDamage}`;
    }
  }

  if (!ai) {
    let text = attackPokemon.name + "의 공격";
    if (obj) text += ` (${obj.serial}타)`;

    consoleLog(text);
    if (getAugmentedStat(attackPokemon, attackStat, battle) !== attackPokemon.stat[attackStat]) {
      consoleLog(attackPokemon.log.getAugmentedStat);
    }

    consoleLog(attackPokemon.log.damage1);
    consoleLog(attackPokemon.log.damage2);
  }

  return finalDamage;
};

export const confuseDamageCalculate = (battle) => {
  //혼란 자해 데미지 계산
  //자속보정, 타입 상성, 생구, 화상 적용 안됨
  //랭크업 적용됨, 천진은 적용 안됨
  //급소 적용 됨
  const pokemon = battle[battle.turn.atk];
  let originAtk = getAugmentedStat(pokemon, "atk", battle);
  let originDef = getAugmentedStat(pokemon, "def", battle);
  let rankNumAtk = pokemon.tempStatus.rank.atk;
  let rankNumDef = pokemon.tempStatus.rank.def;
  let rankUpAtk = getMultiplier(rankNumAtk);
  let rankUpDef = getMultiplier(rankNumDef);
  let atk = Math.floor(originAtk * rankUpAtk);
  let def = Math.floor(originDef * rankUpDef);
  if (pokemon.turn.critical && pokemon.tempStatus.rank.def > 0) {
    def = originDef;
    // 급소에 맞았을 경우 방어측에게 유리한 랭크업이 무시된다
  }
  if (pokemon.turn.critical && pokemon.tempStatus.rank.atk < 0) {
    atk = originAtk;
    // 급소에 맞았을 경우 공격측에게 불리한 랭크다운이 무시된다
    // 랭크업은 적용된다
  }
  let damage = (22 * 40 * atk) / 50 / def;
  damage += 2;
  if (pokemon.turn.critical) {
    damage *= 1.5;
  }
  const randomNum = getRandomNumber();
  damage = (damage * randomNum) / 100;
  return Math.floor(damage);
};

const getRandomNumber = () => {
  // 데미지 보정 난수
  const numbers = [
    { num: 85, prob: 7.69 },
    { num: 86, prob: 5.13 },
    { num: 87, prob: 7.69 },
    { num: 88, prob: 5.13 },
    { num: 89, prob: 7.69 },
    { num: 90, prob: 7.69 },
    { num: 91, prob: 5.13 },
    { num: 92, prob: 7.69 },
    { num: 93, prob: 5.13 },
    { num: 94, prob: 7.69 },
    { num: 95, prob: 5.13 },
    { num: 96, prob: 7.69 },
    { num: 97, prob: 5.13 },
    { num: 98, prob: 7.69 },
    { num: 99, prob: 5.13 },
    { num: 100, prob: 2.56 },
  ];

  // 확률 누적 배열 생성
  let cumulative = 0;
  const weightedNumbers = numbers.map(({ num, prob }) => {
    cumulative += prob;
    return { num, cumulative };
  });

  // 0~100 사이의 랜덤 값
  const randomValue = Math.random() * 100;

  // 랜덤 값이 속하는 숫자 찾기
  return weightedNumbers.find(({ cumulative }) => randomValue <= cumulative)?.num ?? 100;
};

const powerCalculate = (battle, skill, obj, ai) => {
  // 위력이 변하는 기술의 위력 계산
  // 단순히 위력 n배 같은 보정은 damageCalculate에서 적용
  const atk = battle[battle.turn.atk];
  let power = skill.power;

  // 인공지능 데미지 계산시 연속기는 기대값으로 측정
  if (ai) {
    if (skill.name === "트리플악셀") return 94;
    if (skill.feature?.serial === "suru") return skill.power * 3;
    if (skill.feature?.serial === "double") return skill.power * 2;

    if (skill.feature?.serial === "twoFive") {
      // 2~5회 연속 공격기
      power = skill.power * 3.1;
      if (battle[battle.turn.atk].item === "속임수주사위") {
        power = skill.power * 4.14;
      }
      if (battle[battle.turn.atk].abil?.name === "스킬링크") {
        power = skill.power * 5;
      }
      return Math.floor(power);
    }
    if (skill.name === "아가미물기") {
      if (speedCheck(battle) === "npc") return power * 2;
      // npc가 더 빠르면 2배 데미지 줄 것으로 예측 후 보정
      else return power;
    }
  }
  const defItem = battle[battle.turn.def].item;
  if (skill.name === "탁쳐서떨구기") {
    // 상대한테 도구가 있고 떨굴 수 있는 아이템이면 위력 1.5배
    if (defItem !== null && defItem !== "" && !noNullItem.includes(defItem)) power *= 1.5;
  }
  if (skill.name === "아가미물기") {
    // 먼저 공격하면 위력 2배
    if (battle.turn.fastActUser === battle.turn.atk || !battle[battle.turn.fastActUser].turn.useSkill) power *= 2;
    // 유턴이나 교체로 나온 포켓몬은 본인이 스킬을 시전한게 아니므로 2배 적용됨
  }
  if (skill.feature?.hpScale) {
    // 체력비례 데미지
    power = (power * atk.hp) / (atk.maxHp || 1);
  }
  if (skill.name === "묵사발") {
    // 상대의 남은 HP 비례 (최대 120, 최소 1)
    const defPoke = battle[battle.turn.def];
    const curHp = defPoke?.hp ?? 1;
    const maxHp = defPoke.maxHp || curHp;
    power = Math.max(1, Math.floor(120 * (curHp / maxHp)));
  }
  if (skill.name === "객기" && (atk.ailment.burn || atk.ailment.mabi || atk.ailment.poison || atk.ailment.mpoison)) {
    //화상, 독, 마비일때 위력 2배
    power *= 2;
  }
  if (skill.name === "병상첨병") {
    // 상대가 상태이상이면 위력 2배
    // 혼란에 적용 안되는거 맞음
    if (isAilmentCheck(battle[battle.turn.def])) power *= 2;
  }
  if (skill.name === "분노의주먹") {
    // 맞은 횟수당 위력 50증가 (최대 350)
    const hitCount = atk.tempStatus?.hitCount || 0;
    power = Math.min(350, power + hitCount * 50);
  }
  if (skill.name === "성묘") {
    // 쓰러진 아군 수만큼 위력 +50
    if (battle[battle.turn.atk + "Bench1"].faint) power += 50;
    if (battle[battle.turn.atk + "Bench2"].faint) power += 50;
  }

  if (skill.name === "트리플악셀" && obj) {
    if (obj.serial === 1) power = 20;
    if (obj.serial === 2) power = 40;
    if (obj.serial === 3) power = 60;
  }
  if (skill.name === "어시스트파워") {
    //
    const total = Object.values(atk.tempStatus.rank).reduce((sum, v) => {
      return sum + (typeof v === "number" && v > 0 ? v : 0);
    }, 0);
    power += 20 * total;
  }
  if (skill.name === "일렉트릭볼") {
    const atkSpeed = Math.max(speedCalculate(atk, null, battle) || 1, 1);
    const defPokemon = battle[battle.turn.def];
    const defSpeed = Math.max(speedCalculate(defPokemon, null, battle) || 1, 1);
    const ratio = atkSpeed / defSpeed;
    if (ratio >= 4) power = 150;
    else if (ratio >= 3) power = 120;
    else if (ratio >= 2) power = 80;
    else if (ratio >= 1) power = 60;
    else power = 40;
  }
  if (skill.name === "애크러뱃") {
    if (atk.item === null || atk.item === undefined || atk.item === "") {
      power *= 2;
    }
  }
  if (skill.name === "자이로볼") {
    const atkSpeed = Math.max(speedCalculate(atk, null, battle) || 1, 1);
    const defPokemon = battle[battle.turn.def];
    const defSpeed = Math.max(speedCalculate(defPokemon, null, battle) || 1, 1);
    const calculatedPower = Math.floor((25 * defSpeed) / atkSpeed) + 1;
    power = Math.max(1, Math.min(150, calculatedPower));
  }
  if (skill.name === "솔라빔") {
    if (battle.isRainy || battle.isSandstorm || battle.isSnow) {
      power = Math.floor(power * 0.5);
    }
  }
  if (skill.name === "웨더볼") {
    if (battle?.hasWeather) {
      power = 100;
    }
  }

  return Math.floor(power);
};

// ==============================================================================
// 내부 전용 유틸리티 및 헬퍼 함수 (Principle 6: 파일 최하단 배치 및 non-export)
// ==============================================================================

function applyStatSwapAugments(stats, pokemon) {
  if (pokemon?.hasAugment?.("swordAndShield")) {
    const maxVal = Math.max(stats.atk, stats.def);
    stats.atk = maxVal;
    stats.def = maxVal;
  }
  if (pokemon?.hasAugment?.("specialSwordAndShield")) {
    const maxVal = Math.max(stats.catk, stats.cdef);
    stats.catk = maxVal;
    stats.cdef = maxVal;
  }
  if (pokemon?.hasAugment?.("ksante")) {
    const maxVal = Math.max(stats.def, stats.cdef);
    stats.def = maxVal;
    stats.cdef = maxVal;
  }
  if (pokemon?.hasAugment?.("hhgghgg")) {
    const maxVal = Math.max(stats.atk, stats.def, stats.catk, stats.cdef);
    stats.atk = maxVal;
    stats.def = maxVal;
    stats.catk = maxVal;
    stats.cdef = maxVal;
  }
  return stats;
}
