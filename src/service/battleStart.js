import { speedCheck, skillSpeedCheck } from "../calc/speedCheck";
import { turnEnd } from "./turnEnd";
import { switchNpc, switchPlayer } from "./switch";
import { skillUse } from "./skillUse";
import { getZCrystalByItem, isEligibleSkillForZCrystal, isRayquaza, buildZMoveFromSkill } from "../entity/Skill/ZMove";
import { isTeraAble, applyTerastal } from "../entity/Skill/Terastal";
import { isDynamaxAble, applyDynamax } from "../entity/Skill/DymaxMove";
import { isTeraOrbItem, isDynamaxBandItem } from "../entity/Item";
import { josa } from "josa";
import { cloneWithMethods } from "../util/cloneWithMethods";

export const battleStart = (battle, actNumber, npcActNumber, queueObject, options = {}) => {
  // 턴을 시작하는 함수
  // 선택지와 스피드에 맞게 '교체'나 '공격' 함수를 호출한다

  queueObject.resetQueue();
  const enqueue = queueObject.enqueue;

  enqueue(battle, `${battle.turnCount}번째 턴`, "turn_start_log", {
    onlyLog: true, // 로그 모달에만 남고 화면에는 출력 안되게
  });
  battle.turnCount += 1;

  battle.resetBattleTurn();
  battle.player.turn.choice = actNumber;
  battle.npc.turn.choice = npcActNumber;

  // 이번턴 대타출동 상태였는지 여부, 대타출동이 깨뜨린 기술의 부가효과를 막기 위함
  battle.player.turn.substitute = Boolean(battle.player.tempStatus.substitute);
  battle.npc.turn.substitute = Boolean(battle.npc.tempStatus.substitute);

  if (isAttack(actNumber)) battle.player.turn.useSkill = battle.player.skill[actNumber];
  if (isAttack(npcActNumber)) battle.npc.turn.useSkill = battle.npc.skill[npcActNumber];

  // 메가진화 판정 (기술 사용 시 스피드 판정 전 발동)
  const playerMegaTrigger = battle.system?.megaTrigger?.player || options.useMega;
  const playerCanMega = Boolean(playerMegaTrigger && isAttack(actNumber) && battle.player.isMegaEvolveAble?.(battle));
  const npcCanMega = Boolean(isAttack(npcActNumber) && battle.npc.isMegaEvolveAble?.(battle));

  if (playerCanMega && npcCanMega) {
    const faster = speedCheck(battle);
    if (faster === "player") {
      battle.player.megaEvolve(battle, enqueue);
      battle.npc.megaEvolve(battle, enqueue);
    } else {
      battle.npc.megaEvolve(battle, enqueue);
      battle.player.megaEvolve(battle, enqueue);
    }
    if (battle.system?.megaTrigger) {
      battle.system.megaTrigger.player = false;
      battle.system.megaTrigger.npc = false;
    }
  } else if (playerCanMega) {
    battle.player.megaEvolve(battle, enqueue);
    if (battle.system?.megaTrigger) battle.system.megaTrigger.player = false;
  } else if (npcCanMega) {
    battle.npc.megaEvolve(battle, enqueue);
    if (battle.system?.megaTrigger) battle.system.megaTrigger.npc = false;
  }

  // Z기술 판정 (배틀 중 1회 한정, 해당 턴 useSkill을 1회용 Z기술로 교체)
  const playerZTrigger = battle.system?.zTrigger?.player || options.useZMove;
  const playerZCrystal = getZCrystalByItem(battle.player?.item);
  if (playerZTrigger && isAttack(actNumber) && !battle.system?.zUsed?.player && !(battle.player?.tempStatus?.dynamax > 0) && !isRayquaza(battle.player) && playerZCrystal) {
    const baseSkill = battle.player.skill?.[actNumber];
    if (isEligibleSkillForZCrystal(baseSkill, playerZCrystal, battle, battle.player)) {
      if (!battle.system) battle.system = {};
      if (!battle.system.zUsed) battle.system.zUsed = { player: false, npc: false };
      battle.system.zUsed.player = true;
      const zMoveSkill = buildZMoveFromSkill(baseSkill, playerZCrystal, actNumber);
      zMoveSkill.isOneTimeZCrystalMove = true;
      battle.player.turn.useSkill = zMoveSkill;
      enqueue(cloneWithMethods(battle), `${battle.player.names("는")} Z파워를 해방했다!`, "z_power_activate");
    }
  }
  if (battle.system?.zTrigger) battle.system.zTrigger.player = false;

  // 테라스탈 판정 (테라스탈오브 소지, 배틀 중 1회)
  const playerTeraTrigger = battle.system?.teraTrigger?.player || options.useTera;
  if (playerTeraTrigger && isAttack(actNumber) && isTeraOrbItem(battle.player?.item) && isTeraAble(battle.player, battle)) {
    const chosenType = battle.player.teraType || battle.player.o?.teraType || battle.player.type1 || "노말";
    enqueue(cloneWithMethods(battle), josa(`${battle.player.names("는")} 테라스탈오브로 빛나기 시작했다!`), "tera_orb_react");
    applyTerastal(battle.player, chosenType, battle);
    enqueue(cloneWithMethods(battle), josa(`${battle.player.names("는")} ${chosenType} 타입으로 테라스탈했다!`), "terastal_activate");
  }
  if (battle.system?.teraTrigger) battle.system.teraTrigger.player = false;

  // 다이맥스 판정 (다이버섯 소지, 배틀 중 1회, 기술 사용 시 3턴간 다이맥스)
  const playerDynamaxTrigger = battle.system?.dynamaxTrigger?.player || options.useDynamax;
  if (playerDynamaxTrigger && isAttack(actNumber) && actNumber >= 1 && actNumber <= 4 && isDynamaxBandItem(battle.player?.item) && isDynamaxAble(battle.player, battle)) {
    enqueue(cloneWithMethods(battle), josa(`${battle.player.names("는")} 다이버섯의 힘으로 거대해지기 시작했다!`), "dynamax_band_react");
    applyDynamax(battle.player, 3, battle);
    if (battle.player.skill?.[actNumber]) {
      battle.player.turn.useSkill = battle.player.skill[actNumber];
    }
    enqueue(cloneWithMethods(battle), `${battle.player.names("는")} 다이맥스했다!`, "dynamax_activate");
  }
  if (battle.system?.dynamaxTrigger) battle.system.dynamaxTrigger.player = false;

  if (isSwitch(actNumber) && isSwitch(npcActNumber)) {
    //맞교체
    let fastUser = speedCheck(battle); // 우선도 없이 스피드만 체크
    battle.turn.fastActUser = fastUser; // 기습, 방어 성공여부 떄문에 넣는다
    if (fastUser === "player") {
      switchPlayer(battle, actNumber, enqueue);
      switchNpc(battle, npcActNumber, enqueue);
    } else if (fastUser === "npc") {
      switchNpc(battle, npcActNumber, enqueue);
      switchPlayer(battle, actNumber, enqueue);
    }
  } else if (
    // 플레이어만 교체
    isSwitch(actNumber) &&
    isAttack(npcActNumber)
  ) {
    battle.turn.fastActUser = "player"; // 교체도 먼저 행동한 것으로 간주
    switchPlayer(battle, actNumber, enqueue);
    skillUseNpc(battle, actNumber, npcActNumber, enqueue);
  } else if (
    // npc만 교체
    isSwitch(npcActNumber) &&
    isAttack(actNumber)
  ) {
    battle.turn.fastActUser = "npc"; // 교체도 먼저 행동한 것으로 간주
    switchNpc(battle, npcActNumber, enqueue);
    skillUsePlayer(battle, actNumber, npcActNumber, enqueue);
    if (battle.turn.switchBySkill) {
      return;
    }
  } else if (
    //맞공격
    isAttack(actNumber) &&
    isAttack(npcActNumber)
  ) {
    let fastUser = skillSpeedCheck(battle); // 우선도까지 고려한 스피드 체크
    battle.turn.fastActUser = fastUser; //기습 사용조건때문에 넣는다

    if (fastUser === "player") {
      // 플레이어 선공
      skillUsePlayer(battle, actNumber, npcActNumber, enqueue);
      if (battle.turn.switchBySkill) return;
      // 유턴으로 교체시 교체화면을 띄우고 거기서 남은 함수 (skillUseNpc, turnEnd)를 실행한다
      if (battle[battle.turn.def].faint !== true) {
        skillUseNpc(battle, actNumber, npcActNumber, enqueue);
      }
    } else {
      skillUseNpc(battle, actNumber, npcActNumber, enqueue);
      if (battle[battle.turn.def].faint !== true) {
        skillUsePlayer(battle, actNumber, npcActNumber, enqueue);
        if (battle.turn.switchBySkill) return;
        // 유턴으로 교체시 교체화면을 띄우고 거기서 남은 함수 (turnEnd)를 실행한다
      }
    }
  }

  turnEnd(battle, enqueue);
};

function getActionType(act) {
  // 공격 (1~4, 5: 발버둥)
  if (typeof act === "number" && act >= 1 && act <= 5) {
    return "attack";
  }

  // 교체
  const switchList = ["npcBench1", "npcBench2", "playerBench1", "playerBench2"];
  if (typeof act === "string" && switchList.includes(act)) {
    return "switch";
  }

  // 그 외
  console.error("행동타입오류");
}

function isAttack(act) {
  let string = getActionType(act);
  if (string === "attack") return true;
  return false;
}

function isSwitch(act) {
  let string = getActionType(act);
  if (string === "switch") return true;
  return false;
}

const skillUsePlayer = (bt, actNumber, npcActNumber, enqueue) => {
  // skillUse로 들어가기 전에 넣어야 할 변수를 처리한다
  bt.turn.atk = "player";
  bt.turn.def = "npc";
  bt.turn.atkSN = actNumber;
  bt.turn.defSN = npcActNumber;
  skillUse(bt, enqueue);
};

export const skillUseNpc = (bt, actNumber, npcActNumber, enqueue) => {
  bt.turn.atk = "npc";
  bt.turn.def = "player";
  bt.turn.atkSN = npcActNumber;
  bt.turn.defSN = actNumber;
  skillUse(bt, enqueue);
};
