function skillRequirementSearch(name) {
  const functions = {
    기습: (battle, enqueue) => {
      if (battle.turn.atk !== battle.turn.fastUser) {
        return false;
      }
      const stype = battle[battle.turn.def].origin["sk" + battle.turn.defSN].stype;
      if (stype !== "atk" && stype !== "catk") {
        return false;
      }
      return true;
    },
  };

  return functions[name] || null;
}

export default skillRequirementSearch;
