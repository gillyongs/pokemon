import { sleep, confuse } from "../../function/statusCondition";

export function processSkillEffects(battle, enqueue, fastUser, slowUser) {
  // 씨뿌리기
  seed(battle, enqueue, fastUser, slowUser);
  seed(battle, enqueue, slowUser, fastUser);

  // 묶기
  switchLock(battle, enqueue, fastUser);
  switchLock(battle, enqueue, slowUser);

  // 도발
  taunt(battle, enqueue, fastUser);
  taunt(battle, enqueue, slowUser);

  // 하품
  hapum(battle, enqueue, fastUser);
  hapum(battle, enqueue, slowUser);

  //역린 등 자동행동
  autoEnd(battle, enqueue, fastUser);
  autoEnd(battle, enqueue, slowUser);
}

function seed(battle, enqueue, getter, user) {
  const skillUser = battle[user]; // 씨뿌리기 쓴 놈
  const skillGetter = battle[getter]; // 씨뿌리기 맞은놈
  if (skillGetter.faint) return;

  // 씨뿌리기
  if (skillGetter.tempStatus.seed) {
    const dmg = skillGetter.getDamage(battle, enqueue, Math.floor(skillGetter.origin.hp / 8));
    skillUser.recover(battle, Math.floor(dmg), enqueue, `씨뿌리기가 ${skillGetter.name}의 체력을 빼앗는다!`);
  }
}

export function switchLock(battle, enqueue, getter) {
  const skillGetter = battle[getter]; // 마그마스톰 맞은놈
  if (skillGetter.faint) return;

  // 묶기 (ex: 마그마스톰)
  if (skillGetter.tempStatus.switchLock) {
    const skillName = skillGetter.tempStatus.switchLock;
    skillGetter.tempStatus.switchLockTurnRemain--;
    if (skillGetter.tempStatus.switchLockTurnRemain === 0) {
      skillGetter.tempStatus.switchLock = null;
      skillGetter.tempStatus.switchLockTurnRemain = null;
      enqueue({ battle, text: `${skillGetter.names} ${skillName}에게서 벗어났다!` });
    } else {
      skillGetter.getDamage(battle, enqueue, Math.floor(skillGetter.origin.hp / 8), `${skillGetter.names} ${skillName}의 데미지를 입고 있다.`);
    }
  }
}

function taunt(battle, enqueue, getter) {
  const skillGetter = battle[getter]; // 도발 맞은놈
  if (skillGetter.faint) return;
  // 도발 해제는 턴이 종료될때 실행된다 (연속 도발을 막기 위해서일듯 함)

  if (skillGetter.tempStatus.taunt > 0) {
    skillGetter.tempStatus.taunt--;
  }

  if (skillGetter.tempStatus.taunt === 0) {
    let wakeUpText = skillGetter.names + " 도발의 효과가 풀렸다!";
    skillGetter.tempStatus.taunt = null;
    enqueue({ battle: battle, text: wakeUpText });
  }
}

function hapum(battle, enqueue, user) {
  const p = battle[user];
  if (p.faint) return;

  if (p.tempStatus.hapum === 0) {
    p.tempStatus.hapum = null;
    sleep(battle, p.team, enqueue, true);
  }
  if (p.tempStatus.hapum === 1) {
    p.tempStatus.hapum = 0;
  }
}

function autoEnd(battle, enqueue, user) {
  const p = battle[user];
  if (p.faint) return;

  let autoConfuseText = p.names + " 몹시 지쳐서 혼란에 빠졌다!";
  if (p.auto > 0) {
    p.auto--;
  }

  if (p.auto === 0) {
    p.auto = null;
    p.autoSN = null;
    confuse(battle, user, enqueue, autoConfuseText);
  }
}
