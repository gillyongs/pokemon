import { aiItemScore } from "../../entity/Item";
import { damageCalculate } from "../../util/damageCalculate";
import { getAccuracy } from "../../function/accuracyCalculate";
import { statusAbleCheck } from "./easy";

export const calculateSkillScore = (bt, sn, skObj, isAttack) => {
  const npc = bt.npc;
  const player = bt.player;
  const skill = bt.npc.origin.skill[sn];

  // 리턴값
  let score = 0; // 가중치
  let log; // 가중치 계산 로그 문자열

  // 공격기일 경우 (데미지 * 명중률) 값으로 가중치 정산을 시작한다
  // 변화기, 버프기는 0으로 시작
  if (isAttack) {
    let avrDmg = damageCalculate(bt, null, { atkSN: sn, randNum: 92 }); // 평균 데미지 계산
    if (avrDmg === 0) {
      // 무효 스킬, 옹골참에 일격기, 타오르는 불꽃
      // 애초에 공격 판정이 안들어가니 부가효과 계산을 하면 안됨
      skObj.log.score = "불발";
      return -999;
    }

    // 명중률
    let accurRaw = getAccuracy(bt, skill, npc);
    let accur = accurRaw === "-" ? 100 : Number(accurRaw) || 0;
    if (accur !== 100 && accurRaw !== "-") accur = Math.min(100, accur);

    const playerHp = bt.player.origin.hp;
    score = Math.floor((avrDmg * accur) / playerHp); // 평균 데미지 * 명중률 / 상대방 체력
    log = score;
    skObj.log.atkScoreOrigin = `${avrDmg} * ${accur} / ${playerHp} = ${score}`;

    // 위력과 연관된 부가효과 (합적용이 아닌 곱적용이므로 여기서 따로 계산한다)
    if (skill.skillEffectList && typeof skill.skillEffectList[Symbol.iterator] === "function") {
      for (const skillEffect of skill.skillEffectList) {
        if (skillEffect.name === "급소") {
          score *= 1.05;
          log += ` * 1.05 (급소보정)`;
        }

        if (skillEffect.name === "반동") {
          score *= 0.97;
          log += ` * 0.97 (반동)`; // 같은 위력이면 반동이 없는거 고르는 수준이면 될듯
        }

        if (skillEffect.name === "흡수") {
          const recoverValue = Math.min(playerHp, avrDmg) * skillEffect.ratio; // 평균 회복 수치
          score += recoverValue * 1; // 가중치 어느정도일지 조절 필요
          log += ` + ${recoverValue} (흡수)`;
        }
      }
    }
  }

  // 부가효과 가중치 계산
  if (skill.skillEffectList && typeof skill.skillEffectList[Symbol.iterator] === "function") {
    for (const skillEffect of skill.skillEffectList) {
      // 1) 능력치 증감 ============================================================================
      if (skillEffect?.name === "능력치증감") {
        const npcRole = npc.origin.role || "";
        const playerRole = player.origin.role || "";

        let rankUpValue = skillEffect.value;
        if ((npc.abil === "심술꾸러기" && skillEffect.target === "atk") || (player.abil === "심술꾸러기" && skillEffect.target === "def")) {
          // 특성 심술꾸러기는 랭크업이 반대로 적용
          rankUpValue = -skillEffect.value;
        }

        let value = 0; // 상황별 랭크업 가중치

        // 1. 자기자신에게 이로운 효과
        if (skillEffect.target === "atk" && typeof rankUpValue === "number" && rankUpValue > 0) {
          // 이미 랭크업이 되어있으면 제외 (랭크업만 하다 죽는거 방지)
          if (npc.tempStatus.rank[skillEffect.stat] < 2) {
            if (skillEffect.stat === "speed") {
              value = npcRole.includes("어태커") ? 50 : 30;
            } else if (skillEffect.stat === "atk") {
              value = npcRole === "물리어태커" ? 30 : 3;
            } else if (skillEffect.stat === "catk") {
              value = npcRole === "특수어태커" ? 30 : 3;
            } else if (skillEffect.stat === "def") {
              value = playerRole === "물리어태커" ? (npcRole.includes("막이") ? 50 : 30) : 8;
            } else if (skillEffect.stat === "cdef") {
              value = playerRole === "특수어태커" ? (npcRole.includes("막이") ? 50 : 30) : 8;
            }

            // 바디프레스 스킬이 있으면 방어력 증가에 추가 보정
            const isBodyPress = [1, 2, 3, 4].some((num) => npc.origin.skill[num]?.name === "바디프레스");
            if (skillEffect.stat === "def" && isBodyPress) {
              value += 15;
            }
          }

          let plus = (value * rankUpValue * skillEffect.probability) / 100; // 랭크업 확률과 수치 적용
          if (player.abil === "천진") plus = Math.floor(plus * 0.1);
          score += plus;
          log += ` + ${plus}(자벞 ${skillEffect.stat}(${value})*${rankUpValue})`;
        }

        // 2. 자기자신에게 해로운 효과 (ex: 용성군 디메리트)
        else if (skillEffect.target === "atk" && typeof rankUpValue === "number" && rankUpValue < 0) {
          if (skillEffect.stat === "speed") {
            value = npcRole.includes("어태커") ? 40 : 5;
          } else if (skillEffect.stat === "atk") {
            value = npcRole === "물리어태커" ? 20 : 1;
          } else if (skillEffect.stat === "catk") {
            value = npcRole === "특수어태커" ? 20 : 1;
          } else if (skillEffect.stat === "def") {
            value = playerRole === "물리어태커" ? 10 : 5;
          } else if (skillEffect.stat === "cdef") {
            value = playerRole === "특수어태커" ? 10 : 5;
          }

          let plus = (-1 * value * rankUpValue * skillEffect.probability) / 100;
          if (player.abil === "천진") plus = Math.floor(plus * 0.1); // ex) 천진 상대로 용성군 난사
          score -= plus;
          log += ` - ${plus}(디메리트 ${skillEffect.stat}(${value})*${rankUpValue})`;
        }

        // 3. 상대방에게 해로운 효과
        else if (skillEffect.target === "def" && typeof rankUpValue === "number" && rankUpValue < 0) {
          if (skillEffect.stat === "speed") {
            value = playerRole.includes("어태커") ? 50 : 25;
          } else if (skillEffect.stat === "atk") {
            value = playerRole === "물리어태커" ? 35 : 2;
          } else if (skillEffect.stat === "catk") {
            value = playerRole === "특수어태커" ? 35 : 2;
          } else if (skillEffect.stat === "def") {
            value = npcRole === "물리어태커" ? 15 : 5;
          } else if (skillEffect.stat === "cdef") {
            value = npcRole === "특수어태커" ? 15 : 5;
          }

          let plus = (-1 * value * rankUpValue * skillEffect.probability) / 100;
          score += plus;
          log += ` + ${plus}(상대디버프 ${skillEffect.stat}(${value})*${rankUpValue})`;
        }

        // 4. 상대에게 이로운 효과를 주는 경우
        // 뽐내기, 부추기기 추가시 추가 필요
      }

      // 2) 상태이상 ===============================================================================
      if (["마비", "얼음", "트라이어택"].includes(skillEffect.name) && statusAbleCheck(skillEffect.name, player)) {
        let plus = (50 * skillEffect.probability) / 100;
        score += plus;
        log += ` + ${plus} (${skillEffect.name})`;
      }

      //상대가 물리형일때 화상 보정
      if (skillEffect.name === "화상" && player.origin.role === "물리어태커" && statusAbleCheck("화상", player)) {
        let plus = (50 * skillEffect.probability) / 100;
        score += plus;
        log += ` + ${plus} (화상 물리 보정)`;
      }

      // 화상 독 추가 필요

      // 상대가 물리 어태커면 약간 추가 보정 필요
      if (skillEffect.name === "혼란" && player.tempStatus.confuse === null) {
        let plus = (20 * skillEffect.probability) / 100;
        score += plus;
        log += ` + ${plus} (${skillEffect.name})`;
      }

      // 내가 상대보다 빠른지 체크 필요
      if (skillEffect.name === "풀죽음") {
        let plus = (50 * skillEffect.probability) / 100;
        score += plus;
        log += ` + ${plus} (${skillEffect.name})`;
      }

      // 기타 ==================================================================================================================

      // 공격기 =======================================================================

      // 탁쳐서떨구기 상대 아이템 중요도 보정
      if (skillEffect.name === "탁떨" && player.item !== null) {
        const value = aiItemScore[player.item];
        if (value === 0) {
        } else if (!value) {
          console.error("탁떨 가중치 설정 안 됨 " + skillEffect.name);
        } else {
          score += value;
          log += ` + ${value} (${skillEffect.name})`;
        }
      }

      // 스킬 명중률에 비례하게 보정 필요
      if (skillEffect.name === "빗나감패널티") {
        score -= 10;
        log += ` - 10 (${skillEffect.name})`;
      }

      // 역린
      if (skillEffect.name === "자동") {
        score -= 20;
        log += ` - 20 (자동)`;
      }

      // 물거품아리아
      if (skillEffect.name === "화상치료" && player.ailment.burn !== null) {
        score -= 10;
        log += ` - 10 (${skillEffect.name})`;
      }

      if ((skillEffect.name === "벽부수기" && bt.field.player.noClean.reflect !== null) || bt.field.player.noClean.lightScreen !== null) {
        score += 50;
        log += ` + 50 (${skillEffect.name})`;
      }

      if (skillEffect.name === "스핀") {
        const count = Object.values(bt.field.npc).reduce((acc, v) => {
          if (v === null) return acc; // null이면 무시
          if (typeof v === "number") return acc + v; // 숫자면 그대로 더함 (독압정 1 맹독압정 2)
          return acc + 1; // 그 외 (문자열, 객체 등) → 1 추가
        }, 0);

        //아군 필드에 깔린 장판 (스텔스록, 압정, 독압정, 가시)
        const value = count * 30;
        score += value;
        log += ` + ${value} (${skillEffect.name})`;
      }

      if (skillEffect.name === "능력치초기화") {
        const count = Object.values(bt.player.tempStatus.rank).reduce((acc, v) => {
          if (typeof v === "number") return acc + v;
          return acc;
        }, 0);
        if (count > 0) {
          const value = count * 20;
          score += value;
          log += ` + ${value} (${skillEffect.name})`;
        }
      }

      if (skillEffect.name === "구속" && player.tempStatus.switchLock !== null) {
        score += 30;
        log += ` + 30 (구속)`;
      }

      if (skillEffect.name === "스텔스록") {
        if (bt.field.player.sRock === null) {
          let value = 25 * remainPokemonCount(bt, "player"); // 남은 상대방 포켓몬 수에 비례
          score += value;
          log += ` + ${value} (${skillEffect.name})`;
        }
      }
      if (skillEffect.name === "독압정") {
        if (bt.field.player.poisonSpikes === null) {
          let value = 20 * remainPokemonCount(bt, "player");
          score += value;
          log += ` + ${value} (${skillEffect.name})`;
        } else if (bt.field.player.poisonSpikes === 1) {
          let value = 15 * remainPokemonCount(bt, "player");
          score += value;
          log += ` + ${value} (맹독압정)`;
        }
      }
      if (skillEffect.name === "끈적끈적네트") {
        if (bt.field.player.stickyWeb === null) {
          let value = 20 * remainPokemonCount(bt, "player");
          score += value;
          log += ` + ${value} (${skillEffect.name})`;
        }
      }
      if (skillEffect.name === "리플렉터") {
        if (bt.field.npc.noClean.reflect === null) {
          let origin = player.origin.role === "물리어태커" ? 20 : 15; // 상대가 물리면 리플렉터를 먼저 치게
          let value = origin * (remainPokemonCount(bt, "npc") + 1);
          score += value;
          log += ` + ${value} (${skillEffect.name})`;
        }
      }
      if (skillEffect.name === "빛의장막") {
        if (bt.field.npc.noClean.lightScreen === null) {
          let origin = player.origin.role === "특수어태커" ? 20 : 15;
          let value = origin * (remainPokemonCount(bt, "npc") + 1);
          score += value;
          log += ` + ${value} (${skillEffect.name})`;
        }
      }
      if (skillEffect.name === "씨뿌리기") {
        if (player.tempStatus.seed === null && player.type1 !== "풀" && player.type2 !== "풀") {
          score += 20;
          log += ` + 20 (${skillEffect.name})`;
        }
      }

      const playerRankCount = Object.values(bt.player.tempStatus.rank).reduce((acc, v) => {
        if (typeof v === "number") return acc + v;
        return acc;
      }, 0);
      if (skillEffect.name === "하품") {
        if (player.tempStatus.hapum === null) {
          let value = 0;
          if (playerRankCount > 0) {
            value = playerRankCount * 30;
            // 랭크업이 많이 되어있을수록 교체 압박이 심해지므로 가산점
            score += value;
            log += ` + ${value} (${skillEffect.name}-랭크)`;
          } else if (playerRankCount < 0) {
            value = playerRankCount * -20;
            score -= value;
            log += ` - ${value} (${skillEffect.name}-랭크)`;
          }
          if (bt.field.player.sRock) {
            score += 25;
            log += ` + 25 (${skillEffect.name}-스락)`;
          }
          if (bt.field.player.stickyWeb) {
            score += 20;
            log += ` + 20 (${skillEffect.name}-끈적끈적네트)`;
          }
        }
      }
      if (skillEffect.name === "강제교체") {
        if (remainPokemonCount(bt, "player") > 0) {
          // 남은 포켓몬이 없다면 실패하므로 제외
          let value = 0;
          if (playerRankCount > 0) {
            value = playerRankCount * 40;
            score += value;
            log += ` + ${value} (${skillEffect.name}-랭크)`;
          } else if (playerRankCount < 0) {
            value = playerRankCount * -20;
            score -= value;
            log += ` - ${value} (${skillEffect.name}-랭크)`;
          }
          if (bt.field.player.sRock) {
            score += 25;
            log += ` + 25 (${skillEffect.name}-스락)`;
          }
          if (bt.field.player.spikes) {
            score += 20;
            log += ` + 20 (${skillEffect.name}-압정)`;
          }
          if (bt.field.player.poisonSpikes) {
            score += 10;
            log += ` + 10 (${skillEffect.name}-독압정)`;
          }
          if (bt.field.player.stickyWeb) {
            score += 20;
            log += ` + 20 (${skillEffect.name}-끈적네트)`;
          }
        }
      }
      if (skillEffect.name === "초승달춤" || skillEffect.name === "치유소원") {
        const hp = npc.hp;
        const maxHp = npc.origin.hp;
        const hpPercent = hp / maxHp; // 0~1 사이 값
        let value = 230 * Math.pow(1 - hpPercent, 2.3);
        // const a = 60; // 곡선 크기 계수
        // const b = 3.5; // 곡선 완만도 (클수록 저체력에서 급상승)
        // const value = Math.round(a * Math.pow(1 / hpPercent - 1, b));
        value = Math.round(value);
        score += value;
        log += ` + ${value} (${skillEffect.name})`;
      }
      if (skillEffect.name === "트릭") {
        let value = 0;
        if (npc.item?.startsWith("구애") && !player.item?.startsWith("구애")) {
          value = 50;
        }
        if (score) {
          score += value;
          log += ` + ${value} (${skillEffect.name})`;
        }
      }
      if (skillEffect.name === "마비" && statusAbleCheck(skillEffect.name, player)) {
        let value = (50 * skillEffect.probability) / 100;
        if (skill.name === "전기자석파" && (player.type1 === "땅" || player.type2 === "땅")) {
        } else {
          const hasPsychoCut = ["1", "2", "3", "4"].some((key) => npc.origin.skill[key]?.name === "병상첨병");
          if (hasPsychoCut) value *= 1.3;

          score += value;
          let text = ` + ${value} (${skillEffect.name})`;
          if (hasPsychoCut) text += "(병상첨병)";
          log += text;
        }
      }
      if (skillEffect.name === "화상" && player.origin.role === "물리어태커" && statusAbleCheck(skillEffect.name, player)) {
        let value = (50 * skillEffect.probability) / 100;

        score += value;
        log += ` + ${value} (${skillEffect.name})`;
      }
    }
  }
  if (skill.feature) {
    const f = skill.feature;
    if (f.sound && player.tempStatus.substitute !== null) {
      score += 50;
      log += ` + 50 (대타 소리 기술 보정)`;
    }
    if (f.charge && npc.item !== "파워풀허브") {
      score /= 2;
      log += ` /2 (충전)`;
    }
  }

  log += ` = ${score}`;
  skObj.log.score = log;
  return score;
};

// 기술의 우선도 -> 명중률 -> 데미지를 고려하여 최적의 기술 리턴


function remainPokemonCount(battle, user) {
  // 남은 포켓몬 수 계산
  // 남은 포켓몬 수가 많을수록 스텔스록, 독압정 등에 가중치가 증가한다
  // 상대의 남은 포켓몬이 하나일때 날려버리기(강제교체)를 쓰지 않는다 (실패하니까)
  let result = 0;
  let index1 = user + "Bench1";
  let index2 = user + "Bench2";
  if (!battle[index1].faint) result += 1;
  if (!battle[index2].faint) result += 1;
  return result;
}

