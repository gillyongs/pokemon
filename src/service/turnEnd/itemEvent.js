import { recover } from "../../function/recover";
import { burn } from "../../function/statusCondition";

export function processItemEffects(battle, enqueue, fastUser, slowUser) {
  applyFood(battle, enqueue, fastUser);
  applyFood(battle, enqueue, slowUser);
}

export function applyFood(battle, enqueue, user) {
  const p = battle[user];
  if (p.faint) return;

  if (p.item === "먹다남은음식" && p.hp < p.origin.hp) {
    recover(battle, Math.floor(p.origin.hp / 16), user, enqueue, `${p.names} 먹다남은음식으로 인해 조금 회복했다.`);
  }
}
