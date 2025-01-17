import { checkTypes } from "./checkTypes";
export const damage = (battle, skillNumber, attacker) => {
  let atk, def;
  if ((attacker = "player")) {
    atk = battle.player;
    def = battle.npc;
  }
  if ((attacker = "npc")) {
    atk = battle.npc;
    def = battle.player;
  }
  const skillKey = `sk${skillNumber}`;
  const sk = atk.origin[skillKey]; // 동적으로 생성된 key로 값을 가져옴
  let damage = (22 * sk.power * atk[sk.atype]) / 50 / def[sk.dtype];
  damage += 2;
  if (sk.type == atk.type1 || sk.type == atk.type2) {
    damage *= 1.5;
  }
  damage *= checkTypes(sk.type, def.type1, def.type2);
  return Math.floor(damage);
};
