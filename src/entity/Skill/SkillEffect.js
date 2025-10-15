import { damage } from "../../function/damage";
import { random } from "../../util/randomCheck";
import { rank } from "../../function/rank";
import { recover } from "../../function/recover";
import { burn, mabi, poison, freeze } from "../../function/statusError";
import { josa } from "josa";
import { noNullItem } from "../Item";
import { switchNpc, switchPlayerForce } from "../../service/switch";

function skillEffectSearch(name) {
  const functions = {
    공통: (battle, enqueue, skillEffect) => {
      let atk = battle[battle.turn.atk];
      let def = battle[battle.turn.def];
      let sk = atk.origin["sk" + battle.turn.atkSN];
      let touch = sk.feature.touch;
      if (sk.feature.punch && atk.item === "펀치글러브") {
        touch = false;
      }
      if (atk.item === "생명의구슬" && !atk.faint) {
        if (sk.stype === "atk" || sk.stype === "catk") {
          const text = atk.name + "의 생명이 조금 깎였다!";
          damage(battle, atk.origin.hp / 10, battle.turn.atk, enqueue, text);
        }
      }
      if (def.abil === "정전기" && touch && !atk.faint) {
        if (random(30)) {
          mabi(battle, battle.turn.atk, enqueue, true);
        }
      }
      if (def.item === "울퉁불퉁멧" && touch && !atk.faint) {
        const text = atk.names + " 울퉁불퉁멧 때문에 데미지를 입었다!";
        damage(battle, atk.origin.hp / 6, battle.turn.atk, enqueue, text);
      }
    },

    연격: (battle, enqueue, skillEffect) => {
      let atk = battle[battle.turn.atk];
      let def = battle[battle.turn.def];
      let sk = atk.origin["sk" + battle.turn.atkSN];
      let touch = sk.feature.touch;
      if (sk.feature.punch && atk.item === "펀치글러브") {
        touch = false;
      }
      if (def.abil === "정전기" && touch && !atk.faint) {
        if (random(30)) {
          mabi(battle, battle.turn.atk, enqueue, true);
        }
      }
      if (def.item === "울퉁불퉁멧" && touch && !atk.faint) {
        const text = atk.names + " 울퉁불퉁멧 때문에 데미지를 입었다!";
        damage(battle, atk.origin.hp / 6, battle.turn.atk, enqueue, text);
      }
    },

    능력치증감: (battle, enqueue, skillEffect) => {
      if (random(100 - skillEffect.probability)) {
        return;
      }
      const target = battle.turn[skillEffect.target];
      if (battle[target].faint) {
        return;
      }
      rank(battle, enqueue, target, skillEffect.abil, skillEffect.value);
    },

    화상: (battle, enqueue, skillEffect) => {
      if (random(100 - skillEffect.probability)) {
        return;
      }
      burn(battle, battle.turn.def, enqueue);
    },
    독: (battle, enqueue, skillEffect) => {
      if (random(100 - skillEffect.probability)) {
        return;
      }
      poison(battle, battle.turn.def, enqueue);
    },
    마비: (battle, enqueue, skillEffect) => {
      if (random(100 - skillEffect.probability)) {
        return;
      }
      mabi(battle, battle.turn.def, enqueue);
    },
    얼음: (battle, enqueue, skillEffect) => {
      if (random(100 - skillEffect.probability)) {
        return;
      }
      freeze(battle, battle.turn.def, enqueue);
    },

    얼음치료: (battle, enqueue, skillEffect) => {
      let def = battle[battle.turn.def];
      if (def.status.freeze == null) {
        return;
      }
      if (def.faint) {
        return;
      }
      let freezeCureText = def.name + "의 얼음이 녹았다!";
      def.status.freeze = null;
      enqueue({
        battle: battle,
        text: freezeCureText,
      });
    },
    풀죽음: (battle, enqueue, skillEffect) => {
      let def = battle[battle.turn.def];
      if (random(100 - skillEffect.probability)) {
        return;
      }
      def.temp.fullDeath = true;
    },
    빗나감패널티: (battle, enqueue, skillEffect) => {
      let atk = battle[battle.turn.atk];
      if (atk.temp.miss) {
        const text = atk.names + " 의욕이 넘쳐 땅에 부딪쳤다!";
        damage(battle, atk.origin.hp / 2, battle.turn.atk, enqueue, text);
      }
    },

    혼란: (battle, enqueue, skillEffect) => {
      let def = battle[battle.turn.def];
      if (def.tempStatus.confuse !== null) {
        //이미 혼란에 걸려있는지 체크
        return;
      }
      if (def.faint) {
        return;
      }
      if (random(skillEffect.probability)) {
        // 정해진 확률에 따라 부여
        const getConfuseTurn = () => {
          return Math.floor(Math.random() * 4) + 1;
        };
        def.tempStatus.confuse = true;
        def.tempStatus.confuseTurnRemain = getConfuseTurn();
        let confuseText = battle[battle.turn.def].names + " 혼란에 빠졌다!";
        enqueue({
          battle: battle,
          text: confuseText,
        });
        return;
      }
    },
    회복: (battle, enqueue, skillEffect) => {
      const hp = battle[battle.turn.atk].origin.hp;
      recover(battle, Math.floor(hp / 2), battle.turn.atk, enqueue);
    },
    날개쉬기: (battle, enqueue, skillEffect) => {
      const pokemon = battle[battle.turn.atk];
      if (pokemon.type1 !== "비행" && pokemon.type2 !== "비행") {
        return;
      }
      pokemon.temp.roost = true;
      if (pokemon.type1 === "비행") {
        if (pokemon.type2 !== null) {
          pokemon.type1 = null;
        }
        if (pokemon.type2 === null) {
          pokemon.type1 = "노말";
        }
      } else if (pokemon.type2 === "비행") {
        if (pokemon.type1 !== null) {
          pokemon.type2 = null;
        }
        if (pokemon.type1 === null) {
          pokemon.type2 = "노말";
        }
      }
    },
    탁떨: (battle, enqueue, skillEffect) => {
      const def = battle[battle.turn.def];
      const itemName = def.item;

      if (itemName !== null && !noNullItem.includes(itemName)) {
        def.item = null;
        def.tempStatus.onlySkill = null; // 구애 시리즈로 고정된 스킬
        enqueue({
          battle,
          text: def.name + "의 " + josa(`${itemName}#{를} `) + "탁쳐서 떨구었다!",
        });
      }
    },
    유턴: (battle, enqueue, skillEffect) => {
      if (battle.turn.atk === "player") {
        battle.uturn = true;
        battle.turn.textFreeze = true;
        enqueue({
          battle,
          text: "누구로 교체할까?",
        });
      } else if (battle.turn.atk === "npc") {
        if (battle.npcBench1.faint !== true) {
          // 1번이 기절 안했으면 1번 교체
          switchNpc(battle, "npcBench1", enqueue);
        } else if (battle.npcBench2.faint !== true && battle.npcBench1.faint === true) {
          //1번 기절했고 2번 기절 안했으면 2번 교체
          switchNpc(battle, "npcBench2", enqueue);
        }
      }
    },
    반동: (battle, enqueue, skillEffect) => {
      let atk = battle[battle.turn.atk];
      const text = atk.names + " 반동으로 데미지를 입었다!";
      damage(battle, atk.temp.recentDamageGive / 3, battle.turn.atk, enqueue, text);
    },
    하품: (battle, enqueue, skillEffect) => {
      const def = battle[battle.turn.def];
      if (!statusCheck(def.status) && def.tempStatus.hapum !== 1 && def.tempStatus.hapum !== 0) {
        def.tempStatus.hapum = 1;
        enqueue({
          battle,
          text: def.name + "의 " + "졸음을 유도했다!",
        });
      } else {
        enqueue({
          battle,
          text: "하지만 실패했다!",
        });
      }
    },
    방어: (battle, enqueue, skillEffect) => {
      const skillUser = battle[battle.turn.atk];
      const protectUse = skillUser.tempStatus.protectUse; //방어 연속 사용 횟수
      let protectSuccess = false;
      if (!protectUse) {
        // 1회차 반드시 성공
        protectSuccess = true;
      } else if (protectUse === 1) {
        protectSuccess = random(33);
      } else if (protectUse === 2) {
        protectSuccess = random(11);
      } else if (protectUse > 2) {
        protectSuccess = random(4);
      }
      if (protectSuccess) {
        skillUser.temp.protect = true;
        if (!protectUse) {
          skillUser.tempStatus.protectUse = 1;
        } else {
          skillUser.tempStatus.protectUse += 1;
        }

        enqueue({
          battle,
          text: skillUser.names + " 방어 태세에 들어갔다!",
        });
      } else {
        skillUser.tempStatus.protectUse = null;
        enqueue({
          battle,
          text: "하지만 실패했다!",
        });
      }
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
          battle,
          text: sRockText,
        });
      } else {
        enqueue({
          battle,
          text: "하지만 실패했다!",
        });
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
          battle,
          text: sRockText,
        });
      } else {
        enqueue({
          battle,
          text: "하지만 실패했다!",
        });
      }
    },

    강제교체: (battle, enqueue, skillEffect) => {
      if (battle.turn.atk === "player") {
        // 플레이어가 강제교체 시 NPC가 교체됨
        handleForceSwitch(battle, enqueue, "npcBench1", "npcBench2", switchNpc);
      } else if (battle.turn.atk === "npc") {
        // NPC가 강제교체 시 플레이어가 교체됨
        handleForceSwitch(battle, enqueue, "playerBench1", "playerBench2", switchPlayerForce);
      }
    },

    도발: (battle, enqueue, skillEffect) => {
      const def = battle.turn.def;
      const defPokemon = battle[def];
      if (defPokemon.tempStatus.taunt !== null) {
        enqueue({
          battle,
          text: "하지만 실패했다!",
        });
      } else {
        defPokemon.tempStatus.taunt = 3;
        enqueue({
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
          battle,
          text: "하지만 실패했다!",
        });
        return;
      }
      // 아이템 교환
      [atk.item, def.item] = [def.item, atk.item];
      [atk.itemText, def.itemText] = [def.itemText, atk.itemText];

      // 구애 시리즈로 고정된 스킬 초기화
      atk.tempStatus.onlySkill = null;
      def.tempStatus.onlySkill = null;
      enqueue({
        battle,
        text: atk.names + " 서로의 도구를 교체했다!",
      });
    },
    트릭룸: (battle, enqueue, skillEffect) => {
      const atk = battle[battle.turn.atk];
      if (battle.field.trickRoom === null) {
        battle.field.trickRoom = 5;
        enqueue({
          battle,
          text: atk.names + " 시공을 뒤틀었다!",
        });
      } else {
        enqueue({
          battle,
          text: "하지만 실패했다!",
        });
      }
    },
    자동: (battle, enqueue, skillEffect) => {
      const atk = battle[battle.turn.atk];
      if (atk.auto !== null) {
        return;
      }
      atk.auto = Math.random() < 0.5 ? 2 : 3;
      atk.autoSN = battle.turn[battle.turn.atk + "SN"];
    },

    씨뿌리기: (battle, enqueue, skillEffect) => {
      const def = battle.turn.def;
      const defPokemon = battle[def];
      if (defPokemon.tempStatus.seed !== null || defPokemon.type1 === "풀" || defPokemon.type2 === "풀") {
        enqueue({
          battle,
          text: "하지만 실패했다!",
        });
      } else {
        defPokemon.tempStatus.seed = true;
        enqueue({
          battle,
          text: defPokemon.name + "에게 씨앗을 심었다!",
        });
      }
    },
    대타출동: (battle, enqueue, skillEffect) => {
      const atk = battle.turn.atk;
      const atkPokemon = battle[atk];
      const needHp = Math.floor(atkPokemon.origin.hp / 4);

      if (atkPokemon.tempStatus.substitute !== null || atkPokemon.hp <= needHp) {
        enqueue({
          battle,
          text: "하지만 실패했다!",
        });
      } else {
        atkPokemon.tempStatus.substitute = true;
        atkPokemon.tempStatus.substituteHp = needHp;
        damage(battle, needHp, battle.turn.atk, enqueue, atkPokemon.name + "의 대타가 나타났다!");
      }
    },

    스핀: (battle, enqueue, skillEffect) => {
      const def = battle[battle.turn.def];
      const atk = battle[battle.turn.atk];
      const field = battle.field[battle.turn.atk];
      Object.keys(field).forEach((key) => {
        //장판 제거
        field[key] = null;
      });
      if (atk.tempStatus.seed) {
        //씨뿌리기 제거
        atk.tempStatus.seed = null;
      }
    },
  };

  return functions[name] || null;
}

export default skillEffectSearch;

const statusCheck = (status) => {
  return Object.values(status).some((value) => value !== null);
};

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
    //둘다 기절한경우 실패
    enqueue({ battle, text: "하지만 실패했다!" });
  }
};
