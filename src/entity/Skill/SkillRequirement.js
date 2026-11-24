import { random } from "../../util/randomCheck";

function skillRequirementSearch(name) {
  // 특수 성공조건이 있는 기술들 (기습, 카운터, 방어, 만나자마자, 폴터가이스트)
  // 해당 기술들은 실패해도 리베로/변환자재가 발동되지 않는다
  const functions = {
    기습: (battle, enqueue) => {
      if (battle.turn.atk !== battle.turn.fastActUser) {
        return false;
      }
      const stype = battle[battle.turn.def].turn.useSkill.stype;
      if (stype !== "atk" && stype !== "catk") {
        return false;
      }
      return true;
    },
    반사: (battle, enqueue, obj) => {
      // 사이코쇼크는 아무튼 특수기이므로 미러코트에 반사됨
      const pokemon = battle[battle.turn.atk];
      const reflectSkill = battle[battle.turn.def].turn.useSkill;

      if (reflectSkill === null) {
        return false;
      }
      if (obj.stat === "all") {
        if (reflectSkill.stype !== "atk" && reflectSkill.stype !== "catk") {
          return false;
        }
      } else if (reflectSkill.stype !== obj.stat) {
        return false;
      }
      if (pokemon.turn.recentDamageGet === null || pokemon.turn.recentDamageGet <= 0) {
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
    속이기: (battle, enqueue) => {
      const atk = battle[battle.turn.atk];
      if (atk?.tempStatus?.firstTurn === false) {
        return false;
      }
      return true;
    },
    만나자마자: (battle, enqueue) => {
      const atk = battle[battle.turn.atk];
      if (atk?.tempStatus?.firstTurn === false) {
        return false;
      }
      return true;
    },

    폴터가이스트: (battle) => {
      const def = battle[battle.turn.def];
      if (!def || def.faint || !def.item || !def.item.trim()) {
        return false;
      }
      return true;
    },
    // 죽기살기, 배턴터치는 실패하면 리베로가 발동됨, 일단 나누기 애매해서 둠 ===========================================
    // 다른건 어차피 불가능해서 상관없는데 에이스번은 배턴터치 배우는데 어떡하지
    죽기살기: (battle, enqueue) => {
      const atk = battle[battle.turn.atk];
      const def = battle[battle.turn.def];
      if (atk.hp >= def.hp) {
        return false;
      }
      return true;
    },
    배턴터치: (battle) => {
      // 교대할 포켓몬이 없으면 실패
      const side = battle.turn.atk;
      const bench1Alive = battle[`${side}Bench1`]?.faint !== true;
      const bench2Alive = battle[`${side}Bench2`]?.faint !== true;
      return bench1Alive || bench2Alive;
    },
  };

  return functions[name] || null;
}

export default skillRequirementSearch;
