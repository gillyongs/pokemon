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
      enqueue({ id: "cc52dcd3-d1cf-42f8-8131-424e8fca5156", battle, text: `[특성 수포] ${p.name}의 화상이 나았다!` });
    } else {
      const opponentSide = user === "player" ? "npc" : "player";
      const opponent = battle[opponentSide];

      // 팀 전체가 아닌 현재 배틀 중인(필드에 나와있는) 포켓몬이 고추기름 증강을 보유하고 있을 때만 적용
      const hasChiliOil = Boolean(opponent?.hasAugment?.("grandmasChiliOil"));

      const baseBurn = Math.max(1, Math.floor(p.origin.hp / 16));
      const burnDamage = hasChiliOil ? baseBurn * 5 : baseBurn;
      const text = hasChiliOil
        ? `[증강: 할머니의 고추기름] ${p.names} 극심한 화상 데미지를 입었다!`
        : `${p.names} 화상 데미지를 입었다!`;

      p.getDamage(battle, enqueue, burnDamage, text);
    }
  }
}

function flameOrb(battle, enqueue, user) {
  const p = battle[user];
  if (p.faint) return;

  if (p.item === "화염구슬") {
    applyAilment("화상", battle, p.team, enqueue, false, `${p.names} 화염구슬로 화상을 입었다!`);
  }
}
