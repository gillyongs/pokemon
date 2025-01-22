import { damage } from "../service/damage";
import { random } from "../util/randomCheck";
import { rank } from "../service/rank";

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
        battle[skillEffect.target],
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
  };

  return functions[name] || null;
}

export default skillEffectSearch;
