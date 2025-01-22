import { damage } from "./damage";

export const turnEnd = (battle, enqueue) => {
  if (battle.player.faint !== true) {
    if (battle.player.status.poision === true) {
      damage(
        battle,
        Math.floor(battle.player.origin.hp / 8),
        "player",
        enqueue,
        battle.player.names + " 독에 의한 데미지를 입었다!"
      );
    }
    if (battle.player.status.burn === true) {
      damage(
        battle,
        Math.floor(battle.player.origin.hp / 16),
        "player",
        enqueue,
        battle.player.names + " 화상 데미지를 입었다!"
      );
    }
  }
  if (battle.npc.faint !== true) {
    if (battle.npc.status.poision === true) {
      damage(
        battle,
        Math.floor(battle.npc.origin.hp / 8),
        "npc",
        enqueue,
        battle.npc.names + " 독에 의한 데미지를 입었다!"
      );
    }

    if (battle.npc.status.burn === true) {
      damage(
        battle,
        Math.floor(battle.npc.origin.hp / 16),
        "npc",
        enqueue,
        battle.npc.names + " 화상 데미지를 입었다!"
      );
    }
  }

  let tempPlayer = battle.player.temp;
  let tempNpc = battle.npc.temp;

  if (tempPlayer.roost) {
    tempPlayer.roost = null;
    battle.player.type1 = battle.player.origin.type1;
    battle.player.type2 = battle.player.origin.type2;
  }
  if (tempNpc.roost) {
    tempNpc.roost = null;
    battle.npc.type1 = battle.npc.origin.type1;
    battle.npc.type2 = battle.npc.origin.type2;
  }

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
