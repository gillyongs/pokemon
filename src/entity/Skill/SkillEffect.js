import { random } from "../../util/randomCheck";
import { applyAilment } from "../../service/ailment";
import { josa } from "josa";
import { noNullItem } from "../Item";
import { switchNpc, switchNpcAuto, switchPlayer, switchPlayerForce } from "../../service/switch";
import { getAugmentedStat } from "../../calc/getStat";
import { getMultiplier } from "../../calc/rankStat";
import { checkPassiveEndure } from "../../service/damage/endure";

function isTargetSubstituteBlocked(battle) {
  const defPokemon = battle?.[battle?.turn?.def];
  const atkPokemon = battle?.[battle?.turn?.atk];
  const skill = atkPokemon?.turn?.useSkill;
  const hitSub = defPokemon?.turn?.lastHitSubstitute !== null ? Boolean(defPokemon.turn.lastHitSubstitute) : Boolean(defPokemon?.turn?.substitute || defPokemon?.tempStatus?.substitute);
  const penetrates = atkPokemon?.abil?.name === "틈새포착" || Boolean(skill?.feature?.sound);
  return hitSub && !penetrates;
}

function skillEffectSearch(name) {
  // 연속기에서 여러번 발동하는 효과의 경우 onHit에서 처리
  const functions = {
    공통: (battle, enqueue, skillEffect) => {
      let atkPokemon = battle[battle.turn.atk];
      let def = battle[battle.turn.def];
      let skill = atkPokemon.turn.useSkill;
      if (skill.feature?.protect !== true) atkPokemon.tempStatus.protectUse = null;

      // 전기로바꾸기 충전 해제
      if (skill?.type === "전기" && (skill?.stype === "atk" || skill?.stype === "catk") && atkPokemon.tempStatus?.changeElectronic) {
        atkPokemon.tempStatus.changeElectronic = null;
      }

      // 방어 외에 다른 스킬을 사용하였을때 방어 스택 초기화

      // [증강: 운 좋은 회복] 상대 포켓몬을 공격시 30% 확률로 최대 HP의 30%를 회복
      const hasLuckyRecovery = atkPokemon?.hasAugment?.("luckyRecovery");
      if (hasLuckyRecovery && !atkPokemon.faint) {
        if (skill && (skill.stype === "atk" || skill.stype === "catk")) {
          if (Math.random() < 0.3) {
            if (atkPokemon.hp < atkPokemon.maxHp) {
              const healAmount = Math.max(1, Math.floor(atkPokemon.maxHp * 0.3));
              const text = `[증강 운 좋은 회복] ${atkPokemon.names("는")} 체력을 회복했다!`;
              atkPokemon.recover(battle, healAmount, enqueue, text);
            }
          }
        }
      }

      // [증강: 달팽이 세마리] 공격 후 적에게 추가 고정 데미지 (10/25/40)
      const hasThreeSnails = atkPokemon?.hasAugment?.("threeSnails");
      if (hasThreeSnails && def && !def.faint && (def.hp === undefined || def.hp > 0)) {
        if (skill && (skill.stype === "atk" || skill.stype === "catk")) {
          const roll = Math.random();
          let shellColor = "초록";
          let shellDamage = 10;
          if (roll < 1 / 3) {
            shellColor = "초록";
            shellDamage = 10;
          } else if (roll < 2 / 3) {
            shellColor = "파란";
            shellDamage = 25;
          } else {
            shellColor = "빨간";
            shellDamage = 40;
          }
          const text = `[증강 달팽이세마리] ${def.names("는")} ${shellColor} 달팽이 껍질에 맞았다!`;
          def.getDamage(battle, enqueue, shellDamage, text);
        }
      }

      // [버프: 우주류 검술] 공격 후 적에게 30의 추가 고정 데미지
      const hasWujuStyle = atkPokemon?.hasAugment?.("wujuStyle");
      if (hasWujuStyle && def && !def.faint && (def.hp === undefined || def.hp > 0)) {
        if (skill && (skill.stype === "atk" || skill.stype === "catk")) {
          const text = `[버프 우주류 검술] ${def.name}에게 추가 데미지를 입혔다!`;
          def.getDamage(battle, enqueue, 30, text);
        }
      }

      // [증강: 파워 스트라이크] 공격 후 적에게 입힌 데미지의 10%에 해당하는 추가 고정 데미지
      const hasPowerStrike = atkPokemon?.hasAugment?.("powerStrike");
      const recentDamage = Number(atkPokemon?.turn?.recentDamageGive || 0);
      if (hasPowerStrike && recentDamage > 0 && def && !def.faint && (def.hp === undefined || def.hp > 0)) {
        if (skill && (skill.stype === "atk" || skill.stype === "catk")) {
          const extraDamage = Math.max(1, Math.floor(recentDamage * 0.1));
          const text = `[증강 파워 스트라이크] ${def.name}에게 추가 데미지를 입혔다!`;
          def.getDamage(battle, enqueue, extraDamage, text);
        }
      }

      // [증강: 루덴의 메아리] 공격 후 적에게 특수공격의 5%에 해당하는 추가 데미지
      const hasLudensEcho = atkPokemon?.hasAugment?.("ludensEcho");
      if (hasLudensEcho && def && !def.faint && (def.hp === undefined || def.hp > 0)) {
        if (skill && (skill.stype === "atk" || skill.stype === "catk")) {
          const rankCatk = Number(atkPokemon?.tempStatus?.rank?.catk ?? 0);
          const curCatk = Math.floor(getAugmentedStat(atkPokemon, "catk", battle) * getMultiplier(rankCatk));
          const ludenDamage = Math.floor(curCatk * 0.05);
          if (ludenDamage > 0) {
            const text = `[증강 루덴의 메아리] ${def.names("는")} 메아리에 맞았다!`;
            def.getDamage(battle, enqueue, ludenDamage, text);
          }
        }
      }

      // [증강: 아케인셰이드 투핸드소드] 큐브 잠재능력: 공격 시 맹독/빙결 부여
      const cubeStats = atkPokemon?.cubeStats;
      if (cubeStats && def && !def.faint && (def.hp === undefined || def.hp > 0)) {
        if (skill && (skill.stype === "atk" || skill.stype === "catk") && !isTargetSubstituteBlocked(battle)) {
          if (cubeStats.poisonRate > 0 && Math.random() * 100 < cubeStats.poisonRate) {
            applyAilment("맹독", battle, battle.turn.def, enqueue, `[잠재능력] ${def.names("는")} 맹독에 걸렸다!`);
          }
          if (cubeStats.freezeRate > 0 && Math.random() * 100 < cubeStats.freezeRate) {
            applyAilment("얼음", battle, battle.turn.def, enqueue, `[잠재능력] ${def.names("는")} 얼어붙었다!`);
          }
        }
      }

      // [증강: 사라만도라] 공격 시 30% 확률로 적에게 화상을 입힘
      const hasSalamandra = atkPokemon.hasAugment("salamandra");
      if (hasSalamandra && !def.faint) {
        if ((skill.stype === "atk" || skill.stype === "catk") && !isTargetSubstituteBlocked(battle)) {
          if (Math.random() < 0.3) {
            applyAilment("화상", battle, battle.turn.def, enqueue, `[증강 사라만도라] ${def.names("는")} 화상을 입었다!`);
          }
        }
      }

      // [증강: 화염의 카타나] 공격 시 50% 확률로 적 또는 자신이 화상을 입음
      const hasFlamingKatana = atkPokemon.hasAugment("flamingKatana");
      if (hasFlamingKatana && (skill.stype === "atk" || skill.stype === "catk")) {
        if (Math.random() < 0.5) {
          if (Math.random() < 0.5) {
            if (!def.faint && !isTargetSubstituteBlocked(battle)) {
              applyAilment("화상", battle, battle.turn.def, enqueue, `[증강 화염의 카타나] ${def.names("는")} 화상을 입었다!`);
            }
          } else {
            if (!atkPokemon.faint) {
              applyAilment("화상", battle, battle.turn.atk, enqueue, `[증강 화염의 카타나] ${atkPokemon.names("는")} 화상을 입었다!`, atkPokemon);
            }
          }
        }
      }

      if (atkPokemon.item === "생명의구슬") {
        if (skill.stype === "atk" || skill.stype === "catk") {
          const text = atkPokemon.name + "의 생명이 조금 깎였다!";
          atkPokemon.getDamage(battle, enqueue, atkPokemon.maxHp / 10, text);
        }
      }

      if (atkPokemon.hasAugment?.("limiterRemoval") && !atkPokemon.faint) {
        if (skill.stype === "atk" || skill.stype === "catk") {
          const text = `[증강 리미터 해제] ${atkPokemon.names("는")} 반동으로 데미지를 입었다!`;
          atkPokemon.getDamage(battle, enqueue, Math.max(1, Math.floor(atkPokemon.maxHp * 0.4)), text);
        }
      }

      if (def.ailment.freeze && !def.faint) {
        // 얼음치료와 상태이상 부여 이벤트가 동시에 있으면 상태이상 부여가 먼저 발생한다
        // => 상태이상 부여가 실패하고 얼음이 녹아 상태이상이 없는 상태가 된다
        // 상대가 대타출동이면 적용 안될것같긴 한데 얼음+대타출동이 동시에 안될듯?
        const meltSkills = ["열탕", "스팀버스트", "열사의대지", "휘적휘적포", "하이드로스팀"]; //불꽃 타입이 아니지만 얼음을 녹이는 기술들
        if (skill.type === "불꽃" || meltSkills.includes(skill.name)) {
          let freezeCureText = def.name + "의 얼음이 녹았다!";
          def.ailment.freeze = null;
          enqueue(battle, freezeCureText, "eff_thaw_hit");
        }
      }

      // 길동무 발동 (반동 데미지, 생명의구슬, 필드 효과 등이 처리된 후 발동)
      if (battle?.turn?.destinyBondUser) {
        const userName = battle.turn.destinyBondUser;
        battle.turn.destinyBondUser = null;
        if (!atkPokemon.faint) {
          enqueue(battle, userName + ` ${atkPokemon.names("를")} 길동무로 삼았다!`, "eff_destiny_bond_ko");
          const endureResult = checkPassiveEndure(atkPokemon);
          if (endureResult) {
            enqueue(battle, endureResult.endureText, endureResult.endureKey);
            return;
          }
          atkPokemon.handleFaint(battle, enqueue);
        }
      }
    },

    필드파괴: (battle, enqueue, skillEffect) => {
      if (battle.field?.terrain) {
        battle.field.terrain.destroyTerrain(battle, enqueue); //안에 enqueue 있음
      }
    },

    랭크변화: (battle, enqueue, skillEffect) => {
      if (random(100 - skillEffect.probability)) {
        return;
      }

      if (skillEffect.target === "def" && isTargetSubstituteBlocked(battle)) {
        // 암석봉인으로 대타출동을 깨도 랭크다운은 적용되지 않는다.
        // 싫은소리 같은 변화기는 애초에 skillCheck에서 막히므로 "실패했다" 텍스트 안띄워도 됨
        return;
      }

      const target = battle.turn[skillEffect.target];
      const targetPokemon = battle[target];
      if (targetPokemon.faint) {
        return;
      }

      targetPokemon.rankUp(battle, enqueue, skillEffect.stat, skillEffect.value, null, skillEffect.target === "def", battle[battle.turn?.atk].abil?.feature?.tgg);
    },

    랭크다수변화: (battle, enqueue, skillEffect) => {
      if (random(100 - skillEffect.probability)) {
        return;
      }

      if (skillEffect.target === "def" && isTargetSubstituteBlocked(battle)) {
        return;
      }

      const target = battle.turn[skillEffect.target];
      const targetPokemon = battle[target];
      if (targetPokemon.faint) {
        return;
      }

      const atkPokemon = battle[battle.turn?.atk];
      const isMoldBreaker = skillEffect.target === "def" && Boolean(atkPokemon?.abil?.feature?.tgg || atkPokemon?.abil?.name === "틀깨기" || atkPokemon?.abil?.name === "테라볼티지" || atkPokemon?.abil?.name === "터보블레이즈");

      targetPokemon.rankUpMulti(battle, enqueue, skillEffect.stats, null, skillEffect.target === "def", isMoldBreaker);
    },

    화상: (battle, enqueue, skillEffect) => {
      const atkPokemon = battle[battle.turn?.atk];
      const chiliMult = atkPokemon?.hasAugment?.("grandmasChiliOil") ? 3 : 1;
      const prob = Math.min(100, (skillEffect.probability || 10) * chiliMult);
      if (random(100 - prob)) {
        return;
      }
      if (isTargetSubstituteBlocked(battle)) {
        return;
      }
      applyAilment("화상", battle, battle.turn.def, enqueue);
    },
    독: (battle, enqueue, skillEffect) => {
      if (random(100 - skillEffect.probability)) {
        return;
      }
      if (isTargetSubstituteBlocked(battle)) {
        return;
      }
      applyAilment("독", battle, battle.turn.def, enqueue);
    },
    맹독: (battle, enqueue, skillEffect) => {
      if (random(100 - skillEffect.probability)) {
        return;
      }
      if (isTargetSubstituteBlocked(battle)) {
        return;
      }
      applyAilment("맹독", battle, battle.turn.def, enqueue);
    },

    마비: (battle, enqueue, skillEffect) => {
      if (random(100 - skillEffect.probability)) {
        return;
      }
      if (isTargetSubstituteBlocked(battle)) {
        return;
      }
      applyAilment("마비", battle, battle.turn.def, enqueue);
    },
    얼음: (battle, enqueue, skillEffect) => {
      if (random(100 - skillEffect.probability)) {
        return;
      }
      if (isTargetSubstituteBlocked(battle)) {
        return;
      }
      applyAilment("얼음", battle, battle.turn.def, enqueue);
    },
    freezeBug: (battle, enqueue, skillEffect) => {
      if (random(100 - skillEffect.probability)) {
        return;
      }
      if (isTargetSubstituteBlocked(battle)) {
        return;
      }
      applyAilment("freezeBug", battle, battle.turn.def, enqueue);
    },
    잠듦: (battle, enqueue, skillEffect) => {
      if (random(100 - skillEffect.probability)) {
        return;
      }
      if (isTargetSubstituteBlocked(battle)) {
        return;
      }
      applyAilment("잠듦", battle, battle.turn.def, enqueue);
    },
    화상치료: (battle, enqueue, skillEffect) => {
      if (isTargetSubstituteBlocked(battle)) {
        return;
      }
      const def = battle[battle.turn.def];
      if (def.ailment.burn && !def.faint) {
        def.ailment.burn = null;
        enqueue(battle, def.name + "의 화상이 나았다!", "eff_cure_burn");
      }
    },
    트라이어택: (battle, enqueue, skillEffect) => {
      // 20% 확률로 상태이상을 걸고,
      // 상태이상이 걸릴때 각각 33% 확률로 화상 마비 얼음중 하나가 결정
      const atkPokemon = battle[battle.turn?.atk];
      const chiliMult = atkPokemon?.hasAugment?.("grandmasChiliOil") ? 3 : 1;
      const prob = Math.min(100, (skillEffect.probability || 20) * chiliMult);
      if (random(100 - prob)) {
        return;
      }
      if (isTargetSubstituteBlocked(battle)) {
        return;
      }
      const r = Math.random();
      if (r < 1 / 3) applyAilment("얼음", battle, battle.turn.def, enqueue);
      else if (r < 2 / 3) applyAilment("마비", battle, battle.turn.def, enqueue);
      else return applyAilment("화상", battle, battle.turn.def, enqueue);
    },
    페이탈클로: (battle, enqueue, skillEffect) => {
      // 50% 확률로 상태이상을 걸고,
      // 상태이상이 걸릴때 각각 33% 확률로 독 마비 잠듦 중 하나가 결정
      if (random(100 - skillEffect.probability)) {
        return;
      }
      if (isTargetSubstituteBlocked(battle)) {
        return;
      }
      const r = Math.random();
      if (r < 1 / 3) applyAilment("독", battle, battle.turn.def, enqueue);
      else if (r < 2 / 3) applyAilment("마비", battle, battle.turn.def, enqueue);
      else return applyAilment("잠듦", battle, battle.turn.def, enqueue);
    },
    혼란: (battle, enqueue, skillEffect) => {
      if (random(100 - skillEffect.probability)) {
        return;
      }
      if (isTargetSubstituteBlocked(battle)) {
        return;
      }
      applyAilment("혼란", battle, battle.turn.def, enqueue);
    },
    풀죽음: (battle, enqueue, skillEffect) => {
      let atk = battle[battle.turn.atk];
      let def = battle[battle.turn.def];
      const noTggAtk = !atk.abil?.feature?.tgg;
      if (def.abil?.name === "정신력" && noTggAtk) {
        return;
      }
      if (isTargetSubstituteBlocked(battle)) {
        return;
      }
      if (random(100 - skillEffect.probability)) {
        return;
      }
      def.turn.fullDeath = true;
    },
    빗나감패널티: (battle, enqueue, skillEffect) => {
      let atkPokemon = battle[battle.turn.atk];
      if (atkPokemon.turn.jumpKickFail) {
        const text = atkPokemon.names("는") + " 의욕이 넘쳐 땅에 부딪쳤다!";
        atkPokemon.getDamage(battle, enqueue, atkPokemon.maxHp / 2, text);
      }
    },
    회복: (battle, enqueue, skillEffect) => {
      const skillUser = battle[battle.turn.atk];
      const hp = skillUser.maxHp;
      skillUser.recover(battle, Math.floor(hp / 2), enqueue);
    },
    아침햇살: (battle, enqueue, skillEffect) => {
      const skillUser = battle[battle.turn.atk];
      const hp = skillUser.maxHp;
      let value = hp / 2;
      if (battle.isSunny) {
        value = (hp * 2) / 3;
      } else if (battle.isRainy || battle.isSandstorm || battle.isSnow) {
        value = hp / 4;
      } else {
        value = hp / 2;
      }
      skillUser.recover(battle, Math.floor(value), enqueue);
    },
    날개쉬기: (battle, enqueue, skillEffect) => {
      const pokemon = battle[battle.turn.atk];
      if (pokemon.type1 !== "비행" && pokemon.type2 !== "비행") {
        return;
      }
      pokemon.turn.roost = true;
      if (pokemon.type1 === "비행") {
        if (pokemon.type2 !== null) {
          pokemon.type1 = null;
          // 비행 전기 -> 비행
        }
        if (pokemon.type2 === null) {
          pokemon.type1 = "노말";
          // 비행 -> 노말
        }
      } else if (pokemon.type2 === "비행") {
        if (pokemon.type1 !== null) {
          pokemon.type2 = null;
        }
        if (pokemon.type1 === null) {
          // 불가능하긴한데 일단 넣음
          pokemon.type2 = "노말";
        }
      }
    },
    탁떨: (battle, enqueue, skillEffect) => {
      if (isTargetSubstituteBlocked(battle)) {
        return;
      }
      const def = battle[battle.turn.def];
      const itemName = def.item;

      if (itemName !== null && !noNullItem.includes(itemName)) {
        // 대부분 아이템이 발동하고 떨어진다 (ex: 기합의띠)
        // 울멧이나 철가시로 공격자가 기절하면 아이템은 떨구지 못한다
        // 약보 : 추가뎀은 무조건 적용. 악타입 약점이면 아이템이 써지고 아니면 떨어진다
        // 탈출버튼, 레드카드, 나무열매 : 발동하지 않고 떨어진다
        def.consumeItem();
        if (def.abil?.name !== "무아지경") {
          def.tempStatus.onlySkill = null; // 구애 시리즈로 고정된 스킬
        }
        enqueue(battle, def.name + "의 " + josa(`${itemName}#{를} `) + "탁 쳐서 떨구었다!", "eff_knock_off");
      }
    },
    유턴: (battle, enqueue, skillEffect) => {
      if (battle.turn.atk === "player") {
        // 플레이어가 유턴을 사용한 경우
        const faint1 = battle.playerBench1.faint;
        const faint2 = battle.playerBench2.faint;
        if (faint1 && faint2) {
          //둘다 기절헀으면 생략
        } else if (!faint1 && faint2) {
          // 첫번째 포켓몬만 기절하지 않은 경우
          switchPlayer(battle, "playerBench1", enqueue);
        } else if (faint1 && !faint2) {
          switchPlayer(battle, "playerBench2", enqueue);
        } else {
          // 둘다 기절하지 않았으면 교체 화면을 보여준다
          battle.turn.switchBySkill = true;
          // battlStart.js에서 이를 기준으로 함수를 끊고
          // battleScrren.js에서 useEffect(setBottom("switchBySkill"))으로 교체화면을 띄운다

          battle.turn.textFreeze = true; // 텍스트가 넘어가지 않게 처리
          enqueue(battle, "누구로 교체할까?", "eff_uturn_prompt", {
            allowAct: true, // 교체 가능하게
            bottomMode: "switchBySkill",
            waitInput: true,
          });
        }
      } else if (battle.turn.atk === "npc") {
        switchNpcAuto(battle, enqueue);
      }
    },
    배턴터치: (battle, enqueue, skillEffect) => {
      if (battle.turn.atk === "player") {
        const faint1 = battle.playerBench1.faint;
        const faint2 = battle.playerBench2.faint;
        if (faint1 && faint2) {
          // 둘 다 기절했으면 생략
          // skillCheck에서 체크하니까 그럴 일 없긴 한데 일단 추가
        } else if (!faint1 && faint2) {
          switchPlayer(battle, "playerBench1", enqueue, { batonPass: true });
        } else if (faint1 && !faint2) {
          switchPlayer(battle, "playerBench2", enqueue, { batonPass: true });
        } else {
          battle.turn.switchBySkill = true;
          battle.turn.batonPass = true;
          battle.turn.textFreeze = true;
          enqueue(battle, "누구로 교체할까?", "eff_baton_prompt", {
            allowAct: true,
            bottomMode: "switchBySkill",
            waitInput: true,
          });
        }
      } else if (battle.turn.atk === "npc") {
        switchNpcAuto(battle, enqueue, { batonPass: true });
      }
    },
    반동: (battle, enqueue, skillEffect) => {
      let atkPokemon = battle[battle.turn.atk];
      if (atkPokemon.abil?.name === "돌머리") return;
      const text = atkPokemon.names("는") + " 반동으로 데미지를 입었다!";
      const ratio = skillEffect?.ratio || 3;
      atkPokemon.getDamage(battle, enqueue, atkPokemon.turn.recentDamageGive / ratio, text);
    },
    발버둥반동: (battle, enqueue, skillEffect) => {
      let atkPokemon = battle[battle.turn.atk];
      const text = atkPokemon.names("는") + " 반동으로 데미지를 입었다!";
      atkPokemon.getDamage(battle, enqueue, atkPokemon.maxHp / 4, text);
    },
    하품: (battle, enqueue, skillEffect) => {
      const def = battle[battle.turn.def];
      def.tempStatus.hapum = 1;
      enqueue(battle, `${def.name}의 졸음을 유도했다!`, "eff_yawn_apply");
    },
    소리기술금지: (battle, enqueue, skillEffect) => {
      if (isTargetSubstituteBlocked(battle)) {
        return;
      }
      const def = battle[battle.turn.def];
      if (!def.faint) {
        def.tempStatus.noSound = 2;
        enqueue(battle, def.names("는") + " 한동안 소리 기술을 사용할 수 없게 됐다!", "eff_throat_chop");
      }
    },
    회복봉인: (battle, enqueue, skillEffect) => {
      if (isTargetSubstituteBlocked(battle)) {
        return;
      }
      const def = battle[battle.turn.def];
      if (!def || def.faint) return;
      if (def.tempStatus.healBlock === "ready" || def.tempStatus.healBlock === null) {
        enqueue(battle, def.names("는") + " 회복 동작을 봉인당했다!", "eff_heal_block");
        def.tempStatus.healBlock = 2;
      }
    },
    방어: (battle, enqueue, skillEffect) => {
      // 방어 성공 여부는 skillRequirement에서 처리
      const skillUser = battle[battle.turn.atk];
      skillUser.turn.protect = true;
      enqueue(battle, skillUser.names("는") + " 방어 태세에 들어갔다!", "eff_protect");
    },
    니들가드: (battle, enqueue, skillEffect) => {
      const skillUser = battle[battle.turn.atk];
      skillUser.turn.protect = true;
      skillUser.turn.spikyShield = true;
      enqueue(battle, skillUser.names("는") + " 방어 태세에 들어갔다!", "eff_spiky_shield");
    },

    스텔스록: (battle, enqueue, skillEffect) => {
      const def = battle.turn.def;
      const field = battle.field[def];
      field.sRock = true;
      const sRockText = def === "npc" ? "상대의 주변에 뾰족한 바위가 떠다니기 시작했다!" : "아군의 주변에 뾰족한 바위가 떠다니기 시작했다!";
      enqueue(battle, sRockText, "eff_srock_set");
    },

    암석액스: (battle, enqueue, skillEffect) => {
      const def = battle.turn.def;
      const field = battle.field[def];
      if (!field.sRock) {
        field.sRock = true;
        const text = def === "npc" ? "상대의 주변에 뾰족한 바위가 떠다니기 시작했다!" : "아군의 주변에 뾰족한 바위가 떠다니기 시작했다!";
        enqueue(battle, text, "eff_stone_axe_srock");
      }
    },

    독압정: (battle, enqueue, skillEffect) => {
      const def = battle.turn.def;
      const field = battle.field[def];
      if (!field.poisonSpikes) {
        field.poisonSpikes = 1; // 독압정
        const sRockText = def === "npc" ? "상대의 발밑에 독압정이 뿌려졌다!" : "아군의 발밑에 독압정이 뿌려졌다!";
        enqueue(battle, sRockText, "eff_tspikes_1");
      } else if (field.poisonSpikes === 1) {
        field.poisonSpikes = 2; // 맹독압정
        const sRockText = def === "npc" ? "상대의 발밑에 맹독압정이 뿌려졌다!" : "아군의 발밑에 맹독압정이 뿌려졌다!";
        enqueue(battle, sRockText, "eff_tspikes_2");
      }
    },

    압정뿌리기: (battle, enqueue, skillEffect) => {
      // 최대 3번까지 쌓인다 (압정뿌리기는 skillFailCheck에서 3겹 시 실패 처리, 비검천중파는 3겹 시 무시)
      const def = battle.turn.def;
      const field = battle.field[def];
      if ((field.spikes || 0) >= 3) return;
      field.spikes = (field.spikes || 0) + 1;
      const text = def === "npc" ? "상대의 발밑에 압정이 뿌려졌다!" : "아군의 발밑에 압정이 뿌려졌다!";
      enqueue(battle, text, "eff_spikes_set");
    },

    끈적끈적네트: (battle, enqueue, skillEffect) => {
      const def = battle.turn.def;
      const field = battle.field[def];
      field.stickyWeb = true;
      const text = def === "npc" ? "상대의 발밑에 끈적끈적네트가 펼쳐졌다!" : "아군의 발밑에 끈적끈적네트가 펼쳐졌다!";
      enqueue(battle, text, "eff_web_set");
    },

    강제교체: (battle, enqueue, skillEffect) => {
      const defPokemon = battle[battle.turn.def];
      const skill = battle[battle.turn.atk]?.turn?.useSkill;
      if (defPokemon.faint) return; // 드래곤테일로 상대를 기절시킨 경우 강제교체 발동하지 않음
      if ((skill?.stype === "atk" || skill?.stype === "catk") && isTargetSubstituteBlocked(battle)) return;
      // 날려버리기, 울부짖기는 대타를 뚫지만 드래곤테일은 뚫지 못한다

      if (battle.turn.atk === "player") {
        // 플레이어가 강제교체 기술 사용시 NPC가 교체됨
        handleForceSwitch(battle, enqueue, "npcBench1", "npcBench2", switchNpc);
      } else if (battle.turn.atk === "npc") {
        // NPC가 강제교체 기술 사용시 플레이어가 교체됨
        handleForceSwitch(battle, enqueue, "playerBench1", "playerBench2", switchPlayerForce);
      }
    },

    도발: (battle, enqueue, skillEffect) => {
      const def = battle.turn.def;
      const defPokemon = battle[def];
      let num = 4;
      if (battle.turn.fastActUser === battle.turn.atk || !battle[battle.turn.fastActUser].turn.useSkill) {
        // 선도발을 썼거나 교체해서 나온 상대방이 도발을 맞은 경우 (그 턴 포함 3턴)
        num = 3;
      }
      // 후도발의 경우 그 다음턴 부터 3턴 (도발은 3'턴'이 아닌 3'회' 적의 변화기를 막는다)
      defPokemon.tempStatus.taunt = num;
      enqueue(battle, defPokemon.names("는") + " 도발에 넘어가 버렸다!", "eff_taunt_apply");
    },

    트릭: (battle, enqueue, skillEffect) => {
      const def = battle[battle.turn.def];
      const atk = battle[battle.turn.atk];

      // 아이템 교환
      [atk.item, def.item] = [def.item, atk.item];

      // 구애 시리즈로 고정된 스킬 초기화
      if (atk.abil?.name !== "무아지경") atk.tempStatus.onlySkill = null;
      if (def.abil?.name !== "무아지경") def.tempStatus.onlySkill = null;
      enqueue(battle, atk.names("는") + " 서로의 도구를 교체했다!", "eff_trick_swap");
    },

    트릭룸: (battle, enqueue, skillEffect) => {
      battle.field.room.handleTrickRoom(battle, enqueue);
    },

    자동: (battle, enqueue, skillEffect) => {
      // 역린
      const atk = battle[battle.turn.atk];
      if (atk.tempStatus.disable && atk.tempStatus.disable === atk.turn?.useSkill?.name) {
        atk.auto = null;
        atk.autoSN = null;
        return;
      }
      if (atk.auto !== null) {
        return;
      }
      atk.auto = Math.random() < 0.5 ? 2 : 3;
      atk.autoSN = battle[battle.turn.atk].turn.choice;
    },

    반동휴식: (battle, enqueue, skillEffect) => {
      let atkPokemon = battle[battle.turn.atk];
      let defPokemon = battle[battle.turn.def];
      const usedSkill = atkPokemon?.turn?.useSkill;
      if (atkPokemon?.hasAugment?.("lostTechnologyHyperBeam") && usedSkill?.name === "파괴광선" && defPokemon?.faint) {
        return;
      }
      atkPokemon.recharge = true;
      atkPokemon.autoSN = battle[battle.turn.atk].turn.choice;
    },

    씨뿌리기: (battle, enqueue, skillEffect) => {
      const def = battle.turn.def;
      const defPokemon = battle[def];
      defPokemon.tempStatus.seed = true;
      enqueue(battle, defPokemon.name + "에게 씨앗을 심었다!", "eff_seed_apply");
    },
    배북: (battle, enqueue, skillEffect) => {
      const atk = battle.turn.atk;
      const atkPokemon = battle[atk];
      const needHp = Math.floor(atkPokemon.maxHp / 2);

      atkPokemon.getDamage(battle, enqueue, needHp, `${atkPokemon.names("는")} 체력을 깎아 파워를 최대로 올렸다!`);
      atkPokemon.rankUp(battle, enqueue, "atk", 12);
    },
    대타출동: (battle, enqueue, skillEffect) => {
      const atk = battle.turn.atk;
      const atkPokemon = battle[atk];
      const needHp = Math.floor(atkPokemon.maxHp / 4);

      atkPokemon.tempStatus.substitute = true;
      atkPokemon.tempStatus.substituteHp = needHp;
      atkPokemon.turn.substitute = true;
      atkPokemon.getDamage(battle, enqueue, needHp, atkPokemon.name + "의 대타가 나타났다!");
    },

    스핀: (battle, enqueue, skillEffect) => {
      const atk = battle[battle.turn.atk];
      const field = battle.field[battle.turn.atk];
      const hazards = ["sRock", "spikes", "poisonSpikes", "stickyWeb"];
      let hazardRemoved = false;
      hazards.forEach((key) => {
        if (field[key]) {
          //장판 제거
          field[key] = null;
          hazardRemoved = true;
        }
      });
      if (hazardRemoved) {
        enqueue(battle, atk.names("는") + " 자신의 필드를 정리했다!", "eff_spin_hazard");
      }
      if (atk.tempStatus.seed) {
        //씨뿌리기 제거
        atk.tempStatus.seed = null;
        enqueue(battle, atk.names("는") + " 씨뿌리기에서 벗어났다!", "eff_spin_seed");
      }
      if (atk.tempStatus.switchLock) {
        let skillName = atk.tempStatus.switchLock;
        //교체불가 제거
        atk.tempStatus.switchLock = null;
        atk.tempStatus.switchLockTurnRemain = null;
        enqueue(battle, atk.names("는") + " " + skillName + "에서 벗어났다!", "eff_spin_trap");
      }
    },

    흡수: (battle, enqueue, skillEffect) => {
      if (typeof skillEffect.ratio !== "number") {
        console.error("흡수 비율 없음");
      }

      //풀피면 체력 회복 안되고 -> 생구 터짐
      let atk = battle[battle.turn.atk];
      const def = battle[battle.turn.def];
      const text = josa(`${def.name}#{으로}`) + "부터 체력을 흡수했다!";

      if (atk.hp !== atk.maxHp) {
        const ratio = skillEffect.ratio;
        atk.recover(battle, Math.floor(atk.turn.recentDamageGive * ratio), enqueue, text);
      }
    },

    구속: (battle, enqueue, skillEffect) => {
      if (isTargetSubstituteBlocked(battle)) {
        return;
      }
      const def = battle[battle.turn.def];
      if (def.tempStatus.switchLock === null && !def.faint) {
        def.tempStatus.switchLock = skillEffect.skillName;
        def.tempStatus.switchLockTurnRemain = Math.random() < 0.5 ? 4 : 5;
        //4~5턴인데 확률은 모르겠음
        enqueue(battle, def.names("는") + " " + skillEffect.text, "eff_trap_apply");
      }
    },

    능력치초기화: (battle, enqueue, skillEffect) => {
      // 능력치 변화가 없어도 발동은 된다
      const skill = battle[battle.turn.atk]?.turn?.useSkill;
      if ((skill?.stype === "atk" || skill?.stype === "catk") && isTargetSubstituteBlocked(battle)) return;
      const def = battle[battle.turn.def];
      def.resetRank();
      enqueue(battle, def.name + "의 능력치 변화가 원래대로 되돌아갔다!", "eff_clear_rank");
    },
    치유소원: (battle, enqueue, skillEffect) => {
      battle.field[battle.turn.atk].handleHealingWish(battle, enqueue);
    },
    초승달춤: (battle, enqueue, skillEffect) => {
      battle.field[battle.turn.atk].handleLunarDance(battle, enqueue);
    },
    길동무: (battle, enqueue, skillEffect) => {
      const atk = battle[battle.turn.atk];
      atk.tempStatus.destinyBond = true;
      enqueue(battle, atk.names("는") + " 상대를 길동무로 삼으려 하고 있다!", "eff_destiny_bond");
    },
    목숨걸기: (battle, enqueue, skillEffect) => {
      battle[battle.turn.atk].handleFaint(battle, enqueue);
    },
    자폭: (battle, enqueue, skillEffect) => {
      battle[battle.turn.atk].handleFaint(battle, enqueue);
    },
    철제광선반동: (battle, enqueue, skillEffect) => {
      const atkPokemon = battle[battle.turn.atk];
      const damage = Math.ceil(atkPokemon.maxHp / 2);
      const text = atkPokemon.names("는") + " 반동으로 데미지를 입었다!";
      atkPokemon.getDamage(battle, enqueue, damage, text);
    },

    대검돌격: (battle, enqueue, skillEffect) => {
      let atkPokemon = battle[battle.turn.atk];
      atkPokemon.tempStatus.glaiveRush = true;
    },

    희망사항: (battle, enqueue, skillEffect) => {
      const skillUser = battle[battle.turn.atk];
      const wishObj = {
        name: skillUser.name,
        amount: Math.floor(skillUser.maxHp / 2),
        turnRemain: 1,
      };
      battle.field[battle.turn.atk].handleWish(battle, enqueue, wishObj);
    },

    리플렉터: (battle, enqueue, skillEffect) => {
      const user = battle.turn.atk;
      const skillUser = battle[user];
      let num = 5;
      if (skillUser.item === "빛의점토") num = 8;
      battle.field[user].noClean.reflect = num;
      enqueue(battle, battle.common[user].teamKr + " 편은 리플렉터로 물리공격에 강해졌다!", "eff_reflect_set");
    },

    빛의장막: (battle, enqueue, skillEffect) => {
      const user = battle.turn.atk;
      const skillUser = battle[user];
      let num = 5;
      if (skillUser.item === "빛의점토") num = 8;
      battle.field[user].noClean.lightScreen = num;
      enqueue(battle, battle.common[user].teamKr + " 편은 빛의장막으로 특수공격에 강해졌다!", "eff_lscreen_set");
    },

    오로라베일: (battle, enqueue, skillEffect) => {
      const user = battle.turn.atk;
      const skillUser = battle[user];
      const field = battle.field[user].noClean;
      let num = 5;
      if (skillUser.item === "빛의점토") num = 8;
      field.auroraVeil = num;
      enqueue(battle, battle.common[user].teamKr + " 편은 오로라베일로 물리공격과 특수공격에 강해졌다!", "eff_aveil_set");
    },

    순풍: (battle, enqueue, skillEffect) => {
      const user = battle.turn.atk;
      const field = battle.field[user].noClean;
      field.tailwind = 4;
      const teamText = battle.common[user].teamKr;
      enqueue(battle, teamText + " 편의 뒤에서 순풍이 불기 시작했다!", "eff_tailwind_set");
    },

    튀어오르기: (battle, enqueue) => {
      enqueue(battle, "그러나 아무 일도 일어나지 않았다!", "eff_splash");
    },
    물붓기: (battle, enqueue, skillEffect) => {
      if (isTargetSubstituteBlocked(battle)) return;
      const def = battle[battle.turn.def];
      if (!def || def.faint) return;
      def.type1 = "물";
      def.type2 = null;
      enqueue(battle, def.names("는") + " 물 타입이 되었다!", "eff_soak");
    },

    힘흡수: (battle, enqueue, skillEffect) => {
      if (isTargetSubstituteBlocked(battle)) return;
      const atk = battle[battle.turn.atk];
      const def = battle[battle.turn.def];
      if (!def || def.faint) return;

      const targetRank = def.tempStatus?.rank?.atk ?? 0;
      const targetAtk = Math.floor(getAugmentedStat(def, "atk", battle) * getMultiplier(targetRank));
      const healAmount = Math.max(1, targetAtk);

      const text = josa(`${def.name}#{으로}`) + "부터 힘을 흡수했다!";
      atk.recover(battle, healAmount, enqueue, text);

      def.rankUp(battle, enqueue, "atk", -1, null, true, atk.abil?.feature?.tgg);
    },

    벽부수기: (battle, enqueue, skillEffect) => {
      const def = battle.turn.def;
      const field = battle.field[def].noClean;
      if (field.reflect === null && field.lightScreen === null && field.auroraVeil === null) {
        return;
      }
      if (field.reflect !== null) {
        field.reflect = null;
        enqueue(battle, battle.common[battle.turn.def].teamKr + " 편의 리플렉터가 깨졌다!", "eff_break_reflect");
      }
      if (field.lightScreen !== null) {
        field.lightScreen = null;
        enqueue(battle, battle.common[battle.turn.def].teamKr + " 편의 빛의장막이 깨졌다!", "eff_break_lscreen");
      }
      if (field.auroraVeil !== null) {
        field.auroraVeil = null;
        enqueue(battle, battle.common[battle.turn.def].teamKr + " 편의 오로라베일이 깨졌다!", "eff_break_aveil");
      }
    },
  };

  return functions[name] || null;
}

export default skillEffectSearch;

const handleForceSwitch = (battle, enqueue, bench1Key, bench2Key, switchFn) => {
  const bench1Alive = battle[bench1Key].faint !== true;
  const bench2Alive = battle[bench2Key].faint !== true;

  if (bench1Alive && bench2Alive) {
    // 둘다 살아있는 경우 랜덤 선택
    const choice = Math.random() < 0.5 ? bench1Key : bench2Key;
    switchFn(battle, choice, enqueue, true);
  } else if (bench1Alive) {
    //한쪽만 살아있는경우 해당 포켓몬으로 교체
    switchFn(battle, bench1Key, enqueue, true);
  } else if (bench2Alive) {
    switchFn(battle, bench2Key, enqueue, true);
  }
};
