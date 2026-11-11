import { random } from "../../util/randomCheck";
import { applyAilment, isAilmentCheck } from "../../function/ailment";
import { josa } from "josa";
import { noNullItem } from "../Item";
import { switchNpc, switchNpcAuto, switchPlayer, switchPlayerForce } from "../../service/switch";

function isTargetSubstituteBlocked(battle) {
  const defPokemon = battle?.[battle?.turn?.def];
  const atkPokemon = battle?.[battle?.turn?.atk];
  const skill = atkPokemon?.turn?.useSkill;
  const hitSub = defPokemon?.turn?.lastHitSubstitute !== null ? Boolean(defPokemon.turn.lastHitSubstitute) : Boolean(defPokemon?.turn?.substitute || defPokemon?.tempStatus?.substitute);
  const penetrates = atkPokemon?.abil === "틈새포착" || Boolean(skill?.feature?.sound);
  return hitSub && !penetrates;
}

function skillEffectSearch(name) {
  // 연속기에서 여러번 발동하는 효과의 경우 onHit에서 처리
  const functions = {
    공통: (battle, enqueue, skillEffect) => {
      let atkPokemon = battle[battle.turn.atk];
      let def = battle[battle.turn.def];
      let skill = atkPokemon.turn.useSkill;
      if (!atkPokemon.faint && skill.feature?.protect !== true) atkPokemon.tempStatus.protectUse = null;
      // 방어 외에 다른 스킬을 사용하였을때 방어 스택 초기화

      // [증강: 달팽이 세마리] 공격 후 적에게 추가 고정 데미지 (10/25/40)
      const hasThreeSnails = atkPokemon?.hasAugment?.("threeSnails");
      if (hasThreeSnails && def && !def.faint && (def.hp === undefined || def.hp > 0) && atkPokemon && !atkPokemon.faint) {
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
          const targetName = def.names || def.name;
          const text = `[증강 달팽이세마리] ${targetName} ${shellColor} 달팽이 껍질에 맞았다!`;
          def.getDamage(battle, enqueue, shellDamage, text);
        }
      }

      // [버프: 우주류 검술] 공격 후 적에게 30의 추가 고정 데미지
      const hasWujuStyle = atkPokemon?.hasAugment?.("wujuStyle");
      if (hasWujuStyle && def && !def.faint && (def.hp === undefined || def.hp > 0) && atkPokemon && !atkPokemon.faint) {
        if (skill && (skill.stype === "atk" || skill.stype === "catk")) {
          const targetName = def.names || def.name;
          const text = `[버프 우주류 검술] ${targetName} 30의 추가 고정 데미지를 입었다!`;
          def.getDamage(battle, enqueue, 30, text);
        }
      }

      if (atkPokemon.item === "생명의구슬" && !atkPokemon.faint) {
        if (skill.stype === "atk" || skill.stype === "catk") {
          const text = atkPokemon.name + "의 생명이 조금 깎였다!";
          atkPokemon.getDamage(battle, enqueue, atkPokemon.origin.hp / 10, text);
        }
      }

      if (def.ailment.freeze && !def.faint) {
        // 얼음치료와 상태이상 부여 이벤트가 동시에 있으면 상태이상 부여가 먼저 발생한다
        // => 상태이상 부여가 실패하고 얼음이 녹아 상태이상이 없는 상태가 된다
        // 상대가 대타출동이면 적용 안될것같긴 한데 얼음+대타출동이 동시에 안될듯?
        const meltSkills = ["열탕", "스팀버스트", "열사의대지", "휘적휘적포"]; //불꽃 타입이 아니지만 얼음을 녹이는 기술들
        if (skill.type === "불꽃" || meltSkills.includes(skill.name)) {
          let freezeCureText = def.name + "의 얼음이 녹았다!";
          def.ailment.freeze = null;
          enqueue({
            id: "a1347bb8-63d7-485a-9147-ba2e2100707a",
            battle: battle,
            text: freezeCureText,
          });
        }
      }

      // 길동무 발동 (반동 데미지, 생명의구슬, 필드 효과 등이 처리된 후 발동)
      if (battle?.turn?.destinyBondUser) {
        const userName = battle.turn.destinyBondUser;
        battle.turn.destinyBondUser = null;
        if (atkPokemon && !atkPokemon.faint) {
          enqueue({
            id: "e3a9f6c2-1b7d-4c8e-a5f0-6d2b9c4e8a17",
            battle,
            text: userName + ` ${atkPokemon.namess} 길동무로 삼았다!`,
          });
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

      targetPokemon.rankUp(battle, enqueue, skillEffect.stat, skillEffect.value, null, skillEffect.target === "def", battle[battle.turn?.atk].abilObj?.feature?.tgg);
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
      const isMoldBreaker = skillEffect.target === "def" && Boolean(atkPokemon?.abilObj?.feature?.tgg || atkPokemon?.abil === "틀깨기" || atkPokemon?.abil === "테라볼티지" || atkPokemon?.abil === "터보블레이즈");

      targetPokemon.rankUpMulti(battle, enqueue, skillEffect.stats, null, skillEffect.target === "def", isMoldBreaker);
    },

    화상: (battle, enqueue, skillEffect) => {
      if (random(100 - skillEffect.probability)) {
        return;
      }
      if (isTargetSubstituteBlocked(battle)) {
        return;
      }
      applyAilment("화상", battle, battle.turn.def, enqueue, skillEffect.printTextIfFail);
    },
    독: (battle, enqueue, skillEffect) => {
      if (random(100 - skillEffect.probability)) {
        return;
      }
      if (isTargetSubstituteBlocked(battle)) {
        return;
      }
      applyAilment("독", battle, battle.turn.def, enqueue, skillEffect.printTextIfFail);
    },
    맹독: (battle, enqueue, skillEffect) => {
      if (random(100 - skillEffect.probability)) {
        return;
      }
      if (isTargetSubstituteBlocked(battle)) {
        return;
      }
      applyAilment("맹독", battle, battle.turn.def, enqueue, skillEffect.printTextIfFail);
    },

    마비: (battle, enqueue, skillEffect) => {
      if (random(100 - skillEffect.probability)) {
        return;
      }
      if (isTargetSubstituteBlocked(battle)) {
        return;
      }
      applyAilment("마비", battle, battle.turn.def, enqueue, skillEffect.printTextIfFail);
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
    잠듦: (battle, enqueue, skillEffect) => {
      if (random(100 - skillEffect.probability)) {
        return;
      }
      if (isTargetSubstituteBlocked(battle)) {
        return;
      }
      applyAilment("잠듦", battle, battle.turn.def, enqueue, skillEffect.printTextIfFail);
    },
    화상치료: (battle, enqueue, skillEffect) => {
      if (isTargetSubstituteBlocked(battle)) {
        return;
      }
      const def = battle[battle.turn.def];
      if (def.ailment.burn && !def.faint) {
        def.ailment.burn = null;
        enqueue({
          id: "e10ceb1e-26eb-4614-9bcb-0938682e7f6d",
          battle: battle,
          text: def.name + "의 화상이 나았다!",
        });
      }
    },
    트라이어택: (battle, enqueue, skillEffect) => {
      // 20% 확률로 상태이상을 걸고,
      // 상태이상이 걸릴때 각각 33% 확률로 화상 마비 얼음중 하나가 결정
      if (random(100 - skillEffect.probability)) {
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
      const noTggAtk = !atk.abilObj.feature?.tgg;
      if (def.abil === "정신력" && noTggAtk) {
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
        const text = atkPokemon.names + " 의욕이 넘쳐 땅에 부딪쳤다!";
        atkPokemon.getDamage(battle, enqueue, atkPokemon.origin.hp / 2, text);
      }
    },
    회복: (battle, enqueue, skillEffect) => {
      const skillUser = battle[battle.turn.atk];
      const hp = skillUser.origin.hp;
      skillUser.recover(battle, Math.floor(hp / 2), enqueue);
    },
    아침햇살: (battle, enqueue, skillEffect) => {
      const skillUser = battle[battle.turn.atk];
      const hp = skillUser.origin.hp;
      let value = hp / 2;
      if (battle.field.weather.get() === null) {
        value = hp / 2;
      } else if (battle.field.weather.isSunny) {
        value = (hp * 2) / 3;
      } else {
        value = hp / 4;
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
      const atk = battle[battle.turn.atk];
      const def = battle[battle.turn.def];
      const itemName = def.item;

      if (itemName !== null && !noNullItem.includes(itemName) && !atk.faint) {
        // 대부분 아이템이 발동하고 떨어진다 (ex: 기합의띠)
        // 울멧이나 철가시로 공격자가 기절하면 아이템은 떨구지 못한다
        // 약보 : 추가뎀은 무조건 적용. 악타입 약점이면 아이템이 써지고 아니면 떨어진다
        // 탈출버튼, 레드카드, 나무열매 : 발동하지 않고 떨어진다
        def.item = null;
        if (def.abil !== "무아지경") {
          def.tempStatus.onlySkill = null; // 구애 시리즈로 고정된 스킬
        }
        enqueue({
          id: "26b1ce80-ef54-42f9-a6ba-4322c480c728",
          battle,
          text: def.name + "의 " + josa(`${itemName}#{를} `) + "탁쳐서 떨구었다!",
        });
      }
    },
    유턴: (battle, enqueue, skillEffect) => {
      if (battle.turn.atk === "player" && !battle.player.faint) {
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
          battle.turn.uturn = true;
          // battlStart.js에서 이를 기준으로 함수를 끊고
          // battleScrren.js에서 useEffect(setBottom("uturn"))으로 교체화면을 띄운다

          battle.turn.textFreeze = true; // 텍스트가 넘어가지 않게 처리
          enqueue({
            id: "7a02186c-33ec-4a93-94e9-9643022af3d8",
            battle,
            text: "누구로 교체할까?",
            allowAct: true, // 교체 가능하게
            bottomMode: "uturn",
            waitInput: true,
          });
        }
      } else if (battle.turn.atk === "npc") {
        switchNpcAuto(battle, enqueue);
      }
    },
    반동: (battle, enqueue, skillEffect) => {
      let atkPokemon = battle[battle.turn.atk];
      if (atkPokemon.abil === "돌머리") return;
      const text = atkPokemon.names + " 반동으로 데미지를 입었다!";
      const ratio = skillEffect?.ratio || 3;
      atkPokemon.getDamage(battle, enqueue, atkPokemon.turn.recentDamageGive / ratio, text);
    },
    발버둥반동: (battle, enqueue, skillEffect) => {
      let atkPokemon = battle[battle.turn.atk];
      if (atkPokemon.faint) return;
      const text = atkPokemon.names + " 반동으로 데미지를 입었다!";
      atkPokemon.getDamage(battle, enqueue, atkPokemon.origin.hp / 4, text);
    },
    하품: (battle, enqueue, skillEffect) => {
      const def = battle[battle.turn.def];
      if (!isAilmentCheck(def) && def.tempStatus.hapum !== 1 && def.tempStatus.hapum !== 0 && def.abil !== "의기양양" && def.abil !== "불면") {
        // 상대가 상태이상에 걸려있지 않음 + 하품 맞은 상태 아님
        // 불면, 의기양양이면 하품 자체가 실패함
        if (battle.field?.terrian?.isElectircField && !def.isFlying(battle, true)) {
          // 일렉트릭필드면 실패함 (잠드는 것만 실패하는게 아님 그냥 하품 자체가 실패함)
          // 미스트필드면 하품은 쓸 수 있음, 잠들지는 않음. 다음턴에 필드 꺼지면 잠듦
          enqueue({
            id: "b52cae05-d917-4901-8034-61039917ee30",
            battle,
            text: "하지만 실패했다!",
          });
        }
        def.tempStatus.hapum = 1;
        enqueue({
          id: "eee89d87-1741-4dd6-86d6-4280d7330eea",
          battle,
          text: def.name + "의 " + "졸음을 유도했다!",
        });
      } else {
        enqueue({
          id: "8a72c801-8b0d-44e8-99e6-4e64ac4fac04",
          battle,
          text: "하지만 실패했다!",
        });
      }
    },
    소리기술금지: (battle, enqueue, skillEffect) => {
      if (isTargetSubstituteBlocked(battle)) {
        return;
      }
      const def = battle[battle.turn.def];
      if (!def.faint) {
        def.tempStatus.noSound = 2;
        enqueue({
          id: "38e49189-0df7-4c1a-bda8-7552853df759",
          battle,
          text: def.names + " 한동안 소리 기술을 사용할 수 없게 됐다!",
        });
      }
    },
    방어: (battle, enqueue, skillEffect) => {
      // 방어 성공 여부는 skillRequirement에서 처리
      const skillUser = battle[battle.turn.atk];
      skillUser.turn.protect = true;
      enqueue({
        id: "f647a247-0db6-4dc5-bc52-8ed51b1b6d1e",
        battle,
        text: skillUser.names + " 방어 태세에 들어갔다!",
      });
    },
    니들가드: (battle, enqueue, skillEffect) => {
      const skillUser = battle[battle.turn.atk];
      skillUser.turn.protect = true;
      skillUser.turn.spikyShield = true;
      enqueue({
        id: "f48c4cb4-e808-4d70-821a-6bfb3c398f82",
        battle,
        text: skillUser.names + " 방어 태세에 들어갔다!",
      });
    },

    스텔스록: (battle, enqueue, skillEffect) => {
      const def = battle.turn.def;
      const field = battle.field[def];
      if (!field.sRock) {
        field.sRock = true;
        let sRockText;
        if (def === "npc") {
          sRockText = "상대의 주변에 뾰족한 바위가 떠다니기 시작했다!";
        } else {
          sRockText = "아군의 주변에 뾰족한 바위가 떠다니기 시작했다!";
        }
        enqueue({
          id: "6d1e04b2-3607-4cb4-9543-0b5d203e2aa3",
          battle,
          text: sRockText,
        });
      } else {
        enqueue({
          id: "f7eba472-eb0b-414c-abce-f3b4c18c3ce9",
          battle,
          text: "하지만 실패했다!",
        });
      }
    },

    암석액스: (battle, enqueue, skillEffect) => {
      const def = battle.turn.def;
      const field = battle.field[def];
      if (!field.sRock) {
        field.sRock = true;
        const text = def === "npc" ? "상대의 주변에 뾰족한 바위가 떠다니기 시작했다!" : "아군의 주변에 뾰족한 바위가 떠다니기 시작했다!";
        enqueue({ id: "3731810a-b429-4d17-9567-be94d012faf3", battle, text });
      }
    },

    독압정: (battle, enqueue, skillEffect) => {
      const def = battle.turn.def;
      const field = battle.field[def];
      if (!field.poisonSpikes) {
        field.poisonSpikes = 1; // 독압정
        let sRockText;
        if (def === "npc") {
          sRockText = "상대의 발밑에 독압정이 뿌려졌다!";
        } else {
          sRockText = "아군의 발밑에 독압정이 뿌려졌다!";
        }
        enqueue({
          id: "8c0789f4-02d7-42fd-afbe-87dcf09a61e1",
          battle,
          text: sRockText,
        });
      } else if (field.poisonSpikes === 1) {
        field.poisonSpikes = 2; // 맹독압정
        let sRockText;
        if (def === "npc") {
          sRockText = "상대의 발밑에 맹독압정이 뿌려졌다!";
        } else {
          sRockText = "아군의 발밑에 맹독압정이 뿌려졌다!";
        }
        enqueue({
          id: "ee0357a5-eb04-4dbd-93a4-bb0c716af5a1",
          battle,
          text: sRockText,
        });
      } else {
        enqueue({
          id: "f5906a16-82e2-4c75-b89a-0259818aa3c2",
          battle,
          text: "하지만 실패했다!",
        });
      }
    },

    압정뿌리기: (battle, enqueue, skillEffect) => {
      // 최대 3번까지 쌓인다
      const def = battle.turn.def;
      const field = battle.field[def];
      if ((field.spikes || 0) >= 3) {
        if (battle[battle.turn.atk].turn.useSkill?.stype === "buf") {
          // 비검천중파는 실패 텍스트가 뜨지 않음
          enqueue({
            id: "3387c5e4-bf00-4fb4-9c13-f5373677f9ef",
            battle,
            text: "하지만 실패했다!",
          });
        }
        return;
      }
      field.spikes = (field.spikes || 0) + 1;
      const text = def === "npc" ? "상대의 발밑에 압정이 뿌려졌다!" : "아군의 발밑에 압정이 뿌려졌다!";
      enqueue({ id: "19c93aad-0ab7-41c7-a74c-acf6605d37b1", battle, text });
    },

    끈적끈적네트: (battle, enqueue, skillEffect) => {
      const def = battle.turn.def;
      const field = battle.field[def];
      if (!field.stickyWeb) {
        field.stickyWeb = true;
        let text;
        if (def === "npc") {
          text = "상대의 발밑에 끈적끈적네트가 펼쳐졌다!";
        } else {
          text = "아군의 발밑에 끈적끈적네트가 펼쳐졌다!";
        }
        enqueue({
          id: "8acab66c-7f97-4517-98d0-b20e6a769f2f",
          battle,
          text: text,
        });
      } else {
        enqueue({
          id: "5ddd8791-c5d9-4ad7-a1a8-46029dc849d8",
          battle,
          text: "하지만 실패했다!",
        });
      }
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
      const atkPokemon = battle[battle.turn.atk];
      if (defPokemon.abil === "둔감" && !atkPokemon?.abilObj?.feature?.tgg) {
        enqueue({
          id: "ffce1bdf-4b5b-4da4-bb49-6ec64b3d713c",
          battle,
          text: `[특성 둔감] ${defPokemon.names} 도발에 넘어가지 않는다!`,
        });
        return;
      }
      if (defPokemon.tempStatus.taunt !== null) {
        enqueue({
          id: "67cc957c-5b25-46f2-8579-0a8d498082cb",
          battle,
          text: "하지만 실패했다!",
        });
      } else {
        let num = 4;
        if (battle.turn.fastActUser === battle.turn.atk || !battle[battle.turn.fastActUser].turn.useSkill) {
          // 선도발을 썼거나                                   교체해서 나온 상대방이 도발을 맞은 경우
          num = 3;
          // 그 턴 포함 3턴
        }
        // 후도발의 경우 그 다음턴 부터 3턴
        // 도발은 3'턴'이 아닌 3'회' 적의 변화기를 막는다.
        defPokemon.tempStatus.taunt = num;
        enqueue({
          id: "c66c9e96-f65c-4ad0-a59d-d9708ab78329",
          battle,
          text: defPokemon.names + " 도발에 넘어가 버렸다!",
        });
      }
    },

    트릭: (battle, enqueue, skillEffect) => {
      const def = battle[battle.turn.def];
      const atk = battle[battle.turn.atk];

      if (noNullItem.includes(atk.item) || noNullItem.includes(def.item)) {
        enqueue({
          id: "cf71f074-0b88-47a6-9a96-39972116a572",
          battle,
          text: "하지만 실패했다!",
        });
        return;
      }
      // 아이템 교환
      [atk.item, def.item] = [def.item, atk.item];
      [atk.itemText, def.itemText] = [def.itemText, atk.itemText];

      // 구애 시리즈로 고정된 스킬 초기화
      if (atk.abil !== "무아지경") atk.tempStatus.onlySkill = null;
      if (def.abil !== "무아지경") def.tempStatus.onlySkill = null;
      enqueue({
        id: "ea3b5107-90e2-4c4e-8cba-60e3b48af238",
        battle,
        text: atk.names + " 서로의 도구를 교체했다!",
      });
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
      if (!atkPokemon.faint) {
        atkPokemon.recharge = true;
        atkPokemon.autoSN = battle[battle.turn.atk].turn.choice;
      }
    },

    씨뿌리기: (battle, enqueue, skillEffect) => {
      const def = battle.turn.def;
      const defPokemon = battle[def];
      if (defPokemon.tempStatus.seed !== null || defPokemon.type1 === "풀" || defPokemon.type2 === "풀") {
        enqueue({
          id: "98bdd9de-3aea-4b4b-a9b5-8ad3f2c4b473",
          battle,
          text: "하지만 실패했다!",
        });
      } else {
        defPokemon.tempStatus.seed = true;
        enqueue({
          id: "b5e68e7e-61bb-4948-8f48-eb4084c935ae",
          battle,
          text: defPokemon.name + "에게 씨앗을 심었다!",
        });
      }
    },
    배북: (battle, enqueue, skillEffect) => {
      const atk = battle.turn.atk;
      const atkPokemon = battle[atk];
      const needHp = Math.floor(atkPokemon.origin.hp / 2);

      if (atkPokemon.hp <= needHp || atkPokemon.tempStatus.rank.atk >= 6) {
        enqueue({
          id: "dc3196d7-c4af-40bf-b5e4-8edf01535650",
          battle,
          text: "하지만 실패했다!",
        });
        return;
      }

      atkPokemon.getDamage(battle, enqueue, needHp, `${atkPokemon.names} 체력을 깎아 파워를 최대로 올렸다!`);
      if (atkPokemon.faint) return;
      atkPokemon.rankUp(battle, enqueue, "atk", 12);
    },
    대타출동: (battle, enqueue, skillEffect) => {
      const atk = battle.turn.atk;
      const atkPokemon = battle[atk];
      const needHp = Math.floor(atkPokemon.origin.hp / 4);

      if (atkPokemon.tempStatus.substitute !== null || atkPokemon.hp <= needHp) {
        enqueue({
          id: "9ebed236-fd8e-4b63-a745-ee0f3a9fa3ef",
          battle,
          text: "하지만 실패했다!",
        });
      } else {
        atkPokemon.tempStatus.substitute = true;
        atkPokemon.tempStatus.substituteHp = needHp;
        atkPokemon.turn.substitute = true;
        atkPokemon.getDamage(battle, enqueue, needHp, atkPokemon.name + "의 대타가 나타났다!");
      }
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
        enqueue({ id: "68712ac3-ad21-42de-a0e1-2844d01d46fa", battle, text: atk.names + " 자신의 필드를 정리했다!" });
      }
      if (atk.tempStatus.seed) {
        //씨뿌리기 제거
        atk.tempStatus.seed = null;
        enqueue({ id: "312f9c6b-4ae8-4730-96f4-bf6d2d408f4e", battle, text: atk.names + " 씨뿌리기에게서 벗어났다!" });
      }
      if (atk.tempStatus.switchLock) {
        let skillName = atk.tempStatus.switchLock;
        //교체불가 제거
        atk.tempStatus.switchLock = null;
        atk.tempStatus.switchLockTurnRemain = null;
        enqueue({
          id: "c1ec77c2-36ef-434a-aa47-cba739355644",
          battle,
          text: atk.names + " " + skillName + "에게서 벗어났다!",
        });
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

      if (atk.hp !== atk.origin.hp) {
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
        enqueue({ id: "4255ff9b-961a-428c-9cfe-05a52ef07753", battle, text: def.names + " " + skillEffect.text });
      }
    },

    능력치초기화: (battle, enqueue, skillEffect) => {
      // 능력치 변화가 없어도 발동은 된다
      const skill = battle[battle.turn.atk]?.turn?.useSkill;
      if ((skill?.stype === "atk" || skill?.stype === "catk") && isTargetSubstituteBlocked(battle)) return;
      const def = battle[battle.turn.def];
      def.resetRank();
      enqueue({
        id: "5ae8c51d-ea8f-4c3c-ad7d-7f214c63a523",
        battle,
        text: def.name + "의 능력치 변화가 원래대로 되돌아갔다!",
      });
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
      enqueue({ id: "b7c2e8a1-4d3f-4e6a-9b1c-2f5d8e7a0c31", battle, text: atk.names + " 상대를 길동무로 삼으려 하고 있다!" });
    },
    목숨걸기: (battle, enqueue, skillEffect) => {
      battle[battle.turn.atk].handleFaint(battle, enqueue);
    },
    자폭: (battle, enqueue, skillEffect) => {
      battle[battle.turn.atk].handleFaint(battle, enqueue);
    },
    철제광선반동: (battle, enqueue, skillEffect) => {
      const atkPokemon = battle[battle.turn.atk];
      if (atkPokemon.turn.steelBeamRecoilDone) return;
      atkPokemon.turn.steelBeamRecoilDone = true;
      const damage = Math.ceil(atkPokemon.origin.hp / 2);
      const text = atkPokemon.names + " 반동으로 데미지를 입었다!";
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
        amount: Math.floor(skillUser.origin.hp / 2),
        turnRemain: 1,
      };
      battle.field[battle.turn.atk].handleWish(battle, enqueue, wishObj);
    },

    리플렉터: (battle, enqueue, skillEffect) => {
      const user = battle.turn.atk;
      const skillUser = battle[user];
      const field = battle.field[user].noClean;
      if (field.reflect !== null) {
        enqueue({
          id: "fcccce9e-4c53-4ad3-b6e5-2052f60e565c",
          battle,
          text: "하지만 실패했다!",
        });
        return;
      }
      let num = 5;
      if (skillUser.item === "빛의점토") num = 8;
      battle.field[user].noClean.reflect = num;
      enqueue({
        id: "95b7f21f-b6c4-4d47-b6c5-67d4741682e4",
        battle,
        text: battle.common[user].teamKr + " 편은 리플렉터로 물리공격에 강해졌다!",
      });
    },

    빛의장막: (battle, enqueue, skillEffect) => {
      const user = battle.turn.atk;
      const skillUser = battle[user];
      const field = battle.field[user].noClean;
      if (field.lightScreen !== null) {
        enqueue({
          id: "7d39c72d-fabb-46a6-a73e-925ed031f01b",
          battle,
          text: "하지만 실패했다!",
        });
        return;
      }
      let num = 5;
      if (skillUser.item === "빛의점토") num = 8;
      battle.field[user].noClean.lightScreen = num;
      enqueue({
        id: "28c03b92-8494-44c6-ba42-9725e203fc6f",
        battle,
        text: battle.common[user].teamKr + " 편은 빛의장막으로 특수공격에 강해졌다!",
      });
    },

    오로라베일: (battle, enqueue, skillEffect) => {
      const user = battle.turn.atk;
      const skillUser = battle[user];
      const field = battle.field[user].noClean;
      // 설경이 아니거나 이미 오로라베일이 있으면 실패
      if (!battle.field.weather.isSnow || field.auroraVeil !== null) {
        enqueue({
          id: "a89d6c3d-6c8f-44f1-8866-34ea01fd934d",
          battle,
          text: "하지만 실패했다!",
        });
        return;
      }
      let num = 5;
      if (skillUser.item === "빛의점토") num = 8;
      field.auroraVeil = num;
      enqueue({
        id: "4de313b1-64ec-4418-bbce-1c6e5f8ffa5e",
        battle,
        text: battle.common[user].teamKr + " 편은 오로라베일로 물리공격과 특수공격에 강해졌다!",
      });
    },

    순풍: (battle, enqueue, skillEffect) => {
      const user = battle.turn.atk;
      const field = battle.field[user].noClean;
      if (field.tailwind !== null) {
        enqueue({
          id: "91e99e57-c597-4c6d-b2f1-de39f86cd278",
          battle,
          text: "하지만 실패했다!",
        });
        return;
      }
      field.tailwind = 4;
      enqueue({
        id: "11741873-ba17-40aa-9c9e-f2213707f877",
        battle,
        text: battle.common[user].teamKr + " 편의 뒤에서 순풍이 불기 시작했다!",
      });
    },

    벽부수기: (battle, enqueue, skillEffect) => {
      const def = battle.turn.def;
      const field = battle.field[def].noClean;
      if (field.reflect === null && field.lightScreen === null && field.auroraVeil === null) {
        return;
      }
      if (field.reflect !== null) {
        field.reflect = null;
        enqueue({
          id: "fa56e285-7f15-4487-b919-4d13905c1e42",
          battle,
          text: battle.common[battle.turn.def].teamKr + " 편의 리플렉터가 깨졌다!",
        });
      }
      if (field.lightScreen !== null) {
        field.lightScreen = null;
        enqueue({
          id: "b528d8e6-6c13-460f-9afe-06f645fa0707",
          battle,
          text: battle.common[battle.turn.def].teamKr + " 편의 빛의장막이 깨졌다!",
        });
      }
      if (field.auroraVeil !== null) {
        field.auroraVeil = null;
        enqueue({
          id: "a5ee6350-521b-490c-827c-f1deebd21e2a",
          battle,
          text: battle.common[battle.turn.def].teamKr + " 편의 오로라베일이 깨졌다!",
        });
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
  } else {
    // 둘다 기절한경우 울부짖기, 날려버리기 실패 텍스트 출력
    // 드래곤테일은 텍스트는 뜨지 않는다
    const skill = battle[battle.turn.atk]?.turn?.useSkill;
    if (skill?.stype !== "atk" && skill?.stype !== "catk") {
      enqueue({ id: "474bbad7-726d-4802-a13f-0677abd8bacf", battle, text: "하지만 실패했다!" });
    }
  }
};
