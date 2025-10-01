import { damage } from "../function/damage";
import { switchNpc } from "./switch";
import { recover } from "../function/recover";
import { speedCheck } from "../util/speedCheck";
import { burn, mabi, poison, freeze, sleep } from "../function/statusError";
export const turnEnd = (battle, enqueue) => {
  // 턴이 종료될때 실행되는 이벤트 모음
  // 화상딜, 독딜, 날개쉬기 타입복구, NPC 기절시 교체
  // turnEnd를 trigger로 사용하여 모든 이벤트가 끝나야 교체화면이 나오게 함
  // player.temp의 프로퍼티들은 여기서 초기화된다.
  // battle.turn은 turnEnd 때문에 턴 시작할때 (battleStart.js)에서 초기화된다

  const fastUser = speedCheck(battle);
  const slowUser = fastUser === "player" ? "npc" : "player";
  const fast = battle[fastUser];
  const slow = battle[slowUser];
  const field = battle.field.field;

  if (battle.field.weather !== null) {
    battle.field.weatherTurnRemain -= 1;
    if (battle.field.weatherTurnRemain === 0) {
      const weather = battle.field.weather;
      battle.field.weather = null;
      let text;
      if (weather === "비") {
        text = "비가 그쳤다!";
      }
      enqueue({ battle, text: text });
    }
  }
  if (field !== null) {
    let fieldEndText;
    if (field === "그래스필드") {
      fieldEndText = "발밑의 풀이 사라졌다!";
      const text = "의 체력이 회복되었다!";
      if (fast.hp < fast.origin.hp && !fast.faint) {
        recover(battle, Math.floor(fast.origin.hp / 16), fastUser, enqueue, "[그래스필드] " + fast.name + text);
      }
      if (slow.hp < slow.origin.hp && !slow.faint) {
        recover(battle, Math.floor(slow.origin.hp / 16), slowUser, enqueue, "[그래스필드] " + slow.name + text);
      }
    }

    if (field === "일렉트릭필드") {
      fieldEndText = "발밑의 전기가 사라졌다!";
    }
    const bf = battle.field;
    bf.fieldTurnRemain -= 1;
    if (bf.fieldTurnRemain === 0) {
      bf.fieldTurnRemain = null;
      bf.field = null;
      enqueue({ battle, text: fieldEndText });
    }
  }

  if (fast.item === "먹다남은음식" && !fast.faint && fast.hp < fast.origin.hp) {
    recover(battle, Math.floor(fast.origin.hp / 16), fastUser, enqueue, fast.names + " 먹다남은음식으로 인해 조금 회복했다.");
  }
  if (slow.item === "먹다남은음식" && !slow.faint && slow.hp < slow.origin.hp) {
    recover(battle, Math.floor(slow.origin.hp / 16), slowUser, enqueue, slow.names + " 먹다남은음식으로 인해 조금 회복했다.");
  }

  if (fast.status.poison && !fast.faint) {
    damage(battle, Math.floor(fast.origin.hp / 8), fastUser, enqueue, fast.names + " 독에 의한 데미지를 입었다!");
  }
  if (slow.status.poison && !slow.faint) {
    damage(battle, Math.floor(slow.origin.hp / 8), slowUser, enqueue, slow.names + " 독에 의한 데미지를 입었다!");
  }
  if (fast.status.burn && !fast.faint) {
    damage(battle, Math.floor(fast.origin.hp / 16), fastUser, enqueue, fast.names + " 화상 데미지를 입었다!");
  }
  if (slow.status.burn && !slow.faint) {
    damage(battle, Math.floor(slow.origin.hp / 16), slowUser, enqueue, slow.names + " 화상 데미지를 입었다!");
  }

  if (fast.item === "화염구슬" && !fast.faint && !fast.status.burn) {
    //화염구슬로 화상을 입은 턴엔 화상 데미지를 입지 않는다
    burn(battle, fast.team, enqueue, true);
  }
  if (slow.item === "화염구슬" && !slow.faint && !slow.status.burn) {
    burn(battle, slow.team, enqueue, true);
  }

  if (fast.tempStatus.hapum === 0 && !fast.faint) {
    fast.tempStatus.hapum = null;
    sleep(battle, fast.team, enqueue, true);
  }
  if (slow.tempStatus.hapum === 0 && !slow.faint) {
    slow.tempStatus.hapum = null;
    sleep(battle, slow.team, enqueue, true);
  }
  if (fast.tempStatus.hapum === 1 && !fast.faint) {
    fast.tempStatus.hapum = 0;
  }
  if (slow.tempStatus.hapum === 1 && !slow.faint) {
    slow.tempStatus.hapum = 0;
  }

  if (fast.tempStatus.taunt === 0 && !fast.faint) {
    // 도발 3턴은 행동을 기준으로 센다
    // 선 도발 맞았으면 그 턴 포함 3턴
    // 후 도발 맞았으면 그 다음 턴부터 3턴 (이건 확실함) -> 카운트는 skillCheck에서
    // 도발 풀리는건 턴 종료시 (일단 행동한 다음에 풀리는건 확실함) -> 풀리는건 turnEnd에서
    let wakeUpText = fast.names + " 도발의 효과가 풀렸다!";
    fast.tempStatus.taunt = null;
    enqueue({ battle: battle, text: wakeUpText });
  }
  if (slow.tempStatus.taunt === 0 && !slow.faint) {
    let wakeUpText = slow.names + " 도발의 효과가 풀렸다!";
    slow.tempStatus.taunt = null;
    enqueue({ battle: battle, text: wakeUpText });
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

  battle.turn.turnEnd = true;
  if (battle.npc.faint && !battle.player.faint) {
    if (battle.npcBench1.faint !== true) {
      // 1번이 기절 안했으면 1번 교체
      switchNpc(battle, "npcBench1", enqueue);
    } else if (battle.npcBench2.faint !== true && battle.npcBench1.faint === true) {
      //1번 기절했고 2번 기절 안했으면 2번 교체
      switchNpc(battle, "npcBench2", enqueue);
    }
  }

  if (battle.player.faint) {
    battle.turn.textFreeze = true;
    enqueue({
      battle: battle,
      text: "누구로 교체 할까?",
    });
  } else {
    if (battle.uturn) {
      return;
    }
    // enqueue({
    //   battle: battle,
    //   text: battle.player.origin.names + " 무엇을 할까?",
    // });
  }
};
