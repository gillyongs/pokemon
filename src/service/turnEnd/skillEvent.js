import { hpCalculate } from "../../util/hpCalculate";
import { applyAilment } from "../../function/ailment";

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

  // 역린 등 자동행동
  autoEnd(battle, enqueue, fastUser);
  autoEnd(battle, enqueue, slowUser);

  // 지옥찌르기 소리 기술 금지
  noSound(battle, enqueue, fastUser);
  noSound(battle, enqueue, slowUser);

  // 저주받은바디 기술 봉인
  disable(battle, enqueue, fastUser);
  disable(battle, enqueue, slowUser);
}

function seed(battle, enqueue, getter, user) {
  const skillUser = battle[user]; // 씨뿌리기 쓴 놈
  const skillGetter = battle[getter]; // 씨뿌리기 맞은놈
  if (skillGetter.faint) return;

  // 씨뿌리기
  if (skillGetter.tempStatus.seed) {
    const dmg = skillGetter.getDamage(battle, enqueue, Math.floor(hpCalculate(skillGetter) / 8));
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
      enqueue({ id: "8c6a1aa2-f25d-45bf-bbe3-f5aea20fdb22", battle, text: `${skillGetter.names} ${skillName}에게서 벗어났다!` });
    } else {
      skillGetter.getDamage(battle, enqueue, Math.floor(hpCalculate(skillGetter) / 8), `${skillGetter.names} ${skillName}의 데미지를 입고 있다.`);
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
    enqueue({ id: "e40f7ddc-71fe-4cd9-b3ac-36031dbbdf26", battle: battle, text: wakeUpText });
  }
}

function noSound(battle, enqueue, getter) {
  const skillGetter = battle[getter]; // 도발 맞은놈
  if (skillGetter.faint) return;
  // 도발 해제는 턴이 종료될때 실행된다 (연속 도발을 막기 위해서일듯 함)

  if (skillGetter.tempStatus.noSound > 0) {
    skillGetter.tempStatus.noSound--;
  }

  if (skillGetter.tempStatus.noSound === 0) {
    let wakeUpText = skillGetter.names + " 다시 소리 기술을 사용할 수 있게 됐다!";
    skillGetter.tempStatus.noSound = null;
    enqueue({ id: "10facab5-d501-4e07-a21d-ab5d777c55db", battle: battle, text: wakeUpText });
  }
}

function disable(battle, enqueue, getter) {
  const skillGetter = battle[getter];
  if (skillGetter.faint) return;

  if (skillGetter.tempStatus.disableTurnRemain > 0) {
    skillGetter.tempStatus.disableTurnRemain--;
  }

  if (skillGetter.tempStatus.disableTurnRemain === 0) {
    const disabledSkill = skillGetter.tempStatus.disable;
    skillGetter.tempStatus.disable = null;
    skillGetter.tempStatus.disableTurnRemain = null;
    let wakeUpText = `${skillGetter.name}의 ${disabledSkill} 봉인이 풀렸다!`;
    enqueue({ id: "3f8a9c1b-7d2e-4f5a-8b3c-9e1d2f3a4b5c", battle: battle, text: wakeUpText });
  }
}

function hapum(battle, enqueue, user) {
  const p = battle[user];
  if (p.faint) return;

  if (p.tempStatus.hapum === 0) {
    p.tempStatus.hapum = null;
    applyAilment("잠듦", battle, p.team, enqueue, false);
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
    applyAilment("혼란", battle, user, enqueue, null, autoConfuseText);
  }
}
