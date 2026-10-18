import { switchPokemon } from "../function/switchPokemon";
import { applyAbilityEffects } from "../entity/Ability";
import { applyFieldEffects } from "./field";
import { calculatePokemonSwitchScore } from "../npc/ai/easy";
import { speedCheck } from "../util/speedCheck";

export const switchPlayer = (battle, actNumber, enqueue) => {
  // 플레이어 교체 함수
  // 사용자가 교체를 골랐을 때 (BattleStart.js)
  // 포켓몬이 쓰러져서 교체할때, 유턴 썼을때 (Bottom-Switch.js) 호출됨

  battle.turn.textFreeze = null;
  battle.turn.turnEnd = null;
  let isFaintSwitch = battle.player.faint;
  enqueue({ battle, text: battle.player.origin.name + " 돌아와!" });
  switchPokemon(battle, "player", actNumber);
  battle.turn.turnEnd = null;
  enqueue({
    battle,
    text: "가랏! " + battle.player.origin.name + "!",
  });

  applyFieldEffects(battle, "player", enqueue); // 장판 효과가 특성보다 먼저임
  if (!battle.player.faint) {
    // 장판 데미지에 기절하면 특성 발동 안함
    applyAbilityEffects(battle, "player", enqueue);
  } else {
    if (isFaintSwitch) {
      // 배틀 중 기절하거나 유턴으로 교체해 나온 포켓몬이 기절했을 경우엔 턴 종료시까지 대기하지만
      // 이전 포켓몬이 기절하여 교체해 나온 포켓몬이 스텔스록을 맞고 바로 다시 기절한 경우 바로 다음 포켓몬 꺼냄

      battle.turn.turnEnd = true;
      battle.turn.textFreeze = true;
      enqueue({ battle, text: "누구로 교체할까?" });
    }
  }
};

export const switchPlayerForce = (battle, actNumber, enqueue) => {
  switchPokemon(battle, "player", actNumber);
  enqueue({
    battle,
    text: battle.player.origin.names + " 배틀에 끌려나왔다!",
  });
  applyFieldEffects(battle, "player", enqueue);
  if (!battle.player.faint) {
    applyAbilityEffects(battle, "player", enqueue);
  }
};

export const switchNpc = (battle, actNumber, enqueue, force) => {
  // NPC 교체 함수
  // NPC가 교체를 골랐을 때(BattleStart.js), 날려버리기 강제교체(skillEffect.js)에서만 직접 사용
  // 그 외의 경우엔 switchNpcAuto를 호출하여 사용
  if (force) {
    switchPokemon(battle, "npc", actNumber);
    enqueue({
      battle,
      text: "상대 " + battle.npc.origin.names + " 배틀에 끌려나왔다!",
    });
  } else {
    enqueue({
      battle,
      text: "상대는 " + battle.npc.origin.namess + " 넣어 버렸다!",
    });
    switchPokemon(battle, "npc", actNumber);
    enqueue({
      battle,
      text: "상대는 " + battle.npc.origin.namess + " 내보냈다!",
    });
  }
  applyFieldEffects(battle, "npc", enqueue);
  if (!battle.npc.faint) {
    applyAbilityEffects(battle, "npc", enqueue);
  }
};

const getNpcAutoSwitchTarget = (battle) => {
  // 교체할 포켓몬 리턴
  if (battle.npcBench1.faint !== true && battle.npcBench2.faint !== true) {
    // 둘 다 기절하지 않았으면 가중치가 더 높은 포켓몬으로 교체
    const score1 = calculatePokemonSwitchScore(battle, 1).score;
    const score2 = calculatePokemonSwitchScore(battle, 2).score;
    return score2 > score1 ? "npcBench2" : "npcBench1";
  } else if (battle.npcBench1.faint !== true) {
    // 1번이 기절 안했으면 1번 교체
    return "npcBench1";
  } else if (battle.npcBench2.faint !== true && battle.npcBench1.faint === true) {
    //1번 기절했고 2번 기절 안했으면 2번 교체
    return "npcBench2";
  }
  return null;
};

export const switchNpcAuto = (battle, enqueue) => {
  // NPC 포켓몬만 쓰러져서 교체할때 (turnEnd.js)
  // 양쪽 다 쓰러져서 맞교체할때 (Bottom-Switch.js)  *사용자가 교체한 다음에 호출해야해서
  // 유턴 사용시 (skillEffect.js) 호출됨
  const targetBench = getNpcAutoSwitchTarget(battle);
  if (targetBench) {
    switchNpc(battle, targetBench, enqueue);
  }
};

export const switchBothFaint = (battle, actNumber, enqueue) => {
  // 양쪽 다 쓰러져서 맞기절 교체할때 (Bottom-Switch.js) 호출됨
  // 플레이어 포켓몬이 먼저 교체되어 나오고, 이어서 NPC 포켓몬이 교체되어 나온 뒤
  // 교체되어 나온 두 포켓몬 중 스피드가 빠른 쪽부터 특성 및 필드 효과를 적용한다.
  // 일반적인 맞교체에선 빠른 포켓몬이 먼저 들어감 -> 위협 포켓몬이 나옴 -> 느린 포켓몬한테 위협 적용됨 -> 느린 포켓몬 들어감 -> 교체 포켓몬 나옴 (위협 적용 안됨) 이 순서이지만
  // 기절 맞교체는 필드 위 포켓몬이 없으므로 교체 순서는 랜덤, 양족 포켓몬이 나온 다음 특성이 빠른 쪽부터 먼저 적용된다.
  battle.turn.textFreeze = null;
  battle.turn.turnEnd = null;
  enqueue({ battle, text: battle.player.origin.name + " 돌아와!" });
  switchPokemon(battle, "player", actNumber);
  battle.turn.turnEnd = null;
  enqueue({
    battle,
    text: "가랏! " + battle.player.origin.name + "!",
  });

  const targetBench = getNpcAutoSwitchTarget(battle);
  if (targetBench) {
    enqueue({
      battle,
      text: "상대는 " + battle.npc.origin.namess + " 넣어 버렸다!",
    });
    switchPokemon(battle, "npc", targetBench);
    enqueue({
      battle,
      text: "상대는 " + battle.npc.origin.namess + " 내보냈다!",
    });
  }

  const fastUser = speedCheck(battle);
  const slowUser = fastUser === "player" ? "npc" : "player";
  applyFieldEffects(battle, fastUser, enqueue);
  if (!battle.player.faint) {
    applyAbilityEffects(battle, fastUser, enqueue);
  }
  applyFieldEffects(battle, slowUser, enqueue);
  if (!battle.npc.faint) {
    applyAbilityEffects(battle, slowUser, enqueue);
  }
};
