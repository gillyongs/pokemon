import { hpCalculate } from "../calc/hpCalculate";
import { applyAbilityEffects } from "../entity/Ability";
import { applyFieldEffects } from "./field";
import { calculatePokemonSwitchScore } from "../npc/ai/easy";
import { speedCheck } from "../calc/speedCheck";

export const switchPlayer = (battle, actNumber, enqueue, options = {}) => {
  // 플레이어 교체 함수
  // 사용자가 교체를 골랐을 때 (BattleStart.js)
  // 포켓몬이 쓰러져서 교체할때, 유턴 썼을때 (Bottom-Switch.js) 호출됨

  battle.turn.textFreeze = null;
  battle.turn.turnEnd = null;
  let isFaintSwitch = battle.player.faint;
  enqueue({ id: "b83eb420-1c0d-47c1-aa65-c3b7115a7268", battle, text: battle.player.origin.name + " 돌아와!" });
  switchPokemon(battle, "player", actNumber, options);
  battle.turn.turnEnd = null;
  enqueue({
    id: "d62ecb46-560e-40ad-a16a-e57235acf4e2",
    battle,
    text: "가랏! " + battle.player.origin.name + "!",
  });

  applyFieldEffects(battle, "player", enqueue); // 장판 효과가 특성보다 먼저임
  if (!battle.player.faint) {
    // 장판 데미지에 기절하면 특성 발동 안함
    applyAbilityEffects(battle, "player", enqueue);
    if (options?.batonPass && !battle.player.faint) {
      battle.player.checkWhiteHerb?.(battle, enqueue);
      // 배턴터치로 넘겨받은 랭크다운은 교체 즉시 하양허브로 원복됨
    }
  } else {
    if (isFaintSwitch) {
      // 배틀 중 기절하거나 유턴으로 교체해 나온 포켓몬이 기절했을 경우엔 턴 종료시까지 대기하지만
      // 이전 포켓몬이 기절하여 교체해 나온 포켓몬이 스텔스록을 맞고 바로 다시 기절한 경우 바로 다음 포켓몬 꺼냄
      extraSwitchWhenTurnEnd(battle, "player", enqueue);
    }
  }
};

export const switchPlayerForce = (battle, actNumber, enqueue) => {
  switchPokemon(battle, "player", actNumber);
  enqueue({
    id: "5635931b-ab6f-4b80-ab18-55df5ec2cd2f",
    battle,
    text: battle.player.origin.names + " 배틀에 끌려나왔다!",
  });
  applyFieldEffects(battle, "player", enqueue);
  if (!battle.player.faint) {
    applyAbilityEffects(battle, "player", enqueue);
  }
};

export const switchNpc = (battle, actNumber, enqueue, force, options = {}) => {
  // NPC 교체 함수
  // NPC가 교체를 골랐을 때(BattleStart.js), 날려버리기 강제교체(skillEffect.js)에서만 직접 사용
  // 그 외의 경우엔 switchNpcAuto를 호출하여 사용
  if (force) {
    switchPokemon(battle, "npc", actNumber);
    enqueue({
      id: "cbe52210-aa36-4e06-9244-9807127f2e58",
      battle,
      text: "상대 " + battle.npc.origin.names + " 배틀에 끌려나왔다!",
    });
  } else {
    enqueue({
      id: "e895cc4c-5ad6-4ccc-a7dd-98bd1a5b3c04",
      battle,
      text: "상대는 " + battle.npc.origin.namess + " 넣어 버렸다!",
    });
    switchPokemon(battle, "npc", actNumber, options);
    enqueue({
      id: "50befd61-7787-45c3-ba72-b3ed7b1892f1",
      battle,
      text: "상대는 " + battle.npc.origin.namess + " 내보냈다!",
    });
  }
  applyFieldEffects(battle, "npc", enqueue);
  if (!battle.npc.faint) {
    applyAbilityEffects(battle, "npc", enqueue);
    if (options?.batonPass && !battle.npc.faint) {
      battle.npc.checkWhiteHerb?.(battle, enqueue);
    }
  } else {
    if (battle.turn.turnEnd) {
      extraSwitchWhenTurnEnd(battle, "npc", enqueue);
    }
  }
};

const getNpcAutoSwitchTarget = (battle) => {
  // 교체할 포켓몬 계산 함수
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

export const switchNpcAuto = (battle, enqueue, options = {}) => {
  // NPC 포켓몬만 쓰러져서 교체할때 (turnEnd.js)
  // 유턴 사용시 (skillEffect.js) 호출됨
  const targetBench = getNpcAutoSwitchTarget(battle);
  if (targetBench) {
    switchNpc(battle, targetBench, enqueue, false, options);
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
  enqueue({ id: "24038799-2c59-4d5c-92c3-ed926eeb7c20", battle, text: battle.player.origin.name + " 돌아와!" });
  switchPokemon(battle, "player", actNumber);
  battle.turn.turnEnd = null;
  enqueue({
    id: "4fb97c1c-8937-4290-96c6-1e9c48689d18",
    battle,
    text: "가랏! " + battle.player.origin.name + "!",
  });

  const targetBench = getNpcAutoSwitchTarget(battle);
  if (targetBench) {
    enqueue({
      id: "abad55be-ab92-466e-823f-39eda4774b5e",
      battle,
      text: "상대는 " + battle.npc.origin.namess + " 넣어 버렸다!",
    });
    switchPokemon(battle, "npc", targetBench);
    enqueue({
      id: "d0fdcf3b-fb85-458f-8850-0923f8a57148",
      battle,
      text: "상대는 " + battle.npc.origin.namess + " 내보냈다!",
    });
  }

  const fastUser = speedCheck(battle);
  const slowUser = fastUser === "player" ? "npc" : "player";
  applyFieldEffects(battle, fastUser, enqueue);
  if (!battle[fastUser].faint) {
    applyAbilityEffects(battle, fastUser, enqueue);
  }
  applyFieldEffects(battle, slowUser, enqueue);
  if (!battle[slowUser].faint) {
    applyAbilityEffects(battle, slowUser, enqueue);
  }

  if (battle[fastUser].faint && battle[slowUser].faint) {
    // 맞교체일경우
    // player만 처리하면 bottom-switch에서 npc 기절여부 체크하고 switchBothFaint 호출함
    extraSwitchWhenTurnEnd(battle, "player", enqueue);
  } else {
    if (battle[fastUser].faint) {
      extraSwitchWhenTurnEnd(battle, fastUser, enqueue);
    }
    if (battle[slowUser].faint) {
      extraSwitchWhenTurnEnd(battle, slowUser, enqueue);
    }
  }
};

const extraSwitchWhenTurnEnd = (battle, user, enqueue) => {
  if (user === "player") {
    battle.turn.turnEnd = true;
    battle.turn.textFreeze = true;
    enqueue({
      id: "3f3fba5e-e31f-4243-aade-a7adb8038cc8",
      battle,
      text: "누구로 교체할까?",
      allowAct: true,
      bottomMode: "mustSwitch",
      waitInput: true,
    });
  }
  if (user === "npc") {
    switchNpcAuto(battle, enqueue);
  }
};

// ===================================================================================================

export const switchPokemon = (battle, IN, OUT, options = {}) => {
  // 교체 함수.
  // 실제 객체의 값을 바꾸고
  // pokemon.tempStatus 값을 초기화한다

  //IN: player or npc
  //OUT: playerBench1,2 // npcBench1,2

  if (!battle || !battle[IN] || !battle[OUT]) {
    console.error("Invalid battle object or keys");
    return;
  }

  const pokemonIn = battle[IN]; //교체로 들어가는 포켓몬

  const batonState = options?.batonPass // 배턴터치
    ? {
        rank: { ...pokemonIn.tempStatus.rank },
        confuse: pokemonIn.tempStatus.confuse, // 혼란 넘기는거 맞음
        seed: pokemonIn.tempStatus.seed,
        substitute: pokemonIn.tempStatus.substitute,
        substituteHp: pokemonIn.tempStatus.substituteHp,
      }
    : null;
  if (pokemonIn.abil === "재생력") {
    // 재생력 특성을 지닌 포켓몬은 교체시 체력이 회복
    const hp = hpCalculate(pokemonIn);
    pokemonIn.recoverNoText(battle, Math.floor(hp / 3), pokemonIn);
  }
  if (pokemonIn.abil === "자연회복") {
    // 자연회복 특성을 지닌 포켓몬은 교체시 상태이상을 회복
    Object.keys(pokemonIn.ailment).forEach((key) => {
      pokemonIn.ailment[key] = null;
    });
  }
  if (pokemonIn.ailment.mpoison && pokemonIn.ailment.mpoison > 1) {
    pokemonIn.ailment.mpoison = 1;
    //맹독 스탯 초기화
  }

  let op = IN === "player" ? "npc" : "player";
  if (battle[op].tempStatus.switchLock !== null) {
    battle[op].tempStatus.switchLock = null;
    battle[op].tempStatus.switchLockTurnRemain = null;
    // 마그마스톰 등으로 상대를 구속 후 교체하면 구속 효과가 풀린다
    // 물론 상대방은 해당 턴에 교체할 수 없다
  }

  const ts = pokemonIn.tempStatus;

  Object.keys(ts).forEach((key) => {
    if (key !== "rank") {
      ts[key] = null;
    } else {
      Object.keys(ts.rank).forEach((key) => {
        ts.rank[key] = 0;
      });
    }
  });
  // 리베로 타입 초기화 (메가진화 포켓몬은 메가진화 타입 유지)
  if (pokemonIn.isMega && pokemonIn.origin?.megaData) {
    pokemonIn.type1 = pokemonIn.origin.megaData.type1;
    pokemonIn.type2 = pokemonIn.origin.megaData.type2;
  } else {
    pokemonIn.type1 = pokemonIn.origin.type1;
    pokemonIn.type2 = pokemonIn.origin.type2;
  }

  // 트레이스 특성 초기화
  if (pokemonIn.abil !== pokemonIn.origin.abil) {
    pokemonIn.abil = pokemonIn.origin.abil;
    pokemonIn.abilObj = { ...pokemonIn.origin.abilObj };
  }

  [battle[IN], battle[OUT]] = [battle[OUT], battle[IN]];

  if (batonState && battle[IN]?.tempStatus) {
    Object.assign(battle[IN].tempStatus.rank, batonState.rank);
    battle[IN].tempStatus.confuse = batonState.confuse;
    battle[IN].tempStatus.seed = batonState.seed;
    battle[IN].tempStatus.substitute = batonState.substitute;
    battle[IN].tempStatus.substituteHp = batonState.substituteHp;
    if (battle[IN].turn) {
      battle[IN].turn.substitute = Boolean(batonState.substitute);
    }
  }

  if (battle[IN]?.tempStatus) {
    battle[IN].tempStatus.firstTurn = true; // 만나자마자
    battle[IN].tempStatus.turnsOnField = 0; // 슬로스타트
  }
  if (battle?.turn) {
    if (IN === "player") battle.turn.playerSwitched = true;
    if (IN === "npc") battle.turn.npcSwitched = true;
  }
};
