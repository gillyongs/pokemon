import { random } from "../../util/randomCheck";

function skillRequirementSearch(name) {
  const functions = {
    기습: (battle, enqueue) => {
      if (battle.turn.atk !== battle.turn.fastActUser) {
        return false;
      }
      const stype = battle[battle.turn.def].temp.useSkill.stype;
      if (stype !== "atk" && stype !== "catk") {
        return false;
      }
      return true;
    },
    반사: (battle, enqueue, obj) => {
      const pokemon = battle[battle.turn.atk];
      const reflectSkill = battle[battle.turn.def].temp.useSkill;

      if (reflectSkill === null || reflectSkill.stype !== obj.stat) {
        return false;
      }
      if (pokemon.temp.recentDamageGet === null) {
        return false;
      }
      return true;
    },
    방어: (battle, enqueue) => {
      const skillUser = battle[battle.turn.atk];
      if (battle.turn.atk !== battle.turn.fastActUser) {
        // 먼저 행동하지 않으면 (상대가 교체하면) 실패
        skillUser.tempStatus.protectUse = null;
        return false;
      }

      const protectUse = skillUser.tempStatus.protectUse; //방어 연속 사용 횟수
      let protectSuccess = false;
      if (!protectUse) {
        // null이나 0이 아니면 = 1회차 = 반드시 성공
        protectSuccess = true;
      } else if (protectUse === 1) {
        protectSuccess = random(33);
      } else if (protectUse === 2) {
        protectSuccess = random(11);
      } else if (protectUse > 2) {
        protectSuccess = random(4);
      }

      if (protectSuccess) {
        if (!protectUse) {
          skillUser.tempStatus.protectUse = 1;
        } else {
          skillUser.tempStatus.protectUse += 1;
        }
        return true;
      } else {
        skillUser.tempStatus.protectUse = null;
        return false;
      }
    },
  };

  return functions[name] || null;
}

export default skillRequirementSearch;
