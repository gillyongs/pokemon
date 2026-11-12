import { hpCalculate } from "../../util/hpCalculate";
import { applyAilment } from "../../function/ailment";

export function processAilment(battle, enqueue, fastUser, slowUser) {
  applyStatusDamage(battle, enqueue, fastUser);
  applyStatusDamage(battle, enqueue, slowUser);

  // 화염구슬로 화상을 입은 턴엔 화상 데미지가 들어가지 않음
  flameOrb(battle, enqueue, fastUser);
  flameOrb(battle, enqueue, slowUser);
}

function applyStatusDamage(battle, enqueue, user) {
  const p = battle[user];

  if (p.faint) return;
  const maxHp = hpCalculate(p);

  if (p.ailment.poison) {
    p.getDamage(battle, enqueue, Math.floor(maxHp / 8), `${p.names} 독에 의한 데미지를 입었다!`);
  }
  if (p.ailment.mpoison) {
    p.getDamage(battle, enqueue, Math.floor((maxHp * p.ailment.mpoison) / 16), `${p.names} 맹독에 의한 데미지를 입었다!`);
    p.ailment.mpoison++;
  }
  if (p.ailment.burn) {
    const opponentSide = user === "player" ? "npc" : "player";
    const opponent = battle[opponentSide];

    // [증강] 할머니의 고추기름
    const hasChiliOil = Boolean(opponent?.hasAugment?.("grandmasChiliOil"));

    const baseBurn = Math.max(1, Math.floor(maxHp / 16));
    const burnDamage = hasChiliOil ? baseBurn * 5 : baseBurn;
    const text = hasChiliOil ? `[증강: 할머니의 고추기름] ${p.names} 극심한 화상 데미지를 입었다!` : `${p.names} 화상 데미지를 입었다!`;

    p.getDamage(battle, enqueue, burnDamage, text);
  }
}

function flameOrb(battle, enqueue, user) {
  const p = battle[user];
  if (p.faint) return;

  if (p.item === "화염구슬") {
    applyAilment("화상", battle, p.team, enqueue, false, `${p.names} 화염구슬로 화상을 입었다!`);
  }
}
