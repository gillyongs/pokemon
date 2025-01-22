import { typeCheck } from "./typeCheck";
export const damageCalculate = (battle, skillNumber, attacker) => {
  const atk = battle[battle.turn.atk];
  const def = battle[battle.turn.def];
  const skillKey = `sk${skillNumber}`;
  const sk = atk.origin[skillKey];
  let damage = (22 * sk.power * atk[sk.atkCatk]) / 50 / def[sk.defCdef];
  if (atk.status.burn != null && sk.atkCatk === "atk") {
    damage /= 2;
  }
  damage += 2;
  if (sk.type == atk.type1 || sk.type === atk.type2) {
    damage *= 1.5;
  }
  damage *= typeCheck(sk.type, def.type1, def.type2);
  return Math.floor(damage);
};
