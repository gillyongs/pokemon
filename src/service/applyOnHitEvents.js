export const applyOnHitEvents = (battle, enqueue) => {
  const atk = battle.turn.atk;
  const def = battle.turn.def;
  const atkPokemon = battle[battle.turn.atk];
  const defPokemon = battle[battle.turn.def];
  const skillNumber = battle.turn.atkSN;
  const skKey = `sk${skillNumber}`;
  const useSkill = atkPokemon.origin[skKey];

  if (defPokemon.abil === "독치장") {
    if (useSkill.stype === "atk") {
      const field = battle.field[atk];
      if (!field.poisonSpikes) {
        field.poisonSpikes = 1; // 독압정
        let sRockText;
        if (atk === "npc") {
          sRockText = "[특성 독치장] 상대의 발밑에 독압정이 뿌려졌다!";
        } else {
          sRockText = "[특성 독치장] 아군의 발밑에 독압정이 뿌려졌다!";
        }
        enqueue({
          battle,
          text: sRockText,
        });
      } else if (field.poisonSpikes === 1) {
        field.poisonSpikes = 2; // 맹독압정
        let sRockText;
        if (atk === "npc") {
          sRockText = "[특성 독치장] 상대의 발밑에 맹독압정이 뿌려졌다!";
        } else {
          sRockText = "[특성 독치장] 아군의 발밑에 맹독압정이 뿌려졌다!";
        }
        enqueue({
          battle,
          text: sRockText,
        });
      }
    }
  }
};
