export const turnEnd = (battle, enqueue) => {
  let tempPlayer = battle.player.temp;
  let tempNpc = battle.npc.temp;
  Object.keys(tempPlayer).forEach((key) => {
    tempPlayer[key] = null;
  });
  Object.keys(tempNpc).forEach((key) => {
    tempNpc[key] = null;
  });

  enqueue({
    battle: battle,
    text: battle.player.origin.names + " 무엇을 할까?",
  });
};
