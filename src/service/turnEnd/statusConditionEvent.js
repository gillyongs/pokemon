import { burn } from "../../function/statusCondition";

export function processStatusCondition(battle, enqueue, fastUser, slowUser) {
  applyStatusDamage(battle, enqueue, fastUser);
  applyStatusDamage(battle, enqueue, slowUser);
  flameOrb(battle, enqueue, fastUser);
  flameOrb(battle, enqueue, slowUser);
}

function applyStatusDamage(battle, enqueue, user) {
  const p = battle[user];

  if (p.faint) return;

  if (p.status.poison) {
    p.getDamage(battle, enqueue, Math.floor(p.origin.hp / 8), `${p.names} 독에 의한 데미지를 입었다!`);
  } else if (p.status.mpoison) {
    p.getDamage(battle, enqueue, Math.floor((p.origin.hp * p.status.mpoison) / 16), `${p.names} 맹독에 의한 데미지를 입었다!`);
    p.status.mpoison++;
  } else if (p.status.burn) {
    p.getDamage(battle, enqueue, Math.floor(p.origin.hp / 16), `${p.names} 화상 데미지를 입었다!`);
  }

  if (p.item === "화염구슬") {
    //화염구슬로 화상을 입은 턴엔 화상 데미지를 입지 않는다
    burn(battle, p.team, enqueue, true);
  }
}

function flameOrb(battle, enqueue, user) {
  const p = battle[user];
  if (p.faint) return;

  if (p.item === "화염구슬") {
    //화염구슬로 화상을 입은 턴엔 화상 데미지를 입지 않는다
    burn(battle, p.team, enqueue, true);
  }
}
