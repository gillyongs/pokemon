import { applyAilment } from "../../function/ailment";

export function processAilment(battle, enqueue, fastUser, slowUser) {
  applyStatusDamage(battle, enqueue, fastUser);
  applyStatusDamage(battle, enqueue, slowUser);
  flameOrb(battle, enqueue, fastUser);
  flameOrb(battle, enqueue, slowUser);
}

function applyStatusDamage(battle, enqueue, user) {
  const p = battle[user];

  if (p.faint) return;

  if (p.ailment.poison) {
    p.getDamage(battle, enqueue, Math.floor(p.origin.hp / 8), `${p.names} 독에 의한 데미지를 입었다!`);
  }
  if (p.ailment.mpoison) {
    p.getDamage(battle, enqueue, Math.floor((p.origin.hp * p.ailment.mpoison) / 16), `${p.names} 맹독에 의한 데미지를 입었다!`);
    p.ailment.mpoison++;
  }
  if (p.ailment.burn) {
    if (p.abil === "수포") {
      p.ailment.burn = null;
      enqueue({ battle, text: `[특성 수포] ${p.name}의 화상이 나았다!` });
    } else {
      p.getDamage(battle, enqueue, Math.floor(p.origin.hp / 16), `${p.names} 화상 데미지를 입었다!`);
    }
  }

  if (p.item === "화염구슬") {
    applyAilment("화상", battle, p.team, enqueue, false, `${p.names} 화염구슬로 화상을 입었다!`);
  }
}

function flameOrb(battle, enqueue, user) {
  const p = battle[user];
  if (p.faint) return;

  if (p.item === "화염구슬") {
    applyAilment("화상", battle, p.team, enqueue, true);
  }
}
