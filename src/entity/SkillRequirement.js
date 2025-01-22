import { damage } from "../service/damage";
import { random } from "../util/randomCheck";
import { rank } from "../service/rank";

const statusCheck = (status) => {
  return Object.values(status).some((value) => value !== null);
};

function skillRequirementSearch(name) {
  const functions = {
    기습: (battle, enqueue) => {
      if (battle.turn.atk !== battle.turn.fastUser) {
        return false;
      }
      if (
        battle[battle.turn.def].origin["sk" + battle.turn.defSN].atkNatk !==
        "atk"
      ) {
        return false;
      }
      return true;
    },
  };

  return functions[name] || null;
}

export default skillRequirementSearch;
