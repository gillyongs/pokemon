import { damage, handleFaint } from "../../function/damage";
import { random } from "../../util/randomCheck";
import { rank, rankReset } from "../../function/rankStat";
import { recover, recoverNoText } from "../../function/recover";
import { burn, mabi, poison, freeze, confuse, pokemonNoStatusCheck } from "../../function/statusCondition";
import { josa } from "josa";
import { noNullItem } from "../Item";
import { switchNpc, switchPlayer, switchPlayerForce } from "../../service/switch";

function skillEffectSearch(name) {
  const functions = {
    공통: (battle, enqueue, skillEffect) => {
      let atk = battle[battle.turn.atk];
      let def = battle[battle.turn.def];
      let sk = atk.origin["sk" + battle.turn.atkSN];
      if (atk.item === "생명의구슬" && !atk.faint) {
        if (sk.stype === "atk" || sk.stype === "catk") {
          const text = atk.name + "의 생명이 조금 깎였다!";
          damage(battle, atk.origin.hp / 10, battle.turn.atk, enqueue, text);
        }
      }
      if (def.status.freeze && !def.faint) {
        // 얼음치료와 상태이상 부여 이벤트가 동시에 있으면 상태이상 부여가 먼저 발생한다
        // => 상태이상 부여가 실패하고 얼음이 녹아 상태이상이 없는 상태가 된다
        const meltSkills = ["열탕", "스팀버스트", "열사의대지", "휘적휘적포"];
        if (sk.type === "불꽃" || meltSkills.includes(sk.name)) {
          let freezeCureText = def.name + "의 얼음이 녹았다!";
          def.status.freeze = null;
          enqueue({
            battle: battle,
            text: freezeCureText,
          });
        }
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
      // 반대로 랭크업을 주는쪽은
      // 기절해도 정상적으로 적용된다
      rank(battle, enqueue, target, skillEffect.abil, skillEffect.value);
    },

    화상: (battle, enqueue, skillEffect) => {
      if (random(100 - skillEffect.probability)) {
        return;
      }
      burn(battle, battle.turn.def, enqueue, null, skillEffect.failText);
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
      mabi(battle, battle.turn.def, enqueue, skillEffect.failText);
    },
    얼음: (battle, enqueue, skillEffect) => {
      if (random(100 - skillEffect.probability)) {
        return;
      }
      freeze(battle, battle.turn.def, enqueue);
    },
    트라이어택: (battle, enqueue, skillEffect) => {
      // 20% 확률로 상태이상을 걸고,
      // 상태이상이 걸릴때 각각 33% 확률로 화상 마비 얼음중 하나가 결정
      if (random(100 - skillEffect.probability)) {
        return;
      }
      const r = Math.random();
      if (r < 1 / 3) freeze(battle, battle.turn.def, enqueue);
      else if (r < 2 / 3) mabi(battle, battle.turn.def, enqueue);
      else return burn(battle, battle.turn.def, enqueue);
    },
    혼란: (battle, enqueue, skillEffect) => {
      if (random(100 - skillEffect.probability)) {
        return;
      }
      confuse(battle, battle.turn.def, enqueue);
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
      if (atk.temp.jumpKickFail) {
        const text = atk.names + " 의욕이 넘쳐 땅에 부딪쳤다!";
        damage(battle, atk.origin.hp / 2, battle.turn.atk, enqueue, text);
      }
    },
    회복: (battle, enqueue, skillEffect) => {
      const hp = battle[battle.turn.atk].origin.hp;
      recover(battle, Math.floor(hp / 2), battle.turn.atk, enqueue);
    },
    아침햇살: (battle, enqueue, skillEffect) => {
      const hp = battle[battle.turn.atk].origin.hp;
      let value = hp / 2;
      if (battle.field.weather === null) {
        value = hp / 2;
      }
      if (battle.field.weather === "쾌청") {
        value = (hp * 2) / 3;
      } else {
        value = hp / 4;
      }
      recover(battle, Math.floor(value), battle.turn.atk, enqueue);
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
      const atk = battle[battle.turn.atk];
      const def = battle[battle.turn.def];
      const itemName = def.item;

      if (itemName !== null && !noNullItem.includes(itemName) && !atk.faint) {
        // 대부분 아이템이 발동하고 떨어진다 (ex: 기합의띠)
        // 울멧이나 철가시로 공격자가 기절하면 아이템은 떨구지 못한다
        // 약보 : 추가뎀은 무조건 적용. 악타입 약점이면 아이템이 써지고 아니면 떨어진다
        // 탈출버튼, 레드카드, 나무열매 : 발동하지 않고 떨어진다
        def.item = null;
        def.tempStatus.onlySkill = null; // 구애 시리즈로 고정된 스킬
        enqueue({
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
          battle.common.temp.uturn = true;
          // battlStart.js에서 이를 기준으로 함수를 끊고
          // battleScrren.js에서 useEffect(setBottom("uturn"))으로 교체화면을 띄운다

          battle.turn.textFreeze = true; // 텍스트가 넘어가지 않게 처리
          enqueue({
            battle,
            text: "누구로 교체할까?",
          });
        }
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
      if (pokemonNoStatusCheck(def) && def.tempStatus.hapum !== 1 && def.tempStatus.hapum !== 0) {
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
      // 방어 성공 여부는 skillRequirement에서 처리
      const skillUser = battle[battle.turn.atk];
      skillUser.temp.protect = true;
      enqueue({
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
        let num = 4;
        if (battle.turn.fastActUser === battle.turn.atk || !battle[battle.turn.fastActUser].temp.useSkill) {
          // 선도발을 썼거나                                   교체해서 나온 상대방이 도발을 맞은 경우
          num = 3;
          // 그 턴 포함 3턴
        }
        //후도발의 경우 그 다음턴 부터 3턴
        defPokemon.tempStatus.taunt = num;
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
        //트릭룸 두번쓰면 없어진다
        battle.field.trickRoom = null;
        enqueue({ battle, text: "뒤틀린 시공이 원래대로 되돌아왔다!" });
      }
    },
    자동: (battle, enqueue, skillEffect) => {
      // 역린
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
      //방어로 막히면 안되는게 맞음
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
        enqueue({ battle, text: atk.names + " 씨뿌리기에게서 벗어났다!" });
      }
      if (atk.tempStatus.switchLock) {
        let skillName = atk.tempStatus.switchLock;
        //교체불가 제거
        atk.tempStatus.switchLock = null;
        atk.tempStatus.switchLockTurnRemain = null;
        enqueue({ battle, text: atk.names + " " + skillName + "에게서 벗어났다!" });
      }
    },

    흡수: (battle, enqueue, skillEffect) => {
      //풀피면 체력 회복 안되고 -> 생구 터짐

      let atk = battle[battle.turn.atk];
      const def = battle[battle.turn.def];
      const text = josa(`${def.name}#{으로}`) + "부터 체력을 흡수했다!";

      if (atk.hp !== atk.origin.hp) {
        recoverNoText(battle, (atk.temp.recentDamageGive * 3) / 4, battle.turn.atk);
        enqueue({
          battle,
          text: text,
        });
      }
    },

    구속: (battle, enqueue, skillEffect) => {
      const def = battle[battle.turn.def];
      if (def.tempStatus.switchLock === null && !def.faint) {
        def.tempStatus.switchLock = skillEffect.skillName;
        def.tempStatus.switchLockTurnRemain = Math.random() < 0.5 ? 4 : 5;
        //4~5턴인데 확률은 모르겠음
        enqueue({ battle, text: def.names + " " + skillEffect.text });
      }
    },

    능력치초기화: (battle, enqueue, skillEffect) => {
      // 능력치 변화가 없어도 발동은 된다
      const def = battle[battle.turn.def];
      rankReset(def);
      enqueue({
        battle,
        text: def.name + "의 능력치 변화가 원래대로 되돌아갔다!",
      });
    },
    치유소원: (battle, enqueue, skillEffect) => {
      // 연속 사용해도 실패하지 않는다 (하지만 효과가 중첩되지도 않는다)
      const skillUser = battle[battle.turn.atk];
      battle.field.noClean[battle.turn.atk].healingWish = true;
      handleFaint(skillUser, enqueue, battle);
    },
    초승달춤: (battle, enqueue, skillEffect) => {
      const skillUser = battle[battle.turn.atk];
      battle.field.noClean[battle.turn.atk].lunarDance = true;
      handleFaint(skillUser, enqueue, battle);
    },

    희망사항: (battle, enqueue, skillEffect) => {
      if (battle.field.noClean[battle.turn.atk].wish !== null) {
        //연속사용 안됨
        enqueue({
          battle,
          text: "하지만 실패했다!",
        });
        return;
      }
      const skillUser = battle[battle.turn.atk];
      battle.field.noClean[battle.turn.atk].wish = { name: skillUser.name, amount: Math.floor(skillUser.origin.hp / 2), turnRemain: 1 };
      // 희망사항의 회복량은 시전자 체력의 절반
    },

    리플렉터: (battle, enqueue, skillEffect) => {
      const user = battle.turn.atk;
      const skillUser = battle[user];
      const field = battle.field.noClean[user];
      if (field.reflect !== null) {
        enqueue({
          battle,
          text: "하지만 실패했다!",
        });
        return;
      }
      let num = 5;
      if (skillUser.item === "빛의점토") num = 8;
      battle.field.noClean[user].reflect = num;
      enqueue({
        battle,
        text: battle.common[user].teamKr + " 편은 리플렉터로 물리공격에 강해졌다!",
      });
    },

    빛의장막: (battle, enqueue, skillEffect) => {
      const user = battle.turn.atk;
      const skillUser = battle[user];
      const field = battle.field.noClean[user];
      if (field.lightScreen !== null) {
        enqueue({
          battle,
          text: "하지만 실패했다!",
        });
        return;
      }
      let num = 5;
      if (skillUser.item === "빛의점토") num = 8;
      battle.field.noClean[user].lightScreen = num;
      enqueue({
        battle,
        text: battle.common[user].teamKr + " 편은 빛의장막으로 특수공격에 강해졌다!",
      });
    },

    벽부수기: (battle, enqueue, skillEffect) => {
      const def = battle.turn.def;
      if (battle.field.noClean[def].reflect === null && battle.field.noClean[def].lightScreen === null) {
        return;
      }
      if (battle.field.noClean[def].reflect !== null) {
        battle.field.noClean[def].reflect = null;
        enqueue({
          battle,
          text: battle.common[battle.turn.def].teamKr + " 편의 리플렉터가 깨졌다!",
        });
      }
      if (battle.field.noClean[def].lightScreen !== null) {
        battle.field.noClean[def].lightScreen = null;
        enqueue({
          battle,
          text: battle.common[battle.turn.def].teamKr + " 편의 빛의장막이 깨졌다!",
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
    //둘다 기절한경우 실패
    enqueue({ battle, text: "하지만 실패했다!" });
  }
};
