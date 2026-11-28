import skillList from "../../entity/Skill/skillList.js";
import { typeCheckOnBattle } from "../../calc/typeEffectCalculate.js";
import { skillTypeCalculate } from "../../calc/skillTypeCalculate.js";
import { priCalculate } from "../../calc/speedCheck.js";
import { isAilmentCheck, ailmentAbleCheck } from "../ailment.js";
import { noNullItem } from "../../entity/Item.js";

const NO_SUBSTITUTE_SKILLS = ["가드스왑", "날려버리기", "냄새구별", "도발", "멸망의노래", "미라클아이", "봉인", "사슬묶기", "스킬스왑", "앙코르", "역할", "울부짖기", "원념", "원한", "자기암시", "저주", "트집", "하트스왑", "헤롱헤롱", "흑안개"];

const NO_PROTECT_SKILLS = ["날려버리기", "울부짖기"];

const hasAliveBench = (battle, side) => {
  const b1 = battle[`${side}Bench1`];
  const b2 = battle[`${side}Bench2`];
  return Boolean((b1 && !b1.faint && b1.hp > 0) || (b2 && !b2.faint && b2.hp > 0));
};

const canPokemonRankChange = (pokemon, statKey, value) => {
  if (typeof pokemon?.canRankUp === "function") {
    return pokemon.canRankUp(statKey, value);
  }
  const rank = pokemon?.tempStatus?.rank || {};
  let isUp = value > 0;
  if (pokemon?.abil?.name === "심술꾸러기") {
    isUp = !isUp;
  }
  if (statKey === "all") {
    return ["atk", "def", "catk", "cdef", "speed"].some((st) => (isUp ? (rank[st] ?? 0) < 6 : (rank[st] ?? 0) > -6));
  }
  const cur = rank[statKey] ?? 0;
  return isUp ? cur < 6 : cur > -6;
};

/**
 * 기술 시전 시 실패 사유와 출력 메시지/부가 효과를 계산하는 순수 판정 함수
 * enqueue를 직접 호출하거나 battle 상태를 변경하지 않습니다.
 * (단, 배틀 중 실패 확정 시 실행할 콜백 onFail을 반환 객체에 포함합니다.)
 *
 * @param {Object} battle - 배틀 인스턴스
 * @param {string|Object} atk - 기술 시전자 진영 ("player" | "npc") 또는 포켓몬 객체
 * @param {string|Object|number} skill - 기술명 ("스텔스록"), 기술 객체, 또는 기술 인덱스 (1~4)
 * @param {Object} [options] - { skipPreLibero: boolean }
 * @returns {Object|null} 성공 시 null, 실패 시 { text, code, jumpKickFail?, onFail? }
 */
export const getSkillFailResult = (battle, atk, skill, options = {}) => {
  const atkSide = typeof atk === "string" ? atk : atk?.team || battle.turn?.atk || "npc";
  const defSide = atkSide === "player" ? "npc" : "player";
  const atkPokemon = battle[atkSide];
  const defPokemon = battle[defSide];

  // 1. 기술 객체 해석 (문자열 이름, 스킬 인덱스 번호, 스킬 객체 모두 지원)
  let skillObj = null;
  if (typeof skill === "number" && atkPokemon.skill) {
    skillObj = atkPokemon.skill[skill];
  } else if (typeof skill === "string") {
    skillObj = atkPokemon.skill ? Object.values(atkPokemon.skill).find((s) => s?.name === skill) : null;
    if (!skillObj) {
      skillObj = skillList.search(skill);
    }
  } else if (skill && typeof skill === "object") {
    skillObj = skill;
  }

  if (!skillObj || !skillObj.name) return { text: "하지만 실패했다!", code: "chk_fail" };

  // 웨더볼, 스카이스킨, 페어리스킨 등 동적 타입 변환 반영
  const calculatedType = skillTypeCalculate(battle, skillObj, atkPokemon);
  if (calculatedType && skillObj.type !== calculatedType) {
    skillObj = { ...skillObj, type: calculatedType };
  }

  const skillType = skillObj.stype;
  const moldBreaker = Boolean(atkPokemon.abil?.feature?.tgg);

  // =========================================================================
  // A. 리베로 발동 이전 실패 조건 (AI 등에서 skillFailCheck 단독 호출 시에도 체크)
  // =========================================================================
  if (!options.skipPreLibero) {
    // SkillRequirement 조건 (폴터가이스트, 속이기, 만나자마자)
    if (skillObj.name === "폴터가이스트" && (!defPokemon.item || !defPokemon.item.trim())) {
      return { text: "하지만 실패했다!", code: "chk_req_fail" };
    }
    if ((skillObj.name === "속이기" || skillObj.name === "만나자마자") && atkPokemon.tempStatus?.firstTurn === false) {
      return { text: "하지만 실패했다!", code: "chk_req_fail" };
    }

    // 상대가 이미 기절한 경우
    if (defPokemon.faint === true && skillType !== "buf") {
      return { text: "하지만 실패했다!", code: "chk_def_faint" };
    }

    // 증강 "하지만 버텨냈다"가 발동한 턴에 자폭/목숨걸기 계열 사용 시 실패
    if (atkPokemon.turn?.butItRefused && (skillObj.skillEffectList?.some((e) => e.name === "자폭" || e.name === "목숨걸기") || ["목숨걸기", "자폭", "대폭발"].includes(skillObj.name))) {
      return { text: "하지만 실패했다!", code: "chk_suicide_but_it_refused" };
    }
  }

  // =========================================================================
  // B. 리베로 발동 이후 일반 실패 및 무효 판정
  // =========================================================================

  // 1. 증강 "하지만 버텨냈다" 발동 턴의 치유소원 / 초승달춤
  if (atkPokemon.turn?.butItRefused) {
    if (skillObj.name === "치유소원") {
      return { text: "하지만 실패하고 말았다!", code: "field_healing_wish_fail" };
    }
    if (skillObj.name === "초승달춤") {
      return { text: "하지만 실패하고 말았다!", code: "field_lunar_dance_fail" };
    }
  }

  // 2. 원시 날씨 (폭우 / 큰가뭄) 공격기 무효화
  if (battle.isHeavyRain && (skillType === "atk" || skillType === "catk") && skillObj.type === "불꽃") {
    return {
      text: "강한 비의 영향으로 불꽃타입의 공격이 사라졌다!",
      code: "chk_heavy_rain_fire",
      jumpKickFail: true,
    };
  }
  if (battle.isHarshSun && (skillType === "atk" || skillType === "catk") && skillObj.type === "물") {
    return {
      text: "강한 햇살의 영향으로 물타입의 공격이 증발했다!",
      code: "chk_harsh_sun_water",
      jumpKickFail: true,
    };
  }

  // 사이코필드: 지상 대상에게 우선도 +1 이상의 공격기 무효화
  if (battle.field?.terrain?.isPsychicField && (skillType === "atk" || skillType === "catk") && priCalculate(battle, atkPokemon, skillObj) > 0 && !defPokemon.isFlying(battle)) {
    return {
      text: `${defPokemon.names("는")} 사이코필드가 지켜 주고 있다!`,
      code: "chk_psychic_terrain_priority",
      jumpKickFail: true,
    };
  }

  // 3. 방어 / 니들가드 / 다이윌에 막힌 경우
  if (defPokemon.turn?.protect === true && skillType !== "buf") {
    const isMaxGuard = Boolean(defPokemon.turn?.maxGuard);
    const isUnseenFist = Boolean(atkPokemon.abil?.name === "보이지않는주먹" && skillObj.feature?.touch && atkPokemon.item !== "펀치글러브");
    const isFeint = Boolean(skillObj.feature?.feint);
    const isMaxMove = Boolean(skillObj.feature?.isMaxMove); // 다이맥스
    const isNoProtectSkill = NO_PROTECT_SKILLS.includes(skillObj.name);

    if (isMaxGuard || (!isUnseenFist && !isFeint && !isMaxMove && !isNoProtectSkill)) {
      return {
        text: defPokemon.names("는") + " 공격으로부터 몸을 지켰다!",
        code: "chk_protect_block",
        jumpKickFail: true,
        onFail: (bt, enqueue) => {
          const isTouch = Boolean(skillObj.feature?.touch && atkPokemon.item !== "펀치글러브");
          if (defPokemon.turn?.spikyShield && isTouch && !atkPokemon.faint) {
            const spikyDmg = Math.floor(atkPokemon.maxHp / 8);
            const spikyText = `${atkPokemon.names("는")} 가시에 찔려 데미지를 입었다!`;
            atkPokemon.getDamage(bt, enqueue, spikyDmg, spikyText);
          }
        },
      };
    }
  }

  // 4. 특성 피뢰침 (전기 기술 무효 + 특공 1랭크 상승)
  if (skillObj.type === "전기" && skillType !== "buf" && defPokemon.abil?.name === "피뢰침" && !moldBreaker) {
    return {
      text: null,
      code: "chk_lightning_rod",
      onFail: (bt, enqueue) => {
        defPokemon.rankUp(bt, enqueue, "catk", 1, "[특성 피뢰침]");
      },
    };
  }

  // 5. 특성 타오르는불꽃 (불꽃 기술 무효 + 불꽃 위력 상승)
  if (skillObj.type === "불꽃" && skillType !== "buf" && defPokemon.abil?.name === "타오르는불꽃" && !moldBreaker) {
    if (defPokemon.tempStatus?.flashFire) {
      return {
        text: "[특성 타오르는불꽃] " + defPokemon.name + "에겐 효과가 없는 것 같다...",
        code: "chk_flash_fire_immune",
      };
    }
    return {
      text: "[특성 타오르는불꽃] " + defPokemon.names("는") + " 불꽃의 위력이 올라갔다!",
      code: "chk_flash_fire_boost",
      onFail: () => {
        defPokemon.tempStatus.flashFire = true;
      },
    };
  }

  // 6. 짓궂은마음 포켓몬이 악타입에게 변화기를 쓴 경우
  if (atkPokemon.abil?.name === "짓궂은마음" && skillType === "natk" && (defPokemon.type1 === "악" || defPokemon.type2 === "악")) {
    return {
      text: defPokemon.name + "에겐 효과가 없는 것 같다...",
      code: "chk_prankster_dark",
    };
  }

  // 7. 다이맥스 대상 일격기 / 무게 비례 기술 면역
  if (defPokemon.tempStatus?.dynamax > 0 && skillObj.feature?.oneShot) {
    return {
      text: `${defPokemon.name}에겐 효과가 없는 것 같다...`,
      code: "chk_dynamax_oneshot_immune",
    };
  }
  if (defPokemon.tempStatus?.dynamax > 0 && skillObj.feature?.weight) {
    return {
      text: "하지만 실패했다!",
      code: "chk_dynamax_weight_fail",
    };
  }

  // 7-1. 특성 옹골참에 일격기가 막힌 경우
  if (skillObj.feature?.oneShot && defPokemon.abil?.name === "옹골참" && !moldBreaker) {
    return {
      text: `[특성 옹골참] ${defPokemon.name}에겐 효과가 없는 것 같다...`,
      code: "chk_sturdy_oneshot",
    };
  }

  // 8. 절대영도 vs 얼음 타입
  if (skillObj.name === "절대영도" && (defPokemon.type1 === "얼음" || defPokemon.type2 === "얼음")) {
    return {
      text: defPokemon.name + "에겐 효과가 없는 것 같다...",
      code: "chk_sheer_cold_ice",
    };
  }

  // 9. 공격기 상성 무효 (0배) 판정 (부유, 풍선, 타입 상성 0배 등 포함)
  if (skillType === "atk" || skillType === "catk") {
    const typeDamage = typeCheckOnBattle(battle, skillObj, atkPokemon, defPokemon);
    if (typeDamage === 0) {
      return {
        text: defPokemon.name + "에겐 효과가 없는 것 같다...",
        code: "use_type_immune",
        jumpKickFail: true,
      };
    }
  }

  // 10. 상대방 지정 변화기 (natk) 공통 무효 및 대타출동 차단
  if (skillType === "natk") {
    // 전기자석파 vs 땅 타입
    if (skillObj.name === "전기자석파" && (defPokemon.type1 === "땅" || defPokemon.type2 === "땅")) {
      return {
        text: defPokemon.name + "에겐 효과가 없는 것 같다...",
        code: "use_twave_ground",
      };
    }

    // 가루 기술 vs 풀 타입 및 방진 특성
    if (skillObj.feature?.powder && (defPokemon.type1 === "풀" || defPokemon.type2 === "풀" || defPokemon.abil?.name === "방진")) {
      return {
        text: defPokemon.name + "에겐 효과가 없는 것 같다...",
        code: "use_powder_immune",
      };
    }

    // 대타출동으로 막히는 변화기
    if (defPokemon.tempStatus?.substitute) {
      if (!NO_SUBSTITUTE_SKILLS.includes(skillObj.name) && !skillObj.feature?.sound && atkPokemon.abil?.name !== "틈새포착") {
        return {
          text: "하지만 실패했다!",
          code: "use_natk_sub_fail",
        };
      }
    }
  }

  // 11. 교대 / 벤치 생존 포켓몬 조건
  if (skillObj.name === "배턴터치" && !hasAliveBench(battle, atkSide)) {
    return { text: "하지만 실패했다!", code: "eff_baton_fail" };
  }
  if (skillObj.name === "치유소원" && !hasAliveBench(battle, atkSide)) {
    return { text: "하지만 실패했다!", code: "field_healing_wish_fail" };
  }
  if (skillObj.name === "초승달춤" && !hasAliveBench(battle, atkSide)) {
    return { text: "하지만 실패했다!", code: "field_lunar_dance_fail" };
  }
  if (["날려버리기", "울부짖기"].includes(skillObj.name) && (!hasAliveBench(battle, defSide) || defPokemon.tempStatus?.dynamax > 0)) {
    return { text: "하지만 실패했다!", code: "eff_force_switch_fail" };
  }

  // 12. 장판 설치기 중복
  if (skillObj.name === "스텔스록" && battle.field?.[defSide]?.sRock) {
    return { text: "하지만 실패했다!", code: "eff_srock_fail" };
  }
  if (skillObj.name === "독압정" && (battle.field?.[defSide]?.poisonSpikes || 0) >= 2) {
    return { text: "하지만 실패했다!", code: "eff_tspikes_fail" };
  }
  if (skillObj.name === "압정뿌리기" && (battle.field?.[defSide]?.spikes || 0) >= 3) {
    return { text: "하지만 실패했다!", code: "eff_spikes_fail" };
  }
  if ((skillObj.name === "끈적끈적네트" || skillObj.name === "끈적네트") && battle.field?.[defSide]?.stickyWeb) {
    return { text: "하지만 실패했다!", code: "eff_web_fail" };
  }

  // 13. 장막 / 순풍 / 희망사항 중복
  if (skillObj.name === "리플렉터" && battle.field?.[atkSide]?.noClean?.reflect !== null) {
    return { text: "하지만 실패했다!", code: "eff_reflect_fail" };
  }
  if (skillObj.name === "빛의장막" && battle.field?.[atkSide]?.noClean?.lightScreen !== null) {
    return { text: "하지만 실패했다!", code: "eff_lscreen_fail" };
  }
  if (skillObj.name === "오로라베일" && (!battle.isSnow || battle.field?.[atkSide]?.noClean?.auroraVeil !== null)) {
    return { text: "하지만 실패했다!", code: "eff_aveil_fail" };
  }
  if (skillObj.name === "순풍" && battle.field?.[atkSide]?.noClean?.tailwind !== null) {
    return { text: "하지만 실패했다!", code: "eff_tailwind_fail" };
  }
  if (skillObj.name === "희망사항" && battle.field?.[atkSide]?.noClean?.wish !== null) {
    return { text: "하지만 실패했다!", code: "field_wish_fail" };
  }

  // 14. 도발 / 씨뿌리기 / 하품 / 상태이상 변화기 / 트릭 / 물붓기
  if (skillObj.name === "도발") {
    if (defPokemon.abil?.name === "둔감" && !moldBreaker) {
      return {
        text: `[특성 둔감] ${defPokemon.names("는")} 도발에 넘어가지 않는다!`,
        code: "eff_taunt_oblivious",
      };
    }
    if (defPokemon.tempStatus?.taunt !== null) {
      return { text: "하지만 실패했다!", code: "eff_taunt_fail" };
    }
  }

  if (skillObj.name === "씨뿌리기") {
    if (defPokemon.tempStatus?.seed !== null || defPokemon.type1 === "풀" || defPokemon.type2 === "풀") {
      return { text: "하지만 실패했다!", code: "eff_seed_fail" };
    }
  }

  if (skillObj.name === "하품") {
    if (isAilmentCheck(defPokemon) || defPokemon.tempStatus?.hapum === 1 || defPokemon.tempStatus?.hapum === 0 || ((defPokemon.abil?.name === "의기양양" || defPokemon.abil?.name === "불면") && !moldBreaker)) {
      return { text: "하지만 실패했다!", code: "eff_yawn_fail" };
    }
    if (battle.field?.terrain?.isElectricField && !defPokemon.isFlying?.(battle, true)) {
      return { text: "하지만 실패했다!", code: "eff_yawn_efield_fail" };
    }
  }

  // 상대 지정 상태이상 변화기 (버섯포자, 전기자석파, 뱀눈초리, 도깨비불, 맹독 등)
  const ailmentEffects = skillObj.skillEffectList?.filter((e) => ["마비", "화상", "독", "맹독", "잠듦"].includes(e.name)) || [];
  if (skillType === "natk" && ailmentEffects.length > 0) {
    for (const eff of ailmentEffects) {
      if (!ailmentAbleCheck(battle, eff.name, defPokemon, atkPokemon)) {
        return { text: "하지만 실패했다!", code: "ail_fail_immune" };
      }
    }
  }

  if (["트릭", "바꿔치기"].includes(skillObj.name)) {
    if ((!atkPokemon.item && !defPokemon.item) || noNullItem.includes(atkPokemon.item) || noNullItem.includes(defPokemon.item)) {
      return { text: "하지만 실패했다!", code: "eff_trick_fail" };
    }
  }

  if (skillObj.name === "물붓기") {
    if (defPokemon.type1 === "물" && !defPokemon.type2) {
      return { text: "하지만 실패했다!", code: "eff_soak_fail" };
    }
  }

  // 15. 체력 조건 및 자해/회복 기술
  if (skillObj.name === "대타출동") {
    const needHp = Math.floor(atkPokemon.maxHp / 4);
    if (atkPokemon.tempStatus?.substitute !== null || atkPokemon.hp <= needHp) {
      return { text: "하지만 실패했다!", code: "eff_sub_fail" };
    }
  }

  if (skillObj.name === "배북") {
    const needHp = Math.floor(atkPokemon.maxHp / 2);
    if (atkPokemon.hp <= needHp || (atkPokemon.tempStatus?.rank?.atk ?? 0) >= 6) {
      return { text: "하지만 실패했다!", code: "eff_bellydrum_fail" };
    }
  }

  if (skillObj.name === "죽기살기") {
    if (atkPokemon.hp >= defPokemon.hp) {
      return { text: "하지만 실패했다!", code: "eff_endeavor_fail" };
    }
  }

  // 순수 회복기 (HP회복, 알낳기, 게으름피우기, 아침햇살, 달빛, 광합성, 날개쉬기)
  const pureHealSkills = ["HP회복", "알낳기", "게으름피우기", "광합성", "아침햇살", "달빛", "날개쉬기", "생명의물방울"];
  if (skillType === "buf" && (pureHealSkills.includes(skillObj.name) || skillObj.skillEffectList?.some((e) => e.name === "회복" || e.name === "아침햇살"))) {
    if (atkPokemon.hp >= atkPokemon.maxHp) {
      return { text: "더 이상 회복할 수 없다!", code: "heal_already_full" };
    }
  }

  if (skillObj.name === "튀어오르기") {
    return { text: "그러나 아무 일도 일어나지 않았다!", code: "eff_splash" };
  }

  // 16. 순수 랭크 변화기 상한/하한 및 클리어바디 체크
  const nonCommonEffects = skillObj.skillEffectList?.filter((e) => e?.name && e.name !== "공통") || [];
  const isPureRankSkill = nonCommonEffects.length > 0 && nonCommonEffects.every((e) => e.name === "랭크변화" || e.name === "랭크다수변화");

  if (isPureRankSkill) {
    const rankChanges = [];
    nonCommonEffects.forEach((e) => {
      if (e.name === "랭크변화") {
        rankChanges.push({ stat: e.stat, value: e.value, target: e.target || (skillType === "buf" ? "atk" : "def") });
      } else if (e.name === "랭크다수변화" && Array.isArray(e.stats)) {
        e.stats.forEach((s) => {
          rankChanges.push({ stat: s.stat, value: s.value, target: e.target || (skillType === "buf" ? "atk" : "def") });
        });
      }
    });

    if (skillType === "buf" && rankChanges.length > 0) {
      const anyCanChange = rankChanges.some(({ stat, value }) => canPokemonRankChange(atkPokemon, stat, value));
      if (!anyCanChange) {
        return {
          text: null,
          code: "rank_max_limit",
          onFail: (bt, enqueue) => {
            rankChanges.forEach(({ stat, value }) => {
              atkPokemon.applyRankChange?.(bt, enqueue, stat, value, null, false, moldBreaker);
            });
          },
        };
      }
    }

    if (skillType === "natk" && rankChanges.length > 0) {
      const isBlockedByClearBody = defPokemon.abil?.name === "클리어바디" && !moldBreaker && defPokemon.abil?.name !== "심술꾸러기" && rankChanges.every(({ value }) => value < 0);

      if (isBlockedByClearBody) {
        return {
          text: null,
          code: "rank_clearbody",
          onFail: (bt, enqueue) => {
            rankChanges.forEach(({ stat, value }) => {
              defPokemon.applyRankChange?.(bt, enqueue, stat, value, null, true, moldBreaker);
            });
          },
        };
      }

      // 미러아머가 아닐 때 모든 대상 랭크가 이미 하한(-6)에 도달한 경우
      if (defPokemon.abil?.name !== "미러아머" || moldBreaker) {
        const anyCanChange = rankChanges.some(({ stat, value }) => canPokemonRankChange(defPokemon, stat, value));
        if (!anyCanChange) {
          return {
            text: null,
            code: "rank_min_limit",
            onFail: (bt, enqueue) => {
              rankChanges.forEach(({ stat, value }) => {
                defPokemon.applyRankChange?.(bt, enqueue, stat, value, null, true, moldBreaker);
              });
            },
          };
        }
      }
    }
  }

  return null;
};

/**
 * battle 상태에 따라 특정 기술을 사용했을 때 성공할지 실패할지 판정하는 함수 (순수 함수)
 * @returns {boolean} 성공 시 true, 실패(불발) 시 false
 */
export const skillFailCheck = (battle, atk, skill) => {
  return getSkillFailResult(battle, atk, skill) === null;
};

/**
 * 기술이 실패하는지 여부를 직관적으로 확인하는 헬퍼 함수
 * @returns {boolean} 실패(불발) 시 true, 성공 시 false
 */
export const isSkillFail = (battle, atk, skill) => !skillFailCheck(battle, atk, skill);

export default skillFailCheck;
