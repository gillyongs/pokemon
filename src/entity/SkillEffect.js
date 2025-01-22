import { damage } from "../service/damage";
import { random } from "../util/randomCheck";
import { rank } from "../service/rank";
import { recover } from "../service/recover";

const statusCheck = (status) => {
  return Object.values(status).some((value) => value !== null);
};

function skillEffectSearch(name) {
  const functions = {
    화상: (battle, enqueue, skillEffect) => {
      let def = battle[battle.turn.def];
      if (def.type1 === "불꽃" || def.type2 === "불꽃") {
        return;
      }
      if (statusCheck(def.status)) {
        //이미 걸린 상태이상이 있는지 체크
        return;
      }
      if (random(100 - skillEffect.probability)) {
        // 10% 확률로 화상
        return;
      }
      let fireText = battle[battle.turn.def].names + " 화상을 입었다!";
      def.status.burn = true;
      enqueue({
        battle: battle,
        text: fireText,
      });
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
    독: (battle, enqueue, skillEffect) => {
      let def = battle[battle.turn.def];
      if (
        def.type1 === "독" ||
        def.type2 === "독" ||
        def.type1 === "강철" ||
        def.type2 === "강철"
      ) {
        return;
      }
      if (statusCheck(def.status)) {
        //이미 걸린 상태이상이 있는지 체크
        return;
      }
      if (random(100 - skillEffect.probability)) {
        // 정해진 확률에 따라 부여
        return;
      }
      let poisionText = battle[battle.turn.def].name + "의 몸에 독이 퍼졌다!";
      def.status.poision = true;
      enqueue({
        battle: battle,
        text: poisionText,
      });
    },
    마비: (battle, enqueue, skillEffect) => {
      let def = battle[battle.turn.def];
      if (def.type1 === "전기" || def.type2 === "전기") {
        return;
      }
      if (statusCheck(def.status)) {
        //이미 걸린 상태이상이 있는지 체크
        return;
      }
      if (random(100 - skillEffect.probability)) {
        // 정해진 확률에 따라 부여
        return;
      }
      let mabiText =
        battle[battle.turn.def].names + " 마비되어 기술이 나오기 어려워졌다!";
      def.status.mabi = true;
      enqueue({
        battle: battle,
        text: mabiText,
      });
    },
    혼란: (battle, enqueue, skillEffect) => {
      let def = battle[battle.turn.def];
      if (def.tempStatus.confuse !== null) {
        //이미 걸린 상태이상이 있는지 체크
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
