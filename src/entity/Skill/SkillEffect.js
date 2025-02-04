import { damage } from "../../function/damage";
import { random } from "../../util/randomCheck";
import { rank } from "../../function/rank";
import { recover } from "../../function/recover";
import { burn, mabi, poision } from "../../function/statusError";

function skillEffectSearch(name) {
  const functions = {
    공통: (battle, enqueue, skillEffect) => {
      let atk = battle[battle.turn.atk];
      let def = battle[battle.turn.def];
      let sk = atk.origin["sk" + battle.turn.atkSN];
      if (atk.item === "생명의구슬") {
        if (sk.stype === "atk" || sk.stype === "catk") {
          enqueue({
            battle: battle,
            text: atk.name + "의 생명이 조금 깎였다!",
          });
          damage(battle, atk.origin.hp, battle.turn.atk, enqueue);
        }
      }
      if (def.abil === "정전기" && sk.touch) {
        if (random(30)) {
          mabi(battle, battle.turn.atk, enqueue, true);
        }
      }
    },

    능력치증감: (battle, enqueue, skillEffect) => {
      if (random(100 - skillEffect.probability)) {
        return;
      }
      rank(
        battle,
        enqueue,
        battle.turn[skillEffect.target],
        skillEffect.abil,
        skillEffect.value
      );
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
      poision(battle, battle.turn.def, enqueue);
    },
    마비: (battle, enqueue, skillEffect) => {
      if (random(100 - skillEffect.probability)) {
        return;
      }
      mabi(battle, battle.turn.def, enqueue);
    },

    얼음치료: (battle, enqueue, skillEffect) => {
      let def = battle[battle.turn.def];
      if (def.status.freeze == null) {
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
        enqueue({
          battle: battle,
          text: atk.names + " 의욕이 넘쳐 땅에 부딪쳤다!",
        });
        damage(battle, atk.origin.hp / 2, battle.turn.atk, enqueue);
      }
    },

    혼란: (battle, enqueue, skillEffect) => {
      let def = battle[battle.turn.def];
      if (def.tempStatus.confuse !== null) {
        //이미 혼란에 걸려있는지 체크
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
  };

  return functions[name] || null;
}

export default skillEffectSearch;
