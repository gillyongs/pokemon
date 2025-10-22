import { recover } from "../../function/recover";

// 희망사항
// 스킬을 사용한 다음턴 체력의 1/2를 회복한다
// 교체하면 교체한 포켓몬이 (시전자의 체력 1/2만큼) 회복한다
export function processWish(battle, enqueue, user) {
  const wish = battle.field.noClean[user]?.wish;
  const target = battle[user];
  if (wish === null || target.faint) return;

  if (wish.turnRemain === 0) {
    battle.field.noClean[user].wish = null;
    if (target.hp < target.origin.hp && !target.faint) {
      // 풀피면 아예 발동 안하고 사라짐
      recover(battle, Math.floor(wish.amount), user, enqueue, `${wish.name}의 희망사항이 이루어졌다!`);
    }
  } else if (wish.turnRemain === 1) {
    wish.turnRemain = 0;
  }
}
